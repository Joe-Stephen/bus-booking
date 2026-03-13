"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tracking_controller_1 = require("./tracking.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get("/bus/:busId", tracking_controller_1.trackingController.getBusLocation);
router.post("/bus/:busId", auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(["ADMIN", "DRIVER"]), tracking_controller_1.trackingController.updateBusLocation);
exports.default = router;
