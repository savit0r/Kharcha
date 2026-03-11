import rateLimit from "express-rate-limit";

// Rate limit for sending OTP — max 3 requests per 15 minutes per IP
export const sendOtpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3,
    message: { message: "Too many OTP requests. Please try again after 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limit for verifying OTP — max 10 requests per 15 minutes per IP
export const verifyOtpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: "Too many verification attempts. Please try again after 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
});

// Global API rate limiter — max 100 requests per 15 minutes per IP
export const globalApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { message: "Too many requests from this IP, please try again after 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
});
