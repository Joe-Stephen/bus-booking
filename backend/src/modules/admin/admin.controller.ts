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
      const { busId, routeId, departureTime, arrivalTime, price, repeatType = 1 } = req.body;

      // Validate references
      const bus = await prisma.bus.findUnique({ where: { id: busId } });
      if (!bus) return res.status(404).json({ status: "error", message: "Bus not found" });

      const route = await prisma.route.findUnique({ where: { id: routeId } });
      if (!route) return res.status(404).json({ status: "error", message: "Route not found" });

      const iterations = repeatType === 2 ? 60 : 1;
      const groupId = repeatType === 2 ? require("crypto").randomUUID() : null;

      const schedulesToCreate: any[] = [];

      await prisma.$transaction(async (tx: any) => {
        for (let i = 0; i < iterations; i++) {
          const parsedDepartureOffset = new Date(departureTime);
          const parsedArrivalOffset = new Date(arrivalTime);

          parsedDepartureOffset.setDate(parsedDepartureOffset.getDate() + i);
          parsedArrivalOffset.setDate(parsedArrivalOffset.getDate() + i);

          // Check for overlap in existing schedules for the SAME bus
          const overlapSchedule = await tx.schedule.findFirst({
            where: {
              busId,
              isPaused: false,
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
            throw new Error(`Bus is already scheduled for another route on Day ${i + 1}`);
          }

          schedulesToCreate.push({
            busId,
            routeId,
            departureTime: parsedDepartureOffset,
            arrivalTime: parsedArrivalOffset,
            price: Number(price),
            repeatType: Number(repeatType),
            groupId: groupId
          });
        }

        await tx.schedule.createMany({
          data: schedulesToCreate,
        });
      });

      res.status(201).json({ status: "success", message: iterations > 1 ? `Daily schedule established for 60 occurrences` : "Schedule parsed successfully", data: { groupId } });
    } catch (error: any) {
      if (error.message && error.message.includes("scheduled")) {
         return res.status(400).json({ status: "error", message: error.message });
      }
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

      // Group by groupId to avoid duplicating daily schedule rows on Admin table
      const groupedSchedules = schedules.reduce((acc: any[], current: any) => {
        if (current.groupId) {
          const existing = acc.find(item => item.groupId === current.groupId);
          if (!existing) {
             // Decorate with isGroup flag for frontend distinction
             acc.push({ ...current, isGroup: true });
          } else {
             // Optionally aggregate booking counts or keep first run stats
             existing._count.bookings += current._count.bookings;
          }
        } else {
          acc.push(current);
        }
        return acc;
      }, []);

      res.status(200).json({ status: "success", data: groupedSchedules });
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

      const overlapSchedule = await prisma.schedule.findFirst({
        where: {
          busId,
          id: { not: String(id) },
          isPaused: false,
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
      const schedule = await prisma.schedule.findUnique({ where: { id: String(id) } });

      if (schedule?.groupId) {
         // Delete all future items in this group
         await prisma.schedule.deleteMany({
            where: { groupId: schedule.groupId, departureTime: { gte: new Date() } }
         });
      } else {
         await prisma.schedule.delete({ where: { id: String(id) } });
      }

      res.status(200).json({ status: "success", message: "Schedule series/item deleted successfully" });
    } catch (error: any) {
      if (error.code === "P2003" || (error.message && error.message.includes("foreign key constraint"))) {
         return res.status(400).json({ status: "error", message: "Cannot delete schedule: It has existing bookings." });
      }
      next(error);
    }
  },

  pauseSchedule: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const schedule = await prisma.schedule.findUnique({ where: { id: String(id) } });

      if (!schedule) return res.status(404).json({ error: "Schedule not found" });

      if (schedule.groupId) {
         await prisma.schedule.updateMany({
            where: { groupId: schedule.groupId, departureTime: { gte: new Date() } },
            data: { isPaused: true }
         });
      } else {
         await prisma.schedule.update({ where: { id: schedule.id }, data: { isPaused: true } });
      }

      res.status(200).json({ status: "success", message: "Schedule paused from next day onwards" });
    } catch (error) {
      next(error);
    }
  },

  resumeSchedule: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const schedule = await prisma.schedule.findUnique({ where: { id: String(id) } });

      if (!schedule) return res.status(404).json({ error: "Schedule not found" });

      if (schedule.groupId) {
         await prisma.schedule.updateMany({
            where: { groupId: schedule.groupId },
            data: { isPaused: false }
         });
      } else {
         await prisma.schedule.update({ where: { id: schedule.id }, data: { isPaused: false } });
      }

      res.status(200).json({ status: "success", message: "Schedule resumed" });
    } catch (error) {
      next(error);
    }
  }
};
