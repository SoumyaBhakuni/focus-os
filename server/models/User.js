const mongoose = require('mongoose');

// Sub-schema for Dynamic Tracks (Roadmaps)
const TrackSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "Maths", "Bio", "Fitness"
  currentTopic: { type: String, default: 'Not Set' }, // e.g. "L1: Algebra"
  targetHours: { type: Number, default: 1.0 } // e.g. 2.0
}, { _id: false });

// Sub-schema for Todo List
const TodoSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isCompleted: { type: Boolean, default: false }
});

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // The Dynamic Systems
  tracks: { type: [TrackSchema], default: [] },
  todos: { type: [TodoSchema], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);