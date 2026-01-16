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

// Active link on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('#main-nav a');

window.addEventListener('scroll', () => {
  const scrollY = window.pageYOffset;

  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 120;
    const sectionHeight = section.offsetHeight;
    const id = section.getAttribute('id');

    if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
      navLinks.forEach((link) => link.classList.remove('active-link'));
      const active = document.querySelector(`#main-nav a[href="#${id}"]`);
      if (active) active.classList.add('active-link');
    }
  });
});

// Scroll to top button
const scrollBtn = document.getElementById('scrollToTopBtn');

if (scrollBtn) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      scrollBtn.style.opacity = '1';
      scrollBtn.style.visibility = 'visible';
      scrollBtn.style.transform = 'translateY(0)';
    } else {
      scrollBtn.style.opacity = '0';
      scrollBtn.style.visibility = 'hidden';
      scrollBtn.style.transform = 'translateY(10px)';
    }
  });

  scrollBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Typing effect for roles
const roles = [
  'Full-Stack Developer',
  'React & Node.js Engineer',
  'Generative AI Enthusiast'
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

// Scroll reveal + certifications stagger
const observerOptions = {
  threshold: 0.2
};

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, observerOptions);

document
  .querySelectorAll('.animate-on-scroll, .skill-card, .project-card, .about-card')
  .forEach((el) => {
    revealObserver.observe(el);
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

// Helper: append message bubble
function appendAiMessage(text, type = 'bot') {
  if (!aiMessages) return;
  const wrapper = document.createElement('div');
  wrapper.classList.add('ai-message');
  wrapper.classList.add(type === 'user' ? 'ai-user' : 'ai-bot');

  const p = document.createElement('p');
  p.textContent = text;
  wrapper.appendChild(p);

  aiMessages.appendChild(wrapper);
  aiMessages.scrollTop = aiMessages.scrollHeight;
}

// Helper: show/hide typing indicator
let typingEl = null;
function showTyping() {
  if (!aiMessages) return;
  typingEl = document.createElement('div');
  typingEl.classList.add('ai-message', 'ai-bot', 'ai-typing');
  typingEl.textContent = 'Thinking...';
  aiMessages.appendChild(typingEl);
  aiMessages.scrollTop = aiMessages.scrollHeight;
}
function hideTyping() {
  if (typingEl && typingEl.parentNode) {
    typingEl.parentNode.removeChild(typingEl);
    typingEl = null;
  }
}

// AI endpoint
const AI_ENDPOINT = '/.netlify/functions/portfolio-chat';

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
        // YAHAN CHANGE: backend `message` expect kar raha hai
        body: JSON.stringify({
          message: question
        })
      });

      const data = await response.json();
      console.log('FUNCTION RAW RESPONSE:', data); // debug

      hideTyping();

      if (!response.ok) {
        appendAiMessage('Sorry, something went wrong. Please try again later.');
        return;
      }

      const answer =
        data && typeof data.answer === 'string'
          ? data.answer
          : 'I could not generate a response right now.';
      appendAiMessage(answer, 'bot');
    } catch (err) {
      console.error('Frontend error:', err);
      hideTyping();
      appendAiMessage('Network error. Please check your connection and try again.');
    }
  });
}
