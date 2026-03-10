import { Router } from "express";
import { authController } from "./auth.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { registerSchema, loginSchema, verifyEmailSchema, refreshTokenSchema, googleAuthSchema } from "./auth.schema";

const router = Router();

router.post("/register", validateRequest(registerSchema), authController.register);
router.post("/login", validateRequest(loginSchema), authController.login);
router.get("/verify-email", validateRequest(verifyEmailSchema), authController.verifyEmail);
router.post("/refresh-token", validateRequest(refreshTokenSchema), authController.refreshToken);
router.post("/google", validateRequest(googleAuthSchema), authController.googleAuth);

export default router;
