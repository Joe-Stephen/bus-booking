import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import prisma from "../../config/prisma";
import { BookingStatus } from "@prisma/client";

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
      // 1. Explicit Row Lock on Schedule to prevent race conditions during concurrent bookings
      const scheduleRows = await tx.$queryRaw`
        SELECT id, "busId", "departureTime" 
        FROM "Schedule" 
        WHERE id = ${scheduleId}::uuid
        FOR UPDATE
      `;

      if (!scheduleRows || scheduleRows.length === 0) {
        throw new Error("SCHEDULE_NOT_FOUND");
      }

      const schedule = scheduleRows[0];

      if (new Date(schedule.departureTime) < new Date()) {
        throw new Error("SCHEDULE_UNAVAILABLE");
      }

      // 2. Count existing active bookings
      const existingBookings = await tx.booking.count({
        where: { scheduleId: schedule.id, status: BookingStatus.BOOKED },
      });

      // 3. Fetch Bus to get total seats
      const bus = await tx.bus.findUnique({
        where: { id: schedule.busId }
      });

      if (!bus) {
        throw new Error("BUS_NOT_FOUND");
      }

      const availableSeats = bus.totalSeats - existingBookings;

      if (availableSeats < 1) {
        throw new Error("NOT_ENOUGH_SEATS");
      }

      // 4. Create Booking
      const newBooking = await tx.booking.create({
        data: { userId, scheduleId: schedule.id, status: BookingStatus.BOOKED },
      });

      return newBooking;
    });

    res.status(201).json({ status: "success", data: booking });
  } catch (error: any) {
    if (error.message === "SCHEDULE_NOT_FOUND" || error.message === "SCHEDULE_UNAVAILABLE") {
      res.status(404).json({ status: "error", message: "Schedule not found or already departed" });
    } else if (error.message === "NOT_ENOUGH_SEATS") {
      res.status(400).json({ status: "error", message: "Not enough seats available" });
    } else {
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
      
      // Explicit Row Lock on New Schedule to prevent race conditions
      const scheduleRows = await tx.$queryRaw`
        SELECT id, "busId", "departureTime" 
        FROM "Schedule" 
        WHERE id = ${newScheduleId}::uuid
        FOR UPDATE
      `;

      if (!scheduleRows || scheduleRows.length === 0) {
        throw new Error("NEW_SCHEDULE_NOT_FOUND");
      }

      const newSchedule = scheduleRows[0];

      if (new Date(newSchedule.departureTime) < new Date()) {
        throw new Error("NEW_SCHEDULE_UNAVAILABLE");
      }

      const existingBookings = await tx.booking.count({
        where: { scheduleId: newSchedule.id, status: BookingStatus.BOOKED },
      });

      const bus = await tx.bus.findUnique({
        where: { id: newSchedule.busId }
      });

      if (!bus) {
         throw new Error("BUS_NOT_FOUND");
      }

      const availableSeats = bus.totalSeats - existingBookings;

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
