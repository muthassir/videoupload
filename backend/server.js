const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
app.use(cors({ origin: "*"}));
app.use(express.json({ limit: '50mb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Enhanced Schemas for Cloudinary
const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  videoUrl: {
    type: String,
    required: true
  },
  cloudinaryId: {
    type: String,
    required: true
  },
  duration: Number,
  fileSize: Number,
  format: String,
  uploadedAt: { 
    type: Date, 
    default: Date.now 
  },
  likes: {
    type: Number,
    default: 0
  }
});

const adSchema = new mongoose.Schema({
  title: String,
  imageUrl: String,
  url: String,
});

const contentRemoveSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  msg: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved'],
    default: 'pending'
  },
  submittedAt: { 
    type: Date, 
    default: Date.now 
  }
});

const Video = mongoose.model('Video', videoSchema);
const Ad = mongoose.model('Ad', adSchema);
const ContentRemove = mongoose.model('ContentRemove', contentRemoveSchema);

// Routes

// Updated upload route for Cloudinary - now accepts video metadata instead of file
app.post('/api/videos/upload', async (req, res) => {
  try {
    const { title, videoUrl, cloudinaryId, duration, fileSize, format } = req.body;

    // Validate required fields
    if (!title || !videoUrl || !cloudinaryId) {
      return res.status(400).json({ 
        error: 'Title, videoUrl, and cloudinaryId are required' 
      });
    }

    if (title.length < 3) {
      return res.status(400).json({ 
        error: 'Title must be at least 3 characters long' 
      });
    }

    const video = new Video({
      title: title.trim(),
      videoUrl,
      cloudinaryId,
      duration: duration || 0,
      fileSize: fileSize || 0,
      format: format || 'mp4'
    });

    await video.save();
    
    res.status(201).json({
      message: 'Video uploaded successfully',
      video: {
        id: video._id,
        title: video.title,
        videoUrl: video.videoUrl,
        duration: video.duration,
        uploadedAt: video.uploadedAt
      }
    });
    
  } catch (error) {
    console.error('Error saving video:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    
    res.status(500).json({ 
      error: 'Error saving video information',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get all videos with optional pagination
app.get('/api/videos', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const videos = await Video.find()
      .sort({ uploadedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await Video.countDocuments();

    res.json({
      videos,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ error: 'Error fetching videos' });
  }
});

// Get single video by ID
app.get('/api/videos/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    res.json(video);
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ error: 'Error fetching video' });
  }
});

// Update video likes
app.patch('/api/videos/:id/like', async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    res.json({ likes: video.likes });
  } catch (error) {
    console.error('Error updating likes:', error);
    res.status(500).json({ error: 'Error updating likes' });
  }
});

// Content removal request with enhanced validation
app.post('/api/contentremove', async (req, res) => {
  try {
    const { email, msg } = req.body;

    if (!email || !msg) {
      return res.status(400).json({ 
        error: 'Email and message are required' 
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Please provide a valid email address' 
      });
    }

    if (msg.length < 10) {
      return res.status(400).json({ 
        error: 'Message must be at least 10 characters long' 
      });
    }

    const contentRemoval = new ContentRemove({
      email: email.trim().toLowerCase(),
      msg: msg.trim()
    });

    await contentRemoval.save();
    
    res.status(201).json({
      message: 'Content removal request submitted successfully',
      requestId: contentRemoval._id,
      status: contentRemoval.status
    });
    
  } catch (error) {
    console.error('Error processing content removal request:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    
    res.status(500).json({ error: 'Error processing removal request' });
  }
});

// Get all content removal requests (admin endpoint)
app.get('/api/contentremove', async (req, res) => {
  try {
    const requests = await ContentRemove.find()
      .sort({ submittedAt: -1 })
      .select('-__v');
    
    res.json(requests);
  } catch (error) {
    console.error('Error fetching removal requests:', error);
    res.status(500).json({ error: 'Error fetching removal requests' });
  }
});

// Get random ad with fallback
app.get('/api/ads/random', async (req, res) => {
  try {
    const ads = await Ad.find();
    
    if (ads.length === 0) {
      // Return default ad if no ads in database
      return res.json({
        title: 'Welcome to Flixx',
        imageUrl: 'https://via.placeholder.com/300x150/800080/FFFFFF?text=Flixx+Video',
        url: '#',
        _id: 'default-ad'
      });
    }

    const randomAd = ads[Math.floor(Math.random() * ads.length)];
    res.json(randomAd);
  } catch (error) {
    console.error('Error fetching ad:', error);
    // Fallback ad on error
    res.json({
      title: 'Flixx Video Platform',
      imageUrl: 'https://via.placeholder.com/300x150/800080/FFFFFF?text=Flixx+Video',
      url: '#',
      _id: 'fallback-ad'
    });
  }
});

// Create new ad (admin endpoint)
app.post('/api/ads', async (req, res) => {
  try {
    const { title, imageUrl, url } = req.body;

    if (!title || !imageUrl || !url) {
      return res.status(400).json({ 
        error: 'Title, imageUrl, and url are required' 
      });
    }

    const ad = new Ad({
      title,
      imageUrl,
      url
    });

    await ad.save();
    res.status(201).json(ad);
  } catch (error) {
    console.error('Error creating ad:', error);
    res.status(500).json({ error: 'Error creating ad' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Flixx Video API Server',
    version: '1.0.0',
    endpoints: {
      videos: {
        upload: 'POST /api/videos/upload',
        list: 'GET /api/videos',
        single: 'GET /api/videos/:id',
        like: 'PATCH /api/videos/:id/like'
      },
      content: {
        removal: 'POST /api/contentremove',
        requests: 'GET /api/contentremove'
      },
      ads: {
        random: 'GET /api/ads/random',
        create: 'POST /api/ads'
      },
      health: 'GET /api/health'
    }
  });
});

// 404 handler for undefined routes - FIXED: Use proper Express 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { 
      message: error.message
    })
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}`);
  console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
});