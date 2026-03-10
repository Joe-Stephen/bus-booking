import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import prisma from "../../config/prisma";

export const createBooking = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { scheduleId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Run within a Prisma transaction to prevent race conditions as best as possible
    const booking = await prisma.$transaction(async (tx: any) => {
      const schedule = await tx.schedule.findUnique({
        where: { id: scheduleId },
        include: { bus: true },
      });

      if (!schedule) {
        throw new Error("SCHEDULE_NOT_FOUND");
      }

      // Count current bookings for this schedule
      const existingBookings = await tx.booking.count({
        where: {
          scheduleId,
          status: "BOOKED",
        },
      });

      const availableSeats = schedule.bus.totalSeats - existingBookings;

      if (availableSeats < 1) {
        throw new Error("NOT_ENOUGH_SEATS");
      }



      const newBooking = await tx.booking.create({
        data: {
          userId,
          scheduleId,
          status: "BOOKED", 
        },
      });

      return newBooking;
    });

    res.status(201).json(booking);
  } catch (error: any) {
    if (error.message === "SCHEDULE_NOT_FOUND") {
      res.status(404).json({ error: "Schedule not found" });
    } else if (error.message === "NOT_ENOUGH_SEATS") {
      res.status(400).json({ error: "Not enough seats available" });
    } else {
      res.status(500).json({ error: "Failed to create booking" });
    }
  }
};

export const getMyBookings = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        schedule: {
          include: {
            route: true,
            bus: true,
          },
        },
      },
      orderBy: { bookedAt: "desc" },
    });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
};

export const cancelBooking = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const booking = await prisma.booking.findUnique({ where: { id: String(id) } });
    if (!booking) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }

    if (booking.userId !== userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    if (booking.status === "CANCELLED") {
      res.status(400).json({ error: "Booking is already cancelled" });
      return;
    }

    const updated = await prisma.booking.update({
      where: { id: String(id) },
      data: { status: "CANCELLED" },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to cancel booking" });
  }
};
