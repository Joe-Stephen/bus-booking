"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const errorHandler = (err, req, res, next) => {
    console.error("error handler caught:", err);
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({
            status: "error",
            message: "Validation Error",
            errors: err.errors.map((e) => ({
                path: e.path.join("."),
                message: e.message,
            })),
        });
    }
    // Handle Prisma Specific Errors
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        // Unique constraint violation
        if (err.code === "P2002") {
            const target = err.meta?.target;
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
exports.errorHandler = errorHandler;
