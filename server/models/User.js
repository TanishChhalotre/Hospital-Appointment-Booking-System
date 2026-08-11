const { mongoose } = require('../db');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone:    { type: String, default: '' },

  // ── Email verification ──────────────────────────────────────────────────────
  // false until the user enters a correct OTP after signup
  emailVerified: { type: Boolean, default: false },

  // OTP data — all three fields are cleared once the user verifies successfully.
  // otpHash    : bcrypt hash of the 6-digit OTP (we never store the raw OTP)
  // otpExpiry  : Date after which the OTP is invalid (10 minutes from generation)
  // otpAttempts: how many wrong guesses the user has made (max 5)
  otpHash:     { type: String,  select: false },   // select:false = excluded from normal queries
  otpExpiry:   { type: Date,    select: false },
  otpAttempts: { type: Number,  select: false, default: 0 },

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
