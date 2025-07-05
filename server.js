import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
app.use(cors());

// Initialize Gemini with your API key
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

app.get('/api/compliment', async (_req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
      Give me a short, sweet, and respectful compliment for my girlfriend.
      Keep it under 25 words.
    `;

    const result = await model.generateContent([prompt]);
    const compliment = result.response.text().trim();

    res.json({ compliment });
  } catch (err) {
    console.error('Gemini error:', err.message, err.response?.data || '');
    res.status(400).json({ message: 'Error generating compliment' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Gemini AI compliment server is running at http://localhost:${PORT}`);
});
