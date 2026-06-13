// backend/routes/uploads.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const Upload = require('../models/Upload');
const { protect } = require('../middleware/auth');
const AWS = require('aws-sdk');

// Configure AWS S3
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Configure multer for file upload
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['audio/mpeg', 'audio/wav', 'audio/aac', 'audio/flac'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file format'));
        }
    },
});

// Upload track
router.post('/upload', protect, upload.single('track'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { trackName, artistName, genre, description } = req.body;

        if (!trackName || !artistName || !genre) {
            return res.status(400).json({ message: 'Please provide track details' });
        }

        // Upload to S3
        const fileName = `${req.user.id}/${Date.now()}-${req.file.originalname}`;
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileName,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
            ACL: 'public-read',
        };

        const s3Response = await s3.upload(params).promise();

        // Create upload record
        const uploadRecord = new Upload({
            userId: req.user.id,
            trackName,
            artistName,
            genre,
            description,
            fileUrl: s3Response.Location,
            fileName: req.file.originalname,
            fileSize: req.file.size,
            audioFormat: req.file.mimetype.split('/')[1],
            status: 'processing',
        });

        await uploadRecord.save();

        // Update user track count
        await User.findByIdAndUpdate(
            req.user.id,
            { $inc: { tracksUploaded: 1 } }
        );

        res.status(201).json({
            success: true,
            message: 'Track uploaded successfully',
            upload: uploadRecord,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get user uploads
router.get('/my-uploads', protect, async (req, res) => {
    try {
        const uploads = await Upload.find({ userId: req.user.id }).sort({ uploadedAt: -1 });
        res.status(200).json({ success: true, uploads });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete upload
router.delete('/:id', protect, async (req, res) => {
    try {
        const uploadRecord = await Upload.findById(req.params.id);

        if (!uploadRecord || uploadRecord.userId.toString() !== req.user.id.toString()) {
            return res.status(404).json({ message: 'Upload not found' });
        }

        // Delete from S3
        const fileName = uploadRecord.fileUrl.split('/').pop();
        await s3.deleteObject({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `${req.user.id}/${fileName}`,
        }).promise();

        await Upload.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Track deleted successfully',
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;