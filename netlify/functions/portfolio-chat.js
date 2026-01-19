const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = 'gemini-2.5-flash';

// Static portfolio context so the AI knows about your site and work
const portfolioContext = `
You are an AI assistant for the personal portfolio website of Piyush Kumar.

ABOUT:
- Name: Piyush Kumar
- Location: Greater Noida, India
- Education: Master of Computer Applications (MCA) student.
- Role: Full-Stack Developer and Generative AI Enthusiast.
- Profile: Passionate about building modern web applications using JavaScript from frontend to backend, experimenting with AI-powered features, and continuously improving problem-solving and system design skills.

SKILLS:
- Frontend: HTML5, modern CSS (Flexbox, Grid, responsive design), vanilla JavaScript (DOM manipulation, event handling, localStorage, async code).
- Backend: Node.js, Express (REST APIs, routing, middleware).
- Database: MongoDB with Mongoose (schemas, models, basic CRUD) — only mention in answers if the user specifically asks about backend or DB.
- Tools & Platforms: Git, GitHub, VS Code, Netlify (static hosting, forms, serverless functions), Render/other Node hosting.
- Other: Basic knowledge of APIs, JSON, deployment workflows, and integrating AI services like Google Gemini.

PROJECTS:
1) Advanced Todo App
   - Tech: HTML, CSS, JavaScript.
   - Features: Add/edit/delete tasks, mark complete, filter tasks, store tasks in localStorage so they persist after reload, responsive layout for mobile and desktop.
   - Purpose: Demonstrates strong DOM manipulation, state management in the browser, and ability to design a clean, usable UI for daily productivity.

2) Analytics Dashboard
   - Tech: React, Node.js, Charts.
   - Features: A responsive dashboard for monitoring KPIs with charts, filters, and role-based views.
   - Purpose: Serves as Piyush's main personal brand website, showcasing skills, projects, and contact options in a modern, animated, and responsive design.

3) AI-Powered Assistant
   - Tech: <e.g., HTML, CSS, JavaScript, Node.js, Express, MongoDB>.
   - Features: <authentication, dashboards, API integration, etc.>.
   - Purpose: <Explain what this project proves about Piyush's skills: e.g., building full-stack CRUD apps, working with APIs, handling authentication, etc.>.

4) Portfolio Website
   - Tech: HTML, CSS, JavaScript.
   - Features: Smooth scrolling navigation, animated hero section with typing effect for roles, skills grid, projects section, certifications/experience timeline, contact form (Netlify), and an AI assistant panel integrated with a Gemini-powered backend.
   - Purpose: Serves as Piyush's main personal brand website, showcasing skills, projects, and contact options in a modern, animated, and responsive design.

RESUME-STYLE SUMMARY:
- Strengths: Solid foundation in core CS concepts (via MCA), good grasp of JavaScript, eagerness to learn, ability to take a project from idea to deployed web app.
- Interests: Full-stack JavaScript, building practical tools, integrating AI assistants into web apps, improving UI/UX for portfolio and product-like projects.
- Goals: Entry-level /  developer roles (full-stack or frontend/backend), internships, and real-world experience building production-ready systems.

HOW TO ANSWER:
- When the user refers to "my portfolio", "my skills", "my projects", or "my resume", talk specifically about Piyush Kumar and the above details.
- Do not invent frameworks or databases that are not listed here.
- If asked to improve or rewrite sections (like About, Projects, Skills), use this information and suggest clearer, more professional wording.
- You can also answer general questions about coding, MCA studies, learning paths, and career guidance for junior/full-stack developers.
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
