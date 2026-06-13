// backend/models/Upload.js
const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    trackName: {
        type: String,
        required: [true, 'Track name is required'],
        trim: true,
    },
    artistName: {
        type: String,
        required: [true, 'Artist name is required'],
        trim: true,
    },
    genre: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        trim: true,
    },
    fileUrl: {
        type: String,
        required: true,
    },
    fileName: String,
    fileSize: Number, // in bytes
    duration: Number, // in seconds
    audioFormat: {
        type: String,
        enum: ['mp3', 'wav', 'aac', 'flac'],
    },
    status: {
        type: String,
        enum: ['uploading', 'processing', 'published', 'failed'],
        default: 'uploading',
    },
    platforms: [{
        platform: String,
        releaseDate: Date,
        status: String,
    }],
    coverArtUrl: String,
    isrc: String, // International Standard Recording Code
    explicit: Boolean,
    uploadedAt: {
        type: Date,
        default: Date.now,
    },
    publishedAt: Date,
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

module.exports = mongoose.model('Upload', uploadSchema);