"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const buses_controller_1 = require("./buses.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Only ADMIN can manage buses
router.use(auth_middleware_1.requireAuth);
router.use((0, auth_middleware_1.requireRole)(["ADMIN"]));
router.post("/", buses_controller_1.createBus);
router.get("/", buses_controller_1.getBuses);
router.put("/:id", buses_controller_1.updateBus);
router.delete("/:id", buses_controller_1.deleteBus);
exports.default = router;
