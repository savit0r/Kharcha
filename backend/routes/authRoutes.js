import express from "express";
import { registerUser, loginUser, sendOtp, verifyOtp, logoutUser } from "../controllers/authController.js";
import { sendOtpLimiter, verifyOtpLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/send-otp", sendOtpLimiter, sendOtp);
router.post("/verify-otp", verifyOtpLimiter, verifyOtp);
router.post("/logout", logoutUser);

export default router;
