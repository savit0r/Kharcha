import express from "express";
import pool from "../config/db.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

// @desc    Get recent activity logs
// @route   GET /api/activity
// @access  Private
router.get("/", async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;

        const result = await pool.query(
            "SELECT * FROM activity_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2",
            [req.userId, limit]
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching activity logs:", error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
