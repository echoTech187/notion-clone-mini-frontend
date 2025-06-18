const multer = require('multer');


exports.doUpload = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded or invalid file type.' });
    }

    const baseURL = process.env.APP_BASE_URL || 'http://localhost:5000';
    const imageUrl = `${process.env.APP_BASE_URL || 'http://localhost:5000'}/images/${req.file.filename}`;

    res.status(200).json({
        message: 'Image uploaded successfully!',
        url: imageUrl,
    });
}