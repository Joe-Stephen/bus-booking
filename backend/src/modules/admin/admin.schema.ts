import { z } from "zod";

export const createBusSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Bus name is required"),
    totalSeats: z.number().int().min(1, "Total seats must be greater than 0"),
  }),
});

export const createRouteSchema = z.object({
  body: z.object({
    source: z.string().min(1, "Source is required"),
    destination: z.string().min(1, "Destination is required"),
    distance: z.number().positive("Distance must be a positive number"),
  }),
});

export const createScheduleSchema = z.object({
  body: z.object({
    busId: z.string().min(1, "Bus ID is required"),
    routeId: z.string().min(1, "Route ID is required"),
    // busId: z.string().uuid("Invalid bus ID format"),
    // routeId: z.string().uuid("Invalid route ID format"),
    departureTime: z.string().datetime("Must be a valid ISO 8601 date string"),
    arrivalTime: z.string().datetime("Must be a valid ISO 8601 date string"),
    price: z.number().positive("Price must be a positive number"),
    repeatType: z.number().int().min(1).max(2).optional(),
  }).refine((data) => new Date(data.arrivalTime) > new Date(data.departureTime), {
    message: "Arrival time must be after departure time",
    path: ["arrivalTime"],
  }),
});

export const updateBusSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Bus name is required").optional(),
    totalSeats: z.number().int().min(1, "Total seats must be greater than 0").optional(),
  }),
});

export const updateBusTrackingSchema = z.object({
  body: z.object({
    enabled: z.boolean(),
  }),
});

export const updateRouteSchema = z.object({
  body: z.object({
    source: z.string().min(1, "Source is required").optional(),
    destination: z.string().min(1, "Destination is required").optional(),
    distance: z.number().positive("Distance must be a positive number").optional(),
  }),
});

export const updateScheduleSchema = z.object({
  body: z.object({
    busId: z.string().min(1).optional(),
    routeId: z.string().min(1).optional(),
    departureTime: z.string().datetime("Must be a valid ISO 8601 date string").optional(),
    arrivalTime: z.string().datetime("Must be a valid ISO 8601 date string").optional(),
    price: z.number().positive("Price must be a positive number").optional(),
  }).refine((data) => {
    if (data.arrivalTime && data.departureTime) {
      return new Date(data.arrivalTime) > new Date(data.departureTime);
    }
    return true;
  }, {
    message: "Arrival time must be after departure time",
    path: ["arrivalTime"],
  }),
});
