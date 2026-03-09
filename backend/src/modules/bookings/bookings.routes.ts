import { Router } from "express";
import {
  createBooking,
  getMyBookings,
  cancelBooking,
} from "./bookings.controller";
import { requireAuth } from "../../middlewares/auth.middleware";

const router = Router();

router.use(requireAuth);

router.post("/", createBooking);
router.get("/my", getMyBookings);
router.patch("/:id/cancel", cancelBooking);

export default router;
