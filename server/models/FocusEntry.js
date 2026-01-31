const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  category: { type: String, required: true }, // e.g., "Dev", "DSA", "Reading"
  subCategory: { type: String, default: '' }, // e.g., "Graphs", "AutoScan Project"
  tags: [{ type: String }],                   // e.g., ["Learning", "Self-Coded", "With-AI"]
  focused: { type: Number, required: true },
  assigned: { type: Number, required: true }  // We track targets per session now
});

const FocusEntrySchema = new mongoose.Schema({
  date: {
    type: String, 
    required: true,
    unique: true
  },
  // Instead of a fixed object, we now have an array of sessions
  sessions: [SessionSchema], 
  
  // We can keep daily notes/reflection
  notes: { type: String, default: '' }
}, {
  timestamps: true
});

module.exports = mongoose.model('FocusEntry', FocusEntrySchema);