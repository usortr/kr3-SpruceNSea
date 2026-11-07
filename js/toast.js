/* =========================================================
   Spruce & Sea — toast-уведомления
   ========================================================= */
window.SS_TOAST = (function () {
  'use strict';

  function ensureContainer() {
    let c = document.querySelector('.toast-stack');
    if (!c) {
      c = document.createElement('div');
      c.className = 'toast-stack';
      c.setAttribute('aria-live', 'polite');
      document.body.appendChild(c);
    }
    return c;
  }

  function show(text, opts) {
    const { duration = 3000 } = opts || {};
    const stack = ensureContainer();
    const el = document.createElement('div');
    el.className = 'toast-site';
    el.textContent = text;
    stack.appendChild(el);

    /* появление */
    requestAnimationFrame(() => el.classList.add('is-visible'));

    setTimeout(() => {
      el.classList.remove('is-visible');
      el.addEventListener('transitionend', () => el.remove(), { once: true });
      /* страховка, если transitionend не сработал */
      setTimeout(() => el.remove(), 400);
    }, duration);

    return el;
  }

  return { show };
})();