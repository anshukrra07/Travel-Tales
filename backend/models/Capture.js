const mongoose = require('mongoose');

const captureSchema = new mongoose.Schema({
  selfiePath: String,
  videoPath: String,
  audioPath: String, // Optional if you're saving audio separately
  location: {
    lat: Number,
    lon: Number,
    accuracy: Number
  },
  triggeredBy: { type: String, default: 'user' },
  username: { type: String, default: "" },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Capture', captureSchema);