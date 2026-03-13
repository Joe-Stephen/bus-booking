import bcrypt from "bcryptjs";
import crypto from "crypto";
import prisma from "../../config/prisma";
import { generateToken, generateRefreshToken, verifyRefreshToken } from "../../utils/jwt";
import { RegisterUserInput, LoginUserInput } from "./auth.schema";
import { sendVerificationEmail } from "../../utils/mailer";
import { OAuth2Client } from "google-auth-library";
import { env } from "../../config/env";
import { ApiError } from "../../utils/ApiError";

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

export const authService = {
  register: async (data: RegisterUserInput) => {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ApiError(409, "Email already in use");
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
      throw new ApiError(400, "Invalid or expired verification token");
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
      throw new ApiError(401, "Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password!);

    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid credentials");
    }

    if (!user.isEmailVerified) {
      throw new ApiError(401, "Please verify your email address before logging in");
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
      
      return { accessToken: newAccessToken };
    } catch (e) {
      throw new ApiError(401, "Invalid refresh token");
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
        throw new ApiError(401, "Invalid Google token");
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
            isEmailVerified: true, 
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
    } catch (error: any) {
       if (error instanceof ApiError) throw error;
       console.error(error);
       throw new ApiError(401, "Google authentication failed");
    }
  }
};
