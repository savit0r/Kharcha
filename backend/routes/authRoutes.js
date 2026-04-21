import express from "express";
import { registerUser, loginUser, sendOtp, verifyOtp, logoutUser, getUserProfile, refreshToken } from "../controllers/authController.js";
import { sendOtpLimiter, verifyOtpLimiter } from "../middleware/rateLimiter.js";
import authMiddleware from "../middleware/authMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";
import { registerSchema, loginSchema, verifyOtpSchema, resendOtpSchema } from "../validations/authValidation.js";

const router = express.Router();

router.post("/register", validateRequest(registerSchema), registerUser);
router.post("/login", validateRequest(loginSchema), loginUser);
router.post("/send-otp", sendOtpLimiter, sendOtp);
router.post("/verify-otp", verifyOtpLimiter, validateRequest(verifyOtpSchema), verifyOtp);
router.post("/refresh", refreshToken);
router.post("/logout", logoutUser);
router.get("/me", authMiddleware, getUserProfile);

export default router;
