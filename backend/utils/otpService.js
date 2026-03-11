import crypto from "crypto";
import bcrypt from "bcryptjs";
import pool from "../config/db.js";
import { sendOtpEmail } from "./emailService.js";

const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 5;

// Generate, hash, store, and email an OTP
export const generateAndSendOtp = async (email) => {
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Delete old OTPs, insert new one
    await pool.query("DELETE FROM otps WHERE email = $1", [email]);
    await pool.query(
        "INSERT INTO otps (email, otp_hash, attempts, expires_at) VALUES ($1, $2, $3, $4)",
        [email, otpHash, 0, expiresAt]
    );

    // Send email directly
    await sendOtpEmail(email, otp);
};

// Verify an OTP — returns { valid, message }
export const verifyOtpCode = async (email, otp) => {
    const result = await pool.query(
        "SELECT * FROM otps WHERE email = $1 AND expires_at > NOW()",
        [email]
    );

    if (result.rows.length === 0) {
        return { valid: false, status: 401, message: "OTP expired or not found. Please request a new one." };
    }

    const record = result.rows[0];

    // Check attempt limit
    if (record.attempts >= MAX_ATTEMPTS) {
        await pool.query("DELETE FROM otps WHERE email = $1", [email]);
        return { valid: false, status: 429, message: "Too many failed attempts. Please request a new OTP." };
    }

    // Verify hash
    const isValid = await bcrypt.compare(otp, record.otp_hash);

    if (!isValid) {
        await pool.query(
            "UPDATE otps SET attempts = attempts + 1 WHERE id = $1",
            [record.id]
        );
        const remaining = MAX_ATTEMPTS - record.attempts - 1;
        return { valid: false, status: 401, message: `Invalid OTP. ${remaining} attempt(s) remaining.` };
    }

    // Success — clear OTP
    await pool.query("DELETE FROM otps WHERE email = $1", [email]);
    return { valid: true };
};
