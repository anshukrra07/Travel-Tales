// models/ManualCaptureFlag.js
const mongoose = require("mongoose");

const flagSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  trigger: { type: Boolean, default: false },
  camera: { type: String, enum: ["front", "back"], default: "front" }, // 👈 new
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 60 * 60 * 1000),
    index: { expires: 0 }
  }
});

module.exports = mongoose.model("ManualCaptureFlag", flagSchema);