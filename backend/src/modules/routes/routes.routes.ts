import { Router } from "express";
import { getRoutes } from "./routes.controller";
import { getSchedulesByRoute } from "../schedules/schedules.controller";

const router = Router();

// Publicly accessible for users dropping into the application
router.get("/", getRoutes);
router.get("/:id/schedules", getSchedulesByRoute);

export default router;
