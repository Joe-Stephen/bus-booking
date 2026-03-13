"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDistance = calculateDistance;
exports.snapToRoad = snapToRoad;
const axios_1 = __importDefault(require("axios"));
const OSRM_BASE = `${process.env.OSRM_SERVER_URL ?? "https://router.project-osrm.org"}/nearest/v1/driving`;
const EARTH_RADIUS_M = 6_371_000; // metres
/**
 * Calculates the great-circle distance between two GPS points using the
 * Haversine formula. Returns distance in metres.
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return EARTH_RADIUS_M * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
/**
 * Snaps a raw GPS coordinate to the nearest road using the public OSRM nearest API.
 * Falls back to the original coordinates if the request fails.
 */
async function snapToRoad(latitude, longitude) {
    try {
        // OSRM expects coordinates as lon,lat
        const url = `${OSRM_BASE}/${longitude},${latitude}`;
        const response = await axios_1.default.get(url, { timeout: 2000 });
        const waypoint = response.data?.waypoints?.[0];
        if (!waypoint || !waypoint.location) {
            return { latitude, longitude, snapped: false };
        }
        // OSRM returns location as [longitude, latitude]
        const [snappedLng, snappedLat] = waypoint.location;
        return {
            latitude: snappedLat,
            longitude: snappedLng,
            snapped: true,
        };
    }
    catch (err) {
        // Log but do not throw — tracking must not break if OSRM is unavailable
        console.error(`[snapToRoad] OSRM request failed (lat=${latitude}, lng=${longitude}):`, err.message);
        return { latitude, longitude, snapped: false };
    }
}
