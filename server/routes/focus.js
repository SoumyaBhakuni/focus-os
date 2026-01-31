const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Import Middleware
const FocusEntry = require('../models/FocusEntry');

// @route   POST /api/focus
router.post('/', auth, async (req, res) => {
  const { date, sessions, notes } = req.body;
  try {
    const entry = await FocusEntry.findOneAndUpdate(
      { date: date, user: req.user.id }, // Find by Date AND User
      { $set: { sessions, notes, user: req.user.id } }, // Ensure user ID is saved
      { new: true, upsert: true }
    );
    res.json(entry);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/focus
router.get('/', auth, async (req, res) => {
  try {
    // Only return data belonging to this user
    const entries = await FocusEntry.find({ user: req.user.id }).sort({ date: 1 });
    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;