const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  category: { type: String, required: true }, // e.g., "Dev", "DSA", "Reading"
  subCategory: { type: String, default: '' }, // e.g., "Graphs", "AutoScan Project"
  tags: [{ type: String }],                   // e.g., ["Learning", "Self-Coded", "With-AI"]
  focused: { type: Number, required: true },
  assigned: { type: Number, required: true }  // We track targets per session now
});

const FocusEntrySchema = new mongoose.Schema({
  // --- 1. NEW: Link data to the specific user ---
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // --- 2. FIX: Date is NOT unique globally anymore ---
  date: {
    type: String, 
    required: true
    // removed 'unique: true' from here
  },

  sessions: [SessionSchema], 
  notes: { type: String, default: '' }
}, {
  timestamps: true
});

// --- 3. COMPOUND INDEX: Unique Date PER USER ---
// This ensures YOU can't have two entries for today, 
// but YOU and ANOTHER USER can both log today.
FocusEntrySchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('FocusEntry', FocusEntrySchema);