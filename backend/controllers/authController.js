const User = require('../models/User'); // Your Mongoose model

// Register user
const registerUser = async (req, res) => {
  try {
    const { username, email, password, dob } = req.body;

    // Validation
    if (!username || !email || !password || !dob) {
      return res.status(400).json({ message: 'Please fill all fields' });
    }

    // Check for existing user
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists with same name or email' });
    }

    // Create new user
    const newUser = await User.create({ username, email, password, dob });

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      user: newUser,
    });
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("Login attempt with:", username, password);

    // Find user by username
    const user = await User.findOne({ username }); // match with 'username' field
    console.log("User found:", user);

    if (!user) {
      return res.status(404).json({ status: "fail", message: "User not found" });
    }

    // Check if password matches
    if (user.password !== password) {
      return res.status(401).json({ status: "fail", message: "Incorrect password" });
    }

    res.status(200).json({ status: "success", message: "Login successful", user });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ status: "success", user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      const username = name.toLowerCase().replace(/\s+/g, '');
      user = new User({
        username,
        email,
        password: null,
        dob: null,
        googleLogin: true,
      });
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({
      status: "success",
      message: "Google login successful",
      user: {
        username: user.username,
        email: user.email,
      },
      token,
    });

  } catch (error) {
    console.error("Google Login Error:", error);
    res.status(500).json({ status: "error", message: "Google login failed" });
  }
};

module.exports = { registerUser, loginUser, getUserProfile ,googleLogin};