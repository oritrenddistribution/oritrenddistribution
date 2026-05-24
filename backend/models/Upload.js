const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  artistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist',
    required: true
  },
  songId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song'
  },
  fileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['audio', 'cover_art'],
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: String,
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  s3Key: String,
  s3Url: String,
  status: {
    type: String,
    enum: ['uploading', 'completed', 'failed', 'cancelled'],
    default: 'uploading'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  errorMessage: String,
  errorCode: String,
  retryCount: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 3
  },
  ipAddress: String,
  userAgent: String,
  completedAt: Date,
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
uploadSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Upload', uploadSchema);
