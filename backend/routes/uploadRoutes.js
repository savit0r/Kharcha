import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Configure Cloudinary using environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage for Multer instead of disk storage
const storage = multer.memoryStorage();

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
router.post("/", authMiddleware, upload.single("receipt"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Upload buffer directly to Cloudinary via upload_stream
        const uploadToCloudinary = () => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: "spendora_receipts" },
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
                // End the stream with the file buffer
                stream.end(req.file.buffer);
            });
        };

        const result = await uploadToCloudinary();

        res.status(200).json({
            message: "File uploaded successfully",
            filePath: result.secure_url,
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
