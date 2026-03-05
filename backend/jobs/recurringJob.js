import cron from "node-cron";
import pool from "../config/db.js";
import { logActivity } from "../utils/logger.js";

// Run every day at midnight (00:00)
// For testing purposes, you could change this to something like '*/1 * * * *' (every minute)
cron.schedule("0 0 * * *", async () => {
    console.log("[CRON] Running scheduled recurring transaction job...");

    try {
        // Find transactions that are set to recurring
        const res = await pool.query(`
            SELECT * FROM transactions 
            WHERE is_recurring = true
        `);

        const recurringTransactions = res.rows;
        let processedCount = 0;

        for (const t of recurringTransactions) {
            const lastProcessed = new Date(t.last_processed_date || t.date);
            const today = new Date();

            let shouldProcess = false;

            // Check if frequency interval has passed
            if (t.recurring_frequency === 'daily') {
                const diffTime = Math.abs(today - lastProcessed);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays >= 1) shouldProcess = true;
            }
            else if (t.recurring_frequency === 'weekly') {
                const diffTime = Math.abs(today - lastProcessed);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays >= 7) shouldProcess = true;
            }
            else if (t.recurring_frequency === 'monthly') {
                const diffMonths = (today.getFullYear() - lastProcessed.getFullYear()) * 12 + (today.getMonth() - lastProcessed.getMonth());
                if (today.getDate() >= lastProcessed.getDate() && diffMonths >= 1) {
                    shouldProcess = true;
                }
            }
            else if (t.recurring_frequency === 'yearly') {
                if (today.getFullYear() > lastProcessed.getFullYear() &&
                    today.getMonth() >= lastProcessed.getMonth() &&
                    today.getDate() >= lastProcessed.getDate()) {
                    shouldProcess = true;
                }
            }

            if (shouldProcess) {
                // Duplicate transaction
                await pool.query(
                    `INSERT INTO transactions 
                    (user_id, category_id, title, amount, type, date, receipt_url, is_recurring, recurring_frequency, last_processed_date) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                    [
                        t.user_id,
                        t.category_id,
                        `${t.title} (Recurring)`,
                        t.amount,
                        t.type,
                        today.toISOString().split('T')[0],
                        t.receipt_url,
                        true,
                        t.recurring_frequency,
                        today.toISOString().split('T')[0]
                    ]
                );

                // Update the original template transaction's last_processed_date
                await pool.query(
                    `UPDATE transactions SET last_processed_date = $1 WHERE id = $2`,
                    [today.toISOString().split('T')[0], t.id]
                );

                logActivity(t.user_id, 'SYSTEM_RECURRING_EXPENSE', `Automatically generated recurring transaction for '${t.title}'`);
                processedCount++;
            }
        }

        console.log(`[CRON] Recurring job finished. Processed ${processedCount} transactions.`);

    } catch (error) {
        console.error("[CRON ERROR] Failed to process recurring transactions:", error);
    }
});
