import { Worker } from "bullmq";
import { connection, USE_REDIS } from "../queue.js";
import pool from "../../config/db.js";
import { logActivity } from "../../utils/logger.js";

export const processRecurringTransaction = async (t) => {
    console.log(`[Recurring Processor] Processing transaction ID ${t.id} for user ${t.user_id}`);

    try {
        const today = new Date();

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
                today.toISOString().split("T")[0],
                t.receipt_url,
                true,
                t.recurring_frequency,
                today.toISOString().split("T")[0]
            ]
        );

        // Update the original template transaction's last_processed_date
        await pool.query(
            `UPDATE transactions SET last_processed_date = $1 WHERE id = $2`,
            [today.toISOString().split("T")[0], t.id]
        );

        logActivity(t.user_id, "SYSTEM_RECURRING_EXPENSE", `Automatically generated recurring transaction for '${t.title}'`);
        console.log(`[Recurring Processor] Finished duplicate transaction ID ${t.id}`);

    } catch (error) {
        console.error(`[Recurring Processor] Failed transaction ID ${t.id}:`, error.message);
        throw error;
    }
};

// Worker for processing individual recurring transactions via BullMQ
export let recurringTransactionWorker = null;

if (USE_REDIS) {
    recurringTransactionWorker = new Worker("recurringTransactionQueue", async (job) => {
        await processRecurringTransaction(job.data.transaction);
    }, { connection });

    recurringTransactionWorker.on("completed", (job) => {
        console.log(`Job (Recurring) ${job.id} has completed!`);
    });

    recurringTransactionWorker.on("failed", (job, err) => {
        console.log(`Job (Recurring) ${job.id} has failed with ${err.message}`);
    });
} else {
    console.log("[Worker - Recurring] Redis disabled. Recurring transactions will process synchronously in cron run.");
}

