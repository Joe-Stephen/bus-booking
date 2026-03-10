"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const zod_1 = require("zod");
const validateRequest = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                res.status(400).json({
                    status: "error",
                    message: "Validation Error",
                    errors: error.errors.map((e) => ({
                        field: e.path.join("."),
                        message: e.message,
                    })),
                });
            }
            else {
                next(error);
            }
        }
    };
};
exports.validateRequest = validateRequest;
