"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const schedules_controller_1 = require("./schedules.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get("/", schedules_controller_1.getSchedules);
router.get("/:id/availability", schedules_controller_1.getScheduleAvailability);
// Admin only
router.use(auth_middleware_1.requireAuth);
router.use((0, auth_middleware_1.requireRole)(["ADMIN"]));
router.post("/", schedules_controller_1.createSchedule);
exports.default = router;
