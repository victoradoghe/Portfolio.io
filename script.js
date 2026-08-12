/* ==========================================================================
   Victor Adoghe — Portfolio interactions
   No dependencies except EmailJS (loaded from CDN for the contact form).
   ========================================================================== */

const THEME_KEY = 'va_theme';

const root = document.documentElement;

/* Motion follows the OS setting — checked live so a mid-session change applies. */
const motionIsOff = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* --------------------------------------------------------------------------
   Theme
   -------------------------------------------------------------------------- */

function resolveTheme(theme) {
  if (theme !== 'auto') return theme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  const resolved = resolveTheme(theme);
  root.setAttribute('data-theme', theme);
  root.setAttribute('data-resolved-theme', resolved);

  const toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.setAttribute(
      'aria-label',
      resolved === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
    );
  }

  try { localStorage.setItem(THEME_KEY, theme); } catch (_) {}
}

function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch (_) {}
  applyTheme(saved || 'auto');

  // Keep `auto` in sync when the OS preference changes mid-session.
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (root.getAttribute('data-theme') === 'auto') applyTheme('auto');
  });

  document.getElementById('themeToggle')?.addEventListener('click', () => {
    const resolved = root.getAttribute('data-resolved-theme') || 'dark';
    root.setAttribute('data-theme-switching', 'true');
    applyTheme(resolved === 'dark' ? 'light' : 'dark');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => root.removeAttribute('data-theme-switching'));
    });
  });
}

/* --------------------------------------------------------------------------
   Header: scroll progress + condensed state
   -------------------------------------------------------------------------- */

function initHeaderScroll() {
  const header = document.getElementById('siteHeader');
  const progress = document.getElementById('scrollProgress');
  let ticking = false;

  function update() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;

    header?.classList.toggle('is-stuck', y > 8);
    if (progress) {
      progress.style.setProperty('--progress', max > 0 ? String(y / max) : '0');
    }
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });

  update();
}

/* --------------------------------------------------------------------------
   Mobile navigation overlay
   -------------------------------------------------------------------------- */

function initNav() {
  const toggle = document.getElementById('navToggle');
  const overlay = document.getElementById('navOverlay');
  if (!toggle || !overlay) return;

  // The `hidden` attribute is only there for the no-JS/no-CSS case; from here
  // on, visibility is driven by the `is-open` class so it can transition.
  overlay.hidden = false;

  const links = overlay.querySelectorAll('a');

  function setOpen(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    overlay.classList.toggle('is-open', open);
    document.body.classList.toggle('is-locked', open);
    if (open) {
      links[0]?.focus({ preventScroll: true });
    } else {
      toggle.focus({ preventScroll: true });
    }
  }

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  links.forEach((link) => link.addEventListener('click', () => setOpen(false)));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) setOpen(false);
  });

  // Bail out of the overlay if the viewport grows past the mobile breakpoint.
  window.matchMedia('(min-width: 881px)').addEventListener('change', (e) => {
    if (e.matches && overlay.classList.contains('is-open')) setOpen(false);
  });
}

/* --------------------------------------------------------------------------
   Scroll spy — highlights the section you are reading
   -------------------------------------------------------------------------- */

function initScrollSpy() {
  const links = [...document.querySelectorAll('.nav-menu a[href^="#"]')];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);
  if (!sections.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((link) => {
        const isCurrent = link.getAttribute('href') === `#${entry.target.id}`;
        if (isCurrent) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  sections.forEach((section) => observer.observe(section));
}

/* --------------------------------------------------------------------------
   Scroll reveal
   -------------------------------------------------------------------------- */

function initReveal() {
  const items = [...document.querySelectorAll('[data-reveal]')];
  if (!items.length) return;

  if (motionIsOff() || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-revealed'));
    return;
  }

  // Stagger cards that share a grid so they cascade rather than pop together.
  document.querySelectorAll('.work-grid > [data-reveal]').forEach((card, i) => {
    card.style.setProperty('--reveal-delay', `${Math.min(i, 4) * 0.07}s`);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  items.forEach((el) => observer.observe(el));
}

/* --------------------------------------------------------------------------
   Hero role rotator
   -------------------------------------------------------------------------- */

function initRoleRotator() {
  const el = document.getElementById('roleRotator');
  if (!el) return;

  const roles = ['Software Engineer', 'Front-end Engineer', 'Mobile Developer', 'Desktop App Developer'];
  let i = 0;

  if (motionIsOff()) return;

  setInterval(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(-6px)';

    setTimeout(() => {
      i = (i + 1) % roles.length;
      el.textContent = roles[i];
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 320);
  }, 3400);
}

/* --------------------------------------------------------------------------
   Project filters
   -------------------------------------------------------------------------- */

function initProjectFilters() {
  const chips = [...document.querySelectorAll('.filters .chip')];
  const cards = [...document.querySelectorAll('.work-card')];
  const count = document.getElementById('workCount');
  const empty = document.getElementById('workEmpty');
  if (!chips.length || !cards.length) return;

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const filter = chip.dataset.filter;

      chips.forEach((c) => {
        const active = c === chip;
        c.classList.toggle('is-active', active);
        c.setAttribute('aria-pressed', String(active));
      });

      let visible = 0;
      cards.forEach((card) => {
        const tags = (card.dataset.tags || '').split(/\s+/);
        const show = filter === 'all' || tags.includes(filter);
        card.hidden = !show;
        if (show) {
          visible += 1;
          // Restart the entrance animation so filtered results feel deliberate.
          if (!motionIsOff()) {
            card.classList.remove('is-filtering');
            void card.offsetWidth; // force reflow so the animation replays
            card.classList.add('is-filtering');
          }
        }
      });

      if (count) count.textContent = `${visible} project${visible === 1 ? '' : 's'}`;
      if (empty) empty.hidden = visible > 0;
    });
  });
}

/* --------------------------------------------------------------------------
   Experience accordion
   -------------------------------------------------------------------------- */

function initTimeline() {
  document.querySelectorAll('.timeline-header').forEach((btn) => {
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return; // no panel to expand — leave the row static

    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      panel.classList.toggle('is-open', !expanded);
    });
  });
}

/* --------------------------------------------------------------------------
   Copy email
   -------------------------------------------------------------------------- */

function initCopyEmail() {
  const btn = document.getElementById('copyEmail');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    const email = btn.dataset.email || '';
    try {
      await navigator.clipboard.writeText(email);
      toast('Email copied');
    } catch (_) {
      // Clipboard API needs a secure context; fall back to a hidden field.
      const field = document.createElement('textarea');
      field.value = email;
      field.setAttribute('readonly', '');
      field.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
      document.body.appendChild(field);
      field.select();
      try {
        document.execCommand('copy');
        toast('Email copied');
      } catch (__) {
        toast('Copy failed — select it manually');
      }
      field.remove();
    }
  });
}

/* --------------------------------------------------------------------------
   Contact form (EmailJS)
   -------------------------------------------------------------------------- */

const EMAILJS = {
  publicKey: 'cGxRCB5m37rXeA-W7',
  serviceId: 'service_vzg04li',
  templateId: 'template_w8mdvvh',
};

function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  if (typeof emailjs !== 'undefined') {
    try { emailjs.init(EMAILJS.publicKey); } catch (_) {}
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnLoader = submitBtn.querySelector('.btn-loader');
  const successMsg = form.querySelector('.form-message.success');
  const errorMsg = form.querySelector('.form-message.error');
  const fields = [...form.querySelectorAll('input, textarea')];

  const labelFor = (input) =>
    input.closest('.field')?.querySelector('span')?.textContent.trim() || input.name;

  function messageFor(input) {
    if (input.validity.valid) return '';
    if (input.validity.valueMissing) return `${labelFor(input)} is required.`;
    if (input.validity.typeMismatch && input.type === 'email') return 'That email address looks incomplete.';
    if (input.validity.tooShort) return `${labelFor(input)} needs at least ${input.minLength} characters.`;
    return 'Please check this field.';
  }

  function validateField(input) {
    const target = document.getElementById(input.getAttribute('aria-describedby'));
    const message = messageFor(input);
    if (target) target.textContent = message;
    input.setAttribute('aria-invalid', String(Boolean(message)));
    return !message;
  }

  // Only nag after the visitor has already left a field once.
  fields.forEach((input) => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.getAttribute('aria-invalid') === 'true') validateField(input);
    });
  });

  function setLoading(loading) {
    btnText.hidden = loading;
    btnLoader.hidden = !loading;
    submitBtn.disabled = loading;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    successMsg.hidden = true;
    errorMsg.hidden = true;

    const results = fields.map(validateField);
    if (results.includes(false)) {
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }

    if (typeof emailjs === 'undefined') {
      errorMsg.hidden = false;
      return;
    }

    setLoading(true);
    try {
      // Read through `form.elements` — `form.name` resolves to the form's own
      // name attribute, not the input called "name".
      await emailjs.send(EMAILJS.serviceId, EMAILJS.templateId, {
        from_name: form.elements.namedItem('name').value,
        from_email: form.elements.namedItem('email').value,
        message: form.elements.namedItem('message').value,
        to_name: 'Victor Adoghe',
      });
      successMsg.hidden = false;
      form.reset();
      fields.forEach((input) => {
        input.removeAttribute('aria-invalid');
        const target = document.getElementById(input.getAttribute('aria-describedby'));
        if (target) target.textContent = '';
      });
      toast('Message sent');
    } catch (err) {
      console.error('EmailJS send failed:', err);
      errorMsg.hidden = false;
    } finally {
      setLoading(false);
    }
  });
}

/* --------------------------------------------------------------------------
   Toasts
   -------------------------------------------------------------------------- */

function toast(message) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  container.appendChild(el);

  setTimeout(() => {
    el.classList.add('is-out');
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }, 2400);
}

/* --------------------------------------------------------------------------
   Misc
   -------------------------------------------------------------------------- */

function initToTop() {
  document.getElementById('toTop')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: motionIsOff() ? 'auto' : 'smooth' });
  });
}

function setYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = String(new Date().getFullYear());
}

/* --------------------------------------------------------------------------
   Boot
   -------------------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initHeaderScroll();
  initNav();
  initScrollSpy();
  initReveal();
  initRoleRotator();
  initProjectFilters();
  initTimeline();
  initCopyEmail();
  initContactForm();
  initToTop();
  setYear();
});
