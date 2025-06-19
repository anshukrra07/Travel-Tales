// models/ManualCaptureFlag.js
const mongoose = require("mongoose");

const flagSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },  // Can be real or anonymous
  trigger: { type: Boolean, default: false },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 60 * 60 * 1000), // expires after 1 hour
    index: { expires: 0 }
  }
});

module.exports = mongoose.model("ManualCaptureFlag", flagSchema);