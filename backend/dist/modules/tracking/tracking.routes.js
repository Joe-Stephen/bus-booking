"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tracking_controller_1 = require("./tracking.controller");
const router = (0, express_1.Router)();
router.get("/bus/:busId", tracking_controller_1.trackingController.getBusLocation);
exports.default = router;
