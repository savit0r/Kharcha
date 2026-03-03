import express from "express";
import { getCategories, addCategory, deleteCategory } from "../controllers/categoryController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getCategories);
router.post("/", addCategory);
router.delete("/:id", deleteCategory);

export default router;
