import { Router } from "express";
import {
  createSchedule,
  getSchedules,
  getScheduleAvailability,
} from "./schedules.controller";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/", getSchedules);
router.get("/:id/availability", getScheduleAvailability);

// Admin only
router.use(requireAuth);
router.use(requireRole(["ADMIN"]));
router.post("/", createSchedule);

export default router;
