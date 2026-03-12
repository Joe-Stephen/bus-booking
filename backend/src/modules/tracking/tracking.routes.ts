import { Router } from "express";
import { trackingController } from "./tracking.controller";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/bus/:busId", trackingController.getBusLocation);
router.post("/bus/:busId", requireAuth, requireRole(["ADMIN", "DRIVER"]), trackingController.updateBusLocation);

export default router;
