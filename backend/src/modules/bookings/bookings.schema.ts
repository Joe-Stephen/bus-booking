import { z } from "zod";

export const createBookingSchema = z.object({
  body: z.object({
    scheduleId: z.string().uuid("Invalid schedule ID format"),
  }),
});

export const changeScheduleSchema = z.object({
  body: z.object({
    newScheduleId: z.string().uuid("Invalid schedule ID format"),
  }),
});
