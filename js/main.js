/* =========================================================
   Spruce & Sea — скрипты
   ========================================================= */

/* ---------- 0. Активный пункт меню по URL ---------- */
(function () {
  const links = document.querySelectorAll('.site-nav__link');
  if (!links.length) return;

  const url   = new URL(location.href);
  const type  = url.searchParams.get('type');   // stays | spa | bikes | restaurant
  const page  = url.pathname.split('/').pop() || 'index.html';

  // Карта: какой ссылке соответствует какой контекст
  const map = {
    stays:      'catalog.html?type=stays',
    spa:        'catalog.html?type=spa',
    bikes:      'catalog.html?type=bikes',
    restaurant: 'restaurant.html',
    contacts:   'contacts.html',
    index:      'index.html',
  };

  // Какие страницы НЕ должны получать авто-подсветку:
  //  - item.html: подсветку выставит item.js через window.setActiveNav
  //  - checkout.html / privacy.html и т.п.: просто ничего не подсвечиваем
  const NO_AUTO_ACTIVE = ['item.html', 'checkout.html', 'privacy.html'];

  let target = null;

  if (NO_AUTO_ACTIVE.includes(page)) {
    target = null;
  } else if (page === 'catalog.html') {
    target = map[type] || map.stays;
  } else if (page === 'restaurant.html') {
    target = map.restaurant;
  } else if (page === 'contacts.html') {
    target = map.contacts;
  } else {
    target = map.index;
  }

  links.forEach(link => {
    link.classList.toggle(
      'site-nav__link--active',
      target !== null && link.getAttribute('href') === target
    );
  });
})();

/* ---------- 1. Мобильное меню навбара ---------- */
(function () {
  const burger = document.querySelector('.burger');
  const nav = document.getElementById('site-nav');
  if (!burger || !nav) return;

  const close = () => {
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Открыть меню');
  };

  burger.addEventListener('click', () => {
    const willOpen = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', willOpen);
    burger.setAttribute('aria-expanded', String(willOpen));
    burger.setAttribute('aria-label', willOpen ? 'Закрыть меню' : 'Открыть меню');
  });

  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', close));

  document.addEventListener('click', (e) => {
    if (nav.classList.contains('is-open') &&
        !nav.contains(e.target) && !burger.contains(e.target)) {
      close();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
})();

/* ---------- 2. Бегающая линия под пунктами меню ---------- */
(function () {
  const nav = document.querySelector('.site-nav');
  if (!nav) return;

  const list      = nav.querySelector('[data-nav-list]');
  const underline = nav.querySelector('[data-nav-underline]');
  if (!list || !underline) return;

  const links = Array.from(list.querySelectorAll('.site-nav__link'));
  if (!links.length) return;

  // Активный пункт — тот, у которого класс --active.
  // Если активного нет — НЕ подставляем links[0], линия просто скрыта.
  let activeLink = links.find(l => l.classList.contains('site-nav__link--active')) || null;

  // На мобильных линия скрыта через CSS — тогда не трогаем
  const isDesktop = () => window.matchMedia('(min-width: 1181px)').matches;

  // Измеряем позицию пункта относительно списка
  const measure = (link) => {
    const listRect = list.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    return {
      x: linkRect.left - listRect.left,
      w: linkRect.width
    };
  };

  // Устанавливаем линию под конкретный пункт
  const moveTo = (link) => {
    if (!link || !isDesktop()) return;
    const { x, w } = measure(link);
    underline.style.width = w + 'px';
    underline.style.transform = `translateX(${x}px)`;
    underline.classList.add('site-nav__underline--visible');
  };

  // Спрятать линию (например, когда меню скрыто)
  const hide = () => {
    underline.classList.remove('site-nav__underline--visible');
  };

  // Инициализация: ставим линию под активный пункт (или прячем)
  const init = () => {
    if (!isDesktop()) return;
    requestAnimationFrame(() => {
      if (activeLink) moveTo(activeLink);
      else hide();
    });
  };

  // При наведении — линия едет к пункту
  links.forEach(link => {
    link.addEventListener('mouseenter', () => moveTo(link));
    link.addEventListener('focus',      () => moveTo(link));
  });

  // Когда курсор уходит из меню — линия возвращается к активному пункту
  // (или прячется, если активного нет)
  list.addEventListener('mouseleave', () => {
    if (activeLink) moveTo(activeLink);
    else hide();
  });

  // При смене размера окна пересчитываем
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (!isDesktop()) { hide(); return; }
      if (activeLink) moveTo(activeLink);
      else hide();
    }, 100);
  });

  // Пересчёт после загрузки шрифтов (иначе ширина пункта меняется)
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(init);
  } else {
    window.addEventListener('load', init);
  }
  init();

  /* Публичный API: выставить активный пункт навигации по href (или null — снять).
     Нужен для item.js и любых других страниц с динамическим контекстом. */
  window.setActiveNav = function (href) {
    links.forEach(link => {
      link.classList.toggle(
        'site-nav__link--active',
        !!href && link.getAttribute('href') === href
      );
    });
    activeLink = href
      ? (links.find(l => l.getAttribute('href') === href) || null)
      : null;

    if (!isDesktop()) return;
    requestAnimationFrame(() => {
      if (activeLink) moveTo(activeLink);
      else hide();
    });
  };
})();

/* ---------- 3. Корзина (drawer) ---------- */
(function () {
  const toggle  = document.querySelector('[data-cart-toggle]');
  const drawer  = document.querySelector('[data-cart-drawer]');
  if (!toggle || !drawer) return;

  const closeEls = drawer.querySelectorAll('[data-cart-close]');
  let lastFocused = null;

  const open = () => {
    lastFocused = document.activeElement;
    drawer.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    drawer.querySelector('.cart-drawer__close')?.focus();
  };

  const close = () => {
    drawer.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    lastFocused?.focus();
  };

  toggle.addEventListener('click', () => {
    drawer.hidden ? open() : close();
  });

  closeEls.forEach(el => el.addEventListener('click', close));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !drawer.hidden) close();
  });

  /* Заготовка под каталог: счётчик из localStorage */
  const badge = document.querySelector('[data-cart-count]');
  const foot  = document.querySelector('[data-cart-foot]');

  let cartItems = [];
  try {
    cartItems = JSON.parse(localStorage.getItem('spruce-sea-cart') || '[]');
  } catch { cartItems = []; }

  if (badge) {
    if (cartItems.length > 0) {
      badge.textContent = String(cartItems.length);
      badge.hidden = false;
    } else {
      badge.hidden = true;
    }
  }
  if (foot) foot.hidden = cartItems.length === 0;
})();