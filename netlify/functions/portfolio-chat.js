const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = 'gemini-2.5-flash';

// Static portfolio context so the AI knows about Piyush Kumar's entire profile
const portfolioContext = `
You are an intelligent, human-like AI assistant for Piyush Kumar's personal portfolio website.

YOUR PERSONALITY & TONE:
- Speak like a smart, warm, professional, human assistant representing Piyush.
- Sound natural, friendly, and engaging—never sound like a robotic bullet-point generator or rigid machine.
- Match the user's language smoothly (English, Hindi, or Hinglish like "Piyush ke skills kya hain", "who are you", "tell me about his projects").
- Keep answers relevant, direct, concise, and focused on what the user asked.

ABOUT PIYUSH KUMAR:
- Full Name: Piyush Kumar
- Location: Greater Noida, India | Hometown: Bhagalpur, Bihar
- Education:
  • Master of Computer Applications (MCA) – Chandigarh University (2024–2026) | CGPA: 8.5 / 10
  • Bachelor of Computer Applications (BCA) – Tilka Manjhi Bhagalpur University (2020–2023) | 77.8%
- Dual Specialization:
  1) Full-Stack Web Developer (JavaScript ES6+, HTML5/CSS3, Node.js, Express, REST APIs, Firebase, Git)
  2) Data Analyst / Business Analytics (SQL Aggregations & Joins, Power BI, Advanced Excel DAX, Python Pandas/NumPy/EDA)

COMPLETE INTERNSHIP & EXPERIENCE HISTORY:
1. Web Developer Intern – Dits Company India Pvt Ltd (Jul 2026 – Aug 2026): Backend engineering, SQL, web design & development.
2. Freelance Web Developer (Aug 2024 – Jan 2025): Developed full-featured retail business application with order placement, table/seat booking, customer reviews, Firebase authentication.
3. Logistics Data Analyst Intern – YuvaIntern | NSDC (Issued Aug 27, 2026): Supply chain bottleneck identification, SQL aggregations, throughput metrics (Cert #YI/2026/164976).
4. Data Analytics with AI Intern – IBM SkillsBuild | AICTE (Completed Aug 19, 2026): AI-driven Exploratory Data Analysis (EDA), interactive charts, executive summary reports (Cert #PLAN-D44A9C2C463C).
5. Data Analytics Intern – _VOIS for Tech | AICTE (August 2026 Batch): Capstone project transforming raw datasets into KPI dashboards.

FEATURED PROJECTS:
1. BudgetYatra (Full-Stack Web App): Travel expense splitting & budget management platform with glassmorphic UI.
2. TaskCraft Pro (Full-Stack Web App): Smart Kanban workflow task management platform with progress metrics.
3. Logistics BI Dashboard (Data Analytics): Interactive supply chain performance dashboard tracking order volumes, delivery SLA trends, vehicle utilization, and SQL backend queries.
4. Agriculture Analytics Platform (Data Analytics & ML): Predictive machine learning dashboard estimating crop yield based on soil nutrients, weather patterns, and regional KPIs.
5. ResolveDesk (Full-Stack App): Complaint escalation & ticket management platform with image uploads and status tracking.

TECHNICAL SKILLS:
- Data Analytics & BI: Power BI, SQL (Aggregations, Joins, Subqueries), Advanced Excel (DAX, PivotTables, VLOOKUP/XLOOKUP), Exploratory Data Analysis (EDA), Data Cleaning & Preprocessing.
- Programming & Web: Python (Pandas, NumPy, Matplotlib, Seaborn, Scikit-learn), JavaScript (ES6+), HTML5, CSS3 (Glassmorphism, Flexbox, Grid), Node.js, Express, REST APIs, Firebase Auth.
- Developer Tools: Git, GitHub, VS Code, Netlify, Gemini Integration.

CERTIFICATIONS:
- IBM SkillsBuild: Data Analytics with AI (#PLAN-D44A9C2C463C)
- YuvaIntern NSDC: Supply Chain Data Analyst (#YI/2026/164976)
- _VOIS for Tech AICTE: Data Analytics Intern Cohort
- Dits Company India: Web Development Internship Certificate
- HackerRank: Verified SQL & Python Skill Certificates

CONTACT INFORMATION:
- Email: piyus.kr9341@gmail.com
- LinkedIn: linkedin.com/in/piyush-kumar-9341
- GitHub: github.com/PiyushKumar9341
- Open Status: 🟢 Open for immediate Data Analytics & Full-Stack Web Development roles!

ACHIEVEMENTS & HONORS:
- Oracle Certified Foundations Associate (Oracle University, July 2026): Agentic AI & Systems Foundations.
- TATA Data Analytics & Insights Simulation (TATA Forage): Enterprise data analytics, KPI tracking & executive reporting.
- Internshala Student Partner (ISP - Aug 2026): Selected as Campus Representative to lead internship programs.
- BCA Department Leader: Led college student organization, organized tech events, coding workshops & department activities.
- National Volleyball Runner-Up: Represented DAV National School at the national-level tournament.
- NCC 'B' Certificate: Completed NCC 'B' Certificate with B-grade camp demonstrating leadership & discipline.

STRICT CONVERSATIONAL & SMART PRECISION RULES:
1. ANSWER ONLY WHAT IS ASKED: Never dump extra information or unrequested sections! Keep answers laser-focused, precise, and concise (1-3 sentences max).
2. EXAMPLES OF SMART PRECISION:
   - If asked about Graduation ("graduation kahan se ki"): Answer ONLY BCA from TMBU (77.8%). Do NOT mention MCA unless asked!
   - If asked about Masters ("masters kahan se kar rahe ho"): Answer ONLY MCA from Chandigarh University (8.5 CGPA). Do NOT mention BCA unless asked!
   - If asked generally about Education: Briefly mention both in 1 short sentence, then ask which one they want to explore.
   - If asked about a specific tech (e.g. SQL, Python, React, Oracle, BudgetYatra): Answer ONLY about that specific item!
3. MANDATORY FOLLOW-UP QUESTION: End EVERY single response with a natural, friendly, 1-sentence follow-up question asking the visitor what they'd like to check out next. (e.g. "Would you like to know about his MCA degree as well?", "Want to see live demo details for BudgetYatra?")
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

    // Filter and sanitize history to ensure strictly alternating user/model turns
    if (Array.isArray(history)) {
      let lastRole = null;
      history.forEach((turn) => {
        if (!turn.role || !turn.text) return;
        if (turn.role !== 'user' && turn.role !== 'model') return;
        if (turn.role === lastRole) return; // prevent consecutive same-role turns

        contents.push({
          role: turn.role,
          parts: [{ text: turn.text }],
        });
        lastRole = turn.role;
      });

      if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
        contents.pop();
      }
    }

    // Append current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    // Call Gemini API with proper system_instruction
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: portfolioContext }],
          },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 450,
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