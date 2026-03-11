import { z } from "zod";

export const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters string"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    role: z.enum(["owner", "staff"]).optional().default("owner"),
});

export const loginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
});

export const verifyOtpSchema = z.object({
    email: z.string().email("Invalid email format"),
    otp: z.string().length(6, "OTP must be exactly 6 digits"),
    type: z.enum(["registration", "password_reset", "login"]).optional(),
});

export const resendOtpSchema = z.object({
    email: z.string().email("Invalid email format"),
    type: z.enum(["registration", "password_reset", "login"]).optional(),
});
