const express = require('express');
const cors = require('cors'); // ✅ add this
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

dotenv.config();
connectDB();

const app = express();

app.use(cors()); // ✅ allow all origins (or configure specific ones if needed)
app.use(express.json());
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));