// netlify/functions/portfolio-chat.js

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { message } = JSON.parse(event.body || '{}');

    if (!message || typeof message !== 'string') {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid message' })
      };
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Missing GEMINI_API_KEY' })
      };
    }

    // Gemini REST API call
    const apiRes = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: message }]
            }
          ]
        })
      }
    );

    if (!apiRes.ok) {
      const errorText = await apiRes.text();
      console.error('Gemini API error:', apiRes.status, errorText);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Gemini API error', details: errorText })
      };
    }

    const data = await apiRes.json();

    // Optional: raw response dekhna ho to temporary enable karo
    // console.log('Gemini raw:', JSON.stringify(data, null, 2));

    let answer = 'I could not generate a response right now.';

    // Safe parsing: candidates / parts empty hone par crash nahi karega
    if (
      data &&
      Array.isArray(data.candidates) &&
      data.candidates.length > 0 &&
      data.candidates[0].content &&
      Array.isArray(data.candidates[0].content.parts) &&
      data.candidates[0].content.parts.length > 0 &&
      typeof data.candidates[0].content.parts[0].text === 'string'
    ) {
      answer = data.candidates[0].content.parts[0].text;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ answer })
    };
  } catch (err) {
    console.error('Function error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error' })
    };
  }
};
