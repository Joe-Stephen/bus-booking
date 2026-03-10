"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const admin_routes_1 = __importDefault(require("./modules/admin/admin.routes"));
const errorHandler_1 = require("./middlewares/errorHandler");
// Import other routes here as they get refactored
// import userRoutes from "./modules/users/users.routes";
// import busesRoutes from "./modules/buses/buses.routes";
// import routesRoutes from "./modules/routes/routes.routes";
// import schedulesRoutes from "./modules/schedules/schedules.routes";
// import bookingsRoutes from "./modules/bookings/bookings.routes";
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// API Routes
app.use("/api/v1/auth", auth_routes_1.default);
app.use("/api/v1/admin", admin_routes_1.default);
// Health Check
app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK" });
});
// Global Error Handler must be the last middleware
app.use(errorHandler_1.errorHandler);
exports.default = app;
