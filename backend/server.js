const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const dotnenv = require('dotenv')
dotnenv.config()

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({origin: '*'}));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Video Schema
const videoSchema = new mongoose.Schema({
  title: String,
  videoUrl: String,
  uploadedAt: { type: Date, default: Date.now },
});
const Video = mongoose.model('Video', videoSchema);

// Ad Schema
const adSchema = new mongoose.Schema({
  title: String,
  imageUrl: String,
  url: String,
});
const Ad = mongoose.model('Ad', adSchema);

// content Remove schema
const contentRemoveSchema = new mongoose.Schema({
  email: String,
  msg: String,
});
const contentRemove = mongoose.model('contentremove', contentRemoveSchema)

// Multer Storage
const storage = multer.diskStorage({
  destination: './uploads/videos',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Routes
app.post('/api/videos/upload', upload.single('video'), async (req, res) => {
  try {
    const video = new Video({
      title: req.body.title,
      videoUrl: `/uploads/videos/${req.file.filename}`,
    });
    await video.save();
    res.status(201).json(video);
  } catch (error) {
    res.status(500).json({ error: 'Error uploading video' });
  }
});

app.get('/api/videos', async (req, res) => {
  try {
    const videos = await Video.find().sort({ uploadedAt: -1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching videos' });
  }
});

app.post('/api/contentremove', async (req, res)=>{
  try {
    const contentRemoval = new contentRemove({
      email: req.body.email,
      msg: req.body.msg
    })
    await contentRemoval.save()
    res.status(201).json(contentRemoval)
  } catch (error) {
    res.status(500).json({ error: 'Error content removing msg' });
  }
})
app.get('/api/ads/random', async (req, res) => {
  try {
    const ads = await Ad.find();
    const randomAd = ads[Math.floor(Math.random() * ads.length)];
    res.json(randomAd);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching ad' });
  }
});

// Serve uploaded videos
app.use('/uploads/videos', express.static(path.join(__dirname, 'uploads/videos')));

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));