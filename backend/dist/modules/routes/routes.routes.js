"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const routes_controller_1 = require("./routes.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get("/", routes_controller_1.getRoutes); // Accessible to everyone
router.use(auth_middleware_1.requireAuth);
router.use((0, auth_middleware_1.requireRole)(["ADMIN"]));
router.post("/", routes_controller_1.createRoute);
router.put("/:id", routes_controller_1.updateRoute);
router.delete("/:id", routes_controller_1.deleteRoute);
exports.default = router;
