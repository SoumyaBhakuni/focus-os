const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const FocusEntry = require('../models/FocusEntry');

// Init Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/analyze', auth, async (req, res) => {
  try {
    // 1. Fetch User's Last 7 Days of Data
    const entries = await FocusEntry.find({ user: req.user.id })
      .sort({ date: -1 })
      .limit(7);

    if (entries.length === 0) return res.json({ advice: "No data available to analyze. Log some sessions first!" });

    // 2. Construct the Prompt
    const dataString = JSON.stringify(entries.map(e => ({
      date: e.date,
      sessions: e.sessions
    })));

    const prompt = `
      Act as a high-performance productivity coach. 
      Here is my focus data for the last 7 days: ${dataString}.
      
      Analyze my performance. 
      1. Identify my strongest area.
      2. Identify where I am slacking (Target vs Reality).
      3. Give me 3 bullet points of specific, ruthless advice for next week.
      
      Keep it short, "terminal style", and direct. No fluff.
    `;

    // 3. Call Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ advice: text });
    
  } catch (err) {
    console.error(err);
    res.status(500).send('AI Error');
  }
});

module.exports = router;