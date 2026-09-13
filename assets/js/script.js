// Scrolled Navbar Header Toggle
const navHeader = document.querySelector('.navbar-header');
if (navHeader) {
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 40) {
      navHeader.classList.add('scrolled');
    } else {
      navHeader.classList.remove('scrolled');
    }
  }, { passive: true });
}

// Mobile nav toggle
const hamburger = document.querySelector('.hamburger');
const nav = document.getElementById('main-nav');

if (hamburger && nav) {
  hamburger.addEventListener('click', () => {
    nav.classList.toggle('active');
  });

  // close nav when clicking a link (mobile)
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('active');
    });
  });
}

// Butter-smooth easeInOutCubic scroll animation helper
function smoothScrollTo(targetY, duration = 750) {
  const startY = window.pageYOffset;
  const distance = targetY - startY;
  let startTime = null;

  function step(currentTime) {
    if (!startTime) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);

    // easeInOutCubic easing function
    const ease = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;

    window.scrollTo(0, startY + distance * ease);

    if (timeElapsed < duration) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

// Smooth scroll with offset for fixed navbar
const navScrollLinks = document.querySelectorAll('nav a[href^="#"]');
const headerOffset = 70;

navScrollLinks.forEach((link) => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href').substring(1);
    const targetEl = document.getElementById(targetId);
    if (!targetEl) return;

    e.preventDefault();

    const elementPosition = targetEl.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = Math.max(0, elementPosition - headerOffset);

    smoothScrollTo(offsetPosition, 750);
  });
});

// Scroll to top button
const scrollBtn = document.getElementById('scrollToTopBtn');

// Sections + nav links for active highlight
const sections = document.querySelectorAll('section[id], header#home');
const navLinks = document.querySelectorAll('#main-nav a');

// Cache section positions
const sectionPositions = [];
function computeSectionPositions() {
  sectionPositions.length = 0;
  sections.forEach((section) => {
    sectionPositions.push({
      id: section.id,
      top: section.offsetTop
    });
  });
}
computeSectionPositions();

// Recompute after full load (images/fonts may shift layout)
window.addEventListener('load', computeSectionPositions);
window.addEventListener('resize', computeSectionPositions);

// Active link + scroll-to-top visibility (throttled + passive)
let ticking = false;

function handleScroll() {
  const scrollY = window.pageYOffset;
  const viewOffset = 150; // adjust to align with your header height
  let currentId = 'home';

  for (let i = 0; i < sectionPositions.length; i++) {
    const { id, top } = sectionPositions[i];
    if (scrollY + viewOffset >= top) {
      currentId = id;
    }
  }

  navLinks.forEach((link) => {
    link.classList.remove('active-link');
    if (link.getAttribute('href') === `#${currentId}`) {
      link.classList.add('active-link');
    }
  });

  if (scrollBtn) {
    if (scrollY > 300) {
      scrollBtn.style.opacity = '1';
      scrollBtn.style.visibility = 'visible';
      scrollBtn.style.transform = 'translateY(0)';
    } else {
      scrollBtn.style.opacity = '0';
      scrollBtn.style.visibility = 'hidden';
      scrollBtn.style.transform = 'translateY(10px)';
    }
  }

  ticking = false;
}

window.addEventListener(
  'scroll',
  () => {
    if (!ticking) {
      window.requestAnimationFrame(handleScroll);
      ticking = true;
    }
  },
  { passive: true }
);

// Scroll-to-top click
if (scrollBtn) {
  scrollBtn.addEventListener('click', () => {
    smoothScrollTo(0, 750);
  });
}

// Typing effect for roles
const roles = [
  'Full-Stack Developer',
  'Data & Business Analyst',
  'React & Node.js Engineer',
  'Software & Web Engineer'
];
let roleIndex = 0;
let charIndex = 0;
const typingSpan = document.getElementById('role-typing');

function typeRole() {
  if (!typingSpan) return;
  if (charIndex < roles[roleIndex].length) {
    typingSpan.textContent += roles[roleIndex].charAt(charIndex);
    charIndex++;
    setTimeout(typeRole, 90);
  } else {
    setTimeout(eraseRole, 1500);
  }
}

function eraseRole() {
  if (!typingSpan) return;
  if (charIndex > 0) {
    typingSpan.textContent = roles[roleIndex].substring(0, charIndex - 1);
    charIndex--;
    setTimeout(eraseRole, 60);
  } else {
    roleIndex = (roleIndex + 1) % roles.length;
    setTimeout(typeRole, 300);
  }
}

typeRole();

// Scroll reveal + certifications stagger (JS-controlled animations)
const observerOptions = {
  threshold: 0.05,
  rootMargin: '0px 0px -40px 0px'
};

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    const el = entry.target;

    // Decide animation based on element type / id
    if (el.matches('header#home')) {
      el.classList.add('reveal-fade-up');
    } else if (el.matches('#about')) {
      el.classList.add('reveal-left');
    } else if (el.matches('#skills')) {
      el.classList.add('reveal-right');
    } else if (el.matches('#projects')) {
      el.classList.add('reveal-up');
    } else if (el.matches('#experience')) {
      el.classList.add('reveal-up-slow');
    } else if (el.matches('#certifications')) {
      el.classList.add('reveal-up');
    } else if (el.matches('#toolbox')) {
      el.classList.add('reveal-right');
    } else if (el.matches('#testimonials')) {
      el.classList.add('reveal-left');
    } else if (el.matches('#resume')) {
      el.classList.add('reveal-fade-up');
    } else if (el.matches('#contact')) {
      el.classList.add('reveal-fade-up');
    } else if (el.classList.contains('skill-card')) {
      el.classList.add('reveal-up');
    } else if (el.classList.contains('project-card')) {
      el.classList.add('reveal-up');
    } else if (el.classList.contains('about-card')) {
      el.classList.add('reveal-up');
    } else {
      // default fallback
      el.classList.add('reveal-up');
    }

    el.classList.add('revealed');
    revealObserver.unobserve(el);
  });
}, observerOptions);

document
  .querySelectorAll('.animate-on-scroll, .skill-card, .project-card, .about-card')
  .forEach((el) => {
    if (el.classList.contains('marquee-card')) {
      el.classList.add('revealed');
    } else {
      revealObserver.observe(el);
    }
  });

// Certifications stagger animation
const certCards = document.querySelectorAll('.js-cert');
const certObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        certCards.forEach((card, index) => {
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, index * 150);
        });
        certObserver.disconnect();
      }
    });
  },
  { threshold: 0.3 }
);

if (certCards.length) {
  certObserver.observe(certCards[0]);
}

// Timeline line-fill activation
const timeline = document.querySelector('.timeline');
if (timeline) {
  const timelineObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        timeline.classList.add('timeline-active');
        timelineObserver.disconnect();
      });
    },
    { threshold: 0.35 }
  );
  timelineObserver.observe(timeline);
}

// Project role filters
const projectFilterButtons = document.querySelectorAll('.project-filter-btn');
const projectCards = document.querySelectorAll('.project-card');
const marqueeTrack = document.querySelector('.projects-marquee-track');

if (projectFilterButtons.length && projectCards.length) {
  projectFilterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const selected = button.getAttribute('data-filter');

      projectFilterButtons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');

      if (selected === 'all') {
        if (marqueeTrack) marqueeTrack.classList.remove('is-filtered');
        projectCards.forEach((card) => {
          card.classList.remove('is-hidden');
        });
      } else {
        if (marqueeTrack) marqueeTrack.classList.add('is-filtered');
        projectCards.forEach((card) => {
          const roles = (card.getAttribute('data-roles') || '').split(/\s+/).filter(Boolean);
          const isSetOne = card.getAttribute('data-set') === '1';
          const shouldShow = isSetOne && roles.includes(selected);
          card.classList.toggle('is-hidden', !shouldShow);
        });
      }
    });
  });
}

// Case study modal
const caseStudyModal = document.getElementById('case-study-modal');
const caseStudyTitle = document.getElementById('case-study-title');
const caseStudyProblem = document.getElementById('case-study-problem');
const caseStudyBuild = document.getElementById('case-study-build');
const caseStudyImpact = document.getElementById('case-study-impact');
const caseStudyClose = document.getElementById('case-study-close');
const caseStudyButtons = document.querySelectorAll('.case-study-btn');

function closeCaseStudyModal() {
  if (!caseStudyModal) return;
  caseStudyModal.classList.remove('open');
  caseStudyModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

if (caseStudyModal && caseStudyButtons.length) {
  caseStudyButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!caseStudyTitle || !caseStudyProblem || !caseStudyBuild || !caseStudyImpact) return;
      caseStudyTitle.textContent = btn.getAttribute('data-case-title') || 'Case Study';
      caseStudyProblem.textContent = btn.getAttribute('data-case-problem') || '';
      caseStudyBuild.textContent = btn.getAttribute('data-case-build') || '';
      caseStudyImpact.textContent = btn.getAttribute('data-case-impact') || '';
      caseStudyModal.classList.add('open');
      caseStudyModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });

  caseStudyModal.addEventListener('click', (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.hasAttribute('data-close-modal')) {
      closeCaseStudyModal();
    }
  });
}

if (caseStudyClose) {
  caseStudyClose.addEventListener('click', closeCaseStudyModal);
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeCaseStudyModal();
  }
});

// Current year in footer
const yearSpan = document.getElementById('current-year');
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// === AI Portfolio Assistant ===

// DOM elements
const aiToggleBtn = document.getElementById('ai-toggle-btn');
const aiChatPanel = document.getElementById('ai-chat-panel');
const aiCloseBtn = document.getElementById('ai-close-btn');
const aiChatForm = document.getElementById('ai-chat-form');
const aiUserInput = document.getElementById('ai-user-input');
const aiMessages = document.getElementById('ai-chat-messages');

// Toggle panel
if (aiToggleBtn && aiChatPanel) {
  aiToggleBtn.addEventListener('click', () => {
    aiChatPanel.classList.toggle('open');
    if (aiChatPanel.classList.contains('open')) {
      setTimeout(() => aiUserInput && aiUserInput.focus(), 150);
    }
  });
}

if (aiCloseBtn && aiChatPanel) {
  aiCloseBtn.addEventListener('click', () => {
    aiChatPanel.classList.remove('open');
  });
}

// Quick Prompt Chips Trigger
const promptChips = document.querySelectorAll('.ai-chip');
promptChips.forEach((chip) => {
  chip.addEventListener('click', () => {
    const promptText = chip.getAttribute('data-prompt');
    if (promptText && aiUserInput) {
      aiUserInput.value = promptText;
      if (aiChatForm) {
        aiChatForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }
  });
});

// Helper: append message bubble
function appendAiMessage(text, type = 'bot') {
  if (!aiMessages) return;
  const wrapper = document.createElement('div');
  wrapper.classList.add('ai-message', type === 'user' ? 'ai-user' : 'ai-bot');

  const bubble = document.createElement('div');
  bubble.classList.add('ai-msg-bubble');

  if (typeof text === 'string' && (text.includes('<br>') || text.includes('<strong>') || text.includes('<ul>'))) {
    bubble.innerHTML = text;
  } else {
    const p = document.createElement('p');
    p.textContent = text;
    bubble.appendChild(p);
  }

  wrapper.appendChild(bubble);

  aiMessages.appendChild(wrapper);
  aiMessages.scrollTop = aiMessages.scrollHeight;
}

// Helper: show/hide typing indicator
let typingEl = null;
function showTyping() {
  if (!aiMessages) return;
  typingEl = document.createElement('div');
  typingEl.classList.add('ai-message', 'ai-bot');
  typingEl.innerHTML = `
    <div class="ai-msg-bubble">
      <div class="ai-typing-dots">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
  aiMessages.appendChild(typingEl);
  aiMessages.scrollTop = aiMessages.scrollHeight;
}

function hideTyping() {
  if (typingEl && typingEl.parentNode) {
    typingEl.parentNode.removeChild(typingEl);
    typingEl = null;
  }
}

// Smart Local AI Engine
function getLocalAiReply(question) {
  const q = question.toLowerCase().trim();

  // Simple Greetings
  if (['hi', 'hii', 'hiii', 'hello', 'hey', 'heyy', 'namaste', 'kaise ho', 'hlo', 'yo'].includes(q) || q.startsWith('hi ') || q.startsWith('hello ') || q.startsWith('hey ')) {
    return `Hey there! 👋 I'm Piyush's AI assistant. How can I help you explore Piyush's work today?`;
  }

  // Who are you / Identity
  if (q.includes('who are you') || q.includes('who r u') || q.includes('who are u') || q.includes('who made you') || q.includes('who created you') || q.includes('tell me about yourself') || q.includes('your name')) {
    return `Hey! I'm Piyush Kumar's portfolio assistant. I'm here to share quick insights into Piyush's full-stack web dev projects, data analytics experience, tech stack, or get you directly in touch with him. How can I help?`;
  }

  // Who is Piyush / About
  if (q.includes('who is piyush') || q.includes('about piyush') || q.includes('kaun hai') || q.includes('kon h') || q.includes('tell me about piyush') || q.includes('about him')) {
    return `Piyush Kumar is a Data Analyst & Full-Stack Web Developer currently pursuing his MCA at Chandigarh University (8.5 CGPA). He specializes in building data-driven applications, glassmorphic UI experiences, and analytical dashboards.`;
  }

  // Web Development (Strictly Web Dev only)
  if (q.includes('web dev') || q.includes('web development') || q.includes('frontend') || q.includes('backend') || q.includes('full stack') || q.includes('fullstack') || q.includes('javascript') || q.includes('react') || q.includes('html') || q.includes('css') || q.includes('dits') || q.includes('freelance')) {
    return `Piyush is a skilled Full-Stack Developer! He has experience as a Web Developer Intern at Dits Company India and has built freelance custom web applications with seat/order management & Firebase auth. His primary stack includes JavaScript (ES6+), HTML5/CSS3, Node.js, Express, and REST APIs.`;
  }

  // Data Analytics (Strictly DA only)
  if (q.includes('da') || q.includes('data analyst') || q.includes('data analytics') || q.includes('business analytics') || q.includes('power bi') || q.includes('eda') || q.includes('kpi') || q.includes('sql') || q.includes('excel')) {
    return `Data Analytics is one of Piyush's core domains! He's completed 3 analytics internships—including Logistics Data Analyst at NSDC (#YI/2026/164976), IBM SkillsBuild DA with AI (#PLAN-D44A9C2C463C), and _VOIS AICTE. His core stack covers SQL (aggregations & complex joins), Power BI, Advanced Excel (DAX), and Python (Pandas/NumPy).`;
  }

  // Specific Web Dev Internships & Experience
  if (q.includes('web dev intern') || q.includes('web dev experience') || q.includes('frontend intern') || q.includes('fullstack intern') || q.includes('dits') || q.includes('freelance')) {
    return `Here is Piyush's <strong>Full-Stack Web Development</strong> experience:<br>
    • <strong>Web Developer Intern @ Dits Company India:</strong> Backend engineering, SQL logic, REST APIs, Git & web application design.<br>
    • <strong>Freelance Web Developer:</strong> Developed full-featured retail business app with seat booking, online order placement, and Firebase Auth.`;
  }

  // Specific Data Analytics Internships
  if (q.includes('da intern') || q.includes('data analytics intern') || q.includes('analytics intern') || q.includes('logistics intern') || q.includes('nsdc') || q.includes('ibm') || q.includes('vois')) {
    return `Here are Piyush's <strong>Data Analytics & BI</strong> internships:<br>
    • <strong>Logistics Data Analyst Intern @ YuvaIntern | NSDC:</strong> Supply chain bottleneck analysis, throughput metrics & SQL queries (Cert #YI/2026/164976).<br>
    • <strong>Data Analytics with AI @ IBM SkillsBuild:</strong> AI-driven Exploratory Data Analysis (EDA) & executive visualization reports (#PLAN-D44A9C2C463C).<br>
    • <strong>Data Analytics Intern @ _VOIS for Tech | AICTE:</strong> Capstone project transforming complex datasets into interactive KPI dashboards.`;
  }

  // General Internships & Experience Query (Ask user to distinguish role)
  if (q.includes('intern') || q.includes('experience') || q.includes('company') || q.includes('work history') || q.includes('kahan kaam kiya')) {
    return `Piyush has completed hands-on internships across both software engineering and data analytics! 💼<br><br>Which track's experience would you like to explore?<br>• <strong>Full-Stack Web Development</strong> (Dits Company India & Freelance Retail App)<br>• <strong>Data Analytics & BI</strong> (NSDC Logistics Analyst, IBM SkillsBuild DA with AI, _VOIS AICTE)`;
  }

  // Specific Web Dev Projects
  if (q.includes('web dev project') || q.includes('web project') || q.includes('frontend project') || q.includes('full stack project') || q.includes('fullstack project') || q.includes('budget') || q.includes('yatra') || q.includes('taskcraft') || q.includes('resolve')) {
    return `Here are Piyush's featured <strong>Full-Stack Web Development</strong> projects:<br>
    • <strong>BudgetYatra:</strong> Travel expense splitter & budget tracker app.<br>
    • <strong>TaskCraft Pro:</strong> Smart Kanban workflow management platform.<br>
    • <strong>ResolveDesk:</strong> Complaint escalation platform with image uploads & tracking.`;
  }

  // Specific Data Analytics Projects
  if (q.includes('da project') || q.includes('data analytics project') || q.includes('analytics project') || q.includes('ml project') || q.includes('logistics') || q.includes('agri') || q.includes('bi dashboard')) {
    return `Here are Piyush's featured <strong>Data Analytics & ML</strong> projects:<br>
    • <strong>Logistics BI Dashboard:</strong> Supply chain KPI analytics tool tracking order SLAs & vehicle metrics.<br>
    • <strong>Agriculture Analytics:</strong> ML crop yield predictor dashboard based on soil & weather data.`;
  }

  // General Projects Query (Ask user to distinguish role)
  if (q.includes('project') || q.includes('build') || q.includes('kon se project')) {
    return `Piyush has built impressive projects across both software engineering and data analytics! 🚀<br><br>Which role's projects would you like to explore?<br>• <strong>Full-Stack Web Development</strong> (BudgetYatra, TaskCraft Pro, ResolveDesk)<br>• <strong>Data Analytics & BI</strong> (Logistics BI Dashboard, Agriculture Analytics)`;
  }

  // Specific Web Dev Skills
  if (q.includes('web dev skill') || q.includes('web skill') || q.includes('frontend skill') || q.includes('backend skill') || q.includes('fullstack skill')) {
    return `Here is Piyush's <strong>Full-Stack Web Development</strong> toolkit:<br>
    • <strong>Languages & Logic:</strong> JavaScript (ES6+), HTML5, CSS3 (Glassmorphism design)<br>
    • <strong>Backend & APIs:</strong> Node.js, Express.js, REST APIs, Firebase Auth<br>
    • <strong>Tools & Deployment:</strong> Git, GitHub, Netlify, VS Code`;
  }

  // Specific Data Analytics Skills
  if (q.includes('da skill') || q.includes('data analytics skill') || q.includes('bi skill') || q.includes('analytics skill')) {
    return `Here is Piyush's <strong>Data Analytics & BI</strong> toolkit:<br>
    • <strong>BI & Visualization:</strong> Power BI (Dashboards, KPI Cards), Advanced Excel (DAX, PivotTables)<br>
    • <strong>Database & SQL:</strong> SQL (Complex Joins, Aggregations, Subqueries)<br>
    • <strong>Python & Data Science:</strong> Python (Pandas, NumPy, Matplotlib, Seaborn, EDA)`;
  }

  // General Technical Skills Query (Ask user to distinguish role)
  if (q.includes('skill') || q.includes('tech') || q.includes('stack')) {
    return `Piyush possesses strong skill sets in both Web Engineering and Data Analytics! 🛠️<br><br>Which stack would you like to inspect?<br>• <strong>Full-Stack Web Development</strong> (JS, Node.js, REST APIs, Glassmorphic UI)<br>• <strong>Data Analytics & BI</strong> (Power BI, SQL, Python EDA, DAX)`;
  }

  // Specific Web Dev Certifications
  if (q.includes('web dev cert') || q.includes('web cert') || q.includes('dits cert')) {
    return `Here are Piyush's <strong>Web Development</strong> credentials:<br>
    • <strong>Dits Company India:</strong> Web Engineering & Backend Internship Certificate<br>
    • <strong>HackerRank:</strong> Verified JavaScript & Software Logic Badges`;
  }

  // Specific Data Analytics Certifications
  if (q.includes('da cert') || q.includes('data analytics cert') || q.includes('ibm cert') || q.includes('nsdc cert') || q.includes('vois cert')) {
    return `Here are Piyush's <strong>Data Analytics & AI</strong> certifications:<br>
    • <strong>IBM SkillsBuild:</strong> Data Analytics with AI (#PLAN-D44A9C2C463C)<br>
    • <strong>YuvaIntern | NSDC:</strong> Supply Chain Data Analyst (#YI/2026/164976)<br>
    • <strong>_VOIS for Tech | AICTE:</strong> Executive BI & Analytics Cohort<br>
    • <strong>HackerRank:</strong> Verified SQL & Python Skill Certificates`;
  }

  // General Certifications Query
  if (q.includes('certif') || q.includes('cert')) {
    return `Piyush holds verified certifications across both domains! 📜<br><br>Which certifications would you like to see?<br>• <strong>Data Analytics & AI</strong> (IBM SkillsBuild, NSDC YuvaIntern, _VOIS AICTE)<br>• <strong>Web Development & Programming</strong> (Dits Company India, HackerRank SQL/Python)`;
  }

  // Education
  if (q.includes('education') || q.includes('mca') || q.includes('bca') || q.includes('degree') || q.includes('college') || q.includes('cgpa') || q.includes('cu') || q.includes('study') || q.includes('qualification')) {
    return `Here is Piyush's educational background: 🎓<br><br>
    • <strong>Master of Computer Applications (MCA):</strong> Chandigarh University (2024–2026) | <strong>8.5 CGPA</strong><br>
    • <strong>Bachelor of Computer Applications (BCA):</strong> Tilka Manjhi Bhagalpur University (2020–2023) | <strong>77.8% Marks</strong>`;
  }

  // Achievements Sub-Categories
  if (q.includes('sports') || q.includes('ncc') || q.includes('volleyball')) {
    return `Here are Piyush's <strong>Sports & Co-Curricular</strong> achievements: 🏅<br>
    • <strong>National Volleyball Runner-Up:</strong> Represented DAV National School at the national-level tournament.<br>
    • <strong>NCC 'B' Certificate:</strong> Completed NCC B-grade camp demonstrating leadership, endurance & discipline.`;
  }

  if (q.includes('leadership') || q.includes('isp') || q.includes('department leader')) {
    return `Here are Piyush's <strong>Campus Leadership</strong> roles: 👥<br>
    • <strong>BCA Department Leader:</strong> Led the student body, organized coding workshops, tech fests & academic events.<br>
    • <strong>Internshala Student Partner (ISP):</strong> Selected as Campus Representative for Internshala (Aug 2026 Edition).`;
  }

  // General Achievements Query (Conversational preview)
  if (q.includes('achiev') || q.includes('award') || q.includes('leader') || q.includes('tata') || q.includes('oracle')) {
    return `Piyush has an impressive track record across technical certifications, campus leadership, and sports! 🏆<br><br>Key highlights include being an <strong>Oracle Certified Associate in Agentic AI</strong>, serving as the <strong>BCA Department Leader</strong>, and representing as a <strong>National Volleyball Runner-Up</strong>.<br><br>Which category would you like to explore deeper?<br>• <strong>Technical & Analytics Credentials</strong> (Oracle AI, TATA Simulation)<br>• <strong>Campus Leadership</strong> (Internshala ISP, Department Leader)<br>• <strong>Sports & NCC Honors</strong> (National Volleyball, NCC 'B' Cert)`;
  }

  // Contact & Hiring
  if (q.includes('contact') || q.includes('hire') || q.includes('email') || q.includes('linkedin') || q.includes('github') || q.includes('job') || q.includes('reach') || q.includes('number')) {
    return `You can reach Piyush directly at <strong>piyus.kr9341@gmail.com</strong> or connect with him on LinkedIn and GitHub.<br><br>He's actively open for immediate roles in:<br>1) <strong>Full-Stack Web Development</strong><br>2) <strong>Data Analytics & Business Intelligence</strong>`;
  }

  return `I'm here to help! Ask me anything about Piyush's web projects, Data Analytics experience, tech skills, education, achievements, or contact info. What's on your mind?`;
}

// AI endpoint
const AI_ENDPOINT = '/.netlify/functions/portfolio-chat';
let aiHistory = [];

// Handle form submit
if (aiChatForm && aiUserInput) {
  aiChatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const question = aiUserInput.value.trim();
    if (!question) return;

    appendAiMessage(question, 'user');
    aiUserInput.value = '';

    showTyping();

    try {
      const response = await fetch(AI_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: question,
          history: aiHistory
        })
      });

      let data = null;
      if (response.ok) {
        try {
          data = await response.json();
        } catch (err) {
          console.warn('JSON parse error from AI endpoint:', err);
        }
      }

      hideTyping();

      if (data && typeof data.reply === 'string' && data.reply.trim().length > 0) {
        appendAiMessage(data.reply, 'bot');
        aiHistory.push({ role: 'user', text: question });
        aiHistory.push({ role: 'model', text: data.reply });
      } else {
        // Use smart local fallback engine when API is unavailable or rate limited
        const localReply = getLocalAiReply(question);
        appendAiMessage(localReply, 'bot');
      }
    } catch (err) {
      console.warn('Backend fetch failed, falling back to local KB engine:', err);
      hideTyping();
      const localReply = getLocalAiReply(question);
      appendAiMessage(localReply, 'bot');
    }
  });
}

// === Netlify contact form AJAX + Thank You toast ===
const contactForm = document.getElementById('contact-form');
const formMessage = document.getElementById('form-message');

function encode(data) {
  return Object.keys(data)
    .map(
      (key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key])
    )
    .join('&');
}

if (contactForm) {
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const formData = {
      'form-name': 'contact',
      name: contactForm.name.value,
      email: contactForm.email.value,
      message: contactForm.message.value
    };

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encode(formData)
    })
      .then(() => {
        if (formMessage) {
          formMessage.textContent = 'Thank you! Your message has been sent.';
          formMessage.style.color = '#27c93f';
        }

        const toast = document.createElement('div');
        toast.textContent = 'Message sent successfully!';
        toast.style.position = 'fixed';
        toast.style.right = '24px';
        toast.style.bottom = '24px';
        toast.style.padding = '10px 16px';
        toast.style.borderRadius = '999px';
        toast.style.background =
          'linear-gradient(135deg, #00bcd4, #4caf50)';
        toast.style.color = '#fff';
        toast.style.fontSize = '0.85rem';
        toast.style.boxShadow = '0 12px 25px rgba(0,0,0,0.7)';
        toast.style.zIndex = '9999';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
        document.body.appendChild(toast);

        requestAnimationFrame(() => {
          toast.style.opacity = '1';
          toast.style.transform = 'translateY(0)';
        });

        setTimeout(() => {
          toast.style.opacity = '0';
          toast.style.transform = 'translateY(10px)';
          setTimeout(() => toast.remove(), 300);
        }, 6000);

        contactForm.reset();
      })
      .catch(() => {
        if (formMessage) {
          formMessage.textContent =
            'Something went wrong. Please try again later.';
          formMessage.style.color = '#ff5252';
        }
      });
  });
}

// About Section Dual Persona Switcher + Experience Track Auto-Sync
const personaTabs = document.querySelectorAll('.persona-tab');
const personaContents = document.querySelectorAll('.persona-content');

if (personaTabs.length > 0 && personaContents.length > 0) {
  personaTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const persona = tab.getAttribute('data-persona');

      personaTabs.forEach(t => t.classList.remove('active'));
      personaContents.forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      const targetContent = document.getElementById(`persona-${persona}`);
      if (targetContent) {
        targetContent.classList.add('active');
      }

      // Sync experience filter track button
      const targetTrack = persona === 'analytics' ? 'data-analytics' : 'web-dev';
      const expBtn = document.querySelector(`.exp-filter-btn[data-exp-filter="${targetTrack}"]`);
      if (expBtn && !expBtn.classList.contains('active')) {
        expBtn.click();
      }
    });
  });
}

// Experience Track Filter Switcher (Global Function + Event Listener)
window.filterExp = function(selectedFilter) {
  const expBtns = document.querySelectorAll('.exp-filter-btn');
  const expItems = document.querySelectorAll('#experience .timeline-item');

  expBtns.forEach((b) => {
    if (b.getAttribute('data-exp-filter') === selectedFilter) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });

  expItems.forEach((item) => {
    const category = item.getAttribute('data-exp-category');
    if (category === selectedFilter) {
      item.style.display = 'block';
      item.style.opacity = '1';
      item.style.transform = 'translateY(0)';
      item.classList.add('revealed');
    } else {
      item.style.display = 'none';
    }
  });
};

const expFilterBtns = document.querySelectorAll('.exp-filter-btn');
if (expFilterBtns.length > 0) {
  expFilterBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const selectedFilter = btn.getAttribute('data-exp-filter');
      if (selectedFilter) window.filterExp(selectedFilter);
    });
  });
}

