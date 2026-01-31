const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    let user = await User.findOne({ username });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    user = new User({ username, password });
    
    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    // Return JWT
    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    let user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/auth/user (Load User)
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// ... existing imports and register/login routes ...

// @route   PUT /api/auth/tracks
// @desc    Update the entire list of roadmap tracks
router.put('/tracks', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.tracks = req.body.tracks;
    await user.save();
    res.json(user.tracks);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/auth/todos
// @desc    Update the entire todo list
router.put('/todos', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.todos = req.body.todos;
    await user.save();
    res.json(user.todos);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/auth/update
// @desc    Update user details (Tracks & Topics)
router.put('/update', auth, async (req, res) => {
  try {
    const { tracks } = req.body;

    // Find user
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Update tracks if provided
    if (tracks) user.tracks = tracks;

    await user.save();

    // Return the updated user so frontend can refresh immediately
    res.json({ 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        tracks: user.tracks
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;