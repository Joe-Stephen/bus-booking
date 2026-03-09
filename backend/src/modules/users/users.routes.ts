import { Router } from "express";
import { getCurrentUser } from "./users.controller";
import { requireAuth } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/me", requireAuth, getCurrentUser);

export default router;
