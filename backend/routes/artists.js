const express = require('express');
const router = express.Router();
const Artist = require('../models/Artist');
const User = require('../models/User');
const Song = require('../models/Song');
const Subscription = require('../models/Subscription');
const { protect } = require('../middleware/auth');
const { validateArtistProfile } = require('../middleware/validation');

// @route   GET /api/artists/profile
// @desc    Get artist profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const artist = await Artist.findOne({ userId: req.user._id });
    
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: 'Artist profile not found. Create one to get started.'
      });
    }

    res.status(200).json({
      success: true,
      artist
    });
  } catch (error) {
    console.error('Get artist profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching artist profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/artists/profile
// @desc    Create artist profile
// @access  Private
router.post('/profile', protect, validateArtistProfile, async (req, res) => {
  try {
    const { artistName, bio, genres, socialLinks } = req.body;

    // Check if artist profile already exists
    let artist = await Artist.findOne({ userId: req.user._id });
    if (artist) {
      return res.status(400).json({
        success: false,
        message: 'Artist profile already exists. Use PUT to update.'
      });
    }

    // Create artist profile
    artist = await Artist.create({
      userId: req.user._id,
      artistName,
      bio: bio || '',
      genres: genres || [],
      socialLinks: socialLinks || {}
    });

    res.status(201).json({
      success: true,
      message: 'Artist profile created successfully',
      artist
    });
  } catch (error) {
    console.error('Create artist profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating artist profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/artists/profile
// @desc    Update artist profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { artistName, bio, genres, socialLinks, profileImage } = req.body;

    let artist = await Artist.findOne({ userId: req.user._id });
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: 'Artist profile not found'
      });
    }

    // Update fields
    if (artistName) artist.artistName = artistName;
    if (bio) artist.bio = bio;
    if (genres && Array.isArray(genres)) artist.genres = genres;
    if (socialLinks) artist.socialLinks = { ...artist.socialLinks, ...socialLinks };
    if (profileImage) artist.profileImage = profileImage;

    await artist.save();

    res.status(200).json({
      success: true,
      message: 'Artist profile updated successfully',
      artist
    });
  } catch (error) {
    console.error('Update artist profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating artist profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/artists/profile
// @desc    Delete artist profile
// @access  Private
router.delete('/profile', protect, async (req, res) => {
  try {
    const artist = await Artist.findOneAndDelete({ userId: req.user._id });
    
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: 'Artist profile not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Artist profile deleted successfully'
    });
  } catch (error) {
    console.error('Delete artist profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting artist profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/artists/dashboard
// @desc    Get artist dashboard data
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
  try {
    const artist = await Artist.findOne({ userId: req.user._id });
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: 'Artist profile not found'
      });
    }

    // Get subscription info
    const subscription = await Subscription.findOne({ userId: req.user._id, status: 'active' });

    // Get total songs
    const totalSongs = await Song.countDocuments({ artistId: artist._id });

    // Get live songs
    const liveSongs = await Song.countDocuments({ artistId: artist._id, status: 'live' });

    // Get total streams
    const songs = await Song.find({ artistId: artist._id });
    const totalStreams = songs.reduce((sum, song) => sum + (song.analytics?.totalStreams || 0), 0);
    const totalEarnings = songs.reduce((sum, song) => sum + (song.analytics?.totalEarnings || 0), 0);

    // Get recent uploads
    const recentSongs = await Song.find({ artistId: artist._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status createdAt');

    res.status(200).json({
      success: true,
      dashboard: {
        artist: {
          id: artist._id,
          artistName: artist.artistName,
          profileImage: artist.profileImage,
          genres: artist.genres
        },
        subscription: subscription ? {
          plan: subscription.plan,
          status: subscription.status,
          endDate: subscription.endDate,
          uploads: subscription.uploads
        } : null,
        stats: {
          totalSongs,
          liveSongs,
          totalStreams,
          totalEarnings
        },
        recentSongs
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/artists/stats
// @desc    Get artist statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const artist = await Artist.findOne({ userId: req.user._id });
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: 'Artist profile not found'
      });
    }

    const songs = await Song.find({ artistId: artist._id });

    // Calculate stats by platform
    const platformStats = {};
    songs.forEach(song => {
      if (song.analytics?.platformStats) {
        song.analytics.platformStats.forEach(stat => {
          if (!platformStats[stat.platform]) {
            platformStats[stat.platform] = { streams: 0, downloads: 0, earnings: 0 };
          }
          platformStats[stat.platform].streams += stat.streams || 0;
          platformStats[stat.platform].downloads += stat.downloads || 0;
          platformStats[stat.platform].earnings += stat.earnings || 0;
        });
      }
    });

    res.status(200).json({
      success: true,
      stats: {
        totalSongs: songs.length,
        liveSongs: songs.filter(s => s.status === 'live').length,
        draftSongs: songs.filter(s => s.status === 'draft').length,
        totalStreams: songs.reduce((sum, s) => sum + (s.analytics?.totalStreams || 0), 0),
        totalDownloads: songs.reduce((sum, s) => sum + (s.analytics?.totalDownloads || 0), 0),
        totalEarnings: songs.reduce((sum, s) => sum + (s.analytics?.totalEarnings || 0), 0),
        platformStats
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/artists/:id
// @desc    Get artist profile by ID (public)
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: 'Artist not found'
      });
    }

    res.status(200).json({
      success: true,
      artist
    });
  } catch (error) {
    console.error('Get artist by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching artist',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
