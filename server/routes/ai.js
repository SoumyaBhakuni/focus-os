const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const FocusEntry = require('../models/FocusEntry'); 
const auth = require('../middleware/auth');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @route   POST /api/ai/analyze
// @desc    Get AI analysis of recent performance
router.post('/analyze', auth, async (req, res) => {
  try {
    // 1. Fetch data from DB
    const logs = await FocusEntry.find({ user: req.user.id })
      .sort({ date: -1 })
      .limit(7);

    if (!logs || logs.length === 0) {
      return res.json({ 
        analysis: "No data detected. Log your first session to activate the Neural Coach." 
      });
    }

    // 2. Prepare Lightweight Summary
    const dataSummary = logs.map(log => ({
      date: log.date,
      total: log.sessions.reduce((sum, s) => sum + s.focused, 0).toFixed(1),
      focus_breakdown: log.sessions.map(s => `${s.category}: ${s.focused}h`),
      reflection: log.notes
    }));

    // 3. Initialize Model (UPDATED TO AVAILABLE MODEL)
    // We use gemini-2.5-flash as it is in your available list and optimized for speed.
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are an elite cognitive performance coach. 
      Analyze this JSON work log:
      ${JSON.stringify(dataSummary)}

      Instructions:
      1. Identify the biggest productivity bottleneck.
      2. Identify the strongest win.
      3. Give one ruthless, actionable command for tomorrow.
      4. Maximum 3 sentences. No formatting/markdown.
    `;

    // 4. Execute
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ analysis: text });

  } catch (err) {
    console.error("AI Error:", err.message);
    res.json({ analysis: "Coach is offline (API Error). Focus on your metrics." });
  }
});

module.exports = router;