import { Request, Response, NextFunction } from "express";
import prisma from "../../config/prisma";

export const trackingController = {
  getBusLocation: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { busId } = req.params;

      const location = await prisma.busLocation.findUnique({
        where: { busId: String(busId) },
      });

      if (!location) {
        return res.status(404).json({ status: "error", message: "Location not found for this bus" });
      }

      res.status(200).json({
        status: "success",
        data: {
          busId: location.busId,
          latitude: location.latitude,
          longitude: location.longitude,
          speed: location.speed,
          updatedAt: location.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
