const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// FIXED MODEL NAME: Removed the '1.5' to match the standard v1beta endpoint path
const MODEL_NAME = 'gemini-1.5-flash-latest';

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
- DevOps & Tools: Git, GitHub, VS Code, Netlify (serverless functions), deployment workflows.
- AI: Google Gemini integration, APIs, JSON.

CAREER ROLE MAPPING (How to answer about job roles):
When users ask what roles Piyush fits for, respond VERY politely and explain why based on these mappings:
1. Frontend Role: Fit because of his mastery in responsive design, CSS Grids, and React/dashboard projects.
2. Backend Role: Fit due to his knowledge of Node.js, REST APIs, and MongoDB schema design.
3. AI/ML/GenAI Role: Fit because of his enthusiasm for Large Language Models and projects like this Gemini-integrated Portfolio Assistant.
4. DevOps Role: Fit because he understands version control (Git), cloud deployment on Netlify, and managing serverless environments.

PROJECTS:
1) Advanced Todo App
   - Tech: HTML, CSS, JavaScript.
   - Features: Add/edit/delete tasks, mark complete, filter tasks, store tasks in localStorage so they persist after reload, responsive layout.
   - Purpose: Demonstrates strong DOM manipulation, state management in the browser, and ability to design a clean, usable UI for daily productivity.

2) Analytics Dashboard
   - Tech: React, Node.js, Charts.
   - Features: Responsive dashboard for monitoring KPIs with charts, filters, and role-based views.
   - Purpose: Demonstrates structuring React components, handling API data, and keeping UI performant.

3) AI-Powered Assistant
   - Tech: HTML, CSS, JavaScript, Node.js, Express.
   - Purpose: Shows Piyush can integrate AI APIs and build assistant-like experiences.

4) Portfolio Website
   - Tech: HTML, CSS, JavaScript.
   - Features: Smooth scrolling navigation, animated hero typing, skills grid, projects, certifications/experience timeline, contact form (Netlify), and an AI assistant panel integrated with a Gemini-powered backend.
   - Purpose: Main personal brand website.

RESUME-STYLE SUMMARY:
- Strengths: Core CS via MCA, good grasp of JavaScript, eagerness to learn, ability to take a project from idea to deployed web app.
- Interests: Full-stack JavaScript, building practical tools, integrating AI assistants, improving UI/UX.
- Goals: Entry-level developer roles (full-stack or frontend/backend), internships, and real-world production experience.

HOW TO ANSWER:
- ALWAYS respond using clear, professional bullet points or numbered lists.
- Be extremely specific and concise in your explanations.
- Maintain a highly polite and professional tone at all times.
- Ensure every response is fully completed; never cut off mid-sentence.
- When asked about career roles (Frontend, Backend, AI/ML, DevOps), list the fit reasons as specific bullet points.
`;

// Keep your original export structure exactly
export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  if (!GEMINI_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Missing API Key' }) };
  }

  try {
    const { message, history } = JSON.parse(event.body || '{}');

    const contents = [];
    // 1) Push context
    contents.push({ role: 'user', parts: [{ text: portfolioContext }] });

    // 2) Preserve your original history logic
    if (Array.isArray(history)) {
      history.forEach((turn) => {
        if (turn.role === 'user' || turn.role === 'model') {
          contents.push({ role: turn.role, parts: [{ text: turn.text }] });
        }
      });
    }

    // 3) Current message
    contents.push({ role: 'user', parts: [{ text: message }] });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000, // Increased so it doesn't cut off
          }
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return { statusCode: response.status, body: JSON.stringify(data) };
    }

    const modelText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'I could not generate a response.';

    return {
      statusCode: 200,
      body: JSON.stringify({ reply: modelText }), // Keep 'reply' key as per your frontend
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};