/* =========================================================
   Spruce & Sea — модалка заказа
   Работает на catalog.html и item.html
   Без strong-опций (комбо). Без чекбокса «С питомцем» в «Гостях» —
   питомец выбирается только через weak-опцию pet-fee в «Дополнительно».
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

  const MONTHS = ['январь','февраль','март','апрель','май','июнь',
                  'июль','август','сентябрь','октябрь','ноябрь','декабрь'];
  const WEEKDAYS = ['пн','вт','ср','чт','пт','сб','вс'];
  const MONTHS_SHORT = ['янв.','февр.','мар.','апр.','мая','июн.',
                        'июл.','авг.','сент.','окт.','нояб.','дек.'];

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
      adults: 1, kids: 0,
      weakIds: [],
      viewYear: today.getFullYear(),
      viewMonth: today.getMonth(),
      selecting: null,
      bookedSet: (window.SS_AVAILABILITY
        ? window.SS_AVAILABILITY.getBooked(item.id)
        : new Set()),
    };

    modalEl.querySelector('[data-order-title]').textContent = item.title;
    renderBody();
    renderTotal();
    updateSubmitState();

    const bodyEl = modalEl.querySelector('.modal-body');
    if (bodyEl) bodyEl.scrollTop = 0;

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

    /* Календарь */
    const datesHTML = `
      <fieldset class="order-modal__group">
        <legend class="order-modal__legend">Период</legend>
        <div class="order-modal__calendar" data-order-calendar></div>
        <p class="order-modal__selected" data-order-selected></p>
        <p class="order-modal__hint" data-order-nights></p>
        <p class="order-modal__warning" data-order-cal-warning hidden></p>
      </fieldset>`;

    /* Гости — БЕЗ чекбокса «С питомцем» */
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
        <p class="order-modal__hint">До ${capacity} гостей</p>
        <p class="order-modal__warning" data-order-warning hidden></p>
      </fieldset>` : '';

    /* Слабые опции (pet-fee — обычная галочка здесь) */
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

    bodyEl.innerHTML = datesHTML + guestsHTML + weakHTML;

    renderCalendar();
    updateNightsHint();
    updateCapacityWarning();
  }

  /* ---------- Календарь ---------- */
  function renderCalendar() {
    const wrap = modalEl.querySelector('[data-order-calendar]');
    if (!wrap) return;

    const y = state.viewYear;
    const m = state.viewMonth;
    const next = nextMonth(y, m);

    wrap.innerHTML =
      renderOrderMonth(y, m) +
      renderOrderMonth(next.year, next.month);

    updateSelectedHint();
  }

  function nextMonth(year, month) {
    let m = month + 1, y = year;
    if (m > 11) { m = 0; y += 1; }
    return { year: y, month: m };
  }

  function renderOrderMonth(year, month) {
    const today = new Date();
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const first = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = (first.getDay() + 6) % 7;

    const prevDisabled = (year < today.getFullYear())
      || (year === today.getFullYear() && month <= today.getMonth());

    const cells = [];
    for (let i = 0; i < offset; i++) {
      cells.push('<span class="cal__cell cal__cell--empty" aria-hidden="true"></span>');
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const iso = toISO(date);

      const isPast = date < todayMidnight;
      const isToday = date.getTime() === todayMidnight.getTime();
      const isBooked = state.bookedSet.has(iso);

      /* range-подсветка — только для свободных непрошедших дат */
      const canBeRange = !isPast && !isBooked;
      const isCheckin  = canBeRange && iso === state.checkin;
      const isCheckout = canBeRange && iso === state.checkout;
      const inRange    = canBeRange && state.checkin && state.checkout
        && iso > state.checkin && iso < state.checkout;
      const isSelected = isCheckin || isCheckout;

      const mods = [
        'cal__cell',
        isPast ? 'cal__cell--past' : '',
        isToday ? 'cal__cell--today' : '',
        isBooked ? 'cal__cell--booked' : '',
        canBeRange ? 'cal__cell--free' : '',
        isSelected ? 'cal__cell--selected' : '',
        isCheckin ? 'cal__cell--range-start' : '',
        isCheckout ? 'cal__cell--range-end' : '',
        inRange ? 'cal__cell--in-range' : '',
      ].filter(Boolean).join(' ');

      const label = isBooked
        ? `${d} — занято`
        : (isPast ? `${d} — прошедший` : `${d} — свободно`);

      if (isPast) {
        cells.push(`<button type="button" class="${mods}" disabled aria-disabled="true" title="${label}">${d}</button>`);
      } else {
        const bookedAttr = isBooked ? ' data-booked="1"' : '';
        cells.push(`<button type="button" class="${mods}" data-order-day="${iso}"${bookedAttr} title="${label}">${d}</button>`);
      }
    }

    return `
      <div class="cal" data-order-cal-month="${year}-${month}">
        <div class="cal__head">
          <button type="button" class="cal__nav" data-order-cal-prev ${prevDisabled ? 'disabled' : ''} aria-label="Предыдущий месяц">‹</button>
          <span class="cal__title">${MONTHS[month]} ${year}</span>
          <button type="button" class="cal__nav" data-order-cal-next aria-label="Следующий месяц">›</button>
        </div>
        <div class="cal__weekdays">
          ${WEEKDAYS.map(d => `<span class="cal__weekday">${d}</span>`).join('')}
        </div>
        <div class="cal__grid">${cells.join('')}</div>
      </div>`;
  }

    /* true — весь диапазон свободен: и концы, и внутренность */
    /* true — весь диапазон свободен: и концы, и внутренность */
  function isRangeFree(checkin, checkout) {
    if (!checkin || !checkout) return false;
    if (checkout <= checkin) return false;
    if (state.bookedSet.has(checkin)) return false;
    if (state.bookedSet.has(checkout)) return false;
    const a = new Date(checkin + 'T00:00:00');
    const b = new Date(checkout + 'T00:00:00');
    for (let t = a.getTime() + 86400000; t < b.getTime(); t += 86400000) {
      const iso = toISO(new Date(t));
      if (state.bookedSet.has(iso)) return false;
    }
    return true;
  }

  function updateSelectedHint() {
    const el = modalEl.querySelector('[data-order-selected]');
    if (!el) return;

    if (!state.checkin || !state.checkout || state.checkout <= state.checkin) {
      el.textContent = state.selecting === 'checkout'
        ? 'Выберите дату выезда'
        : 'Выберите дату заезда';
      return;
    }
    el.textContent = `Заезд ${formatDateShort(state.checkin)} — выезд ${formatDateShort(state.checkout)}`;
  }

  function formatDateShort(iso) {
    if (!iso) return '';
    const d = new Date(iso + 'T00:00:00');
    return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
  }

  /* ---------- Пересчёт итога ---------- */
  function renderTotal() {
    const item = currentItem;
    const result = pricing.calcOrder(item, { ...state, strongIds: [] });

    const totalEl = modalEl.querySelector('[data-order-total]');
    if (totalEl) totalEl.textContent = fmt(result.total) + ' ₽';

    const summaryEl = modalEl.querySelector('[data-order-summary]');
    if (!summaryEl) return result;

    const rows = [];
    rows.push(`<div class="order-modal__row"><span>${item.title} × ${result.nights} ${plural(result.nights)}</span><span>${fmt(result.baseTotal)} ₽</span></div>`);
    if (result.stayDiscount > 0) {
      rows.push(`<div class="order-modal__row order-modal__row--disc"><span>Скидка за ${result.nights} ${plural(result.nights)} (${result.stayDiscountPercent}%)</span><span>−${fmt(result.stayDiscount)} ₽</span></div>`);
    }
    result.weakList.forEach(w => {
      rows.push(`<div class="order-modal__row"><span>${w.title}${w.qty > 1 ? ' × ' + w.qty : ''}</span><span>${fmt(w.total)} ₽</span></div>`);
    });

    summaryEl.innerHTML = `<div class="order-modal__summary-list">${rows.join('')}</div>`;
    return result;
  }

  /* ---------- Capacity warning (только показ) ---------- */
  function updateCapacityWarning() {
    if (!currentItem || currentItem.category !== 'stays') return;
    const cap = currentItem.capacity || 10;
    const total = state.adults + state.kids;
    const warnEl = modalEl.querySelector('[data-order-warning]');
    if (!warnEl) return;

    if (total > cap) {
      warnEl.hidden = false;
      warnEl.textContent = `Гостей больше, чем мест: ${total} из ${cap}. Мы свяжемся с вами, чтобы обсудить размещение.`;
    } else {
      warnEl.hidden = true;
      warnEl.textContent = '';
    }
  }
    /* Кнопка «Добавить в заказ» — disabled, если диапазон невалиден */
  function updateSubmitState() {
    const btn = modalEl.querySelector('[data-order-submit]');
    if (!btn) return;
    const valid = state.checkin && state.checkout
      && state.checkout > state.checkin
      && isRangeFree(state.checkin, state.checkout);
    btn.disabled = !valid;
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
  }

  /* ---------- Клик по дню ---------- */
  function handleDayClick(iso, isBooked) {
    const calWarn = modalEl.querySelector('[data-order-cal-warning]');
    const setWarn = (msg) => {
      if (!calWarn) return;
      if (msg) { calWarn.hidden = false; calWarn.textContent = msg; }
      else { calWarn.hidden = true; calWarn.textContent = ''; }
    };

    if (isBooked) {
      setWarn('Эта дата занята. Выберите другую.');
      return;
    }

    /* Новый диапазон */
    if (state.selecting !== 'checkout' || iso <= state.checkin) {
      state.checkin = iso;
      state.checkout = iso;
      state.selecting = 'checkout';
      setWarn('');
      renderCalendar();
      updateNightsHint();
      updateSubmitState();
      renderTotal();
      return;
    }

    /* Завершение диапазона */
    state.checkout = iso;
    state.selecting = null;

    if (!isRangeFree(state.checkin, iso)) {
      setWarn('В выбранном периоде есть занятые даты. Выберите другие даты.');
    } else {
      setWarn('');
    }

    renderCalendar();
    updateNightsHint();
    updateSubmitState();
    renderTotal();
  }

  /* ---------- События ---------- */
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-order]');
    if (trigger) {
      e.preventDefault();
      e.stopPropagation();
      const id = trigger.dataset.order;
      if (id) open(id);
      return;
    }

    if (!modalEl || !currentItem) return;

    const calPrev = e.target.closest('[data-order-cal-prev]');
    const calNext = e.target.closest('[data-order-cal-next]');
    if (calPrev || calNext) {
      e.preventDefault();
      if (calPrev && calPrev.disabled) return;
      const d = calPrev ? -1 : 1;
      let m = state.viewMonth + d;
      let y = state.viewYear;
      if (m < 0) { m = 11; y -= 1; }
      if (m > 11) { m = 0; y += 1; }
      state.viewYear = y;
      state.viewMonth = m;
      renderCalendar();
      return;
    }

    const dayBtn = e.target.closest('[data-order-day]');
    if (dayBtn) {
      e.preventDefault();
      handleDayClick(dayBtn.dataset.orderDay, dayBtn.dataset.booked === '1');
      return;
    }

    const counter = e.target.closest('[data-order-counter]');
    if (counter) {
      const key = counter.dataset.orderCounter;
      const dir = Number(counter.dataset.dir);
      if (key === 'adults' || key === 'kids') {
        const min = key === 'adults' ? 1 : 0;
        const max = 20;
        let val = state[key] + dir;
        val = Math.max(min, Math.min(max, val));
        state[key] = val;
        const valueEl = modalEl.querySelector(`[data-order-value="${key}"]`);
        if (valueEl) valueEl.textContent = String(val);
        updateCapacityWarning();
        renderTotal();
      }
      return;
    }

    const submit = e.target.closest('[data-order-submit]');
    if (submit) submitOrder();
  });

  /* ---------- Изменения в форме ---------- */
  document.addEventListener('change', (e) => {
    if (!modalEl || !currentItem) return;

    /* Ветка [data-order-pets] удалена */

    if (e.target.matches('[data-order-weak]')) {
      const id = e.target.value;
      if (e.target.checked && !state.weakIds.includes(id)) state.weakIds.push(id);
      if (!e.target.checked) state.weakIds = state.weakIds.filter(x => x !== id);
      renderTotal();
    }
  });

  /* ---------- Отправка в корзину ---------- */
  function submitOrder() {
    if (!currentItem) return;

    if (!state.checkin || !state.checkout || state.checkout <= state.checkin) {
      alert('Выберите даты заезда и выезда');
      return;
    }

    /* Новое: блокируем, если в диапазоне (включая концы) есть занятые */
    if (!isRangeFree(state.checkin, state.checkout)) {
      alert('В выбранном периоде есть занятые даты. Выберите другие даты.');
      return;
    }

    const result = pricing.calcOrder(currentItem, { ...state, strongIds: [] });
    if (result.nights <= 0) {
      alert('Выберите корректные даты');
      return;
    }

    const cap = currentItem.capacity || 10;
    const guestsTotal = state.adults + state.kids;

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
      /* pets больше не отдельное поле — pet-fee приходит из weakOptions */
      weakOptions: result.weakList.map(w => ({
        id: w.id, title: w.title, price: w.price, unit: w.unit,
        perGuest: !!w.perGuest, qty: w.qty, total: w.total,
      })),
      strongOptions: [],
      capacity: currentItem.category === 'stays' ? cap : null,
      capacityWarning: currentItem.category === 'stays' && guestsTotal > cap,
      baseTotal: result.baseTotal,
      stayDiscountPercent: result.stayDiscountPercent,
      stayDiscount: result.stayDiscount,
      weakTotal: result.weakTotal,
      strongTotal: 0,
      total: result.total,
      createdAt: new Date().toISOString(),
    };

    window.SS_CART.add(order);

    if (bsModal) bsModal.hide();
    else modalEl.style.display = 'none';

    const toggle = document.querySelector('[data-cart-toggle]');
    if (toggle) toggle.click();
  }

  /* Экспорт */
  window.SS_ORDER = { open };
})();