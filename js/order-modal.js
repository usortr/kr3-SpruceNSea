/* =========================================================
   Spruce & Sea — модалка заказа
   Работает на catalog.html и item.html
   ========================================================= */
(function () {
  'use strict';

  const data = window.SS_DATA;
  const pricing = window.SS_PRICING;
  if (!data || !pricing) {
    console.warn('[order-modal] Нет SS_DATA или SS_PRICING');
    return;
  }

  /* ---------- Состояние ---------- */
  let currentItem = null;
  let state = null;
  let modalEl = null;
  let bsModal = null;

  const fmt = n => Number(n).toLocaleString('ru-RU');

  /* ---------- Создание разметки модалки ---------- */
  function ensureModal() {
    if (modalEl) return;

    modalEl = document.createElement('div');
    modalEl.className = 'modal fade';
    modalEl.id = 'orderModal';
    modalEl.tabIndex = -1;
    modalEl.setAttribute('aria-hidden', 'true');
    modalEl.innerHTML = `
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content order-modal">
          <div class="modal-header">
            <h2 class="modal-title" data-order-title></h2>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Закрыть"></button>
          </div>
          <div class="modal-body">
            <div data-order-body></div>
            <div class="order-modal__summary" data-order-summary></div>
          </div>
          <div class="modal-footer">
            <div class="order-modal__total">
              <span>Итого</span>
              <strong data-order-total>0 ₽</strong>
            </div>
            <div class="order-modal__actions">
              <button type="button" class="btn btn--ghost" data-bs-dismiss="modal">Отмена</button>
              <button type="button" class="btn btn--primary" data-order-submit>Добавить в заказ</button>
            </div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(modalEl);
  }

  /* ---------- Открытие ---------- */
  function open(itemId) {
    const item = pricing.findItem(itemId);
    if (!item) return;

    ensureModal();
    currentItem = item;
    const today = new Date();
    const checkin = toISO(addDays(today, 1));
    const checkout = toISO(addDays(today, 4));

    state = {
      checkin, checkout,
      adults: 1, kids: 0, pets: false,
      weakIds: [],
      strongIds: [],
    };

    modalEl.querySelector('[data-order-title]').textContent = item.title;
    renderBody();
    renderTotal();

    if (!bsModal && window.bootstrap && window.bootstrap.Modal) {
      bsModal = window.bootstrap.Modal.getOrCreateInstance(modalEl);
    }
    bsModal ? bsModal.show() : (modalEl.style.display = 'block');
  }

  /* ---------- Рендер тела модалки ---------- */
  function renderBody() {
    const item = currentItem;
    const bodyEl = modalEl.querySelector('[data-order-body]');
    const isStay = item.category === 'stays';
    const capacity = item.capacity || 10;
    const hasPets = (item.filterTags || []).includes('pets');

    /* Даты */
    const datesHTML = `
      <fieldset class="order-modal__group">
        <legend class="order-modal__legend">Период</legend>
        <div class="order-modal__dates">
          <label>Заезд
            <input type="date" name="checkin" value="${state.checkin}"
                   min="${toISO(new Date())}" data-order-checkin>
          </label>
          <label>Выезд
            <input type="date" name="checkout" value="${state.checkout}"
                   min="${state.checkin}" data-order-checkout>
          </label>
        </div>
        <p class="order-modal__hint" data-order-nights></p>
      </fieldset>`;

    /* Гости + питомцы — только жильё */
    const guestsHTML = isStay ? `
      <fieldset class="order-modal__group">
        <legend class="order-modal__legend">Гости</legend>
        <div class="order-modal__counter">
          <span>Взрослые</span>
          <button type="button" class="order-modal__qty-btn" data-order-counter="adults" data-dir="-1" aria-label="Меньше">−</button>
          <span class="order-modal__qty" data-order-value="adults">${state.adults}</span>
          <button type="button" class="order-modal__qty-btn" data-order-counter="adults" data-dir="1" aria-label="Больше">+</button>
        </div>
        <div class="order-modal__counter">
          <span>Дети</span>
          <button type="button" class="order-modal__qty-btn" data-order-counter="kids" data-dir="-1" aria-label="Меньше">−</button>
          <span class="order-modal__qty" data-order-value="kids">${state.kids}</span>
          <button type="button" class="order-modal__qty-btn" data-order-counter="kids" data-dir="1" aria-label="Больше">+</button>
        </div>
        ${hasPets ? `
          <label class="order-modal__checkbox">
            <input type="checkbox" data-order-pets ${state.pets ? 'checked' : ''}>
            <span>С питомцем</span>
          </label>` : ''}
        <p class="order-modal__hint">До ${capacity} гостей</p>
      </fieldset>` : '';

    /* Слабые опции */
    const weak = item.weakOptions || [];
    const weakHTML = weak.length ? `
      <fieldset class="order-modal__group">
        <legend class="order-modal__legend">Дополнительно</legend>
        ${weak.map(o => `
          <label class="order-modal__checkbox">
            <input type="checkbox" value="${o.id}" data-order-weak
                   ${state.weakIds.includes(o.id) ? 'checked' : ''}>
            <span>${o.title} — ${fmt(o.price)} ₽${o.unit ? ' / ' + o.unit : ''}${o.perGuest ? ' с гостя' : ''}</span>
          </label>`).join('')}
      </fieldset>` : '';

    /* Сильные опции */
    const strong = item.strongOptions || [];
    const strongHTML = strong.length ? `
      <fieldset class="order-modal__group">
        <legend class="order-modal__legend">Добавить к брони</legend>
        ${strong.map(s => {
          const sub = pricing.findItem(s.id);
          if (!sub) return '';
          const pct = pricing.calcStrongDiscount(item, s.id);
          const discNote = pct ? ` <span class="order-modal__disc">−${pct}%</span>` : '';
          return `
            <label class="order-modal__checkbox">
              <input type="checkbox" value="${s.id}" data-order-strong
                     ${state.strongIds.includes(s.id) ? 'checked' : ''}>
              <span>${sub.title} — ${fmt(sub.priceDay)} ₽/${sub.unit || 'сутки'}${discNote}</span>
            </label>`;
        }).join('')}
      </fieldset>` : '';

    bodyEl.innerHTML = datesHTML + guestsHTML + weakHTML + strongHTML;

    updateNightsHint();
  }

  /* ---------- Пересчёт итога ---------- */
  function renderTotal() {
    const item = currentItem;
    const result = pricing.calcOrder(item, state);
    const totalEl = modalEl.querySelector('[data-order-total]');
    if (totalEl) totalEl.textContent = fmt(result.total) + ' ₽';

    /* Разбивка в теле — добавим под низ */
    const summaryEl = modalEl.querySelector('[data-order-summary]');
    if (!summaryEl) return;

    const rows = [];
    rows.push(`<div class="order-modal__row"><span>${item.title} × ${result.nights} ${plural(result.nights)}</span><span>${fmt(result.baseTotal)} ₽</span></div>`);
    if (result.stayDiscount > 0) {
      rows.push(`<div class="order-modal__row order-modal__row--disc"><span>Скидка за ${result.nights} ${plural(result.nights)} (${result.stayDiscountPercent}%)</span><span>−${fmt(result.stayDiscount)} ₽</span></div>`);
    }
    result.strongList.forEach(s => {
      rows.push(`<div class="order-modal__row"><span>${s.title} × ${s.nights} ${plural(s.nights)}</span><span>${fmt(s.baseTotal)} ₽</span></div>`);
      if (s.discount > 0) {
        rows.push(`<div class="order-modal__row order-modal__row--disc"><span>Скидка за комплект (${s.discountPercent}%)</span><span>−${fmt(s.discount)} ₽</span></div>`);
      }
    });
    result.weakList.forEach(w => {
      rows.push(`<div class="order-modal__row"><span>${w.title}${w.qty > 1 ? ' × ' + w.qty : ''}</span><span>${fmt(w.total)} ₽</span></div>`);
    });

    summaryEl.innerHTML = `<div class="order-modal__summary-list">${rows.join('')}</div>`;

    return result;
  }

  /* ---------- Вспомогательные ---------- */
  function toISO(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  function addDays(d, n) {
    const r = new Date(d);
    r.setDate(r.getDate() + n);
    return r;
  }
  function plural(n) {
    const mod10 = n % 10, mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return 'сутки';
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'суток';
    return 'суток';
  }
  function updateNightsHint() {
    const n = pricing.nightsBetween(state.checkin, state.checkout);
    const hint = modalEl.querySelector('[data-order-nights]');
    if (hint) hint.textContent = n > 0 ? `${n} ${plural(n)}` : 'Выберите даты';
    const outEl = modalEl.querySelector('[data-order-checkout]');
    if (outEl) outEl.min = state.checkin;
  }

  /* ---------- События ---------- */
  document.addEventListener('click', (e) => {
    /* Открытие модалки */
    const trigger = e.target.closest('[data-order]');
    if (trigger) {
      e.preventDefault();
      e.stopPropagation();
      const id = trigger.dataset.order;
      if (id) open(id);
      return;
    }

    if (!modalEl || !currentItem) return;

    /* Даты */
    const checkinEl = e.target.closest('[data-order-checkin]');
    const checkoutEl = e.target.closest('[data-order-checkout]');
    if (checkinEl || checkoutEl) return;

    /* Счётчики гостей */
    const counter = e.target.closest('[data-order-counter]');
    if (counter) {
      const key = counter.dataset.orderCounter;
      const dir = Number(counter.dataset.dir);
      if (key === 'adults' || key === 'kids') {
        const min = key === 'adults' ? 1 : 0;
        const max = currentItem.capacity || 10;
        let val = state[key] + dir;
        val = Math.max(min, Math.min(max, val));
        state[key] = val;
        const valueEl = modalEl.querySelector(`[data-order-value="${key}"]`);
        if (valueEl) valueEl.textContent = String(val);
        renderTotal();
      }
      return;
    }

    /* Submit */
    const submit = e.target.closest('[data-order-submit]');
    if (submit) {
      submitOrder();
    }
  });

  /* Изменения в форме */
  document.addEventListener('input', (e) => {
    if (!modalEl || !currentItem) return;

    if (e.target.matches('[data-order-checkin]')) {
      state.checkin = e.target.value;
      if (state.checkout <= state.checkin) {
        state.checkout = toISO(addDays(new Date(state.checkin + 'T00:00:00'), 1));
        const out = modalEl.querySelector('[data-order-checkout]');
        if (out) out.value = state.checkout;
      }
      updateNightsHint();
      renderTotal();
    }
    if (e.target.matches('[data-order-checkout]')) {
      state.checkout = e.target.value;
      updateNightsHint();
      renderTotal();
    }
  });

  document.addEventListener('change', (e) => {
    if (!modalEl || !currentItem) return;

    if (e.target.matches('[data-order-pets]')) {
      state.pets = e.target.checked;
      /* Автоматически ставим/снимаем pet-fee */
      const petOpt = (currentItem.weakOptions || []).find(o => o.id === 'pet-fee');
      if (petOpt) {
        if (state.pets && !state.weakIds.includes('pet-fee')) state.weakIds.push('pet-fee');
        if (!state.pets) state.weakIds = state.weakIds.filter(id => id !== 'pet-fee');
        const cb = modalEl.querySelector(`[data-order-weak][value="pet-fee"]`);
        if (cb) cb.checked = state.pets;
      }
      renderTotal();
    }

    if (e.target.matches('[data-order-weak]')) {
      const id = e.target.value;
      if (e.target.checked && !state.weakIds.includes(id)) state.weakIds.push(id);
      if (!e.target.checked) state.weakIds = state.weakIds.filter(x => x !== id);
      renderTotal();
    }

    if (e.target.matches('[data-order-strong]')) {
      const id = e.target.value;
      if (e.target.checked && !state.strongIds.includes(id)) state.strongIds.push(id);
      if (!e.target.checked) state.strongIds = state.strongIds.filter(x => x !== id);
      renderTotal();
    }
  });

  /* Отправка в корзину */
  function submitOrder() {
    if (!currentItem) return;
    const result = pricing.calcOrder(currentItem, state);
    if (result.nights <= 0) {
      alert('Выберите корректные даты');
      return;
    }

    const order = {
      itemId: currentItem.id,
      category: currentItem.category,
      title: currentItem.title,
      image: currentItem.image,
      unit: currentItem.unit,
      priceDay: currentItem.priceDay,
      checkin: state.checkin,
      checkout: state.checkout,
      nights: result.nights,
      guests: { adults: state.adults, kids: state.kids },
      pets: state.pets,
      weakOptions: result.weakList.map(w => ({
        id: w.id, title: w.title, price: w.price, unit: w.unit,
        perGuest: !!w.perGuest, qty: w.qty, total: w.total,
      })),
      strongOptions: result.strongList,
      baseTotal: result.baseTotal,
      stayDiscountPercent: result.stayDiscountPercent,
      stayDiscount: result.stayDiscount,
      weakTotal: result.weakTotal,
      strongTotal: result.strongTotal,
      total: result.total,
      createdAt: new Date().toISOString(),
    };

    window.SS_CART.add(order);

    if (bsModal) bsModal.hide();
    else modalEl.style.display = 'none';

    /* Опционально: открыть корзину */
    const toggle = document.querySelector('[data-cart-toggle]');
    if (toggle) toggle.click();
  }

  /* Экспорт */
  window.SS_ORDER = { open };
})();