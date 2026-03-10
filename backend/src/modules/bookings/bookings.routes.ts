import { Router } from "express";
import {
  createBooking,
  getMyBookings,
  cancelBooking,
  changeSchedule,
} from "./bookings.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../middlewares/validateRequest";
import { createBookingSchema, changeScheduleSchema } from "./bookings.schema";

const router = Router();

// All booking routes require authentication
router.use(requireAuth);

router.post("/", validateRequest(createBookingSchema), createBooking);
router.get("/my-bookings", getMyBookings);
router.patch("/:id/cancel", cancelBooking);
router.patch("/:id/change-schedule", validateRequest(changeScheduleSchema), changeSchedule);

export default router;
