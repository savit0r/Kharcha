import { Worker } from "bullmq";
import { connection, USE_REDIS } from "../queue.js";
import { sendOtpEmail } from "../../utils/emailService.js";

// Worker for processing email jobs
export let emailWorker = null;

if (USE_REDIS) {
    emailWorker = new Worker("emailQueue", async (job) => {
        const { type, email, data } = job.data;

        console.log(`[Worker - Email] Processing job ${job.id} of type ${type} for ${email}`);

        try {
            if (type === "otp") {
                await sendOtpEmail(email, data.otp);
            }
            // FUTURE: Add types for "weekly_report", "budget_alert", etc.

            console.log(`[Worker - Email] Finished job ${job.id}`);
        } catch (error) {
            console.error(`[Worker - Email] Failed job ${job.id}:`, error.message);
            throw error; // Let BullMQ handle retries
        }
    }, { connection });

    emailWorker.on("completed", (job) => {
        console.log(`Job ${job.id} has completed!`);
    });

    emailWorker.on("failed", (job, err) => {
        console.log(`Job ${job.id} has failed with ${err.message}`);
    });
} else {
    console.log("[Worker - Email] Redis disabled. Emails will be sent synchronously.");
}

