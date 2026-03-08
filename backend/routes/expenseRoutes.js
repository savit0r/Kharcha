import express from "express";
import { addTransaction, getTransactions, deleteTransaction } from "../controllers/expenseController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";
import { addTransactionSchema } from "../validations/expenseValidation.js";

const router = express.Router();

router.use(authMiddleware);

// @desc    Add a transaction
// @route   POST /api/transactions
// @access  Private
router.post("/", validateRequest(addTransactionSchema), addTransaction);
router.get("/", getTransactions);
router.delete("/:id", deleteTransaction);

export default router;
