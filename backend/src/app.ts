import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";

import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/users.routes";
import busesRoutes from "./modules/buses/buses.routes";
import routesRoutes from "./modules/routes/routes.routes";
import schedulesRoutes from "./modules/schedules/schedules.routes";
import bookingsRoutes from "./modules/bookings/bookings.routes";

const app: Express = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/buses", busesRoutes);
app.use("/api/v1/routes", routesRoutes);
app.use("/api/v1/schedules", schedulesRoutes);
app.use("/api/v1/bookings", bookingsRoutes);

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK" });
});

// Generic Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

export default app;
