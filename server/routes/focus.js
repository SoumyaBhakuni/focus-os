const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const FocusEntry = require('../models/FocusEntry'); 

// @route   POST /api/focus
// @desc    Log a focus session (Smart Merge: Adds to existing day if present)
router.post('/', auth, async (req, res) => {
  const { date, sessions, notes } = req.body;

  try {
    // 1. Find entry for this user & date
    let dailyEntry = await FocusEntry.findOne({ user: req.user.id, date });

    if (!dailyEntry) {
      // Create New
      dailyEntry = new FocusEntry({
        user: req.user.id,
        date,
        sessions,
        notes
      });
    } else {
      // Merge Existing
      if (notes) dailyEntry.notes = notes;

      sessions.forEach(incomingSession => {
        const existingIndex = dailyEntry.sessions.findIndex(
          s => s.category === incomingSession.category && s.subCategory === incomingSession.subCategory
        );

        if (existingIndex > -1) {
          // Add hours to existing track
          dailyEntry.sessions[existingIndex].focused += Number(incomingSession.focused);
        } else {
          // Add new track
          dailyEntry.sessions.push(incomingSession);
        }
      });
    }

    await dailyEntry.save();
    res.json(dailyEntry);

  } catch (err) {
    console.error("Focus Log Error:", err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/focus
// @desc    Get all logs history
router.get('/', auth, async (req, res) => {
  try {
    const logs = await FocusEntry.find({ user: req.user.id }).sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/focus/:id
// @desc    Update/Overwrite a specific log entry (for manual corrections)
router.put('/:id', auth, async (req, res) => {
  try {
    const { sessions, notes } = req.body;
    
    // Find by ID and User to ensure ownership
    let entry = await FocusEntry.findOne({ _id: req.params.id, user: req.user.id });
    if (!entry) return res.status(404).json({ msg: 'Log not found' });

    // Overwrite the data
    entry.sessions = sessions;
    entry.notes = notes;
    
    await entry.save();
    res.json(entry);
  } catch (err) {
    console.error("Update Error:", err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/focus/:id
// @desc    Delete an entire day's log
router.delete('/:id', auth, async (req, res) => {
  try {
    const entry = await FocusEntry.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!entry) return res.status(404).json({ msg: 'Log not found' });
    res.json({ msg: 'Entry removed' });
  } catch (err) {
    console.error("Delete Error:", err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;