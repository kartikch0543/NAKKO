/* =========================================
   NAKKO - Main JavaScript
   Shared utilities across all pages & dashboards
   Mobile & Web Interaction Engine & Theme Switcher
   ========================================= */

'use strict';

// ---- Theme Switcher System ----
function getPreferredTheme() {
  const storedTheme = localStorage.getItem('nakko-theme');
  if (storedTheme) {
    return storedTheme;
  }
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.body.setAttribute('data-theme', theme);
  localStorage.setItem('nakko-theme', theme);

  // Update theme toggle buttons aria attributes
  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    btn.setAttribute('title', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  });

  // Dispatch custom event for widgets/charts that need re-rendering
  window.dispatchEvent(new CustomEvent('nakko-theme-change', { detail: { theme } }));
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
  showToast(newTheme === 'dark' ? 'Switched to Dark Mode 🌙' : 'Switched to Light Mode ☀️');
}

function initThemeSystem() {
  const theme = getPreferredTheme();
  setTheme(theme);

  // Listen to OS theme changes if user hasn't explicitly set a preference
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem('nakko-theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
}

// ---- Toast Notifications ----
let toastTimeout = null;

function showToast(message, type = 'default') {
  const existing = document.getElementById('nakko-toast');
  if (existing) existing.remove();
  if (toastTimeout) clearTimeout(toastTimeout);

  const toast = document.createElement('div');
  toast.id = 'nakko-toast';
  toast.className = 'toast';

  const icons = {
    default: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`,
    error: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    info: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  };

  toast.innerHTML = `
    <span style="opacity:0.9; flex-shrink:0;">${icons[type] || icons.default}</span>
    <span style="font-size:0.875rem;">${message}</span>
    <button onclick="this.parentElement.remove()" style="background:none;border:none;color:inherit;opacity:0.7;cursor:pointer;padding:0 0 0 8px;margin-left:auto;font-size:1.1rem;line-height:1;" aria-label="Close notification">✕</button>
  `;

  document.body.appendChild(toast);

  toastTimeout = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4200);
}

// ---- Main Navigation Mobile Drawer ----
function initMobileNav() {
  const toggleBtn = document.querySelector('.nav-toggle-btn');
  const drawer = document.getElementById('mobileNavDrawer');
  const closeBtn = document.getElementById('closeMobileNav');

  if (toggleBtn && drawer) {
    toggleBtn.addEventListener('click', () => {
      drawer.classList.add('active');
      document.body.style.overflow = 'hidden';
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        drawer.classList.remove('active');
        document.body.style.overflow = '';
      });
    }

    drawer.addEventListener('click', (e) => {
      if (e.target === drawer) {
        drawer.classList.remove('active');
        document.body.style.overflow = '';
      }
    });

    drawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        drawer.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }
}

// ---- Dashboard Mobile Sidebar Drawer ----
function initDashboardMobileSidebar() {
  const dashToggle = document.querySelector('.mobile-dash-toggle');
  const sidebar = document.querySelector('.sidebar');
  let backdrop = document.querySelector('.sidebar-backdrop');

  if (!backdrop && sidebar) {
    backdrop = document.createElement('div');
    backdrop.className = 'sidebar-backdrop';
    document.body.appendChild(backdrop);
  }

  function openSidebar() {
    if (sidebar) sidebar.classList.add('mobile-open');
    if (backdrop) backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    if (sidebar) sidebar.classList.remove('mobile-open');
    if (backdrop) backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (dashToggle && sidebar) {
    dashToggle.addEventListener('click', () => {
      if (sidebar.classList.contains('mobile-open')) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', closeSidebar);
  }

  if (sidebar) {
    sidebar.querySelectorAll('.sidebar-item').forEach(item => {
      item.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          closeSidebar();
        }
      });
    });
  }
}

// ---- Sync Mobile Bottom Nav with Active Section ----
function syncMobileBottomNav(activeSectionId) {
  const bottomItems = document.querySelectorAll('.mobile-bottom-item');
  bottomItems.forEach(item => {
    const sec = item.getAttribute('data-section');
    if (sec === activeSectionId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

// ---- Smooth Scroll for Anchor Links ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href === '#' || href.length < 2) return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ---- Nav Scroll Effect ----
const navEl = document.querySelector('.nav');
if (navEl) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navEl.style.boxShadow = 'var(--shadow-sm)';
    } else {
      navEl.style.boxShadow = 'none';
    }
  }, { passive: true });
}

// ---- Animate Elements on Scroll ----
const observerOptions = {
  root: null,
  rootMargin: '0px 0px -8% 0px',
  threshold: 0.1,
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animationPlayState = 'running';
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.animate-fade-up, .animate-fade').forEach(el => {
  el.style.animationPlayState = 'paused';
  observer.observe(el);
});

// ---- Escape Key Handlers ----
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const modal = document.querySelector('.modal-overlay.active');
    if (modal) modal.classList.remove('active');

    const navDrawer = document.getElementById('mobileNavDrawer');
    if (navDrawer && navDrawer.classList.contains('active')) {
      navDrawer.classList.remove('active');
      document.body.style.overflow = '';
    }

    const sidebar = document.querySelector('.sidebar.mobile-open');
    const backdrop = document.querySelector('.sidebar-backdrop.active');
    if (sidebar) sidebar.classList.remove('mobile-open');
    if (backdrop) backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }
});

// ---- Utilities ----
function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// ---- Initialize On DOM Loaded ----
document.addEventListener('DOMContentLoaded', () => {
  initThemeSystem();
  initMobileNav();
  initDashboardMobileSidebar();

  document.querySelectorAll('[data-greeting]').forEach(el => {
    el.textContent = getGreeting();
  });

  const greetingEl1 = document.getElementById('greetingTime');
  if (greetingEl1) greetingEl1.textContent = getGreeting();
  const greetingEl2 = document.getElementById('greetingTime2');
  if (greetingEl2) greetingEl2.textContent = getGreeting();
});
