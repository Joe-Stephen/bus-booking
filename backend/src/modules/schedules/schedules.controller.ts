import { Request, Response } from "express";
import prisma from "../../config/prisma";

export const createSchedule = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { busId, routeId, departureTime, arrivalTime, price } = req.body;

    // Validate Bus and Route exist
    const bus = await prisma.bus.findUnique({ where: { id: busId } });
    if (!bus) {
      res.status(404).json({ error: "Bus not found" });
      return;
    }

    const route = await prisma.route.findUnique({ where: { id: routeId } });
    if (!route) {
      res.status(404).json({ error: "Route not found" });
      return;
    }

    const schedule = await prisma.schedule.create({
      data: {
        busId,
        routeId,
        departureTime: new Date(departureTime),
        arrivalTime: new Date(arrivalTime),
        price: parseFloat(price),
      },
    });

    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ error: "Failed to create schedule" });
  }
};

export const getSchedules = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { origin, destination, date } = req.query;

    const where: any = {};

    if (origin || destination) {
      where.route = {};
      if (origin)
        where.route.origin = { contains: String(origin), mode: "insensitive" };
      if (destination)
        where.route.destination = {
          contains: String(destination),
          mode: "insensitive",
        };
    }

    if (date) {
      const startOfDay = new Date(String(date));
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(String(date));
      endOfDay.setUTCHours(23, 59, 59, 999);

      where.departureTime = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const schedules = await prisma.schedule.findMany({
      where,
      include: {
        bus: true,
        route: true,
      },
      orderBy: { departureTime: "asc" },
    });

    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch schedules" });
  }
};

export const getScheduleAvailability = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const schedule = await prisma.schedule.findUnique({
      where: { id: String(id) },
      include: { bus: true },
    });

    if (!schedule) {
      res.status(404).json({ error: "Schedule not found" });
      return;
    }

    const existingBookings = await prisma.booking.count({
      where: {
        scheduleId: String(id),
        status: "BOOKED",
      },
    });

    const availableSeats = schedule.bus.totalSeats - existingBookings;

    res.json({
      scheduleId: id,
      capacity: schedule.bus.totalSeats,
      booked: existingBookings,
      available: availableSeats,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch availability" });
  }
};
