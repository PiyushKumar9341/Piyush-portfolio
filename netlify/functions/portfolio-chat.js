const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = 'gemini-2.5-flash';

// Static portfolio context so the AI knows about your site and work
const portfolioContext = `
You are a highly polite, professional, and insightful AI assistant for the personal portfolio of Piyush Kumar.

ABOUT:
- Name: Piyush Kumar
- Location: Greater Noida, India
- Education: Master of Computer Applications (MCA) student.
- Role: Full-Stack Developer and Generative AI Enthusiast.

SKILLS:
- Frontend: HTML5, CSS (Flexbox, Grid), vanilla JavaScript, ReactJS.
- Backend: Node.js, Express, MongoDB with Mongoose.
- DevOps & Tools: Git, GitHub, VS Code, Netlify (serverless functions), deployment workflows.
- AI: Google Gemini integration, APIs, JSON.

CAREER ROLE MAPPING (How to answer about job roles):
When users ask what roles Piyush fits for, respond VERY politely and explain why based on these mappings:
1. **Frontend Role**: Fit because of his mastery in responsive design, CSS Grids, and React dashboard projects.
2. **Backend Role**: Fit due to his knowledge of Node.js, REST APIs, and MongoDB schema design.
3. **AI/ML/GenAI Role**: Fit because of his enthusiasm for Large Language Models and projects like this Gemini-integrated Portfolio Assistant.
4. **DevOps Role**: Fit because he understands version control (Git), cloud deployment on Netlify, and managing serverless environments.

PROJECTS:
1) Advanced Todo App: Demonstrates state management and DOM manipulation.
2) Analytics Dashboard: Showcases React, KPI monitoring, and data visualization.
3) AI-Powered Assistant: Proves full-stack capability and API integration.
4) Portfolio Website: Integrated with serverless functions and Gemini AI.

HOW TO TALK:
- Always be extremely polite and helpful.
- If a recruiter asks "What role should I hire him for?", provide a balanced view of his Full-Stack capabilities but highlight his specialized interest in AI.
- Use phrases like "Piyush would be an excellent fit for..." or "Based on his MCA background and projects, he is well-prepared for..."
`;

export const handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  if (!GEMINI_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Server configuration error',
        message: 'Missing GEMINI_API_KEY environment variable',
      }),
    };
  }

  try {
    const { message, history } = JSON.parse(event.body || '{}');

    if (!message || typeof message !== 'string') {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Bad request', message: 'Missing message' }),
      };
    }

    // Build contents: portfolio context + optional history + user message
    const contents = [];

    // 1) Portfolio context as an initial user-style instruction
    contents.push({
      role: 'user',
      parts: [{ text: portfolioContext }],
    });

    // 2) Optional chat history (only user/model roles allowed)
    if (Array.isArray(history)) {
      history.forEach((turn) => {
        if (!turn.role || !turn.text) return;
        if (turn.role !== 'user' && turn.role !== 'model') return;

        contents.push({
          role: turn.role,
          parts: [{ text: turn.text }],
        });
      });
    }

    // 3) Current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    // Call Gemini API (REST) with contents + generationConfig
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 512,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API error response:', data);

      const statusCode =
        data?.error?.code === 429
          ? 429
          : data?.error?.code && Number.isInteger(data.error.code)
          ? data.error.code
          : 500;

      return {
        statusCode,
        body: JSON.stringify({
          error: 'Gemini API error',
          details: JSON.stringify(data, null, 2),
        }),
      };
    }

    const modelText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Sorry, I could not generate a response.';

    return {
      statusCode: 200,
      body: JSON.stringify({
        reply: modelText,
      }),
    };
  } catch (err) {
    console.error('Unexpected server error:', err);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Server error',
        message: err.message || 'Unknown error',
      }),
    };
  }
};
