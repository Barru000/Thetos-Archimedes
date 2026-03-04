// Small progressive enhancement: menu toggle and dynamic year
document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  const yearEl = document.getElementById('year');

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      if (mainNav.hasAttribute('hidden')) mainNav.removeAttribute('hidden');
      else mainNav.setAttribute('hidden', '');
    });
  }

  // Example: fetch a small JSON file if present (non-blocking)
  fetch('/meta.json').then(r => {
    if (!r.ok) throw new Error('no meta');
    return r.json();
  }).then(data => {
    console.log('site meta', data);
  }).catch(()=>{/* ignore missing meta */});
});