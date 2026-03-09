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

  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.login(req.body);
      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error: any) {
      if (error.message === "Invalid credentials") {
        return res.status(401).json({ status: "error", message: error.message });
      }
      next(error);
    }
  },
};
