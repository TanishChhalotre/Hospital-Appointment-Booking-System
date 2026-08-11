const express    = require('express');
const bcrypt     = require('bcryptjs');
const crypto     = require('crypto');        // built-in Node.js module — no npm install needed
const jwt        = require('jsonwebtoken');
const User       = require('../models/User');
const Doctor     = require('../models/Doctor');
const Department = require('../models/Department');
const { sendOtpEmail } = require('../services/email');
const {
  validate,
  signupSchema,
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
} = require('../middleware/validate');

const router = express.Router();

// ── Helper: generate and store OTP ───────────────────────────────────────────
// Separated into its own function because both /signup and /resend-otp need it.
//
// crypto.randomInt(100000, 1000000) — generates a cryptographically secure random
// integer between 100000 and 999999 (always exactly 6 digits).
// We do NOT use Math.random() because it is not cryptographically secure.
//
// We then hash the OTP with bcrypt before saving it to the database.
// This means if someone reads the database, they still cannot find out the OTP.
// The raw OTP is only ever in memory for a moment — long enough to email it.
async function generateAndStoreOtp(user) {
  const rawOtp  = String(crypto.randomInt(100_000, 1_000_000)); // e.g. "482910"
  const otpHash = await bcrypt.hash(rawOtp, 10);

  // +10 minutes from now
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  // .select('+otpHash +otpExpiry +otpAttempts') is needed because these fields
  // have select:false in the schema — they are excluded from normal queries for safety.
  // We use updateOne here so we don't need to re-fetch the user first.
  await User.updateOne(
    { _id: user._id },
    { otpHash, otpExpiry, otpAttempts: 0 }
  );

  return rawOtp; // returned so we can email it
}

// ── POST /api/auth/signup ─────────────────────────────────────────────────────
router.post('/signup', validate(signupSchema), async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      // If the account exists but is NOT verified, allow re-signup:
      // delete the old unverified account so they can start fresh.
      // This handles the case where someone signed up but never verified.
      if (!existing.emailVerified) {
        await User.deleteOne({ _id: existing._id });
      } else {
        return res.status(409).json({ message: 'Email already registered' });
      }
    }

    // Hash the password before saving — never store plain text passwords
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the account with emailVerified: false
    // The user cannot log in until they verify their email
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone:    phone || '',
      emailVerified: false,
    });

    // Generate OTP, store its hash in the database, and get back the raw OTP
    const rawOtp = await generateAndStoreOtp(user);

    // Send the raw OTP to the user's email
    // If the email service is not configured (no SMTP env vars), we skip sending
    // and log the OTP to the terminal instead — useful for local development
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      await sendOtpEmail(email, name, rawOtp);
    } else {
      console.log(`[DEV] OTP for ${email}: ${rawOtp}`);
    }

    // 201 Created — account exists but needs verification
    // We tell the frontend to go to the verify-otp page
    res.status(201).json({
      message:       'Account created. Please check your email for a 6-digit verification code.',
      requiresVerification: true,
      email,         // frontend needs this to pre-fill the verify form
    });

  } catch (err) {
    if (err?.code === 11000) return res.status(409).json({ message: 'Email already registered' });
    next(err);
  }
});

// ── POST /api/auth/verify-otp ─────────────────────────────────────────────────
router.post('/verify-otp', validate(verifyOtpSchema), async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    // We need the OTP fields — they are excluded by default (select:false)
    // so we must explicitly request them with .select('+field')
    const user = await User.findOne({ email })
      .select('+otpHash +otpExpiry +otpAttempts');

    // Generic error — don't reveal whether the email exists at all
    if (!user || !user.otpHash) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    // Check if already verified — shouldn't normally happen but handle gracefully
    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email is already verified. Please log in.' });
    }

    // Check attempt limit — max 5 wrong guesses before they must request a new OTP
    if (user.otpAttempts >= 5) {
      return res.status(429).json({
        message: 'Too many incorrect attempts. Please request a new verification code.',
      });
    }

    // Check expiry — otpExpiry is a Date stored in MongoDB
    if (new Date() > user.otpExpiry) {
      return res.status(400).json({
        message: 'Verification code has expired. Please request a new one.',
      });
    }

    // Compare submitted OTP with the stored hash
    // bcrypt.compare() hashes the submitted string and compares — same as password checking
    const match = await bcrypt.compare(otp, user.otpHash);

    if (!match) {
      // Wrong OTP — increment attempt counter and save
      await User.updateOne({ _id: user._id }, { $inc: { otpAttempts: 1 } });
      const remaining = 4 - user.otpAttempts; // user.otpAttempts is the value BEFORE increment
      return res.status(400).json({
        message: `Incorrect code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
      });
    }

    // ✅ OTP is correct — mark account as verified and clear all OTP data
    // $unset removes the fields entirely from the document
    await User.updateOne(
      { _id: user._id },
      {
        emailVerified: true,
        $unset: { otpHash: '', otpExpiry: '', otpAttempts: '' },
      }
    );

    // Account is now fully active — redirect frontend to login
    res.json({
      message: 'Email verified successfully! You can now log in.',
      verified: true,
    });

  } catch (err) {
    next(err);
  }
});

// ── POST /api/auth/resend-otp ─────────────────────────────────────────────────
router.post('/resend-otp', validate(resendOtpSchema), async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // Always respond with the same message — don't reveal if email exists
    if (!user || user.emailVerified) {
      return res.json({ message: 'If that email exists and is unverified, a new code has been sent.' });
    }

    // Generate a fresh OTP and overwrite the old one
    const rawOtp = await generateAndStoreOtp(user);

    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      await sendOtpEmail(email, user.name, rawOtp);
    } else {
      console.log(`[DEV] Resent OTP for ${email}: ${rawOtp}`);
    }

    res.json({ message: 'A new verification code has been sent to your email.' });

  } catch (err) {
    next(err);
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Wrong email or password' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Wrong email or password' });
    }

    // Block login if email not verified — tell the frontend so it can redirect
    // to the OTP page instead of showing a generic error
    if (!user.emailVerified) {
      return res.status(403).json({
        message:              'Please verify your email before logging in.',
        requiresVerification: true,
        email:                user.email,
      });
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

// ── POST /api/auth/doctor-login ───────────────────────────────────────────────
// Doctors are seeded — no OTP needed for them
router.post('/doctor-login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

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
