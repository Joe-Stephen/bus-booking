import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { logError } from "./logger.middleware";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logError(`${req.method} ${req.path}`, err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      status: "error",
      message: "Validation Error",
      errors: (err as any).errors.map((e: any) => ({
        path: e.path.join("."),
        message: e.message,
      })),
    });
  }

  // Handle Prisma Specific Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (err.code === "P2002") {
      const target = err.meta?.target as string[];
      return res.status(409).json({
        status: "error",
        message: `Duplicate field value: ${target?.join(", ")} already exists.`,
      });
    }
    
    // Record not found
    if (err.code === "P2025") {
      return res.status(404).json({
        status: "error",
        message: "Record not found",
      });
    }
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    status: "error",
    message: message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
