"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateScheduleSchema = exports.updateRouteSchema = exports.updateBusSchema = exports.createScheduleSchema = exports.createRouteSchema = exports.createBusSchema = void 0;
const zod_1 = require("zod");
exports.createBusSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, "Bus name is required"),
        totalSeats: zod_1.z.number().int().min(1, "Total seats must be greater than 0"),
    }),
});
exports.createRouteSchema = zod_1.z.object({
    body: zod_1.z.object({
        source: zod_1.z.string().min(1, "Source is required"),
        destination: zod_1.z.string().min(1, "Destination is required"),
        distance: zod_1.z.number().positive("Distance must be a positive number"),
    }),
});
exports.createScheduleSchema = zod_1.z.object({
    body: zod_1.z.object({
        busId: zod_1.z.string().uuid("Invalid bus ID format"),
        routeId: zod_1.z.string().uuid("Invalid route ID format"),
        departureTime: zod_1.z.string().datetime("Must be a valid ISO 8601 date string"),
        arrivalTime: zod_1.z.string().datetime("Must be a valid ISO 8601 date string"),
        price: zod_1.z.number().positive("Price must be a positive number"),
    }).refine((data) => new Date(data.arrivalTime) > new Date(data.departureTime), {
        message: "Arrival time must be after departure time",
        path: ["arrivalTime"],
    }),
});
exports.updateBusSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, "Bus name is required").optional(),
        totalSeats: zod_1.z.number().int().min(1, "Total seats must be greater than 0").optional(),
    }),
});
exports.updateRouteSchema = zod_1.z.object({
    body: zod_1.z.object({
        source: zod_1.z.string().min(1, "Source is required").optional(),
        destination: zod_1.z.string().min(1, "Destination is required").optional(),
        distance: zod_1.z.number().positive("Distance must be a positive number").optional(),
    }),
});
exports.updateScheduleSchema = zod_1.z.object({
    body: zod_1.z.object({
        busId: zod_1.z.string().uuid("Invalid bus ID format").optional(),
        routeId: zod_1.z.string().uuid("Invalid route ID format").optional(),
        departureTime: zod_1.z.string().datetime("Must be a valid ISO 8601 date string").optional(),
        arrivalTime: zod_1.z.string().datetime("Must be a valid ISO 8601 date string").optional(),
        price: zod_1.z.number().positive("Price must be a positive number").optional(),
    }).refine((data) => {
        if (data.arrivalTime && data.departureTime) {
            return new Date(data.arrivalTime) > new Date(data.departureTime);
        }
        return true;
    }, {
        message: "Arrival time must be after departure time",
        path: ["arrivalTime"],
    }),
});
