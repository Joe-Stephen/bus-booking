import { Router } from "express";
import { trackingController } from "./tracking.controller";

const router = Router();

router.get("/bus/:busId", trackingController.getBusLocation);

export default router;
