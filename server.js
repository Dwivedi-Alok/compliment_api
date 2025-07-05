import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Gemini with your API key
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// Romantic compliment templates for variety
const complimentTypes = [
  'sweet and caring',
  'playful and fun',
  'romantic and poetic',
  'admiring and respectful',
  'cute and endearing'
];

// Main compliment endpoint
app.get('/api/compliment', async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    // Get random compliment type for variety
    const randomType = complimentTypes[Math.floor(Math.random() * complimentTypes.length)];

    const prompt = `
      Generate a ${randomType} compliment for my girlfriend.
      
      Please respond in this exact JSON format:
      {
        "shortCompliment": "A brief, heartfelt compliment under 20 words",
        "paragraph": "A longer romantic message of 2-3 sentences",
        "mood": "${randomType}"
      }
      
      Make it genuine, respectful, and loving. Avoid clichés.
    `;

    const result = await model.generateContent([prompt]);
    let response = result.response.text().trim();
    
    // Clean up the response if it has markdown formatting
    response = response.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    try {
      const parsedResponse = JSON.parse(response);
      res.json(parsedResponse);
    } catch (parseError) {
      // Fallback if AI doesn't return proper JSON
      res.json({
        shortCompliment: "You light up my world in ways I never knew possible.",
        paragraph: response,
        mood: randomType
      });
    }
  } catch (err) {
    console.error('Gemini error:', err.message);
    res.status(500).json({ 
      shortCompliment: "You're absolutely amazing in every way.",
      paragraph: "Even when technology fails, my love for you never does. You're the most incredible person I know, and I'm so lucky to have you in my life.",
      mood: "loving"
    });
  }
});

// Custom compliment with specific mood
app.post('/api/compliment/custom', async (req, res) => {
  try {
    const { mood = 'romantic', topic = 'general' } = req.body;
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
      Create a ${mood} compliment about ${topic} for my girlfriend.
      
      Please respond in this exact JSON format:
      {
        "shortCompliment": "Brief message under 20 words",
        "paragraph": "Detailed romantic message of 2-3 sentences",
        "mood": "${mood}"
      }
      
      Be genuine, respectful, and heartfelt.
    `;

    const result = await model.generateContent([prompt]);
    let response = result.response.text().trim();
    
    response = response.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    try {
      const parsedResponse = JSON.parse(response);
      res.json(parsedResponse);
    } catch (parseError) {
      res.json({
        shortCompliment: "You're absolutely amazing in every way.",
        paragraph: response,
        mood: mood
      });
    }
  } catch (err) {
    console.error('Custom compliment error:', err.message);
    res.status(500).json({ 
      shortCompliment: "You're my everything.",
      paragraph: "No matter what happens, you're always the bright spot in my day. Your kindness, beauty, and amazing spirit make every moment special.",
      mood: mood
    });
  }
});

// Get available compliment types
app.get('/api/compliment/types', (req, res) => {
  res.json({ types: complimentTypes });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Romantic Compliment Server is running at http://localhost:${PORT}`);
  console.log(`📖 Available endpoints:`);
  console.log(`   GET  /api/compliment - Random compliment`);
  console.log(`   POST /api/compliment/custom - Custom compliment with mood`);
  console.log(`   GET  /api/compliment/types - Available compliment types`);
  console.log(`   GET  /health - Health check`);
});