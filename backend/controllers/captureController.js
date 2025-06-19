// ✅ controllers/captureController.js
const Capture = require('../models/Capture');
const fs = require('fs');

const saveCaptureData = async (req, res) => {
  try {
    const selfieFile = req.files['selfie']?.[0];
    const videoFile = req.files['video']?.[0];
    const audioFile = req.files['audio']?.[0];
    const location = JSON.parse(req.body.location || '{}');
    const triggeredBy = req.body.triggeredBy || 'user';
    const username = req.body.username || '';

    if (!selfieFile || !videoFile || !audioFile) {
      return res.status(400).json({ message: 'Missing media files' });
    }

    const selfiePath = selfieFile.path;
    const videoPath = videoFile.path;
    const audioPath = audioFile.path;

    await Capture.create({
  selfiePath,
  videoPath,
  audioPath,
  location,
  triggeredBy,
  username, // ✅ Save it here
});

    res.status(200).json({ message: 'Data saved successfully' });

  } catch (err) {
    console.error("❌ Error saving capture:", err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const getCaptureLogs = async (req, res) => {
  try {
    const captures = await Capture.find().sort({ createdAt: -1 }); // newest first
    res.json(captures);
  } catch (err) {
    console.error("❌ Failed to get logs:", err);
    res.status(500).json({ message: "Error fetching capture logs" });
  }
};

module.exports = { saveCaptureData, getCaptureLogs };
