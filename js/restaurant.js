/* =========================================================
   Spruce & Sea — ресторан
   ========================================================= */
(function () {
  'use strict';

  const data = window.SS_RESTAURANT;
  if (!data) {
    console.warn('[restaurant] SS_RESTAURANT не найден');
    return;
  }

  const listEl  = document.querySelector('[data-restaurant-list]');
  const asideEl = document.querySelector('[data-restaurant-filter]');
  if (!listEl || !asideEl) return;

  const fmt = n => Number(n).toLocaleString('ru-RU');

  /* ---------- 1. Карточка блюда ---------- */
  function card(item) {
    return `
      <article class="restaurant-card" data-id="${item.id}">
        <div class="restaurant-card__media">
          <img src="${item.image}" alt="${item.alt}" class="restaurant-card__image" loading="lazy">
        </div>
        <div class="restaurant-card__body">
          <h3 class="restaurant-card__title">${item.title}</h3>
          <p class="restaurant-card__text">${item.short}</p>
          <div class="restaurant-card__foot">
            <div class="restaurant-card__price">${fmt(item.price)} ₽</div>
            <div class="restaurant-card__counter" data-counter="${item.id}">
              <button class="restaurant-card__qty-btn" type="button" data-qty-dec aria-label="Убрать одну порцию">−</button>
              <span class="restaurant-card__qty" data-qty-value>0</span>
              <button class="restaurant-card__qty-btn" type="button" data-qty-inc aria-label="Добавить порцию">+</button>
            </div>
            <button class="btn btn--primary btn--small restaurant-card__order" type="button" data-order="${item.id}">
              Заказать
            </button>
          </div>
        </div>
      </article>`;
  }

  /* ---------- 2. Рендер списка ---------- */
  listEl.innerHTML = data.items.map(card).join('');

  /* ---------- 3. Фильтр ---------- */
  function renderFilter() {
    const groupsHTML = data.filter.groups.map(group => {
      if (group.type === 'checkbox') {
        return `
          <fieldset class="restaurant-filter__group">
            <legend class="restaurant-filter__legend">${group.legend}</legend>
            ${group.options.map(o => `
              <label class="restaurant-filter__option">
                <input type="checkbox" name="${group.name}" value="${o.value}">
                <span>${o.label}</span>
              </label>`).join('')}
          </fieldset>`;
      }
      if (group.type === 'chips') {
        return `
          <fieldset class="restaurant-filter__group">
            <legend class="restaurant-filter__legend">${group.legend}</legend>
            <div class="restaurant-filter__chips">
              ${group.options.map(o => `
                <label class="restaurant-filter__chip">
                  <input type="checkbox" name="${group.name}" value="${o.value}">
                  <span>${o.label}</span>
                </label>`).join('')}
            </div>
          </fieldset>`;
      }
      return '';
    }).join('');

    asideEl.innerHTML = `
      <div class="restaurant-filter__head">
        <h2 class="restaurant-filter__title">Фильтры</h2>
        <button type="reset" class="restaurant-filter__reset" form="restaurant-filter-form">Сбросить</button>
      </div>
      <form id="restaurant-filter-form" class="restaurant-filter__form">
        ${groupsHTML}
      </form>`;
  }
  renderFilter();

    /* ---------- 4. Фильтрация ---------- */
  const cards = Array.from(listEl.querySelectorAll('.restaurant-card'));

  function applyFilters() {
    const checked = {};
    asideEl.querySelectorAll('input[type="checkbox"]:checked').forEach(c => {
      (checked[c.name] ||= []).push(c.value);
    });
    const courses = checked.course || [];
    const diets   = checked.diet   || [];

    let visible = 0;
    cards.forEach(cardEl => {
      const item = data.items.find(i => i.id === cardEl.dataset.id);
      if (!item) return;

      const byCourse = !courses.length || courses.includes(item.course);
      const byDiet   = !diets.length   || diets.every(d => item.diet.includes(d));

      const ok = byCourse && byDiet;
      cardEl.hidden = !ok;
      if (ok) visible++;
    });

    let empty = listEl.querySelector('.restaurant__empty');
    if (!visible) {
      if (!empty) {
        empty = document.createElement('div');
        empty.className = 'restaurant__empty';
        empty.textContent = 'Ничего не найдено под выбранные фильтры.';
        listEl.appendChild(empty);
      }
      empty.hidden = false;
    } else if (empty) {
      empty.hidden = true;
    }
  }

  asideEl.addEventListener('change', applyFilters);
  asideEl.addEventListener('reset', () => {
    setTimeout(applyFilters, 0);
  });
  applyFilters();

  /* ---------- 5. Счётчик порций ---------- */
  const qty = {};   /* { id: number } */

  function updateCounter(id) {
    const wrap = listEl.querySelector(`[data-counter="${id}"]`);
    if (!wrap) return;
    const valueEl = wrap.querySelector('[data-qty-value]');
    const orderBtn = listEl.querySelector(`[data-order="${id}"]`);
    const n = qty[id] || 0;
    if (valueEl) valueEl.textContent = String(n);

    if (orderBtn) {
      const inCart = n > 0;
      orderBtn.hidden = inCart;
      wrap.hidden = !inCart;
    }
    /* Перерисовываем бейдж корзины */
    document.dispatchEvent(new CustomEvent('cart:update'));
  }

  listEl.addEventListener('click', (e) => {
    const inc = e.target.closest('[data-qty-inc]');
    const dec = e.target.closest('[data-qty-dec]');
    const order = e.target.closest('[data-order]');

    if (inc) {
      const id = inc.closest('[data-counter]').dataset.counter;
      qty[id] = (qty[id] || 0) + 1;
      updateCounter(id);
    }
    if (dec) {
      const id = dec.closest('[data-counter]').dataset.counter;
      qty[id] = Math.max(0, (qty[id] || 0) - 1);
      updateCounter(id);
    }
    if (order) {
      const id = order.dataset.order;
      qty[id] = (qty[id] || 0) + 1;
      updateCounter(id);
    }
  });

  /* Скрываем все счётчики и показываем кнопки при старте */
  data.items.forEach(i => updateCounter(i.id));

  /* ---------- 6. Сохранение в localStorage (для будущей корзины) ---------- */
  document.addEventListener('cart:update', () => {
    const items = Object.entries(qty)
      .filter(([, n]) => n > 0)
      .map(([id, n]) => {
        const item = data.items.find(i => i.id === id);
        return item ? { id, title: item.title, price: item.price, qty: n } : null;
      })
      .filter(Boolean);

    try {
      localStorage.setItem('ss-restaurant-order', JSON.stringify(items));
    } catch {}
  });

})();