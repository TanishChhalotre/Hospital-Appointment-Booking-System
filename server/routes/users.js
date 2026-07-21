const express = require('express');
const bcrypt  = require('bcryptjs');
const User    = require('../models/User');
const { requireLogin } = require('../middleware/auth');
const { validate, profileSchema } = require('../middleware/validate');

const router = express.Router();

// ─── Get Profile ──────────────────────────────────────────────────────────────
router.get('/profile', requireLogin, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      id:        user._id,
      name:      user.name,
      email:     user.email,
      phone:     user.phone,
      createdAt: user.createdAt,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get profile', error: err.message });
  }
});

// ─── Update Profile ───────────────────────────────────────────────────────────
router.put('/profile', requireLogin, validate(profileSchema), async (req, res) => {
  try {
    const { name, phone, password } = req.body;
    const updates = {};

    if (name)              updates.name  = name;
    if (phone !== undefined) updates.phone = phone;
    if (password)          updates.password = await bcrypt.hash(password, 10);

    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      message: 'Profile updated',
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile', error: err.message });
  }
});

module.exports = router;
