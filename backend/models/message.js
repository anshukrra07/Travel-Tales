// ✅ models/message.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  toUser: String,
  toAnonId: String,
  title: String,
  body: String,
  showEverywhere: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Message", messageSchema);