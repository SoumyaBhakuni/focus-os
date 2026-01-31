// server/check_models.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listAvailableModels() {
  try {
    console.log("... Contacting Google API ...");
    const modelResponse = await genAI.getGenerativeModel({ model: "gemini-pro" }).apiKey; // Dummy call to init
    
    // Actually fetching the list (Note: The SDK method might vary slightly by version, 
    // but usually a simple fetch to the endpoint works best if SDK is acting up, 
    // but let's try the SDK method first).
    
    // Direct fetch is often more reliable for debugging raw availability:
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.models) {
      console.log("\n✅ AVAILABLE MODELS FOR YOUR KEY:");
      console.log("---------------------------------");
      data.models.forEach(m => {
        if (m.supportedGenerationMethods.includes("generateContent")) {
          console.log(`Model Name: ${m.name.replace('models/', '')}`);
        }
      });
      console.log("---------------------------------");
      console.log("👉 Copy one of the names above into server/routes/ai.js");
    } else {
      console.log("❌ Error:", data);
    }

  } catch (err) {
    console.error("Failed to list models:", err);
  }
}

listAvailableModels();