import pool from "../config/db.js";

/**
 * Logs a user action to the activity_logs table
 * @param {number} userId - ID of the user performing the action
 * @param {string} action - Short identifier for the action (e.g., 'ADD_EXPENSE')
 * @param {string} description - Human-readable description of what happened
 */
export const logActivity = async (userId, action, description) => {
    try {
        if (!userId || !action || !description) return;

        await pool.query(
            "INSERT INTO activity_logs (user_id, action, description) VALUES ($1, $2, $3)",
            [userId, action, description]
        );
    } catch (error) {
        console.error("Failed to log activity:", error.message);
        // Do not throw the error to prevent the main transaction from failing 
        // just because logging failed.
    }
};
