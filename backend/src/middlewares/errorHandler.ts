import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { logError } from "./logger.middleware";
import { ApiError } from "../utils/ApiError";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = err;

  // Convert non-ApiErrors to ApiErrors if necessary
  if (!(error instanceof ApiError)) {
    let statusCode = error.statusCode || 500;
    let message = error.message || "Internal Server Error";

    if (error instanceof ZodError) {
      statusCode = 400;
      message = "Validation Error";
      const errors = error.issues.map((e: any) => ({
        path: e.path.join("."),
        message: e.message,
      }));
      return res.status(statusCode).json({
        status: "error",
        message,
        errors,
      });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        statusCode = 409;
        const target = error.meta?.target as string[];
        message = `Duplicate field value: ${target?.join(", ")} already exists.`;
      } else if (error.code === "P2025") {
        statusCode = 404;
        message = "Record not found";
      }
    }

    error = new ApiError(statusCode, message, false, err.stack);
  }

  logError(`${req.method} ${req.path}`, error);

  res.status(error.statusCode).json({
    status: "error",
    message: error.message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};
