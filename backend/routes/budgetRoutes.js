import express from "express";
import { getBudgets, setBudget } from "../controllers/budgetController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getBudgets);
router.post("/", setBudget);

export default router;
