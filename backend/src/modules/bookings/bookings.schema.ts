import { z } from "zod";

export const createBookingSchema = z.object({
  body: z.object({
    scheduleId: z.string().min(1, "Schedule ID is required"),
  }),
});

export const changeScheduleSchema = z.object({
  body: z.object({
    newScheduleId: z.string().min(1, "New Schedule ID is required"),
  }),
});
