"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleAuthSchema = exports.refreshTokenSchema = exports.verifyEmailSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, "Name must be at least 2 characters"),
        email: zod_1.z.string().email("Invalid email address"),
        password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
    }),
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string(),
    }),
});
exports.verifyEmailSchema = zod_1.z.object({
    query: zod_1.z.object({
        token: zod_1.z.string().min(1, "Verification token is required"),
    }),
});
exports.refreshTokenSchema = zod_1.z.object({
    body: zod_1.z.object({
        refreshToken: zod_1.z.string().min(1, "Refresh token is required"),
    }),
});
exports.googleAuthSchema = zod_1.z.object({
    body: zod_1.z.object({
        tokenId: zod_1.z.string().min(1, "Google tokenId is required"),
    }),
});
