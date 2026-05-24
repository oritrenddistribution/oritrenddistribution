const express = require('express');
const router = express.Router();
const multer = require('multer');
const Upload = require('../models/Upload');
const Song = require('../models/Song');
const Artist = require('../models/Artist');
const Subscription = require('../models/Subscription');
const { protect } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimes = {
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac'],
    cover: ['image/jpeg', 'image/png', 'image/webp']
  };

  const fileType = req.body.fileType || 'audio';
  const allowed = allowedMimes[fileType] || [];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024
  }
});

// @route   POST /api/uploads/audio
// @desc    Upload audio file
// @access  Private
router.post('/audio', protect, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { songId } = req.body;

    const artist = await Artist.findOne({ userId: req.user._id });
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: 'Artist profile not found'
      });
    }

    const subscription = await Subscription.findOne({ userId: req.user._id, status: 'active' });
    if (!subscription) {
      return res.status(403).json({
        success: false,
        message: 'Active subscription required to upload files'
      });
    }

    if (subscription.plan === 'artist' && subscription.uploads.used >= subscription.uploads.limit) {
      return res.status(403).json({
        success: false,
        message: `Upload limit reached for ${subscription.plan} plan. Upgrade to Pro for unlimited uploads.`
      });
    }

    let song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }

    if (song.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to upload for this song'
      });
    }

    const uploadRecord = await Upload.create({
      userId: req.user._id,
      artistId: artist._id,
      songId: songId,
      fileName: req.file.originalname,
      fileType: 'audio',
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      status: 'uploading',
      progress: 0,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    // TODO: Upload to AWS S3
    uploadRecord.status = 'completed';
    uploadRecord.progress = 100;
    uploadRecord.s3Key = `songs/${artist._id}/${songId}/${req.file.originalname}`;
    uploadRecord.s3Url = `https://oritrend-music.s3.amazonaws.com/${uploadRecord.s3Key}`;
    uploadRecord.completedAt = new Date();
    await uploadRecord.save();

    song.audioFile = {
      s3Key: uploadRecord.s3Key,
      s3Url: uploadRecord.s3Url,
      fileSize: req.file.size,
      duration: req.body.duration || null
    };
    song.status = 'pending_approval';
    await song.save();

    if (subscription.plan === 'artist') {
      subscription.uploads.used += 1;
      await subscription.save();
    }

    res.status(200).json({
      success: true,
      message: 'Audio file uploaded successfully',
      upload: uploadRecord,
      song: {
        id: song._id,
        title: song.title,
        status: song.status
      }
    });
  } catch (error) {
    console.error('Audio upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading audio file',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/uploads/cover-art
// @desc    Upload cover art
// @access  Private
router.post('/cover-art', protect, upload.single('coverArt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { songId } = req.body;

    const artist = await Artist.findOne({ userId: req.user._id });
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: 'Artist profile not found'
      });
    }

    let song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }

    if (song.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to upload for this song'
      });
    }

    const uploadRecord = await Upload.create({
      userId: req.user._id,
      artistId: artist._id,
      songId: songId,
      fileName: req.file.originalname,
      fileType: 'cover_art',
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      status: 'uploading',
      progress: 0
    });

    uploadRecord.status = 'completed';
    uploadRecord.progress = 100;
    uploadRecord.s3Key = `covers/${artist._id}/${songId}/${req.file.originalname}`;
    uploadRecord.s3Url = `https://oritrend-music.s3.amazonaws.com/${uploadRecord.s3Key}`;
    uploadRecord.completedAt = new Date();
    await uploadRecord.save();

    song.coverArt = {
      s3Key: uploadRecord.s3Key,
      s3Url: uploadRecord.s3Url,
      fileSize: req.file.size
    };
    await song.save();

    res.status(200).json({
      success: true,
      message: 'Cover art uploaded successfully',
      upload: uploadRecord,
      song: {
        id: song._id,
        title: song.title,
        coverArt: song.coverArt
      }
    });
  } catch (error) {
    console.error('Cover art upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading cover art',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/uploads/status/:uploadId
// @desc    Get upload status
// @access  Private
router.get('/status/:uploadId', protect, async (req, res) => {
  try {
    const uploadRecord = await Upload.findById(req.params.uploadId);
    if (!uploadRecord) {
      return res.status(404).json({
        success: false,
        message: 'Upload not found'
      });
    }

    if (uploadRecord.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this upload'
      });
    }

    res.status(200).json({
      success: true,
      upload: {
        id: uploadRecord._id,
        fileName: uploadRecord.fileName,
        fileType: uploadRecord.fileType,
        status: uploadRecord.status,
        progress: uploadRecord.progress,
        fileSize: uploadRecord.fileSize,
        uploadedAt: uploadRecord.uploadedAt,
        completedAt: uploadRecord.completedAt,
        errorMessage: uploadRecord.errorMessage
      }
    });
  } catch (error) {
    console.error('Get upload status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching upload status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/uploads
// @desc    Get all uploads for artist
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const artist = await Artist.findOne({ userId: req.user._id });
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: 'Artist profile not found'
      });
    }

    const { status, fileType, page = 1, limit = 10 } = req.query;
    let query = { artistId: artist._id };

    if (status) query.status = status;
    if (fileType) query.fileType = fileType;

    const skip = (page - 1) * limit;

    const uploads = await Upload.find(query)
      .sort({ uploadedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Upload.countDocuments(query);

    res.status(200).json({
      success: true,
      uploads,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get uploads error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching uploads',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/uploads/:uploadId
// @desc    Cancel/delete upload
// @access  Private
router.delete('/:uploadId', protect, async (req, res) => {
  try {
    const uploadRecord = await Upload.findById(req.params.uploadId);
    if (!uploadRecord) {
      return res.status(404).json({
        success: false,
        message: 'Upload not found'
      });
    }

    if (uploadRecord.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this upload'
      });
    }

    if (uploadRecord.status !== 'uploading' && uploadRecord.status !== 'failed') {
      return res.status(400).json({
        success: false,
        message: `Cannot delete upload with status: ${uploadRecord.status}`
      });
    }

    uploadRecord.status = 'cancelled';
    await uploadRecord.save();

    res.status(200).json({
      success: true,
      message: 'Upload cancelled successfully'
    });
  } catch (error) {
    console.error('Delete upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling upload',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
