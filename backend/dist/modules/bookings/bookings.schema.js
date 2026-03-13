"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeScheduleSchema = exports.createBookingSchema = void 0;
const zod_1 = require("zod");
exports.createBookingSchema = zod_1.z.object({
    body: zod_1.z.object({
        scheduleId: zod_1.z.string().min(1, "Schedule ID is required"),
    }),
});
exports.changeScheduleSchema = zod_1.z.object({
    body: zod_1.z.object({
        newScheduleId: zod_1.z.string().min(1, "New Schedule ID is required"),
    }),
});
