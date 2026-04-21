import { z } from "zod";

/**
 * Strong password rules:
 *  - Minimum 8 characters
 *  - At least one uppercase letter (A-Z)
 *  - At least one lowercase letter (a-z)
 *  - At least one digit (0-9)
 *  - At least one special character (@$!%*?&#^_\-+=)
 */
const strongPassword = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
        /[@$!%*?&#^_\-+=]/,
        "Password must contain at least one special character (@$!%*?&#^_-+=)"
    );

export const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email format"),
    password: strongPassword,
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
