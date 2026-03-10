"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../../config/prisma"));
const jwt_1 = require("../../utils/jwt");
exports.authService = {
    register: async (data) => {
        const existingUser = await prisma_1.default.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            throw new Error("Email already in use");
        }
        const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
        const user = await prisma_1.default.user.create({
            data: {
                name: data.name,
                email: data.email,
                passwordHash: hashedPassword,
                role: "USER", // Default role
            },
            select: { id: true, name: true, email: true, role: true },
        });
        const token = (0, jwt_1.generateToken)({ id: user.id, role: user.role });
        return { user, token };
    },
    login: async (data) => {
        const user = await prisma_1.default.user.findUnique({
            where: { email: data.email },
        });
        if (!user || !user.passwordHash) {
            throw new Error("Invalid credentials");
        }
        const isPasswordValid = await bcryptjs_1.default.compare(data.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new Error("Invalid credentials");
        }
        const token = (0, jwt_1.generateToken)({ id: user.id, role: user.role });
        return {
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
            token,
        };
    },
};
