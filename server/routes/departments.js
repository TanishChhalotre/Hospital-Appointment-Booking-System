const express    = require('express');
const Department = require('../models/Department');

const router = express.Router();

// ─── Get All Departments ──────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const departments = await Department.find().sort({ id: 1 });
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get departments', error: err.message });
  }
});

module.exports = router;
