/* =========================================================
   Spruce & Sea — корзина (localStorage + события)
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

  /* Первичная инициализация бейджа — глобально */
  document.addEventListener('cart:update', () => {
    const badge = document.querySelector('[data-cart-count]');
    const n = count();
    if (badge) {
      badge.textContent = String(n);
      badge.hidden = n === 0;
    }
    /* Заголовок «Итого» в drawer */
    const totalEl = document.querySelector('[data-cart-total]');
    if (totalEl) totalEl.textContent = total().toLocaleString('ru-RU') + ' ₽';
    const foot = document.querySelector('[data-cart-foot]');
    if (foot) foot.hidden = n === 0;
  });

  /* Отрисовка пустого/непустого состояния в drawer — на этом шаге
     только пустое (полный список сделаем позже) */
  document.addEventListener('cart:update', () => {
    const body = document.querySelector('.cart-drawer__body');
    if (!body) return;
    const items = read();
    const empty = body.querySelector('.cart-drawer__empty');
    if (items.length === 0) {
      if (!empty) {
        body.innerHTML = `
          <div class="cart-drawer__empty">
            <span class="cart-drawer__empty-icon" aria-hidden="true">🛒</span>
            <p class="cart-drawer__empty-title">Заказ пока пуст</p>
            <p class="cart-drawer__empty-text">Начните с выбора жилья — потом добавите СПА, велосипеды или ужин.</p>
            <a href="catalog.html?type=stays" class="cart-drawer__empty-link">Перейти к жилью →</a>
          </div>`;
      }
    } else {
      /* Пока просто показываем строки-заглушки — полный рендер позже */
      body.innerHTML = items.map(i => `
        <div class="cart-drawer__line">
          <div class="cart-drawer__line-title">${i.title}</div>
          <div class="cart-drawer__line-meta">${i.nights || ''} ${i.unit === 'сутки' ? 'сут.' : ''}</div>
          <div class="cart-drawer__line-total">${(i.total || 0).toLocaleString('ru-RU')} ₽</div>
        </div>
      `).join('');
    }
  });

  return { add, remove, clear, total, count, read, subscribe };
})();