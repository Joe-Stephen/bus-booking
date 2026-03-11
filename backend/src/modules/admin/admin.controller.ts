import { Request, Response, NextFunction } from "express";
import prisma from "../../config/prisma";

export const adminController = {
  // --- Buses ---
  createBus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, totalSeats } = req.body;

      const existing = await prisma.bus.findFirst({ where: { name } });
      if (existing) {
        return res.status(400).json({ status: "error", message: "Bus with this name already exists" });
      }

      const bus = await prisma.bus.create({
        data: { name, totalSeats },
      });

      res.status(201).json({ status: "success", data: bus });
    } catch (error) {
      next(error);
    }
  },

  getBuses: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const buses = await prisma.bus.findMany();
      res.status(200).json({ status: "success", data: buses });
    } catch (error) {
      next(error);
    }
  },

  updateBus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { name, totalSeats } = req.body;

      const bus = await prisma.bus.update({
        where: { id: String(id) },
        data: { name, totalSeats },
      });

      res.status(200).json({ status: "success", data: bus });
    } catch (error) {
      next(error);
    }
  },

  deleteBus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await prisma.bus.delete({ where: { id: String(id) } });
      res.status(200).json({ status: "success", message: "Bus deleted successfully" });
    } catch (error) {
      next(error);
    }
  },

  updateBusTracking: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { enabled } = req.body;

      const bus = await prisma.bus.update({
        where: { id: String(id) },
        data: { isTrackingEnabled: enabled },
      });

      res.status(200).json({ status: "success", data: bus });
    } catch (error) {
      if ((error as any).code === "P2025") {
        return res.status(404).json({ status: "error", message: "Bus not found" });
      }
      next(error);
    }
  },

  // --- Routes ---
  createRoute: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { source, destination, distance } = req.body;

      const existing = await prisma.route.findFirst({
        where: { source, destination },
      });

      if (existing) {
        return res.status(400).json({ status: "error", message: "This route already exists" });
      }

      const route = await prisma.route.create({
        data: { source, destination, distance },
      });

      res.status(201).json({ status: "success", data: route });
    } catch (error) {
      next(error);
    }
  },

  getRoutes: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const routes = await prisma.route.findMany();
      res.status(200).json({ status: "success", data: routes });
    } catch (error) {
      next(error);
    }
  },

  updateRoute: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { source, destination, distance } = req.body;

      const route = await prisma.route.update({
        where: { id: String(id) },
        data: { source, destination, distance },
      });

      res.status(200).json({ status: "success", data: route });
    } catch (error) {
      next(error);
    }
  },

  deleteRoute: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await prisma.route.delete({ where: { id: String(id) } });
      res.status(200).json({ status: "success", message: "Route deleted successfully" });
    } catch (error) {
      next(error);
    }
  },

  // --- Schedules ---
  createSchedule: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { busId, routeId, departureTime, arrivalTime, price } = req.body;

      // Validate references
      const bus = await prisma.bus.findUnique({ where: { id: busId } });
      if (!bus) return res.status(404).json({ status: "error", message: "Bus not found" });

      const route = await prisma.route.findUnique({ where: { id: routeId } });
      if (!route) return res.status(404).json({ status: "error", message: "Route not found" });

      const parsedDepartureOffset = new Date(departureTime);
      const parsedArrivalOffset = new Date(arrivalTime);

      // Check for overlap in existing schedules for the SAME bus
      // A schedule overlaps if it is not strictly completely before or completely after the new time bracket
      const overlapSchedule = await prisma.schedule.findFirst({
        where: {
          busId,
          OR: [
            {
               // New dep time falls inside existing schedule
               departureTime: { lte: parsedDepartureOffset },
               arrivalTime: { gte: parsedDepartureOffset }
            },
            {
               // New arrival time falls inside existing schedule
               departureTime: { lte: parsedArrivalOffset },
               arrivalTime: { gte: parsedArrivalOffset }
            },
            {
               // Existing schedule is entirely encompassed by new schedule
               departureTime: { gte: parsedDepartureOffset },
               arrivalTime: { lte: parsedArrivalOffset }
            }
          ]
        }
      });

      if (overlapSchedule) {
        return res.status(400).json({ 
          status: "error", 
          message: "Bus is already scheduled for another route during this time." 
        });
      }

      const schedule = await prisma.schedule.create({
        data: {
          busId,
          routeId,
          departureTime: parsedDepartureOffset,
          arrivalTime: parsedArrivalOffset,
          price,
        },
      });

      res.status(201).json({ status: "success", data: schedule });
    } catch (error) {
      next(error);
    }
  },

  getSchedules: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schedules = await prisma.schedule.findMany({
        include: { 
          bus: true, 
          route: true,
          _count: {
            select: {
              bookings: {
                where: { status: "BOOKED" }
              }
            }
          }
        },
        orderBy: { departureTime: "asc" }
      });
      res.status(200).json({ status: "success", data: schedules });
    } catch (error) {
      next(error);
    }
  },

  updateSchedule: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { busId, routeId, departureTime, arrivalTime, price } = req.body;

      const parsedDepartureOffset = new Date(departureTime);
      const parsedArrivalOffset = new Date(arrivalTime);

      // Check for overlap in existing schedules for the SAME bus (ignore self)
      const overlapSchedule = await prisma.schedule.findFirst({
        where: {
          busId,
          id: { not: String(id) },
          OR: [
            {
               departureTime: { lte: parsedDepartureOffset },
               arrivalTime: { gte: parsedDepartureOffset }
            },
            {
               departureTime: { lte: parsedArrivalOffset },
               arrivalTime: { gte: parsedArrivalOffset }
            },
            {
               departureTime: { gte: parsedDepartureOffset },
               arrivalTime: { lte: parsedArrivalOffset }
            }
          ]
        }
      });

      if (overlapSchedule) {
        return res.status(400).json({ 
          status: "error", 
          message: "Bus is already scheduled for another route during this time." 
        });
      }

      const schedule = await prisma.schedule.update({
        where: { id: String(id) },
        data: {
          busId,
          routeId,
          departureTime: parsedDepartureOffset,
          arrivalTime: parsedArrivalOffset,
          price,
        },
      });

      res.status(200).json({ status: "success", data: schedule });
    } catch (error) {
      next(error);
    }
  },

  deleteSchedule: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await prisma.schedule.delete({ where: { id: String(id) } });
      res.status(200).json({ status: "success", message: "Schedule deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
};
