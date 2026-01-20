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

// Smooth scroll with offset for fixed navbar
const navScrollLinks = document.querySelectorAll('#main-nav a[href^="#"]');
const headerOffset = 80; // adjust if your navbar height is different

navScrollLinks.forEach((link) => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href').substring(1);
    const targetEl = document.getElementById(targetId);
    if (!targetEl) return;

    e.preventDefault();

    const elementPosition = targetEl.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });
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

// Scroll reveal + certifications stagger (JS-controlled animations)
const observerOptions = {
  threshold: 0.2
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

// Optional simple history
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

      let data;
      try {
        data = await response.json();
      } catch (err) {
        console.error('Failed to parse JSON from function:', err);
        hideTyping();
        appendAiMessage('Assistant returned an invalid response.', 'bot');
        return;
      }

      console.log('FUNCTION RAW RESPONSE:', data);

      hideTyping();

      if (!response.ok) {
        if (response.status === 429) {
          appendAiMessage(
            'AI limit reached for now. Please try again later or check Gemini API quota.',
            'bot'
          );
        } else {
          appendAiMessage(
            data.message || 'Sorry, something went wrong. Please try again later.',
            'bot'
          );
        }
        return;
      }

      const answer =
        data && typeof data.reply === 'string'
          ? data.reply
          : 'I could not generate a response right now.';
      appendAiMessage(answer, 'bot');

      aiHistory.push({ role: 'user', text: question });
      aiHistory.push({ role: 'model', text: answer });
    } catch (err) {
      console.error('Frontend error:', err);
      hideTyping();
      appendAiMessage('Network error. Please check your connection and try again.', 'bot');
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
