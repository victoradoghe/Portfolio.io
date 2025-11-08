// Victor Adoghe — Portfolio Interactions

const state = {
  reducedMotion: false,
};

// Utility: prefers-reduced-motion
const prefersReducedMotion = () =>
  window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Theme handling
const themeKey = 'va_theme';
const motionKey = 'va_motion';

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem(themeKey, theme); } catch (_) {}
}

function initTheme() {
  const saved = localStorage.getItem(themeKey);
  if (saved) applyTheme(saved);
}

function toggleTheme() {
  const root = document.documentElement;
  const current = root.getAttribute('data-theme') || 'auto';
  const next = current === 'dark' ? 'light' : current === 'light' ? 'auto' : 'dark';
  // Disable transitions for instant switch
  root.setAttribute('data-theme-switching', 'true');
  applyTheme(next);
  // Re-enable after paint
  requestAnimationFrame(() => {
    root.removeAttribute('data-theme-switching');
  });
}

// Motion toggle
function applyMotionPref(value) {
  state.reducedMotion = value;
  document.documentElement.setAttribute('data-reduced-motion', value ? 'reduce' : 'auto');
  // Update visual state of motion toggle button
  const motionToggle = document.getElementById('motionToggle');
  if (motionToggle) {
    motionToggle.setAttribute('data-motion', value ? 'reduced' : 'normal');
  }
  try { localStorage.setItem(motionKey, value ? 'reduce' : 'auto'); } catch (_) {}
}

function initMotion() {
  const saved = localStorage.getItem(motionKey);
  if (saved) applyMotionPref(saved === 'reduce');
  else applyMotionPref(prefersReducedMotion());
}

// Hero role rotator
function initRoleRotator() {
  const el = document.getElementById('roleRotator');
  if (!el) return;
  const roles = ['Junior Front‑end Engineer', 'Full‑stack Engineer'];
  let i = 0;
  setInterval(() => {
    i = (i + 1) % roles.length;
    el.textContent = roles[i];
  }, 2600);
}

// CTA cursor-follow glow
function initCtaGlow() {
  const wrapper = document.querySelector('.hero-ctas');
  if (!wrapper) return;
  wrapper.addEventListener('pointermove', (e) => {
    const rect = wrapper.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * 100 + '%';
    const my = ((e.clientY - rect.top) / rect.height) * 100 + '%';
    wrapper.style.setProperty('--mx', mx);
    wrapper.style.setProperty('--my', my);
  });
}

// Smooth scroll for anchor links
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

// Particle background
function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let dpr = Math.min(2, window.devicePixelRatio || 1);
  let rafId;
  const particles = Array.from({ length: 80 }, () => ({
    x: Math.random(), y: Math.random(), vx: (Math.random() - .5) * .002, vy: (Math.random() - .5) * .002, r: Math.random() * 3 + 2,
  }));

  function resize() {
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    // Recalculate particle positions after resize to keep them visible
    particles.forEach(p => {
      if (p.x > 1) p.x = Math.random();
      if (p.y > 1) p.y = Math.random();
    });
  }
  const onResize = () => { 
    resize(); 
    // Restart animation after resize
    if (rafId) cancelAnimationFrame(rafId);
    step();
  };
  window.addEventListener('resize', onResize);
  resize();

  function step() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(122,92,255,0.95)';
    particles.forEach((p) => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > 1) p.vx *= -1;
      if (p.y < 0 || p.y > 1) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x * canvas.width, p.y * canvas.height, p.r * dpr, 0, Math.PI * 2);
      ctx.fill();
    });
    rafId = requestAnimationFrame(step);
  }
  step();

  // Simple motion detection - only stop if user explicitly prefers reduced motion
  const obs = new MutationObserver(() => {
    if (document.documentElement.getAttribute('data-reduced-motion') === 'reduce') {
      if (rafId) cancelAnimationFrame(rafId);
    } else if (!rafId) {
      step();
    }
  });
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-reduced-motion'] });

  // Additional resize observer for better responsiveness
  const resizeObserver = new ResizeObserver(() => {
    resize();
    if (rafId) cancelAnimationFrame(rafId);
    step();
  });
  resizeObserver.observe(canvas);
}

// Skills rings
function initSkillRings() {
  const rings = document.querySelectorAll('.skill-ring');
  rings.forEach((ring) => {
    const percent = Number(ring.getAttribute('data-percent')) || 0;
    const progress = ring.querySelector('.ring-progress');
    const circumference = 2 * Math.PI * 52; // r=52
    const offset = circumference * (1 - percent / 100);
    progress.style.strokeDasharray = String(circumference);
    progress.style.strokeDashoffset = String(offset);
    ring.title = `${ring.getAttribute('data-skill')} — ${percent}%`;
    let label = ring.querySelector('.skill-percent');
    if (!label) {
      label = document.createElement('span');
      label.className = 'skill-percent';
      ring.insertBefore(label, ring.querySelector('.skill-label'));
    }
    label.textContent = `${percent}%`;
  });
}

// Skills mode toggle: rings <-> cloud
function initSkillsModeToggle() {
  const toggle = document.getElementById('skillsModeToggle');
  const wrapper = document.querySelector('.skills-wrapper');
  const grid = document.querySelector('.ring-grid');
  const cloud = document.querySelector('.skill-cloud');
  if (!toggle || !wrapper || !grid || !cloud) return;
  
  toggle.addEventListener('click', () => {
    // Check which view is currently visible
    const isRingsVisible = !grid.hidden;
    console.log('Current state:', { isRingsVisible, gridHidden: grid.hidden, cloudHidden: cloud.hidden });
    
    if (isRingsVisible) {
      // Switch to cloud
      console.log('Switching to cloud');
      grid.hidden = true; 
      cloud.hidden = false; 
      wrapper.setAttribute('data-mode', 'cloud');
      toggle.textContent = 'Switch to Rings';
      // rearrange cloud by weight
      [...cloud.querySelectorAll('.cloud-item')]
        .sort((a,b) => Number(b.dataset.weight) - Number(a.dataset.weight))
        .forEach((el, idx) => {
          el.style.gridColumn = `span ${Math.max(2, 6 - Math.floor(idx/3))}`;
        });
    } else {
      // Switch to rings
      console.log('Switching to rings');
      cloud.hidden = true; 
      grid.hidden = false; 
      wrapper.setAttribute('data-mode', 'rings');
      toggle.textContent = 'Switch to Cloud';
    }
    console.log('After switch:', { gridHidden: grid.hidden, cloudHidden: cloud.hidden });
  });
}

// Project filters
function initProjectFilters() {
  const chips = document.querySelectorAll('.filters .chip');
  const cards = document.querySelectorAll('.project-card');
  chips.forEach((chip) => chip.addEventListener('click', () => {
    chips.forEach((c) => { c.classList.remove('is-active'); c.setAttribute('aria-pressed', 'false'); });
    chip.classList.add('is-active'); chip.setAttribute('aria-pressed', 'true');
    const tag = chip.dataset.filter;
    cards.forEach((card) => {
      const tags = (card.getAttribute('data-tags') || '').split(/\s+/);
      const show = tag === 'all' || tags.includes(tag);
      card.style.display = show ? '' : 'none';
    });
  }));
}

// Timeline toggles
function initTimeline() {
  document.querySelectorAll('.timeline-header').forEach((btn) => {
    const content = btn.parentElement.querySelector('.timeline-content');
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      content.hidden = expanded;
    });
  });
}

// Modal
function initModal() {
  const modal = document.getElementById('caseStudyModal');
  if (!modal) return;
  const dialog = modal.querySelector('.modal-dialog');
  const content = modal.querySelector('.modal-content');
  function open(html) {
    content.innerHTML = html || '<p class="muted">Loading…</p>';
    modal.hidden = false;
    dialog.focus();
    document.body.style.overflow = 'hidden';
  }
  function close() {
    modal.hidden = true; document.body.style.overflow = '';
  }
  modal.addEventListener('click', (e) => {
    const target = e.target;
    if (target.matches('[data-close]') || target.closest('[data-close]') || target === modal) close();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) close(); });
  document.querySelectorAll('[data-open-modal]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const key = btn.getAttribute('data-project');
      open('<p class="muted">Loading…</p>');
      try {
        const res = await fetch(`case-studies/${key}.html`);
        const html = await res.text();
        open(html);
      } catch (e) {
        open('<p>Failed to load. <a href="#">Open in new page</a></p>');
      }
    });
  });
}

// Contact form with EmailJS
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnLoader = submitBtn.querySelector('.btn-loader');
  const successMsg = form.querySelector('.form-message.success');
  const errorMsg = form.querySelector('.form-message.error');

  function showLoading(isLoading) {
    btnText.hidden = isLoading;
    btnLoader.hidden = !isLoading;
    submitBtn.disabled = isLoading;
  }

  function showMessage(type, show = true) {
    successMsg.hidden = type !== 'success' || !show;
    errorMsg.hidden = type !== 'error' || !show;
    if (show) {
      const msgEl = type === 'success' ? successMsg : errorMsg;
      msgEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function validateForm() {
    const inputs = form.querySelectorAll('input, textarea');
    let isValid = true;

    inputs.forEach(input => {
      const errorElement = input.parentElement.querySelector('.error-message');
      errorElement.textContent = '';

      if (!input.checkValidity()) {
        isValid = false;
        if (input.validity.valueMissing) {
          errorElement.textContent = `${input.name} is required`;
        } else if (input.validity.typeMismatch && input.type === 'email') {
          errorElement.textContent = 'Please enter a valid email address';
        } else if (input.validity.tooShort) {
          errorElement.textContent = `${input.name} must be at least ${input.minLength} characters`;
        }
      }
    });

    return isValid;
  }

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    showMessage('success', false);
    showMessage('error', false);

    if (!validateForm()) {
      return;
    }

    showLoading(true);

    try {
      const templateParams = {
        from_name: form.name.value,
        from_email: form.email.value,
        message: form.message.value,
        to_name: 'Victor Adoghe'
      };

      await emailjs.send(
        'service_vzg04li', // Replace with your EmailJS service ID
        'template_w8mdvvh', // Replace with your EmailJS template ID
        templateParams
      );

      showMessage('success', true);
      form.reset();
    } catch (error) {
      console.error('Failed to send email:', error);
      showMessage('error', true);
    } finally {
      showLoading(false);
    }
  });
}

function toast(message) {
  const container = document.getElementById('toastContainer');
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 300);
  }, 2000);
}

// Nav toggle (mobile)
function initNavToggle() {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('nav-menu');
  if (!toggle || !menu) return;
  function set(open) {
    toggle.setAttribute('aria-expanded', String(open));
    menu.style.display = open ? 'grid' : '';
  }
  toggle.addEventListener('click', () => set(toggle.getAttribute('aria-expanded') !== 'true'));
}

// Year
function setYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}

// Event bindings
window.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMotion();
  document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
  document.getElementById('motionToggle')?.addEventListener('click', () => applyMotionPref(!state.reducedMotion));

  initRoleRotator();
  initCtaGlow();
  initSmoothScroll();
  initParticles();
  initSkillRings();
  initSkillsModeToggle();
  initProjectFilters();
  initTimeline();
  initModal();
  initContactForm();
  initNavToggle();
  setYear();
});


