const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const User     = require('../models/User');
const Doctor   = require('../models/Doctor');
const Department = require('../models/Department');
const { validate, signupSchema, loginSchema } = require('../middleware/validate');

const router = express.Router();

// ─── Patient Signup ───────────────────────────────────────────────────────────
router.post('/signup', validate(signupSchema), async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, phone: phone || '' });

    const token = jwt.sign(
      { userId: user._id, role: 'patient' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: 'patient' },
    });
  } catch (err) {
    if (err?.code === 11000) return res.status(409).json({ message: 'Email already registered' });
    next(err);
  }
});

// ─── Patient Login ────────────────────────────────────────────────────────────
router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Wrong email or password' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Wrong email or password' });
    }

    const token = jwt.sign(
      { userId: user._id, role: 'patient' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: 'patient' },
    });
  } catch (err) {
    next(err);
  }
});

// ─── Doctor Login ─────────────────────────────────────────────────────────────
router.post('/doctor-login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(401).json({ message: 'Wrong email or password' });
    }

    const match = await bcrypt.compare(password, doctor.password);
    if (!match) {
      return res.status(401).json({ message: 'Wrong email or password' });
    }

    const department = await Department.findOne({ id: doctor.departmentId });

    const token = jwt.sign(
      { doctorId: doctor._id, role: 'doctor' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Doctor login successful',
      token,
      user: {
        id:             doctor._id,
        name:           doctor.name,
        email:          doctor.email,
        role:           'doctor',
        departmentId:   doctor.departmentId,
        departmentName: department ? department.name : 'Unknown',
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
