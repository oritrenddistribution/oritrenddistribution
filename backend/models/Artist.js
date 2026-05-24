const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  artistName: {
    type: String,
    required: [true, 'Please provide artist name']
  },
  bio: {
    type: String,
    maxlength: 500
  },
  profileImage: {
    type: String,
    default: null
  },
  genres: [{
    type: String,
    enum: [
      'Pop', 'Rock', 'Hip-Hop', 'R&B', 'Jazz', 'Classical',
      'Electronic', 'Country', 'Latin', 'Afrobeats', 'Soul',
      'Reggae', 'Metal', 'Indie', 'Folk', 'Other'
    ]
  }],
  socialLinks: {
    spotify: String,
    appleMusic: String,
    instagram: String,
    twitter: String,
    youtube: String
  },
  stats: {
    totalSongs: {
      type: Number,
      default: 0
    },
    totalStreams: {
      type: Number,
      default: 0
    },
    totalEarnings: {
      type: Number,
      default: 0
    }
  },
  verified: {
    type: Boolean,
    default: false
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
artistSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Artist', artistSchema);
