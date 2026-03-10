"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeScheduleSchema = exports.createBookingSchema = void 0;
const zod_1 = require("zod");
exports.createBookingSchema = zod_1.z.object({
    body: zod_1.z.object({
        scheduleId: zod_1.z.string().uuid("Invalid schedule ID format"),
    }),
});
exports.changeScheduleSchema = zod_1.z.object({
    body: zod_1.z.object({
        newScheduleId: zod_1.z.string().uuid("Invalid schedule ID format"),
    }),
});
