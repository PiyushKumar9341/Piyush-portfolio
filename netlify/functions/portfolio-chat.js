
exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      body: 'Method Not Allowed' 
    };
  }

  // Pull the API Key from your Netlify Environment Variables
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: 'Missing GEMINI_API_KEY in Netlify settings' }) 
    };
  }

  try {
    // Parse the question sent from your script.js
    const { question } = JSON.parse(event.body || '{}');

    if (!question) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Question is required' })
      };
    }

    // This tells the AI who it is and how to behave
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

    // Call the Google Gemini API using built-in fetch
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

    // Extract the text response from the API result
    const answer =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      'I could not generate a response right now.';

    return {
      statusCode: 200,
      body: JSON.stringify({ answer })
    };

  } catch (err) {
    console.error('Error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error' })
    };
  }
};