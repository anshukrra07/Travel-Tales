const express = require('express');
const router = express.Router();

// ✅ Make sure this path is correct based on your project structure
const { registerUser, loginUser } = require('../controllers/authController');
const { getUserProfile } = require("../controllers/authController");
const { googleLogin } = require('../controllers/authController');
const authMiddleware = require("../middleware/authMiddleware");
// ✅ Use registerUser as a route handler
router.post('/register', registerUser);
router.post('/login', loginUser); // ✅ Use actual logic now
router.post('/google-login', googleLogin);

module.exports = router;



