"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminController = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
exports.adminController = {
    // --- Buses ---
    createBus: async (req, res, next) => {
        try {
            const { name, totalSeats } = req.body;
            const existing = await prisma_1.default.bus.findFirst({ where: { name } });
            if (existing) {
                return res.status(400).json({ status: "error", message: "Bus with this name already exists" });
            }
            const bus = await prisma_1.default.bus.create({
                data: { name, totalSeats },
            });
            res.status(201).json({ status: "success", data: bus });
        }
        catch (error) {
            next(error);
        }
    },
    getBuses: async (req, res, next) => {
        try {
            const buses = await prisma_1.default.bus.findMany();
            res.status(200).json({ status: "success", data: buses });
        }
        catch (error) {
            next(error);
        }
    },
    // --- Routes ---
    createRoute: async (req, res, next) => {
        try {
            const { source, destination, distance } = req.body;
            const existing = await prisma_1.default.route.findFirst({
                where: { source, destination },
            });
            if (existing) {
                return res.status(400).json({ status: "error", message: "This route already exists" });
            }
            const route = await prisma_1.default.route.create({
                data: { source, destination, distance },
            });
            res.status(201).json({ status: "success", data: route });
        }
        catch (error) {
            next(error);
        }
    },
    getRoutes: async (req, res, next) => {
        try {
            const routes = await prisma_1.default.route.findMany();
            res.status(200).json({ status: "success", data: routes });
        }
        catch (error) {
            next(error);
        }
    },
    // --- Schedules ---
    createSchedule: async (req, res, next) => {
        try {
            const { busId, routeId, departureTime, arrivalTime, price } = req.body;
            // Validate references
            const bus = await prisma_1.default.bus.findUnique({ where: { id: busId } });
            if (!bus)
                return res.status(404).json({ status: "error", message: "Bus not found" });
            const route = await prisma_1.default.route.findUnique({ where: { id: routeId } });
            if (!route)
                return res.status(404).json({ status: "error", message: "Route not found" });
            const parsedDepartureOffset = new Date(departureTime);
            const parsedArrivalOffset = new Date(arrivalTime);
            // Check for overlap in existing schedules for the SAME bus
            // A schedule overlaps if it is not strictly completely before or completely after the new time bracket
            const overlapSchedule = await prisma_1.default.schedule.findFirst({
                where: {
                    busId,
                    OR: [
                        {
                            // New dep time falls inside existing schedule
                            departureTime: { lte: parsedDepartureOffset },
                            arrivalTime: { gte: parsedDepartureOffset }
                        },
                        {
                            // New arrival time falls inside existing schedule
                            departureTime: { lte: parsedArrivalOffset },
                            arrivalTime: { gte: parsedArrivalOffset }
                        },
                        {
                            // Existing schedule is entirely encompassed by new schedule
                            departureTime: { gte: parsedDepartureOffset },
                            arrivalTime: { lte: parsedArrivalOffset }
                        }
                    ]
                }
            });
            if (overlapSchedule) {
                return res.status(400).json({
                    status: "error",
                    message: "Bus is already scheduled for another route during this time."
                });
            }
            const schedule = await prisma_1.default.schedule.create({
                data: {
                    busId,
                    routeId,
                    departureTime: parsedDepartureOffset,
                    arrivalTime: parsedArrivalOffset,
                    price,
                },
            });
            res.status(201).json({ status: "success", data: schedule });
        }
        catch (error) {
            next(error);
        }
    },
    getSchedules: async (req, res, next) => {
        try {
            const schedules = await prisma_1.default.schedule.findMany({
                include: { bus: true, route: true },
                orderBy: { departureTime: "asc" }
            });
            res.status(200).json({ status: "success", data: schedules });
        }
        catch (error) {
            next(error);
        }
    }
};
