import { Router } from "express";
import {
  createRoute,
  getRoutes,
  updateRoute,
  deleteRoute,
} from "./routes.controller";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/", getRoutes); // Accessible to everyone

router.use(requireAuth);
router.use(requireRole(["ADMIN"]));

router.post("/", createRoute);
router.put("/:id", updateRoute);
router.delete("/:id", deleteRoute);

export default router;
