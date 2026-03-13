"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackingController = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
exports.trackingController = {
    getBusLocation: async (req, res, next) => {
        try {
            const { busId } = req.params;
            const location = await prisma_1.default.busLocation.findUnique({
                where: { busId: String(busId) },
            });
            if (!location) {
                return res.status(404).json({ status: "error", message: "Location not found for this bus" });
            }
            res.status(200).json({
                status: "success",
                data: {
                    busId: location.busId,
                    latitude: location.latitude,
                    longitude: location.longitude,
                    speed: location.speed,
                    updatedAt: location.updatedAt,
                },
            });
        }
        catch (error) {
            next(error);
        }
    },
    updateBusLocation: async (req, res, next) => {
        try {
            const { busId } = req.params;
            const { latitude, longitude, speed, heading } = req.body;
            const lat = Number(latitude);
            const lng = Number(longitude);
            if (isNaN(lat) || lat < -90 || lat > 90 || isNaN(lng) || lng < -180 || lng > 180) {
                return res.status(400).json({ status: "error", message: "Invalid GPS coordinates" });
            }
            const location = await prisma_1.default.busLocation.upsert({
                where: { busId: String(busId) },
                update: {
                    latitude: lat,
                    longitude: lng,
                    speed: speed != null ? Number(speed) : null,
                    heading: heading != null ? Number(heading) : null,
                },
                create: {
                    busId: String(busId),
                    latitude: lat,
                    longitude: lng,
                    speed: speed != null ? Number(speed) : null,
                    heading: heading != null ? Number(heading) : null,
                },
            });
            res.status(200).json({ status: "success", data: location });
        }
        catch (error) {
            next(error);
        }
    },
};
