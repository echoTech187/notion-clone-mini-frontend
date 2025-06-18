const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const uploadController = require('../controllers/uploadController');


// --- Multer Configuration for Local Disk Storage ---
const storage = multer.diskStorage({
    // 'destination' menentukan folder di mana file akan disimpan
    destination: (req, file, cb) => {
        // Path untuk menyimpan file, relatif terhadap direktori ini
        // Memastikan folder 'public/uploads' berada di root server
        const uploadPath = path.join(__dirname, '../public/src/images/uploads');

        // Buat direktori jika belum ada
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    // 'filename' menentukan nama file setelah diunggah
    filename: (req, file, cb) => {
        // Memberikan nama unik untuk setiap file untuk menghindari konflik
        // Contoh: fieldname-timestamp-randomstring.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Inisialisasi Multer dengan konfigurasi penyimpanan
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Batasan ukuran file (misal: 5MB)
    // Filter jenis file yang diizinkan
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true); // Izinkan file
        }
        cb(new Error('Error: Images only! (jpeg, jpg, png, gif, webp)')); // Tolak file
    }
});

router.post('/', upload.single('image'), uploadController.doUpload, (error, req, res, next) => {
    // Middleware error handling untuk multer
    res.status(400).json({ message: error.message });
});

module.exports = router;