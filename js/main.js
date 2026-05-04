// ---- Navigation scroll effect ----
const nav = document.querySelector('.nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 30);
  });
}

// ---- Mobile nav toggle ----
const toggle = document.querySelector('.nav__toggle');
const desktop = document.querySelector('.nav__desktop');
if (toggle && desktop) {
  toggle.addEventListener('click', () => {
    desktop.classList.toggle('open');
  });
}

// ---- Fade-up scroll animations ----
const fadeEls = document.querySelectorAll('.fade-up');
if (fadeEls.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('visible'), i * 80);
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  fadeEls.forEach(el => observer.observe(el));
}

// ---- GDPR Cookie Banner ----
const banner = document.getElementById('gdprBanner');
if (banner) {
  if (localStorage.getItem('cookieConsent')) {
    banner.classList.add('hidden');
  }

  const acceptBtn = document.getElementById('gdprAccept');
  const rejectBtn = document.getElementById('gdprReject');

  if (acceptBtn) {
    acceptBtn.addEventListener('click', () => {
      localStorage.setItem('cookieConsent', 'accepted');
      banner.classList.add('hidden');
    });
  }

  if (rejectBtn) {
    rejectBtn.addEventListener('click', () => {
      localStorage.setItem('cookieConsent', 'rejected');
      banner.classList.add('hidden');
    });
  }
}

// ---- Contact form submit ----
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('[type="submit"]');
    btn.textContent = 'Odesíláno…';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = '✓ Odesláno – odpovíme do 24 hodin';
      btn.style.background = 'var(--moss)';
    }, 1200);
  });
}

// ---- Add to cart ----
const cartBtn = document.getElementById('addToCart');
if (cartBtn) {
  cartBtn.addEventListener('click', () => {
    cartBtn.textContent = '✓ Přidáno do košíku';
    cartBtn.style.background = 'var(--moss)';
    setTimeout(() => {
      cartBtn.textContent = 'Vložit do košíku';
      cartBtn.style.background = '';
    }, 2500);
  });
}

// ---- Internationalization (i18n) ----
let currentLang = localStorage.getItem('lang') || 'cz';
const translations = {};

async function loadTranslations(lang) {
  try {
    const response = await fetch(`i18n/${lang}.json`);
    if (!response.ok) throw new Error('Translation file not found');
    translations[lang] = await response.json();
  } catch (error) {
    console.error(`Failed to load translations for ${lang}:`, error);
  }
}

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  document.documentElement.lang = lang === 'cz' ? 'cs' : lang;
  document.documentElement.setAttribute('data-lang', lang);

  // Update active language in nav
  document.querySelectorAll('.nav__lang a').forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-lang') === lang);
  });

  // Apply translations
  applyTranslations();
}

function applyTranslations() {
  const trans = translations[currentLang];
  if (!trans) return;

  // Update title and meta
  document.title = trans.title || document.title;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.content = trans.description || metaDesc.content;

  // Update elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const value = getNestedValue(trans, key);
    if (value !== undefined) {
      if (el.tagName === 'META') {
        el.content = value;
      } else if (el.tagName === 'TITLE') {
        document.title = value;
      } else {
        el.innerHTML = value;
      }
    }
  });
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current && current[key], obj);
}

// Initialize i18n
async function initI18n() {
  await loadTranslations(currentLang);
  setLanguage(currentLang);

  // Language switcher
  document.querySelectorAll('.nav__lang a').forEach(link => {
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      const lang = link.getAttribute('data-lang');
      if (lang !== currentLang) {
        if (!translations[lang]) {
          await loadTranslations(lang);
        }
        setLanguage(lang);
      }
    });
  });
}

// Load i18n on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initI18n);
} else {
  initI18n();
}
