import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import prisma from "../../config/prisma";
import { BookingStatus } from "@prisma/client";
import { logError } from "../../middlewares/logger.middleware";

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

    const booking = await prisma.$transaction(async (tx: any) => {
      // 1. Fetch and validate schedule using Prisma (avoids raw SQL uuid cast issues)
      const schedule = await tx.schedule.findUnique({
        where: { id: scheduleId },
        include: { bus: true },
      });

      if (!schedule) {
        throw new Error("SCHEDULE_NOT_FOUND");
      }

      if (new Date(schedule.departureTime) < new Date()) {
        throw new Error("SCHEDULE_UNAVAILABLE");
      }

      // 2. Count existing active bookings
      const existingBookings = await tx.booking.count({
        where: { scheduleId: schedule.id, status: BookingStatus.BOOKED },
      });

      const availableSeats = schedule.bus.totalSeats - existingBookings;

      if (availableSeats < 1) {
        throw new Error("NOT_ENOUGH_SEATS");
      }

      // 3. Create Booking
      return await tx.booking.create({
        data: { userId, scheduleId: schedule.id, status: BookingStatus.BOOKED },
      });
    });

    res.status(201).json({ status: "success", data: booking });
  } catch (error: any) {
    if (error.message === "SCHEDULE_NOT_FOUND" || error.message === "SCHEDULE_UNAVAILABLE") {
      res.status(404).json({ status: "error", message: "Schedule not found or already departed" });
    } else if (error.message === "NOT_ENOUGH_SEATS") {
      res.status(400).json({ status: "error", message: "Not enough seats available" });
    } else {
      logError("createBooking", error);
      res.status(500).json({ status: "error", message: "Failed to create booking" });
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
          include: { route: true, bus: true },
        },
      },
      orderBy: { bookedAt: "desc" },
    });

    res.json({ status: "success", data: bookings });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to fetch bookings" });
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

    const booking = await prisma.booking.findUnique({ where: { id: String(id) }, include: { schedule: true } });
    if (!booking) {
      res.status(404).json({ status: "error", message: "Booking not found" });
      return;
    }

    if (booking.userId !== userId) {
      res.status(403).json({ status: "error", message: "Forbidden" });
      return;
    }

    if (booking.status === BookingStatus.CANCELLED) {
      res.status(400).json({ status: "error", message: "Booking is already cancelled" });
      return;
    }

    if (booking.schedule.departureTime < new Date()) {
      res.status(400).json({ status: "error", message: "Cannot cancel a past booking" });
      return;
    }

    const updated = await prisma.booking.update({
      where: { id: String(id) },
      data: { status: BookingStatus.CANCELLED },
    });

    res.json({ status: "success", data: updated });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to cancel booking" });
  }
};

export const changeSchedule = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { newScheduleId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
       res.status(401).json({ error: "Unauthorized" });
       return;
    }

    const booking = await prisma.booking.findUnique({ where: { id: String(id) } });

    if (!booking) {
       res.status(404).json({ status: "error", message: "Booking not found" });
       return;
    }

    if (booking.userId !== userId) {
       res.status(403).json({ status: "error", message: "Forbidden" });
       return;
    }

    if (booking.status === BookingStatus.CANCELLED) {
       res.status(400).json({ status: "error", message: "Cannot change schedule of a cancelled booking" });
       return;
    }

    // Process re-schedule via atomic transaction
    const updatedBooking = await prisma.$transaction(async (tx: any) => {
      
      // Fetch new schedule using Prisma (avoids raw SQL uuid cast issues)
      const newSchedule = await tx.schedule.findUnique({
        where: { id: newScheduleId },
        include: { bus: true },
      });

      if (!newSchedule) {
        throw new Error("NEW_SCHEDULE_NOT_FOUND");
      }

      if (new Date(newSchedule.departureTime) < new Date()) {
        throw new Error("NEW_SCHEDULE_UNAVAILABLE");
      }

      const existingBookings = await tx.booking.count({
        where: { scheduleId: newSchedule.id, status: BookingStatus.BOOKED },
      });

      const availableSeats = newSchedule.bus.totalSeats - existingBookings;

      if (availableSeats < 1) {
        throw new Error("NOT_ENOUGH_SEATS_NEW");
      }

      return await tx.booking.update({
        where: { id: String(id) },
        data: { scheduleId: newSchedule.id },
      });
    });

    res.status(200).json({ status: "success", data: updatedBooking });
  } catch (error: any) {
    if (error.message === "NEW_SCHEDULE_NOT_FOUND" || error.message === "NEW_SCHEDULE_UNAVAILABLE") {
      res.status(404).json({ status: "error", message: "New schedule not found or already departed" });
    } else if (error.message === "NOT_ENOUGH_SEATS_NEW") {
      res.status(400).json({ status: "error", message: "Not enough seats available on the new schedule" });
    } else {
      res.status(500).json({ status: "error", message: "Failed to change schedule" });
    }
  }
};
