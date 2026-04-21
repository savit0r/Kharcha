import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import { setAuthCookies, clearAuthCookies } from "../utils/tokenService.js";
import { generateAndSendOtp, verifyOtpCode } from "../utils/otpService.js";

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
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
        next(error);
    }
};

// @desc    Login with password
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
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

        const token = setAuthCookies(res, user.id);

        res.status(200).json({
            message: "Login successful",
            token,
            user: { id: user.id, name: user.name, email: user.email },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Send OTP to user's email
// @route   POST /api/auth/send-otp
// @access  Public (rate limited)
export const sendOtp = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );
        if (user.rows.length === 0) {
            return res.status(404).json({ message: "User not found. Please register first." });
        }

        await generateAndSendOtp(email);

        res.status(200).json({ message: "OTP sent to your email" });
    } catch (error) {
        next(error);
    }
};

// @desc    Verify OTP and login
// @route   POST /api/auth/verify-otp
// @access  Public (rate limited)
export const verifyOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }

        const result = await verifyOtpCode(email, otp);

        if (!result.valid) {
            return res.status(result.status).json({ message: result.message });
        }

        const user = await pool.query(
            "SELECT id, name, email FROM users WHERE email = $1",
            [email]
        );

        const token = setAuthCookies(res, user.rows[0].id);

        res.status(200).json({
            message: "Login successful",
            token,
            user: user.rows[0],
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Refresh access token using refresh token cookie
// @route   POST /api/auth/refresh
// @access  Public (cookie-based)
export const refreshToken = async (req, res, next) => {
    try {
        const token = req.cookies.refreshToken;

        if (!token) {
            return res.status(401).json({ message: "No refresh token. Please login again." });
        }

        // Dynamically import jwt here to keep it in scope
        const jwt = (await import("jsonwebtoken")).default;

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        } catch {
            clearAuthCookies(res);
            return res.status(401).json({ message: "Refresh token expired. Please login again." });
        }

        // Issue a fresh access token only (don't rotate refresh token to keep it simple)
        const newAccessToken = jwt.sign(
            { userId: decoded.userId },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        const COOKIE_OPTIONS = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        };

        res.cookie("accessToken", newAccessToken, {
            ...COOKIE_OPTIONS,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(200).json({ message: "Token refreshed", token: newAccessToken });
    } catch (error) {
        next(error);
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = (req, res, next) => {
    try {
        clearAuthCookies(res);
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        next(error);
    }
};

// @desc    Get currently logged in user
// @route   GET /api/auth/me
// @access  Private
export const getUserProfile = async (req, res, next) => {
    try {
        const user = await pool.query(
            "SELECT id, name, email FROM users WHERE id = $1",
            [req.userId]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user.rows[0]);
    } catch (error) {
        next(error);
    }
};
