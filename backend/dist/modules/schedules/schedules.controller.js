"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSchedulesByRoute = exports.getScheduleAvailability = exports.getSchedules = exports.createSchedule = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const client_1 = require("@prisma/client");
const createSchedule = async (req, res) => {
    try {
        const { busId, routeId, departureTime, arrivalTime, price } = req.body;
        // Validate Bus and Route exist
        const bus = await prisma_1.default.bus.findUnique({ where: { id: busId } });
        if (!bus) {
            res.status(404).json({ error: "Bus not found" });
            return;
        }
        const route = await prisma_1.default.route.findUnique({ where: { id: routeId } });
        if (!route) {
            res.status(404).json({ error: "Route not found" });
            return;
        }
        const schedule = await prisma_1.default.schedule.create({
            data: {
                busId,
                routeId,
                departureTime: new Date(departureTime),
                arrivalTime: new Date(arrivalTime),
                price: parseFloat(price),
            },
        });
        res.status(201).json(schedule);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create schedule" });
    }
};
exports.createSchedule = createSchedule;
const getSchedules = async (req, res) => {
    try {
        const { origin, destination, date } = req.query;
        const where = {};
        if (origin || destination) {
            where.route = {};
            if (origin)
                where.route.origin = { contains: String(origin), mode: "insensitive" };
            if (destination)
                where.route.destination = {
                    contains: String(destination),
                    mode: "insensitive",
                };
        }
        if (date) {
            const startOfDay = new Date(String(date));
            startOfDay.setUTCHours(0, 0, 0, 0);
            const endOfDay = new Date(String(date));
            endOfDay.setUTCHours(23, 59, 59, 999);
            where.departureTime = {
                gte: startOfDay,
                lte: endOfDay,
            };
        }
        const schedules = await prisma_1.default.schedule.findMany({
            where,
            include: {
                bus: true,
                route: true,
                _count: {
                    select: {
                        bookings: {
                            where: { status: client_1.BookingStatus.BOOKED },
                        },
                    },
                },
            },
            orderBy: { departureTime: "asc" },
        });
        res.json(schedules);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch schedules" });
    }
};
exports.getSchedules = getSchedules;
const getScheduleAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const schedule = await prisma_1.default.schedule.findUnique({
            where: { id: String(id) },
            include: { bus: true },
        });
        if (!schedule) {
            res.status(404).json({ error: "Schedule not found" });
            return;
        }
        const existingBookings = await prisma_1.default.booking.count({
            where: {
                scheduleId: String(id),
                status: client_1.BookingStatus.BOOKED,
            },
        });
        const availableSeats = schedule.bus.totalSeats - existingBookings;
        res.json({
            scheduleId: id,
            capacity: schedule.bus.totalSeats,
            booked: existingBookings,
            available: availableSeats,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch availability" });
    }
};
exports.getScheduleAvailability = getScheduleAvailability;
const getSchedulesByRoute = async (req, res) => {
    try {
        const { id } = req.params;
        const schedules = await prisma_1.default.schedule.findMany({
            where: {
                routeId: String(id),
            },
            include: {
                bus: true,
                route: true,
                _count: {
                    select: {
                        bookings: { where: { status: client_1.BookingStatus.BOOKED } }
                    }
                }
            },
            orderBy: { departureTime: "asc" },
        });
        // Add available seats to each schedule
        const schedulesWithAvailability = schedules.map(s => ({
            ...s,
            availableSeats: s.bus.totalSeats - s._count.bookings,
            isPast: new Date(s.departureTime) < new Date(),
        }));
        res.json(schedulesWithAvailability);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch schedules" });
    }
};
exports.getSchedulesByRoute = getSchedulesByRoute;
