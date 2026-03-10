import bcrypt from "bcryptjs";
import prisma from "../../config/prisma";
import { generateToken } from "../../utils/jwt";
import { RegisterUserInput, LoginUserInput } from "./auth.schema";

export const authService = {
  register: async (data: RegisterUserInput) => {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error("Email already in use");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: hashedPassword,
        role: "USER", // Default role
      },
      select: { id: true, name: true, email: true, role: true },
    });

    const token = generateToken({ id: user.id, role: user.role });

    return { user, token };
  },

  login: async (data: LoginUserInput) => {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !user.passwordHash) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    const token = generateToken({ id: user.id, role: user.role });

    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    };
  },
};
