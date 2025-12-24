const express = require("express");
const router = express.Router();
const Message = require("../models/message");
const authOptional = require("../middleware/authOptional");

router.get("/", authOptional, async (req, res) => {
  const username = req.user?.username;
  const anonId = req.query.anonId;

  try {
    const orFilters = [];

    // 1️⃣ Global messages (explicit only)
    orFilters.push({ showEverywhere: true });

    // 2️⃣ Logged-in user messages
    if (username) {
      orFilters.push({ toUser: username });
    }

    // 3️⃣ Anonymous messages (only if NOT logged in)
    if (!username && anonId) {
      orFilters.push({ toAnonId: anonId });
    }

    // 4️⃣ Safety fallback (no match-all ever)
    if (orFilters.length === 0) {
      return res.json({ status: "success", messages: [] });
    }

    const messages = await Message.find({
      $or: orFilters
    }).sort({ createdAt: -1 });

    res.json({ status: "success", messages });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Message fetch failed" });
  }
});

router.post("/send", async (req, res) => {
  const { toUser, toAnonId, title, body, showEverywhere } = req.body;

  if (!title || !body) {
    return res.status(400).json({ status: "fail", message: "Missing title/body" });
  }

  await Message.create({ toUser, toAnonId, title, body, showEverywhere });
  res.json({ status: "success", message: "Message sent" });
});

router.delete("/:id", async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ status: "success", message: "Message deleted" });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Delete failed" });
  }
});
module.exports = router;