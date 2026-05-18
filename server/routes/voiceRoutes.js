const express = require('express');
const multer = require('multer');
const { processVoice } = require('../controllers/voiceController');
const fs = require('fs');

const router = express.Router();

// Ensure the 'uploads' directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up Multer for handling multipart/form-data (audio uploads)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Save temporarily to 'uploads/' directory
  },
  filename: function (req, file, cb) {
    // Generate a unique filename with the original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Attempt to keep extension if present
    const extMatch = file.originalname.match(/\.[^/.]+$/);
    const ext = extMatch ? extMatch[0] : '.webm'; // default to .webm for browser audio
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB limit
  }
});

// Example API Route: /api/voice/upload
// The client should send the file with the field name 'audio'
router.post('/upload', upload.single('audio'), processVoice);

module.exports = router;
