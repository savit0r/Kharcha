import express from "express";
import { addCustomer, getCustomers, addLedgerEntry, getLedgerByCustomer } from "../controllers/ledgerController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

// Customer routes
router.post("/customers", addCustomer);
router.get("/customers", getCustomers);

// Ledger entry routes
router.post("/customers/:id/entries", addLedgerEntry);
router.get("/customers/:id/entries", getLedgerByCustomer);

export default router;
