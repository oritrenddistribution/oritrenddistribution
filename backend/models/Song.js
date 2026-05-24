const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  artistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide song title'],
    trim: true
  },
  artists: [{
    type: String,
    required: true
  }],
  featuredArtists: [String],
  genre: {
    type: String,
    required: true
  },
  releaseDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true // in seconds
  },
  description: String,
  lyrics: String,
  metadata: {
    isrc: String,
    iswc: String,
    language: String,
    copyright: String,
    producerCredits: String
  },
  platforms: [{
    type: String,
    enum: ['spotify', 'apple', 'youtube', 'tiktok', 'boomplay', 'audiomack', 'deezer', 'amazon', 'tidal']
  }],
  status: {
    type: String,
    enum: ['draft', 'pending_approval', 'approved', 'scheduled', 'live', 'removed', 'failed'],
    default: 'draft'
  },
  audioFile: {
    s3Key: String,
    s3Url: String,
    fileSize: Number,
    duration: Number
  },
  coverArt: {
    s3Key: String,
    s3Url: String,
    fileSize: Number
  },
  analytics: {
    totalStreams: {
      type: Number,
      default: 0
    },
    totalDownloads: {
      type: Number,
      default: 0
    },
    totalEarnings: {
      type: Number,
      default: 0
    },
    platformStats: [{
      platform: String,
      streams: Number,
      downloads: Number,
      earnings: Number
    }]
  },
  distributedAt: Date,
  failureReason: String,
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
songSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Song', songSchema);
