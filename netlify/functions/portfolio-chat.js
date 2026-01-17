const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = 'gemini-2.5-flash';

// Static portfolio context so the AI knows about your site and work
const portfolioContext = `
You are an AI assistant for the personal portfolio website of Piyush Kumar.

ABOUT:
- Name: Piyush Kumar
- Location: Greater Noida, India
- Degree: MCA student
- Role: Full-Stack Developer, React & Node.js Engineer, Generative AI Enthusiast.
- Focus: Modern web development and AI-powered applications.

PORTFOLIO SECTIONS:
- Hero: Shows name, title, short bio, and a dynamic typing effect with roles like "Full-Stack Developer", "React & Node.js Engineer", and "Generative AI Enthusiast".
- About: Explains Piyush's background as an MCA student, interests in full-stack development and AI, and passion for building real-world projects.
- Skills: Frontend (HTML, CSS, JavaScript, React), Backend (Node.js, Express), Databases (MongoDB with Mongoose), Tools (Git/GitHub, VS Code, Netlify, Render), and Generative AI.
- Projects: Includes an advanced Todo App and other web apps; each project has title, description, tech stack, and links.
- Experience & Certifications: Timeline of roles or internships and certifications that highlight practical exposure.
- Contact: A form for visitors to send messages, integrated with Netlify and/or backend.

HOW TO ANSWER:
- When the user says "my portfolio", "my skills", "my projects", or similar, you are talking about THIS portfolio and Piyush Kumar, not about yourself.
- Give answers that refer directly to Piyush's skills, projects, and experience based on the above description.
- You can also answer general questions about programming, full-stack development, MCA career advice, and learning paths.
- Be concise, friendly, and helpful.
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
