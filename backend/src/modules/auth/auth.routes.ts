import { Router } from "express";
import { register, login, verifyEmail, googleLogin } from "./auth.controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/verify-email", verifyEmail);
router.post("/google", googleLogin);

export default router;
