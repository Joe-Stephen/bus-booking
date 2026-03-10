"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const routes_controller_1 = require("./routes.controller");
const schedules_controller_1 = require("../schedules/schedules.controller");
const router = (0, express_1.Router)();
// Publicly accessible for users dropping into the application
router.get("/", routes_controller_1.getRoutes);
router.get("/:id/schedules", schedules_controller_1.getSchedulesByRoute);
exports.default = router;
