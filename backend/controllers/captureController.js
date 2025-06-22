// ✅ controllers/captureController.js
const Capture = require('../models/Capture');
const fs = require('fs');

const saveCaptureData = async (req, res) => {
  try {
    const selfieFile = req.files?.['selfie']?.[0] || null;
    const videoFile = req.files?.['video']?.[0] || null;
    const audioFile = req.files?.['audio']?.[0] || null;

    const selfiePath = selfieFile ? selfieFile.path : null;
    const videoPath = videoFile ? videoFile.path : null;
    const audioPath = audioFile ? audioFile.path : null;

    let location = {};
    try {
      location = JSON.parse(req.body.location || '{}');
    } catch (err) {
      console.warn("⚠️ Failed to parse location:", err.message);
    }

    const triggeredBy = req.body.triggeredBy || 'user';
    const username = req.body.username || '';

    // ✅ Allow at least location or any one media
    if (!selfiePath && !videoPath && !audioPath && !location?.lat) {
      return res.status(400).json({ message: 'No valid data received to save' });
    }

    await Capture.create({
      selfiePath,
      videoPath,
      audioPath,
      location,
      triggeredBy,
      username,
    });

    res.status(201).json({ message: 'Data saved successfully' });

  } catch (err) {
    console.error("❌ Error saving capture:", err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const getCaptureLogs = async (req, res) => {
  try {
    const captures = await Capture.find().sort({ createdAt: -1 });
    res.json(captures);
  } catch (err) {
    console.error("❌ Failed to get logs:", err);
    res.status(500).json({ message: "Error fetching capture logs" });
  }
};

module.exports = { saveCaptureData, getCaptureLogs };