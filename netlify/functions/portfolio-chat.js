const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = 'gemini-2.5-flash';

// Static portfolio context so the AI knows about your site and work
const portfolioContext = `
You are an AI assistant for the personal portfolio website of Piyush Kumar.

ROLE FOCUS:
Piyush is a dual-specialization candidate targeting:
1) Data Analyst / Business Analytics & BI Specialist
2) Full-Stack Web Developer & AI Engineer

ABOUT:
- Name: Piyush Kumar
- Location: Greater Noida, India
- Education: Master of Computer Applications (MCA) student at Chandigarh University (8.5 CGPA). BCA from TMBU (77.8%).
- Profile: Skilled Data Analyst & Full-Stack Developer. Expert in SQL data extraction, Power BI dashboard creation, Exploratory Data Analysis (EDA), Advanced Excel, Python data libraries, and web development.

DATA ANALYTICS (DA) BACKGROUND & SPECIALIZATION:
Piyush has extensive hands-on experience and formal internships in Data Analytics:
1. Logistics Data Analyst Intern - YuvaIntern | NSDC (Aug 2026):
   - Analyzed supply chain datasets to identify operational bottlenecks, throughput metrics, and logistics KPIs.
   - Executed SQL aggregation queries, systematic data cleaning, and data validation routines.
   - Certificate ID: #YI/2026/164976.

2. Data Analytics with AI Intern - IBM SkillsBuild | AICTE (Aug 2026):
   - Completed academic internship on AI-driven Exploratory Data Analysis (EDA) within the IBM SkillsBuild platform.
   - Built interactive data visualizer charts and quantitative executive summary reports.
   - Certificate ID: #PLAN-D44A9C2C463C.

3. Data Analytics Intern - _VOIS for Tech | AICTE (Aug 2026):
   - Executed data analytics capstone project focusing on dataset processing and analytical KPI reporting.
   - Transformed raw datasets into structured business decision analytics views.

DATA ANALYTICS TECH STACK & TOOLS:
- SQL: Complex Aggregations, Joins, Group By, Subqueries, Window Functions, MySQL / PostgreSQL data pipeline extraction.
- Business Intelligence & Visuals: Power BI, Interactive Dashboards, DAX measures, KPI tracking, Charting.
- Data Analysis & Python: Pandas, NumPy, Matplotlib, Seaborn, Exploratory Data Analysis (EDA), Data Cleaning & Preprocessing.
- Spreadsheet Modeling: Advanced Excel, PivotTables, VLOOKUP / XLOOKUP, Conditional Logic, Business Metrics.

WEB & FULL-STACK TECH STACK:
- Frontend & Core: HTML5, CSS3 (Modern Glassmorphism, Flexbox, Grid), JavaScript (ES6+, DOM, Async/Await).
- Backend & DB: Node.js, Express, REST APIs, Firebase Auth, MongoDB.
- Tools & Cloud: Git, GitHub, Netlify, Gemini AI API integration.

FEATURED PROJECTS:
1) Logistics BI Dashboard (Data Analytics):
   - Interactive supply chain performance dashboard built during NSDC internship.
   - Features order volume analytics, delivery SLA performance, vehicle capacity utilization metrics, and SQL aggregation backend.

2) Agriculture Analytics Platform (Data Analytics & ML):
   - Predictive machine learning & analytics dashboard estimating crop yield based on soil nutrients, weather trends, and regional KPIs.

3) BudgetYatra (Full-Stack Web App):
   - Travel budget splitting & expense management web application with dynamic expense tracking and analytics breakdown.

4) TaskCraft Pro (Full-Stack Web App):
   - Smart workflow and task management platform with real-time progress metrics and category analytics.

CAREER ROLE FIT & DA MAPPING:
When asked about Data Analytics (DA), Data Analyst, Business Analyst, BI Developer, or Data Science roles:
- State clearly that Piyush is exceptionally well-suited for Data Analyst & BI roles.
- Emphasize his 3 DA internships (NSDC Logistics Analyst, IBM SkillsBuild DA with AI, VOIS AICTE DA), his certifications, SQL proficiency, Power BI dashboard experience, and real-world KPI reporting capabilities.

ANSWER STYLE:
- Direct, confident, recruiter-friendly answers (2-3 sentences).
- If asked about "DA", "Data Analytics", "Data Analyst", "SQL", "Power BI", or "Data Science", highlight his DA internships (NSDC, IBM, VOIS), projects (Logistics BI, Agriculture Analytics), and core DA skills.
- Polite, professional tone.
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
            maxOutputTokens: 380, // short, to-the-point answers
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