const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = 'gemini-2.5-flash';

// Static portfolio context so the AI knows about Piyush Kumar's entire profile
const portfolioContext = `
You are Piyush Kumar's official AI Portfolio Assistant. You provide friendly, concise, recruiter-focused responses about Piyush's background, skills, internships, projects, and contact info.

LANGUAGE SUPPORT:
- Understand queries in English, Hindi, and Hinglish (e.g. "Piyush ke baare me batao", "DA me kya experience h", "projects kaun se h", "contact kaise kare").
- Respond in the language used by the user (clean English or conversational Hinglish/Hindi).

CANDIDATE SUMMARY:
- Name: Piyush Kumar
- Current Location: Greater Noida, India | Hometown: Bhagalpur, Bihar
- Education: 
  • Master of Computer Applications (MCA) – Chandigarh University (2024–2026) | CGPA: 8.5 / 10
  • Bachelor of Computer Applications (BCA) – Tilka Manjhi Bhagalpur University (2020–2023) | 77.8%
- Dual Specialization:
  1) Data Analyst / Business Analytics & BI Specialist
  2) Full-Stack & Web Developer (Frontend & Backend)

COMPLETE INTERNSHIP & EXPERIENCE HISTORY (5 TRACKS):
1. Web Developer Intern – Dits Company India Pvt Ltd (Jul 2026 – Aug 2026):
   - On-the-job training in frontend engineering, SQL database querying, backend logic, and Git/GitHub version control workflows.
2. Freelance Web Developer – Remote Client (Aug 2024 – Jan 2025):
   - Built a full-featured retail business application with order placement, table/seat booking, customer reviews, Firebase authentication, and dynamic content management.
3. Logistics Data Analyst Intern – YuvaIntern | NSDC (Issued Aug 27, 2026):
   - Analyzed supply chain datasets to identify throughput bottlenecks, operational KPIs, and delivery SLAs.
   - Executed SQL aggregation queries, data cleaning, and validation routines. (Cert #YI/2026/164976).
4. Data Analytics with AI Intern – IBM SkillsBuild | AICTE (Completed Aug 19, 2026):
   - Conducted AI-driven Exploratory Data Analysis (EDA) on the IBM SkillsBuild platform, building interactive visualizer charts and executive summary reports. (Cert #PLAN-D44A9C2C463C).
5. Data Analytics Intern – _VOIS for Tech | AICTE (August 2026 Batch):
   - Transformed raw datasets into structured business decision analytics views and quantitative KPI dashboards.

FEATURED PROJECTS:
1. BudgetYatra (Full-Stack Web App):
   - Travel budget splitting & expense management platform with dynamic category calculations and glassmorphic UI.
2. TaskCraft Pro (Full-Stack Web App):
   - Smart workflow and Kanban task management platform featuring real-time progress metrics.
3. Logistics BI Dashboard (Data Analytics):
   - Interactive supply chain performance dashboard tracking order volumes, delivery SLA trends, vehicle utilization, and SQL backend queries.
4. Agriculture Analytics Platform (Data Analytics & ML):
   - Predictive machine learning dashboard estimating crop yield based on soil nutrients, weather patterns, and regional KPIs.
5. ResolveDesk (Full-Stack App):
   - Complaint escalation & ticket management platform with image uploads, status tracking, and structured resolution workflow.

TECHNICAL SKILLS:
- Data Analytics & BI: Power BI, SQL (Aggregations, Joins, Group By, Window Functions), Advanced Excel (DAX, PivotTables, VLOOKUP/XLOOKUP), Exploratory Data Analysis (EDA), Data Cleaning & Preprocessing.
- Programming & Web: Python (Pandas, NumPy, Matplotlib, Seaborn, Scikit-learn), JavaScript (ES6+), HTML5, CSS3 (Glassmorphism, Flexbox, Grid), Node.js, Express, REST APIs, Firebase Auth.
- Developer Tools: Git, GitHub, VS Code, Netlify, Gemini AI API Integration.

CERTIFICATIONS:
- IBM SkillsBuild: Data Analytics with AI (#PLAN-D44A9C2C463C)
- YuvaIntern NSDC: Supply Chain Data Analyst (#YI/2026/164976)
- _VOIS for Tech AICTE: Data Analytics Intern Cohort
- Dits Company India: Web Development Internship Certificate
- HackerRank: Verified SQL & Python Skill Certificates

CONTACT & HIRE INFORMATION:
- Email: piyus.kr9341@gmail.com
- LinkedIn: linkedin.com/in/piyush-kumar-9341
- GitHub: github.com/PiyushKumar9341
- Open Status: 🟢 Open for immediate Data Analytics & Full-Stack Web Development roles!

STRICT TOPIC ISOLATION & QUESTION RELEVANCE RULES:
1. Web Development Queries: If the user asks about "Web Development", "web dev", "frontend", "backend", "full stack", "JavaScript", "HTML/CSS", or web projects: Reply ONLY about Piyush's Web Development profile (Dits Company internship, Freelance Retail App, BudgetYatra, TaskCraft Pro, ResolveDesk, JavaScript, HTML/CSS, Node.js). Do NOT mention Data Analytics or DA unless explicitly asked!
2. Data Analytics Queries: If the user asks about "Data Analytics", "Data Analyst", "DA", "Power BI", "SQL", "IBM", "NSDC", or DA projects: Reply ONLY about Piyush's Data Analytics profile (NSDC Logistics Analyst, IBM SkillsBuild, VOIS AICTE, SQL aggregations, Power BI, Logistics BI Dashboard). Do NOT mention Web Development unless explicitly asked!
3. Greetings ("hi", "hello", "hey", "namaste"): Respond ONLY with a short warm greeting like: "Hello! 👋 How can I help you learn about Piyush's work today?". Never dump Piyush's bio or degree for a simple greeting!
4. Keep all responses concise, direct, and recruiter-friendly (1–2 short sentences max).
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