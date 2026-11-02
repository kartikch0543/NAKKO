/* =========================================
   NAKKO - Main JavaScript
   Shared utilities across all pages
   ========================================= */

'use strict';

// ---- Toast Notifications ----
let toastTimeout = null;

function showToast(message, type = 'default') {
  // Remove existing toast
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
    <span style="opacity:0.8; flex-shrink:0;">${icons[type] || icons.default}</span>
    <span>${message}</span>
    <button onclick="this.parentElement.remove()" style="background:none;border:none;color:rgba(255,255,255,0.5);cursor:pointer;padding:0;margin-left:auto;font-size:1rem;line-height:1;">✕</button>
  `;

  document.body.appendChild(toast);

  // Auto-dismiss after 4s
  toastTimeout = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ---- Smooth Scroll for anchor links ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ---- Nav scroll effect ----
const nav = document.querySelector('.nav');
if (nav) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      nav.style.borderBottomColor = 'rgba(26, 26, 26, 0.12)';
    } else {
      nav.style.borderBottomColor = 'rgba(26, 26, 26, 0.08)';
    }
  }, { passive: true });
}

// ---- Animate elements on scroll ----
const observerOptions = {
  root: null,
  rootMargin: '0px 0px -10% 0px',
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

// ---- Back to top ----
window.addEventListener('scroll', () => {
  const btn = document.querySelector('.back-to-top');
  if (btn) {
    btn.style.display = window.scrollY > 400 ? 'flex' : 'none';
  }
}, { passive: true });

// ---- Mobile menu toggle ----
const menuBtn = document.querySelector('.menu-btn');
const mobileMenu = document.querySelector('.mobile-menu');
if (menuBtn && mobileMenu) {
  menuBtn.addEventListener('click', () => {
    const isOpen = mobileMenu.style.display === 'flex';
    mobileMenu.style.display = isOpen ? 'none' : 'flex';
    menuBtn.setAttribute('aria-expanded', !isOpen);
  });
}

// ---- Form validation helper ----
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  return /^[+]?[\d\s\-()]{10,}$/.test(phone);
}

// ---- Keyboard accessibility: close modal on Escape ----
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const modal = document.querySelector('.modal-overlay.active');
    if (modal) modal.classList.remove('active');
  }
});

// ---- Format currency ----
function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// ---- Format relative time ----
function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ---- Greeting based on time ----
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// Apply greetings
document.querySelectorAll('[data-greeting]').forEach(el => {
  el.textContent = getGreeting();
});

console.log('%cNAKKO', 'color:#2d6a4f; font-size:2rem; font-weight:800; font-family:serif;');
console.log('%cCooperative Gig Platform · v1.0.0', 'color:#6b6b6b; font-size:0.875rem;');
