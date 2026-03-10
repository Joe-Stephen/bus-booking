"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bookings_controller_1 = require("./bookings.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validateRequest_1 = require("../../middlewares/validateRequest");
const bookings_schema_1 = require("./bookings.schema");
const router = (0, express_1.Router)();
// All booking routes require authentication
router.use(auth_middleware_1.requireAuth);
router.post("/", (0, validateRequest_1.validateRequest)(bookings_schema_1.createBookingSchema), bookings_controller_1.createBooking);
router.get("/my-bookings", bookings_controller_1.getMyBookings);
router.patch("/:id/cancel", bookings_controller_1.cancelBooking);
router.patch("/:id/change-schedule", (0, validateRequest_1.validateRequest)(bookings_schema_1.changeScheduleSchema), bookings_controller_1.changeSchedule);
exports.default = router;
