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
};
