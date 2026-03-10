"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = __importDefault(require("../../config/prisma"));
const jwt_1 = require("../../utils/jwt");
const mailer_1 = require("../../utils/mailer");
const google_auth_library_1 = require("google-auth-library");
const env_1 = require("../../config/env");
const googleClient = new google_auth_library_1.OAuth2Client(env_1.env.GOOGLE_CLIENT_ID);
exports.authService = {
    register: async (data) => {
        const existingUser = await prisma_1.default.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            throw new Error("Email already in use");
        }
        const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
        const verificationToken = crypto_1.default.randomBytes(32).toString("hex");
        const user = await prisma_1.default.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                verificationToken,
                role: "USER"
            },
            select: { id: true, name: true, email: true, role: true, isEmailVerified: true },
        });
        await (0, mailer_1.sendVerificationEmail)(user.email, verificationToken);
        return { user, message: "Registration successful. Please check your email to verify your account." };
    },
    verifyEmail: async (token) => {
        const user = await prisma_1.default.user.findFirst({
            where: { verificationToken: token },
        });
        if (!user) {
            throw new Error("Invalid or expired verification token");
        }
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: {
                isEmailVerified: true,
                verificationToken: null,
            },
        });
        return { message: "Email successfully verified!" };
    },
    login: async (data) => {
        const user = await prisma_1.default.user.findUnique({
            where: { email: data.email },
        });
        if (!user || !user.password) {
            throw new Error("Invalid credentials");
        }
        const isPasswordValid = await bcryptjs_1.default.compare(data.password, user.password);
        if (!isPasswordValid) {
            throw new Error("Invalid credentials");
        }
        if (!user.isEmailVerified) {
            throw new Error("Please verify your email address before logging in");
        }
        const payload = { id: user.id, role: user.role };
        const accessToken = (0, jwt_1.generateToken)(payload);
        const refreshToken = (0, jwt_1.generateRefreshToken)(payload);
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: { refreshToken },
        });
        return {
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
            accessToken,
            refreshToken,
        };
    },
    refreshToken: async (token) => {
        try {
            const decoded = (0, jwt_1.verifyRefreshToken)(token);
            const user = await prisma_1.default.user.findUnique({
                where: { id: decoded.id },
            });
            if (!user || user.refreshToken !== token) {
                throw new Error();
            }
            const payload = { id: user.id, role: user.role };
            const newAccessToken = (0, jwt_1.generateToken)(payload);
            // Optionally rotate the refresh token here, but keeping it simple and static for now.
            return { accessToken: newAccessToken };
        }
        catch (e) {
            throw new Error("Invalid refresh token");
        }
    },
    googleAuth: async (tokenId) => {
        try {
            const ticket = await googleClient.verifyIdToken({
                idToken: tokenId,
                audience: env_1.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            if (!payload || !payload.email) {
                throw new Error("Invalid Google token");
            }
            const { email, name, sub: googleId } = payload;
            let user = await prisma_1.default.user.findUnique({
                where: { email },
            });
            if (!user) {
                // Create new user via Google
                user = await prisma_1.default.user.create({
                    data: {
                        email,
                        name: name || "User",
                        googleId,
                        isEmailVerified: true, // Google accounts don't need manual verification
                        role: "USER"
                    },
                });
            }
            else if (!user.googleId) {
                // Link existing account with Google
                user = await prisma_1.default.user.update({
                    where: { id: user.id },
                    data: { googleId, isEmailVerified: true },
                });
            }
            const tokenPayload = { id: user.id, role: user.role };
            const accessToken = (0, jwt_1.generateToken)(tokenPayload);
            const refreshToken = (0, jwt_1.generateRefreshToken)(tokenPayload);
            await prisma_1.default.user.update({
                where: { id: user.id },
                data: { refreshToken },
            });
            return {
                user: { id: user.id, name: user.name, email: user.email, role: user.role },
                accessToken,
                refreshToken,
            };
        }
        catch (error) {
            console.error(error);
            throw new Error("Google authentication failed");
        }
    }
};
