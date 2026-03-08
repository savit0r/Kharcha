import { z } from "zod";

export const addTransactionSchema = z.object({
    title: z.string().min(1, "Title is required").max(100, "Title is too long"),
    amount: z.number().positive("Amount must be a positive number"),
    type: z.enum(["income", "expense"], { errorMap: () => ({ message: "Type must be 'income' or 'expense'" }) }),
    category_id: z.number().int().positive("Invalid category ID").nullable().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, expected YYYY-MM-DD").optional(),
    is_recurring: z.boolean().optional().default(false),
    recurring_frequency: z.enum(["daily", "weekly", "monthly", "yearly"]).nullable().optional(),
    receipt_url: z.string().url("Invalid URL").nullable().optional(),
});
