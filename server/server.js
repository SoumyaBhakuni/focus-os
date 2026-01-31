// server/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const aiRoutes = require('./routes/ai');

const app = express();

app.use(express.json());
app.use(cors());

// --- NEW LINE 1: Import Routes ---
const focusRoutes = require('./routes/focus');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

app.get('/', (req, res) => {
  res.send('FocusOS API is running...');
});

// --- NEW LINE 2: Use Routes ---
app.use('/api/auth', authRoutes); // <--- NEW
app.use('/api/focus', focusRoutes);
app.use('/api/ai', aiRoutes);     // <--- NEW

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});