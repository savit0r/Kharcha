import cron from "node-cron";
import pool from "../config/db.js";
import { processRecurringTransaction } from "./workers/recurringTransactionWorker.js";

// Run every day at midnight (00:00)
cron.schedule("0 0 * * *", async () => {
    console.log("[CRON] Running scheduled recurring transaction check...");

    try {
        const res = await pool.query(`
            SELECT * FROM transactions 
            WHERE is_recurring = true
        `);

        const recurringTransactions = res.rows;
        let dispatchedCount = 0;

        for (const t of recurringTransactions) {
            const lastProcessed = new Date(t.last_processed_date || t.date);
            const today = new Date();

            let shouldProcess = false;

            if (t.recurring_frequency === "daily") {
                const diffTime = Math.abs(today - lastProcessed);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays >= 1) shouldProcess = true;
            } else if (t.recurring_frequency === "weekly") {
                const diffTime = Math.abs(today - lastProcessed);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays >= 7) shouldProcess = true;
            } else if (t.recurring_frequency === "monthly") {
                const diffMonths = (today.getFullYear() - lastProcessed.getFullYear()) * 12 + (today.getMonth() - lastProcessed.getMonth());
                if (today.getDate() >= lastProcessed.getDate() && diffMonths >= 1) {
                    shouldProcess = true;
                }
            } else if (t.recurring_frequency === "yearly") {
                if (today.getFullYear() > lastProcessed.getFullYear() &&
                    today.getMonth() >= lastProcessed.getMonth() &&
                    today.getDate() >= lastProcessed.getDate()) {
                    shouldProcess = true;
                }
            }

            if (shouldProcess) {
                // Process immediately
                await processRecurringTransaction(t);
                dispatchedCount++;
            }
        }

        console.log(`[CRON] Recurring check finished. Processed ${dispatchedCount} transactions.`);

    } catch (error) {
        console.error("[CRON ERROR] Failed to dispatch recurring transactions:", error);
    }
});
