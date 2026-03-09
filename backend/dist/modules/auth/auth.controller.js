"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const auth_service_1 = require("./auth.service");
exports.authController = {
    register: async (req, res, next) => {
        try {
            const result = await auth_service_1.authService.register(req.body);
            res.status(201).json({
                status: "success",
                data: result,
            });
        }
        catch (error) {
            if (error.message === "Email already in use") {
                return res.status(409).json({ status: "error", message: error.message });
            }
            next(error);
        }
    },
    login: async (req, res, next) => {
        try {
            const result = await auth_service_1.authService.login(req.body);
            res.status(200).json({
                status: "success",
                data: result,
            });
        }
        catch (error) {
            if (error.message === "Invalid credentials") {
                return res.status(401).json({ status: "error", message: error.message });
            }
            next(error);
        }
    },
};
