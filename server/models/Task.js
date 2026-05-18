const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100, // Roughly 8 words
  },
  type: {
    type: String,
    required: true,
    enum: ['Action', 'Event', 'Note'],
  },
  urgency: {
    type: String,
    enum: ['high', 'low'],
  },
  importance: {
    type: String,
    enum: ['high', 'low'],
  },
  estimatedTime: {
    type: Number,
    min: 0,
    default: null,
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 1,
  },
  originalTranscript: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Task', TaskSchema);
