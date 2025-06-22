// models/Access.js
const mongoose = require("mongoose");

const accessSchema = new mongoose.Schema({
  username: String, // can be anonymous-123
  visitedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from creation
    index: { expires: 0 } // TTL index, expires at exact time
  }
});

module.exports = mongoose.model("Access", accessSchema);