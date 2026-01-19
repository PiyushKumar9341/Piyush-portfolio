const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Note: Changed model name to a verified stable version for Netlify deployment
const MODEL_NAME = 'gemini-1.5-flash'; 

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

    const contents = [];

    // 1) Initial instruction
    contents.push({
      role: 'user',
      parts: [{ text: portfolioContext }],
    });

    // 2) Optional chat history logic (Preserved)
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
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: 'Gemini API error',
          details: JSON.stringify(data),
        }),
      };
    }

    const modelText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'I apologize, but I am having trouble processing that right now.';

    return {
      statusCode: 200,
      body: JSON.stringify({
        reply: modelText,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Server error',
        message: err.message,
      }),
    };
  }
};