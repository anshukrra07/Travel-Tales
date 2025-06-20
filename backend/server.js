global.userCaptureTriggers = {}; // In-memory trigger store
const express = require('express');
const cors = require('cors'); // ✅ add this
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const path = require('path');
const fs = require('fs');
const captureRoutes = require('./routes/captureRoutes');

dotenv.config();
connectDB();

const app = express();

app.use(cors()); // ✅ allow all origins (or configure specific ones if needed)
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5001;

// Make sure uploads folder exists
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

app.use('/api', captureRoutes); // mount capture route
app.get("/api/ping", (req, res) => {
  res.send("✅ Backend is alive");
});
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));
