import nodemailer from "nodemailer";
import { env } from "../config/env";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (
  to: string,
  token: string,
): Promise<void> => {
  const verifyUrl = `http://localhost:${env.PORT}/api/auth/verify-email?token=${token}`;

  const mailOptions = {
    from: `"Bus Booking System" <${env.EMAIL_USER}>`,
    to,
    subject: "Verify Your Email Address",
    html: `
      <h1>Welcome to Bus Booking System!</h1>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verifyUrl}" target="_blank">Verify Email</a>
      <br />
      <p>If you did not request this, please ignore this email.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
};
