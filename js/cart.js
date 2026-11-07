/* =========================================================
   Spruce & Sea — корзина (localStorage + события)
   Группы: «Проживание и услуги» (stays/spa/bikes) и «Ресторан» (restaurant)
   ========================================================= */
window.SS_CART = (function () {
  const KEY = 'ss-cart';
  let listeners = [];

  function read() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '[]');
    } catch { return []; }
  }

  function write(items) {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
    emit();
  }

  function emit() {
    const items = read();
    document.dispatchEvent(new CustomEvent('cart:update', { detail: items }));
    listeners.forEach(fn => fn(items));
  }

  function add(order) {
    const items = read();
    order.id = order.itemId + '-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    items.push(order);
    write(items);
    return order;
  }

  function remove(lineId) {
    write(read().filter(i => i.id !== lineId));
  }

  function clear() { write([]); }

  function total() {
    return read().reduce((s, i) => s + (i.total || 0), 0);
  }

  function count() { return read().length; }

  function subscribe(fn) {
    listeners.push(fn);
    fn(read());
  }

  /* ---------- Группировка ---------- */
  const SERVICE_CATEGORIES = new Set(['stays', 'spa', 'bikes']);

  function groupOf(item) {
    return SERVICE_CATEGORIES.has(item.category) ? 'services' : 'restaurant';
  }

  function splitByGroups(items) {
    const services = [];
    const restaurant = [];
    items.forEach(i => {
      (groupOf(i) === 'services' ? services : restaurant).push(i);
    });
    return { services, restaurant };
  }

  function listByGroup(group) {
    return read().filter(i => groupOf(i) === group);
  }

  function sumTotal(list) {
    return list.reduce((s, i) => s + (i.total || 0), 0);
  }

  /* ---------- Очистить только одну группу ---------- */
  function clearGroup(group) {
    write(read().filter(i => groupOf(i) !== group));
  }

  /* ---------- Найти строку ресторана по itemId ---------- */
  function findRestaurantLine(itemId) {
    return read().find(i => i.category === 'restaurant' && i.itemId === itemId);
  }

  /* ---------- Обновить строку по id ---------- */
  function updateLine(lineId, patch) {
    const items = read();
    const idx = items.findIndex(i => i.id === lineId);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...patch };
    write(items);
    return items[idx];
  }

  /* ---------- Форматтеры ---------- */
  const fmtPrice = n => Number(n || 0).toLocaleString('ru-RU') + ' ₽';

  function pluralNights(n) {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return 'сутки';
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return 'суток';
    return 'суток';
  }

  function fmtDate(iso) {
    if (!iso) return '';
    const [y, m, d] = iso.split('-').map(Number);
    const months = ['янв.','февр.','мар.','апр.','мая','июн.',
                    'июл.','авг.','сент.','окт.','нояб.','дек.'];
    return `${d} ${months[m - 1]}`;
  }

  function fmtPeriod(item) {
    if (!item.checkin || !item.checkout) return '';
    return `${fmtDate(item.checkin)} — ${fmtDate(item.checkout)}`;
  }

  /* ---------- Рендер строки ---------- */
  function renderLine(item) {
    const img = item.image
      ? `<img class="cart-line__img" src="${item.image}" alt="" loading="lazy">`
      : `<span class="cart-line__img cart-line__img--placeholder" aria-hidden="true">❦</span>`;

    const metaParts = [];
    if (item.checkin && item.checkout) metaParts.push(fmtPeriod(item));
    if (item.nights > 0 && item.unit === 'сутки') {
      metaParts.push(`${item.nights} ${pluralNights(item.nights)}`);
    }
    if (item.guests && (item.guests.adults || item.guests.kids)) {
      const g = [];
      if (item.guests.adults) g.push(`${item.guests.adults} взр.`);
      if (item.guests.kids) g.push(`${item.guests.kids} дет.`);
      metaParts.push(g.join(', '));
    }
    if (item.qty > 1) metaParts.push(`${item.qty} шт.`);
    const meta = metaParts.length
      ? `<div class="cart-line__meta">${metaParts.join(' · ')}</div>`
      : '';

    const opts = [];
    (item.weakOptions || []).forEach(w => {
      opts.push(`${w.title}${w.qty > 1 ? ' × ' + w.qty : ''} — ${fmtPrice(w.total)}`);
    });
    (item.strongOptions || []).forEach(s => {
      opts.push(`${s.title} — ${fmtPrice(s.total)}`);
    });
    const optsHTML = opts.length
      ? `<ul class="cart-line__opts">${opts.map(o => `<li>${o}</li>`).join('')}</ul>`
      : '';

    const capacityNote = item.capacityWarning
      ? `<div class="cart-line__warn">Гостей больше, чем мест (${item.capacity})</div>`
      : '';

    return `
      <li class="cart-line" data-line-id="${item.id}">
        ${img}
        <div class="cart-line__body">
          <div class="cart-line__top">
            <div class="cart-line__title">${item.title}</div>
            <button type="button" class="cart-line__remove"
                    data-cart-remove="${item.id}"
                    aria-label="Удалить «${item.title}»">×</button>
          </div>
          ${meta}
          ${optsHTML}
          ${capacityNote}
        </div>
        <div class="cart-line__price">${fmtPrice(item.total)}</div>
      </li>`;
  }

  function renderGroup(key, title, list) {
    if (!list.length) return '';
    const sum = sumTotal(list);
    return `
      <section class="cart-group cart-group--${key}">
        <header class="cart-group__head">
          <h3 class="cart-group__title">${title}</h3>
          <span class="cart-group__count">${list.length}</span>
        </header>
        <ul class="cart-group__list">
          ${list.map(renderLine).join('')}
        </ul>
        <footer class="cart-group__foot">
          <div class="cart-group__total">
            <span>Итого по группе</span>
            <strong>${fmtPrice(sum)}</strong>
          </div>
          <button type="button" class="btn btn--primary cart-group__checkout"
                  data-cart-checkout="${key}">
            Заказать
          </button>
        </footer>
      </section>`;
  }

  /* ---------- Бейдж, шапка, состояние пустоты ---------- */
  document.addEventListener('cart:update', () => {
    const badge = document.querySelector('[data-cart-count]');
    const n = count();
    if (badge) {
      badge.textContent = String(n);
      badge.hidden = n === 0;
    }
    const totalEl = document.querySelector('[data-cart-total]');
    if (totalEl) totalEl.textContent = fmtPrice(total());
    /* общий footer больше не нужен, но если он где-то остался — скрываем при 0 */
    const foot = document.querySelector('[data-cart-foot]');
    if (foot) foot.hidden = n === 0;
  });

  /* ---------- Рендер drawer ---------- */
  document.addEventListener('cart:update', () => {
    const body = document.querySelector('.cart-drawer__body');
    if (!body) return;
    const items = read();

    if (items.length === 0) {
      const isRestaurantPage = location.pathname.endsWith('restaurant.html');
      const emptyText = isRestaurantPage
        ? 'Начните с выбора блюда — потом добавите проживание и услуги.'
        : 'Начните с выбора жилья — потом добавите СПА, велосипеды или ужин.';
      const emptyLink = isRestaurantPage
        ? `<a href="restaurant.html" class="cart-drawer__empty-link">Перейти к меню →</a>`
        : `<a href="catalog.html?type=stays" class="cart-drawer__empty-link">Перейти к жилью →</a>`;
      body.innerHTML = `
        <div class="cart-drawer__empty">
          <span class="cart-drawer__empty-icon" aria-hidden="true">🛒</span>
          <p class="cart-drawer__empty-title">Заказ пока пуст</p>
          <p class="cart-drawer__empty-text">${emptyText}</p>
          ${emptyLink}
        </div>`;
      return;
    }

    const { services, restaurant } = splitByGroups(items);
    body.innerHTML = `
      <div class="cart-drawer__groups">
        ${renderGroup('services', 'Проживание и услуги', services)}
        ${renderGroup('restaurant', 'Ресторан', restaurant)}
      </div>`;
  });

  /* ---------- Удаление строки ---------- */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-cart-remove]');
    if (!btn) return;
    e.preventDefault();
    remove(btn.dataset.cartRemove);
  });

  /* ---------- Кнопка «Заказать» у группы → открыть модалку оформления ---------- */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-cart-checkout]');
    if (!btn) return;
    e.preventDefault();
    const group = btn.dataset.cartCheckout;
    if (window.SS_CHECKOUT_MODAL) {
      window.SS_CHECKOUT_MODAL.open(group);
    }
  });

  return {
    add, remove, clear, clearGroup, updateLine, findRestaurantLine,
    total, count, read, subscribe,
    groupOf, splitByGroups, listByGroup, sumTotal,
  };
})();