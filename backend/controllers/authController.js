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

module.exports = { registerUser, loginUser };