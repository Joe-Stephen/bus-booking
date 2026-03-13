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
      next(error);
    }
  }
};
