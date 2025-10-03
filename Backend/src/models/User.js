const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  full_name: {
    type: String,
    required: true,
    maxlength: 100,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    maxlength: 100,
  },
  password_hash: {
    type: String,
    default: null, // NULL for Google OAuth users
  },
  currency: {
    type: String,
    default: 'INR',
    maxlength: 10,
  },
  monthly_income: {
    type: Number,
    default: null,
  },
  auth_provider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
  },
  google_id: {
    type: String,
    default: null,
  },
  profile_picture: {
    type: String, // store URL or base64 string
    default: null,
  },
  is_verified: {
    type: Boolean,
    default: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', userSchema);