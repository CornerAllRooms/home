require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

// Rate limiting: 50 requests per user per day
const limiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 50,
  keyGenerator: (req) => {
    // Use IP + user ID if available, or just IP
    return req.headers['x-user-id'] || req.ip;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: "You've used your daily limit of 50 messages. Please try again tomorrow."
    });
  }
});

// Apply rate limiting to API endpoint
app.post('/api/chat', limiter, async (req, res) => {
  try {
    const { messages } = req.body;

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: process.env.GROQ_API_MODEL || 'llama3-70b-8192',
        messages,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).json({ error: 'API request failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));