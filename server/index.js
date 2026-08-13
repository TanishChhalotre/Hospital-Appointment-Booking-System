require('dotenv').config();

const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');
const path      = require('path');
const { connectDB }    = require('./db');
const { seedDatabase } = require('./seed');

const app  = express();

app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;
const allowedOrigins = [process.env.CLIENT_URL, 'http://localhost:5173'].filter(Boolean);

app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Origin is not allowed by CORS'));
  },
}));
app.use(express.json({ limit: '20kb' }));

// ── Rate limiters ─────────────────────────────────────────────────────────────
// Auth routes (login, signup): 20 requests per 15 minutes
app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts. Please try again later.' },
}));

// OTP routes get a tighter limit — max 6 attempts per 15 minutes
// This prevents brute-forcing the 6-digit OTP (1,000,000 possibilities)
app.use('/api/auth/verify-otp', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 6,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many verification attempts. Please wait before trying again.' },
}));

app.use('/api/auth/resend-otp', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many resend requests. Please wait before trying again.' },
}));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/users',        require('./routes/users'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/departments',  require('./routes/departments'));
app.use('/api/hospital',     require('./routes/hospital'));
app.use('/api/doctor',       require('./routes/doctor'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Gurjar Hospital API is running' }));

// ── Serve React build (production) ───────────────────────────────────────────
const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientBuildPath));
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ message: 'API route not found' });
  res.sendFile(path.join(clientBuildPath, 'index.html'), err => {
    if (err && !res.headersSent) res.status(404).json({ message: 'Frontend has not been built yet' });
  });
});

// ── Central error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err);
  if (err.message === 'Origin is not allowed by CORS') {
    return res.status(403).json({ message: err.message });
  }
  res.status(err.status || 500).json({ message: err.status ? err.message : 'Something went wrong' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
async function startServer() {
  try {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters long');
    }
    await connectDB();
    if (process.env.SEED_DATABASE === 'true') await seedDatabase();
    app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

if (require.main === module) startServer();
module.exports = app;
