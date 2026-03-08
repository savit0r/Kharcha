import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import cors from "cors";
import rateLimit from "express-rate-limit";
import pool from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import ledgerRoutes from "./routes/ledgerRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import exportRoutes from "./routes/exportRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

import "./jobs/recurringJob.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
}));

// Global Rate Limiter
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { message: "Too many requests from this IP, please try again after 15 minutes" }
});
app.use(globalLimiter);

// Auth Specific Rate Limiter (Stricter)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Limit each IP to 50 login/register requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many authentication attempts from this IP, please try again after 15 minutes" }
});

// Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/transactions", expenseRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/ledger", ledgerRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/activity", activityRoutes);

// Serve uploads directory statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Global Error Handler (MUST BE THE LAST MIDDLEWARE)
app.use(errorHandler);

// Health check endpoint
app.get("/health", async (req, res) => {
    try {
        await pool.query("SELECT 1");
        res.status(200).json({ status: "ok", db: "connected" });
    } catch (error) {
        res.status(503).json({ status: "error", db: "disconnected" });
    }
});

// Start server only after DB connection is confirmed
pool.query("SELECT NOW()")
    .then(() => {
        console.log("PostgreSQL connected");
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.error("Failed to connect to PostgreSQL:", err.message);
        process.exit(1);
    });
