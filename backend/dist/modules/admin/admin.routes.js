"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("./admin.controller");
const validateRequest_1 = require("../../middlewares/validateRequest");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const admin_schema_1 = require("./admin.schema");
const router = (0, express_1.Router)();
// Secure all admin routes
router.use(auth_middleware_1.requireAuth);
router.use((0, auth_middleware_1.requireRole)(["ADMIN"]));
// Buses
router.post("/bus", (0, validateRequest_1.validateRequest)(admin_schema_1.createBusSchema), admin_controller_1.adminController.createBus);
router.get("/buses", admin_controller_1.adminController.getBuses);
router.put("/bus/:id", (0, validateRequest_1.validateRequest)(admin_schema_1.updateBusSchema), admin_controller_1.adminController.updateBus);
router.delete("/bus/:id", admin_controller_1.adminController.deleteBus);
// Routes
router.post("/route", (0, validateRequest_1.validateRequest)(admin_schema_1.createRouteSchema), admin_controller_1.adminController.createRoute);
router.get("/routes", admin_controller_1.adminController.getRoutes);
router.put("/route/:id", (0, validateRequest_1.validateRequest)(admin_schema_1.updateRouteSchema), admin_controller_1.adminController.updateRoute);
router.delete("/route/:id", admin_controller_1.adminController.deleteRoute);
// Schedules
router.post("/schedule", (0, validateRequest_1.validateRequest)(admin_schema_1.createScheduleSchema), admin_controller_1.adminController.createSchedule);
router.get("/schedules", admin_controller_1.adminController.getSchedules);
router.put("/schedule/:id", (0, validateRequest_1.validateRequest)(admin_schema_1.updateScheduleSchema), admin_controller_1.adminController.updateSchedule);
router.delete("/schedule/:id", admin_controller_1.adminController.deleteSchedule);
exports.default = router;
