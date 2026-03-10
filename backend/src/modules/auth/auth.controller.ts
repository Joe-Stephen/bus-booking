import { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service";

export const authController = {
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({
        status: "success",
        data: result,
      });
    } catch (error: any) {
      if (error.message === "Email already in use") {
        return res.status(409).json({ status: "error", message: error.message });
      }
      next(error);
    }
  },

  verifyEmail: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.query.token as string;
      const result = await authService.verifyEmail(token);
      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error: any) {
      if (error.message === "Invalid or expired verification token") {
        return res.status(400).json({ status: "error", message: error.message });
      }
      next(error);
    }
  },

  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.login(req.body);
      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error: any) {
      if (error.message === "Invalid credentials" || error.message.includes("verify your email")) {
        return res.status(401).json({ status: "error", message: error.message });
      }
      next(error);
    }
  },

  refreshToken: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);
      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error: any) {
      if (error.message === "Invalid refresh token") {
         return res.status(401).json({ status: "error", message: error.message });
      }
      next(error);
    }
  },

  googleAuth: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tokenId } = req.body;
      const result = await authService.googleAuth(tokenId);
      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error: any) {
      return res.status(401).json({ status: "error", message: error.message });
    }
  }
};
