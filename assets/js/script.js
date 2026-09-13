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

  const avatar = document.createElement('div');
  avatar.classList.add('ai-msg-avatar');
  avatar.innerHTML = type === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';

  const bubble = document.createElement('div');
  bubble.classList.add('ai-msg-bubble');

  if (typeof text === 'string' && (text.includes('<br>') || text.includes('<strong>') || text.includes('<ul>'))) {
    bubble.innerHTML = `<p>${text}</p>`;
  } else {
    const p = document.createElement('p');
    p.textContent = text;
    bubble.appendChild(p);
  }

  wrapper.appendChild(avatar);
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
    <div class="ai-msg-avatar"><i class="fas fa-robot"></i></div>
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

// Smart Local Knowledge Base Fallback Engine
function getLocalAiReply(question) {
  const q = question.toLowerCase();

  if (q.includes('project') || q.includes('work') || q.includes('build') || q.includes('budget') || q.includes('yatra') || q.includes('task') || q.includes('logistics') || q.includes('agri') || q.includes('resolve')) {
    return `<strong>Piyush's Key Projects:</strong><br>
    • <strong>BudgetYatra:</strong> Travel expense splitter & budget management app.<br>
    • <strong>TaskCraft Pro:</strong> Kanban workflow platform with real-time metrics.<br>
    • <strong>Logistics BI:</strong> NSDC supply chain performance analytics dashboard.<br>
    • <strong>Agriculture Analytics:</strong> ML crop yield prediction platform.`;
  }

  if (q.includes('skill') || q.includes('tech') || q.includes('stack') || q.includes('python') || q.includes('javascript') || q.includes('sql') || q.includes('react') || q.includes('power bi')) {
    return `<strong>Piyush's Technical Stack:</strong><br>
    • <strong>Languages:</strong> Python, JavaScript, SQL, HTML5, CSS3.<br>
    • <strong>Analytics & Data:</strong> Power BI, EDA, Advanced Excel, SQL Aggregations.<br>
    • <strong>Frameworks & Tools:</strong> Firebase, REST APIs, Git/GitHub, Netlify.`;
  }

  if (q.includes('education') || q.includes('mca') || q.includes('bca') || q.includes('degree') || q.includes('college') || q.includes('cgpa')) {
    return `<strong>Educational Qualifications:</strong><br>
    • <strong>MCA:</strong> Chandigarh University (2024–2026) | CGPA: 8.5 / 10.<br>
    • <strong>BCA:</strong> Tilka Manjhi Bhagalpur University (2020–2023) | 77.8%.`;
  }

  if (q.includes('certif') || q.includes('cert') || q.includes('ibm') || q.includes('vois') || q.includes('yuva') || q.includes('hackerrank')) {
    return `<strong>Featured Certifications:</strong><br>
    • <strong>IBM SkillsBuild:</strong> Data Analytics with AI (#PLAN-D44A9C2C463C).<br>
    • <strong>VOIS for Tech AICTE:</strong> Data Analytics Intern Cohort.<br>
    • <strong>YuvaIntern NSDC:</strong> Supply Chain Data Analyst (#YI/2026/164976).<br>
    • <strong>HackerRank:</strong> SQL & Python Skill Badges.`;
  }

  if (q.includes('contact') || q.includes('hire') || q.includes('email') || q.includes('linkedin') || q.includes('github') || q.includes('job') || q.includes('reach')) {
    return `<strong>Contact Information:</strong><br>
    • <strong>Email:</strong> piyus.kr9341@gmail.com<br>
    • <strong>LinkedIn:</strong> linkedin.com/in/piyush-kumar-9341<br>
    • <strong>GitHub:</strong> github.com/PiyushKumar9341<br>
    • <strong>Status:</strong> 🟢 Available for Web Dev & Data Analytics opportunities!`;
  }

  return `Piyush is a Full-Stack Developer and Data Analyst completing his MCA at Chandigarh University (8.5 CGPA). Ask me about his <strong>projects</strong>, <strong>skills</strong>, <strong>education</strong>, or <strong>contact details</strong>!`;
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

