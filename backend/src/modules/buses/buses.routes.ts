import { Router } from "express";
import { createBus, getBuses, updateBus, deleteBus } from "./buses.controller";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";

const router = Router();

// Only ADMIN can manage buses
router.use(requireAuth);
router.use(requireRole(["ADMIN"]));

router.post("/", createBus);
router.get("/", getBuses);
router.put("/:id", updateBus);
router.delete("/:id", deleteBus);

export default router;
