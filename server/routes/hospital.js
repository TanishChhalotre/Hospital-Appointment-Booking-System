const express  = require('express');
const Hospital = require('../models/Hospital');

const router = express.Router();

// ─── Get Hospital Info ────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const info = await Hospital.findOne();
    if (!info) return res.status(404).json({ message: 'Hospital info not found' });
    res.json(info);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get hospital info', error: err.message });
  }
});

module.exports = router;
