import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import prisma from "../../config/prisma";
import { generateToken, verifyToken } from "../../utils/jwt";
import { sendVerificationEmail } from "../../utils/email";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: "Email already in use" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
      },
    });

    const verificationToken = generateToken(user.id, user.role); // using same jwt or special one
    await sendVerificationEmail(user.email, verificationToken);

    res
      .status(201)
      .json({
        message: "User registered. Please check your email to verify.",
        userId: user.id,
      });
  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || (!user.passwordHash && user.googleId)) {
      res
        .status(401)
        .json({ error: "Invalid credentials. Please login with Google." });
      return;
    }

    if (!user.passwordHash) {
      res.status(401).json({ error: "Invalid credentials." });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    if (!user.isEmailVerified) {
      res
        .status(403)
        .json({ error: "Please verify your email prior to login" });
      return;
    }

    const token = generateToken(user.id, user.role);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { token } = req.query;
    if (!token || typeof token !== "string") {
      res.status(400).json({ error: "Token missing" });
      return;
    }

    const decoded = verifyToken(token) as { id: string };
    await prisma.user.update({
      where: { id: decoded.id },
      data: { isEmailVerified: true },
    });

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(400).json({ error: "Invalid or expired token" });
  }
};

export const googleLogin = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { idToken } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email || !payload?.name || !payload?.sub) {
      res.status(400).json({ error: "Invalid Google payload" });
      return;
    }

    const { email, name, sub: googleId } = payload;

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          googleId,
          isEmailVerified: true, // Google emails are already verified
        },
      });
    } else if (!user.googleId) {
      user = await prisma.user.update({
        where: { email },
        data: { googleId, isEmailVerified: true },
      });
    }

    const token = generateToken(user.id, user.role);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(401).json({ error: "Google login failed" });
  }
};
