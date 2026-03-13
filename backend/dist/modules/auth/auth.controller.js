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
            next(error);
        }
    },
    verifyEmail: async (req, res, next) => {
        try {
            const token = req.query.token;
            const result = await auth_service_1.authService.verifyEmail(token);
            res.status(200).json({
                status: "success",
                data: result,
            });
        }
        catch (error) {
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
            next(error);
        }
    },
    refreshToken: async (req, res, next) => {
        try {
            const { refreshToken } = req.body;
            const result = await auth_service_1.authService.refreshToken(refreshToken);
            res.status(200).json({
                status: "success",
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    },
    googleAuth: async (req, res, next) => {
        try {
            const { tokenId } = req.body;
            const result = await auth_service_1.authService.googleAuth(tokenId);
            res.status(200).json({
                status: "success",
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
};
