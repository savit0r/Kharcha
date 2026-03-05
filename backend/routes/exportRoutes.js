import express from "express";
import { exportTransactionsPDF } from "../controllers/exportController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/transactions/pdf", exportTransactionsPDF);

export default router;
