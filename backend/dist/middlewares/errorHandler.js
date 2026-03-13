"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const logger_middleware_1 = require("./logger.middleware");
const ApiError_1 = require("../utils/ApiError");
const errorHandler = (err, req, res, next) => {
    let error = err;
    // Convert non-ApiErrors to ApiErrors if necessary
    if (!(error instanceof ApiError_1.ApiError)) {
        let statusCode = error.statusCode || 500;
        let message = error.message || "Internal Server Error";
        if (error instanceof zod_1.ZodError) {
            statusCode = 400;
            message = "Validation Error";
            const errors = error.issues.map((e) => ({
                path: e.path.join("."),
                message: e.message,
            }));
            return res.status(statusCode).json({
                status: "error",
                message,
                errors,
            });
        }
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                statusCode = 409;
                const target = error.meta?.target;
                message = `Duplicate field value: ${target?.join(", ")} already exists.`;
            }
            else if (error.code === "P2025") {
                statusCode = 404;
                message = "Record not found";
            }
        }
        error = new ApiError_1.ApiError(statusCode, message, false, err.stack);
    }
    (0, logger_middleware_1.logError)(`${req.method} ${req.path}`, error);
    res.status(error.statusCode).json({
        status: "error",
        message: error.message,
        ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    });
};
exports.errorHandler = errorHandler;
