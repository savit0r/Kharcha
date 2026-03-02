import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendOtpEmail } from "../utils/emailService.js";

// Helper: Generate tokens and set cookies
const setAuthCookies = (res, userId) => {
    const accessToken = jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
        { userId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
    );

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    };

    res.cookie("accessToken", accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
            [name, email, hashedPassword]
        );

        res.status(201).json({
            message: "User registered successfully",
            user: result.rows[0],
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Login with password
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );
        if (result.rows.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const user = result.rows[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        setAuthCookies(res, user.id);

        res.status(200).json({
            message: "Login successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Send OTP to user's email
// @route   POST /api/auth/send-otp
// @access  Public (rate limited)
export const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        // Check if user exists
        const user = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );
        if (user.rows.length === 0) {
            return res.status(404).json({ message: "User not found. Please register first." });
        }

        // Generate 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();

        // Hash OTP before storing
        const otpHash = await bcrypt.hash(otp, 10);

        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Delete old OTPs for this email, then insert hashed OTP
        await pool.query("DELETE FROM otps WHERE email = $1", [email]);
        await pool.query(
            "INSERT INTO otps (email, otp_hash, attempts, expires_at) VALUES ($1, $2, $3, $4)",
            [email, otpHash, 0, expiresAt]
        );

        // Send plain OTP via email (only the hash is stored)
        await sendOtpEmail(email, otp);

        res.status(200).json({ message: "OTP sent to your email" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to send OTP" });
    }
};

// @desc    Verify OTP and login
// @route   POST /api/auth/verify-otp
// @access  Public (rate limited)
export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }

        // Find OTP record that hasn't expired
        const otpRecord = await pool.query(
            "SELECT * FROM otps WHERE email = $1 AND expires_at > NOW()",
            [email]
        );

        if (otpRecord.rows.length === 0) {
            return res.status(401).json({ message: "OTP expired or not found. Please request a new one." });
        }

        const record = otpRecord.rows[0];

        // Check attempt limit
        if (record.attempts >= record.max_attempts) {
            // Delete the OTP — user must request a new one
            await pool.query("DELETE FROM otps WHERE email = $1", [email]);
            return res.status(429).json({ message: "Too many failed attempts. Please request a new OTP." });
        }

        // Verify OTP hash
        const isValid = await bcrypt.compare(otp, record.otp_hash);

        if (!isValid) {
            // Increment attempt counter
            await pool.query(
                "UPDATE otps SET attempts = attempts + 1 WHERE id = $1",
                [record.id]
            );
            const remaining = record.max_attempts - record.attempts - 1;
            return res.status(401).json({
                message: `Invalid OTP. ${remaining} attempt(s) remaining.`,
            });
        }

        // OTP is valid — delete it (clear after success)
        await pool.query("DELETE FROM otps WHERE email = $1", [email]);

        // Get user
        const user = await pool.query(
            "SELECT id, name, email FROM users WHERE email = $1",
            [email]
        );

        setAuthCookies(res, user.rows[0].id);

        res.status(200).json({
            message: "Login successful",
            user: user.rows[0],
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
