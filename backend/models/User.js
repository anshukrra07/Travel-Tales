const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: {
  type: String,
  default: null,
},
dob: {
  type: Date,
  required: function () {
    return !this.googleLogin;
  },
},
googleLogin: {
  type: Boolean,
  default: false,
},
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

module.exports = mongoose.model('User', userSchema);