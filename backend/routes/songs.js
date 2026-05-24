const express = require('express');
const router = express.Router();
const Song = require('../models/Song');
const Artist = require('../models/Artist');
const { protect } = require('../middleware/auth');
const { validateSongCreation } = require('../middleware/validation');

// @route   GET /api/songs
// @desc    Get all songs for current artist
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

    const { status, platform, page = 1, limit = 10 } = req.query;
    let query = { artistId: artist._id };

    if (status) query.status = status;
    if (platform) query.platforms = platform;

    const skip = (page - 1) * limit;

    const songs = await Song.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Song.countDocuments(query);

    res.status(200).json({
      success: true,
      songs,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get songs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching songs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/songs
// @desc    Create a new song (metadata only)
// @access  Private
router.post('/', protect, validateSongCreation, async (req, res) => {
  try {
    const artist = await Artist.findOne({ userId: req.user._id });
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: 'Artist profile not found. Create one first.'
      });
    }

    const {
      title,
      artists: songArtists,
      featuredArtists,
      genre,
      releaseDate,
      duration,
      description,
      lyrics,
      metadata,
      platforms
    } = req.body;

    const song = await Song.create({
      artistId: artist._id,
      userId: req.user._id,
      title,
      artists: songArtists || [artist.artistName],
      featuredArtists: featuredArtists || [],
      genre,
      releaseDate,
      duration,
      description: description || '',
      lyrics: lyrics || '',
      metadata: metadata || {},
      platforms: platforms || [],
      status: 'draft'
    });

    res.status(201).json({
      success: true,
      message: 'Song created successfully. Upload audio file next.',
      song
    });
  } catch (error) {
    console.error('Create song error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating song',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/songs/:id
// @desc    Get song details
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }

    // Verify ownership
    if (song.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this song'
      });
    }

    res.status(200).json({
      success: true,
      song
    });
  } catch (error) {
    console.error('Get song error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching song',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/songs/:id
// @desc    Update song metadata
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }

    // Verify ownership
    if (song.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this song'
      });
    }

    // Can only edit draft or pending songs
    if (song.status === 'live' || song.status === 'removed') {
      return res.status(400).json({
        success: false,
        message: `Cannot edit song with status: ${song.status}`
      });
    }

    const { title, genre, releaseDate, duration, description, lyrics, metadata, platforms } = req.body;

    if (title) song.title = title;
    if (genre) song.genre = genre;
    if (releaseDate) song.releaseDate = releaseDate;
    if (duration) song.duration = duration;
    if (description) song.description = description;
    if (lyrics) song.lyrics = lyrics;
    if (metadata) song.metadata = { ...song.metadata, ...metadata };
    if (platforms && Array.isArray(platforms)) song.platforms = platforms;

    await song.save();

    res.status(200).json({
      success: true,
      message: 'Song updated successfully',
      song
    });
  } catch (error) {
    console.error('Update song error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating song',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/songs/:id
// @desc    Delete song
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const song = await Song.findByIdAndDelete(req.params.id);
    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }

    // Verify ownership
    if (song.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this song'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Song deleted successfully'
    });
  } catch (error) {
    console.error('Delete song error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting song',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/songs/:id/analytics
// @desc    Get song analytics
// @access  Private
router.get('/:id/analytics', protect, async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }

    // Verify ownership
    if (song.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this song'
      });
    }

    res.status(200).json({
      success: true,
      analytics: {
        songTitle: song.title,
        status: song.status,
        distributedAt: song.distributedAt,
        totalStreams: song.analytics?.totalStreams || 0,
        totalDownloads: song.analytics?.totalDownloads || 0,
        totalEarnings: song.analytics?.totalEarnings || 0,
        platformStats: song.analytics?.platformStats || []
      }
    });
  } catch (error) {
    console.error('Get song analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/songs/:id/publish
// @desc    Publish song to platforms
// @access  Private
router.post('/:id/publish', protect, async (req, res) => {
  try {
    let song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }

    // Verify ownership
    if (song.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to publish this song'
      });
    }

    // Check if audio file is uploaded
    if (!song.audioFile?.s3Url) {
      return res.status(400).json({
        success: false,
        message: 'Audio file must be uploaded before publishing'
      });
    }

    // Check if cover art is uploaded
    if (!song.coverArt?.s3Url) {
      return res.status(400).json({
        success: false,
        message: 'Cover art must be uploaded before publishing'
      });
    }

    // Change status to scheduled
    song.status = 'scheduled';
    song.distributedAt = new Date();
    await song.save();

    // TODO: Integrate with distribution service (Spotify API, Apple Music, etc.)

    res.status(200).json({
      success: true,
      message: 'Song scheduled for distribution. It will be live within 2-5 business days.',
      song
    });
  } catch (error) {
    console.error('Publish song error:', error);
    res.status(500).json({
      success: false,
      message: 'Error publishing song',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
