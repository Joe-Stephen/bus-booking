import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import prisma from "../../config/prisma";

export const createBooking = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { scheduleId, seatCount } = req.body;
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

      // Aggregate confirmed/pending bookings
      const existingBookings = await tx.booking.aggregate({
        where: {
          scheduleId,
          status: { in: ["PENDING", "CONFIRMED"] },
        },
        _sum: {
          seatCount: true,
        },
      });

      const totalSeatsBooked = existingBookings._sum.seatCount || 0;
      const availableSeats = schedule.bus.capacity - totalSeatsBooked;

      if (seatCount > availableSeats) {
        throw new Error("NOT_ENOUGH_SEATS");
      }

      const totalPrice = schedule.price * seatCount;

      const newBooking = await tx.booking.create({
        data: {
          userId,
          scheduleId,
          seatCount,
          totalPrice,
          status: "CONFIRMED", // Set to confirmed directly since no payment flow yet
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
      orderBy: { createdAt: "desc" },
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
