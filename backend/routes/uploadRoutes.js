import express from "express";
import multer from "multer";
import path from "path";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Define storage for Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        // Create unique filenames like: 167890123-receipt.jpg
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

// Configure Multer upload parameters
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
    fileFilter: (req, file, cb) => {
        // Only accept images
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed"), false);
        }
    },
});

// @desc    Upload an image
// @route   POST /api/upload
// @access  Private
router.post("/", authMiddleware, upload.single("receipt"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Return the constructed path so frontend can store it
        // We'll serve the /uploads directory statically
        const filePath = `/uploads/${req.file.filename}`;

        res.status(200).json({
            message: "File uploaded successfully",
            filePath: filePath,
        });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ message: "Server error during file upload" });
    }
});

// Error handling middleware for Multer
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
        return res.status(400).json({ message: err.message });
    }
    next();
});

export default router;
