const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, staffOrAdmin } = require('../middleware/auth');

// Ensure uploads directory exists
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Multer disk storage – keeps original extension, adds timestamp to avoid collisions
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const name = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
        cb(null, name);
    },
});

// Accept only image files, max 5 MB
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp|gif/;
        const ok = allowed.test(path.extname(file.originalname).toLowerCase())
            && allowed.test(file.mimetype);
        ok ? cb(null, true) : cb(new Error('Only image files are allowed (jpg, png, webp, gif)'));
    },
});

/**
 * POST /api/upload
 * Upload a single image and get back its public URL.
 * Protected – only logged-in staff/admin can upload.
 */
router.post('/', protect, staffOrAdmin, upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    // Build the public URL: served by the backend at /uploads/<filename>
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ url: imageUrl, filename: req.file.filename });
});

module.exports = router;
