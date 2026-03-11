import { Router } from "express";
import { adminController } from "./admin.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { 
  createBusSchema, 
  createRouteSchema, 
  createScheduleSchema,
  updateBusSchema,
  updateBusTrackingSchema,
  updateRouteSchema,
  updateScheduleSchema
} from "./admin.schema";

const router = Router();

// Secure all admin routes
router.use(requireAuth);
router.use(requireRole(["ADMIN"]));

// Buses
router.post("/bus", validateRequest(createBusSchema), adminController.createBus);
router.get("/buses", adminController.getBuses);
router.put("/bus/:id", validateRequest(updateBusSchema), adminController.updateBus);
router.patch("/bus/:id/tracking", validateRequest(updateBusTrackingSchema), adminController.updateBusTracking);
router.delete("/bus/:id", adminController.deleteBus);

// Routes
router.post("/route", validateRequest(createRouteSchema), adminController.createRoute);
router.get("/routes", adminController.getRoutes);
router.put("/route/:id", validateRequest(updateRouteSchema), adminController.updateRoute);
router.delete("/route/:id", adminController.deleteRoute);

// Schedules
router.post("/schedule", validateRequest(createScheduleSchema), adminController.createSchedule);
router.get("/schedules", adminController.getSchedules);
router.put("/schedule/:id", validateRequest(updateScheduleSchema), adminController.updateSchedule);
router.delete("/schedule/:id", adminController.deleteSchedule);

export default router;
