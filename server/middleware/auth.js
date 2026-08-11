const jwt = require('jsonwebtoken');

function getTokenData(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

// Patient must be logged in
function requireLogin(req, res, next) {
  const decoded = getTokenData(req);
  if (!decoded || !decoded.userId || decoded.role === 'doctor') {
    return res.status(401).json({ message: 'Please login as a patient first' });
  }
  req.userId = decoded.userId;
  next();
}

// Doctor must be logged in
function requireDoctor(req, res, next) {
  const decoded = getTokenData(req);
  if (!decoded || decoded.role !== 'doctor' || !decoded.doctorId) {
    return res.status(401).json({ message: 'Please login as a doctor first' });
  }
  req.doctorId = decoded.doctorId;
  next();
}

module.exports = { requireLogin, requireDoctor };
