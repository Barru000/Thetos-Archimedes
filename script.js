// Progressive enhancement: accessible menu toggle and safe metadata fetch
(function () {
  'use strict';

  function safeText(node, text) {
    node.textContent = text;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.getElementById('navToggle');
    const mainNav = document.getElementById('mainNav');
    const yearEl = document.getElementById('year');

    if (yearEl) safeText(yearEl, String(new Date().getFullYear()));

    if (navToggle && mainNav) {
      navToggle.addEventListener('click', () => {
        const expanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', String(!expanded));
        if (mainNav.hasAttribute('hidden')) mainNav.removeAttribute('hidden');
        else mainNav.setAttribute('hidden', '');
      });
    }

    (async function fetchMeta() {
      try {
        const resp = await fetch('/meta.json', { credentials: 'same-origin' });
        if (!resp.ok) return;
        const data = await resp.json();
        if (location.hostname === 'localhost' || location.hostname.endsWith('.vercel.app')) {
          console.info('site meta', data);
        }
      } catch (e) {
        // intentionally silent in production
      }
    }());
  });
}());