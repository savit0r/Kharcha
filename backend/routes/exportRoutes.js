import express from "express";
import { exportTransactionsPDF, exportTransactionsCSV } from "../controllers/exportController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/transactions/pdf", exportTransactionsPDF);
router.get("/transactions/csv", exportTransactionsCSV);

export default router;
