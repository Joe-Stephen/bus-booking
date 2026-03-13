"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleConnection = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const mapMatching_1 = require("../utils/mapMatching");
const rateLimits = new Map();
// Per-bus cache of the last OSRM-snapped coordinate
const snapCache = new Map();
const SNAP_CACHE_RADIUS_M = 10;
const handleConnection = (socket, io) => {
    console.log(`User connected: ${socket.id}`);
    socket.on("bus:location:update", async (data) => {
        try {
            // 1. Authorization: Only authenticated DRIVER or ADMIN can emit updates
            const user = socket.data.user;
            if (!user || (user.role !== "DRIVER" && user.role !== "ADMIN")) {
                console.warn(`Unauthorized location update attempt from socket ${socket.id}`);
                return;
            }
            if (!data || !data.busId || data.latitude === undefined || data.longitude === undefined) {
                return;
            }
            const { busId, latitude, longitude, speed, heading } = data;
            // 2. Rate Limiting: Max 1 update per second per bus
            const now = Date.now();
            const lastUpdate = rateLimits.get(String(busId)) || 0;
            if (now - lastUpdate < 1000) {
                // Drop the packet silently to protect DB
                return;
            }
            rateLimits.set(String(busId), now);
            // 3. Validation: Enforce strict GPS bounds
            const lat = Number(latitude);
            const lng = Number(longitude);
            if (isNaN(lat) || lat < -90 || lat > 90 || isNaN(lng) || lng < -180 || lng > 180) {
                console.warn(`Invalid coordinates received for bus ${busId}: [${lat}, ${lng}]`);
                return;
            }
            // 4. Jitter filter: ignore updates where the bus hasn't moved >= 5 m
            const JITTER_THRESHOLD_M = 5;
            const prevLocation = await prisma_1.default.busLocation.findUnique({
                where: { busId: String(busId) },
            });
            if (prevLocation) {
                const dist = (0, mapMatching_1.calculateDistance)(prevLocation.latitude, prevLocation.longitude, lat, lng);
                if (dist < JITTER_THRESHOLD_M) {
                    return; // Treat as stationary — skip update
                }
            }
            // 5. Road-snap cache: reuse previous snapped coord if raw GPS moved < 10 m
            const cached = snapCache.get(String(busId));
            let snapped;
            if (cached && (0, mapMatching_1.calculateDistance)(cached.latitude, cached.longitude, lat, lng) < SNAP_CACHE_RADIUS_M) {
                // Raw GPS hasn't strayed outside the cached snap zone — reuse it
                snapped = { latitude: cached.latitude, longitude: cached.longitude, snapped: true };
            }
            else {
                // 6. Call OSRM for a fresh snap, then update the cache
                snapped = await (0, mapMatching_1.snapToRoad)(lat, lng);
                if (snapped.snapped) {
                    snapCache.set(String(busId), { latitude: snapped.latitude, longitude: snapped.longitude });
                }
            }
            const finalLat = snapped.latitude;
            const finalLng = snapped.longitude;
            // 7. Log map-matching result
            const correctionM = (0, mapMatching_1.calculateDistance)(lat, lng, finalLat, finalLng).toFixed(1);
            console.log(`[Tracking] Bus ${busId}\n` +
                `  GPS:     ${lat.toFixed(6)},${lng.toFixed(6)}\n` +
                `  Snapped: ${finalLat.toFixed(6)},${finalLng.toFixed(6)}\n` +
                `  Correction: ${correctionM} m${snapped.snapped ? "" : " (OSRM fallback — raw GPS used)"}`);
            // Upsert latest location into the database
            const upsertedLocation = await prisma_1.default.busLocation.upsert({
                where: { busId: String(busId) },
                update: {
                    latitude: finalLat,
                    longitude: finalLng,
                    speed: speed ? Number(speed) : null,
                    heading: heading ? Number(heading) : null,
                },
                create: {
                    busId: String(busId),
                    latitude: finalLat,
                    longitude: finalLng,
                    speed: speed ? Number(speed) : null,
                    heading: heading ? Number(heading) : null,
                },
            });
            // Broadcast location to clients subscribed to this bus
            io.to(`bus-${upsertedLocation.busId}`).emit("bus:location:broadcast", {
                busId: upsertedLocation.busId,
                latitude: upsertedLocation.latitude,
                longitude: upsertedLocation.longitude,
                speed: upsertedLocation.speed,
                updatedAt: upsertedLocation.updatedAt,
                snapped: snapped.snapped,
            });
        }
        catch (error) {
            console.error("Error updating bus location via socket:", error);
        }
    });
    socket.on("bus:subscribe", (data) => {
        if (data && data.busId) {
            const roomName = `bus-${data.busId}`;
            socket.join(roomName);
            console.log(`Socket ${socket.id} subscribed to ${roomName}`);
        }
    });
    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
    });
};
exports.handleConnection = handleConnection;
