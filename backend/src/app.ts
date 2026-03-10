import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import { requestLogger } from "./middlewares/logger.middleware";

import authRoutes from "./modules/auth/auth.routes";
import adminRoutes from "./modules/admin/admin.routes";
import { errorHandler } from "./middlewares/errorHandler";
import routesRoutes from "./modules/routes/routes.routes";
import bookingsRoutes from "./modules/bookings/bookings.routes";
import schedulesRoutes from "./modules/schedules/schedules.routes";

// Import other routes here as they get refactored
// import userRoutes from "./modules/users/users.routes";
// import busesRoutes from "./modules/buses/buses.routes";
// import routesRoutes from "./modules/routes/routes.routes";
// import schedulesRoutes from "./modules/schedules/schedules.routes";
// import bookingsRoutes from "./modules/bookings/bookings.routes";

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/routes", routesRoutes);
app.use("/api/v1/bookings", bookingsRoutes);
app.use("/api/v1/schedules", schedulesRoutes);

// Health Check
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK" });
});

// Global Error Handler must be the last middleware
app.use(errorHandler);

export default app;
