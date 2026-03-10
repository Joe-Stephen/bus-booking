"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: env_1.env.EMAIL_USER,
        pass: env_1.env.EMAIL_PASS,
    },
});
const sendVerificationEmail = async (to, token) => {
    const verifyUrl = `http://localhost:${env_1.env.PORT}/api/auth/verify-email?token=${token}`;
    console.log(`\n======================================================`);
    console.log(`📩 VERIFICATION EMAIL SENT TO: ${to}`);
    console.log(`🔗 CLICK HERE TO VERIFY: ${verifyUrl}`);
    console.log(`======================================================\n`);
    const mailOptions = {
        from: `"Bus Booking System" <${env_1.env.EMAIL_USER}>`,
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
        if (env_1.env.EMAIL_PASS === "your_app_password" || !env_1.env.EMAIL_PASS) {
            console.log("⚠️  Skipping SMTP delivery because EMAIL_PASS is not configured.");
        }
        else {
            await transporter.sendMail(mailOptions);
        }
    }
    catch (error) {
        console.error("⚠️ Failed to send verification email via Nodemailer. Verification link is printed above.");
    }
};
exports.sendVerificationEmail = sendVerificationEmail;
