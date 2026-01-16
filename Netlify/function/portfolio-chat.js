// netlify/functions/portfolio-chat.js
const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return { statusCode: 500, body: 'Missing GEMINI_API_KEY' };
  }

  try {
    const { question } = JSON.parse(event.body || '{}');

    if (!question) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Question is required' })
      };
    }

    const systemPrompt = `
You are an AI assistant for Piyush's developer portfolio website.

Your job:
- Answer questions about his skills (Java, React, Node.js, databases, DevOps, GenAI, etc.).
- Explain his projects: features, tech stack, architecture, and what he learned.
- Help with general tech questions (web dev, APIs, databases, AI) in a concise way.
- If a question is NOT related to tech or his work, you can still answer, but keep it short.

Tone:
- Friendly, clear, technically accurate.
- Avoid overhyping; be honest about what you do and don't know.
    `.trim();

    const GEMINI_MODEL = 'gemini-1.5-flash';

    const apiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: systemPrompt + '\n\nUser question: ' + question }
              ]
            }
          ]
        })
      }
    );

    const data = await apiRes.json();

    const answer =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      'I could not generate a response right now.';

    return {
      statusCode: 200,
      body: JSON.stringify({ answer })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error' })
    };
  }
};
