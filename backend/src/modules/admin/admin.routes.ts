import { Router } from "express";
import { adminController } from "./admin.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { 
  createBusSchema, 
  createRouteSchema, 
  createScheduleSchema 
} from "./admin.schema";

const router = Router();

// Secure all admin routes
router.use(requireAuth);
router.use(requireRole(["ADMIN"]));

// Buses
router.post("/bus", validateRequest(createBusSchema), adminController.createBus);
router.get("/buses", adminController.getBuses);

// Routes
router.post("/route", validateRequest(createRouteSchema), adminController.createRoute);
router.get("/routes", adminController.getRoutes);

// Schedules
router.post("/schedule", validateRequest(createScheduleSchema), adminController.createSchedule);
router.get("/schedules", adminController.getSchedules);

export default router;
