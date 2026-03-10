import bcrypt from "bcryptjs";
import crypto from "crypto";
import prisma from "../../config/prisma";
import { generateToken, generateRefreshToken, verifyRefreshToken } from "../../utils/jwt";
import { RegisterUserInput, LoginUserInput } from "./auth.schema";
import { sendVerificationEmail } from "../../utils/mailer";
import { OAuth2Client } from "google-auth-library";
import { env } from "../../config/env";

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

export const authService = {
  register: async (data: RegisterUserInput) => {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error("Email already in use");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        verificationToken,
        role: "USER"
      },
      select: { id: true, name: true, email: true, role: true, isEmailVerified: true },
    });

    await sendVerificationEmail(user.email, verificationToken);

    return { user, message: "Registration successful. Please check your email to verify your account." };
  },

  verifyEmail: async (token: string) => {
    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new Error("Invalid or expired verification token");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        verificationToken: null,
      },
    });

    return { message: "Email successfully verified!" };
  },

  login: async (data: LoginUserInput) => {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !user.password) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password!);

    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    if (!user.isEmailVerified) {
      throw new Error("Please verify your email address before logging in");
    }

    const payload = { id: user.id, role: user.role };
    const accessToken = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    };
  },

  refreshToken: async (token: string) => {
    try {
      const decoded = verifyRefreshToken(token);

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user || user.refreshToken !== token) {
        throw new Error();
      }

      const payload = { id: user.id, role: user.role };
      const newAccessToken = generateToken(payload);
      
      // Optionally rotate the refresh token here, but keeping it simple and static for now.

      return { accessToken: newAccessToken };
    } catch (e) {
      throw new Error("Invalid refresh token");
    }
  },

  googleAuth: async (tokenId: string) => {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: tokenId,
        audience: env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      
      if (!payload || !payload.email) {
        throw new Error("Invalid Google token");
      }

      const { email, name, sub: googleId } = payload;

      let user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        // Create new user via Google
        user = await prisma.user.create({
          data: {
            email,
            name: name || "User",
            googleId,
            isEmailVerified: true, // Google accounts don't need manual verification
            role: "USER"
          },
        });
      } else if (!user.googleId) {
        // Link existing account with Google
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId, isEmailVerified: true },
        });
      }

      const tokenPayload = { id: user.id, role: user.role };
      const accessToken = generateToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken },
      });

      return {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        accessToken,
        refreshToken,
      };
    } catch (error) {
       console.error(error);
       throw new Error("Google authentication failed");
    }
  }
};
