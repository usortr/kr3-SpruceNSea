/* =========================================================
   Spruce & Sea — каталог
   Рендер по ?type, режимы info/calendar, фильтры, модалка
   Зависимости: js/data.js, js/availability.js, js/calendar.js
   ========================================================= */
(function () {
  'use strict';

  const data = window.SS_DATA;
  if (!data) {
    console.warn('[catalog] SS_DATA не найден — проверь порядок скриптов');
    return;
  }

  const listEl  = document.querySelector('[data-catalog-list]');
  const asideEl = document.querySelector('[data-catalog-filter]');
  if (!listEl || !asideEl) {
    console.warn('[catalog] Нет контейнеров [data-catalog-list] / [data-catalog-filter]');
    return;
  }

  /* =========================================================
     1. Категория
     ========================================================= */
  const type = new URL(location.href).searchParams.get('type') || 'stays';
  const conf = data[type];
  if (!conf) {
    console.warn(`[catalog] Неизвестный type="${type}"`);
    return;
  }

  /* =========================================================
     2. Заголовок
     ========================================================= */
  const setText = (sel, val) => {
    const el = document.querySelector(sel);
    if (el) el.textContent = val;
  };
  setText('[data-catalog-eyebrow]', conf.head.eyebrow);
  setText('[data-catalog-title]',   conf.head.title);
  setText('[data-catalog-sub]',     conf.head.sub);

  /* =========================================================
     3. Режим отображения (info | calendar)
     ========================================================= */
  const VIEW_KEY = 'spruce-sea-view-mode';
  let viewMode = sessionStorage.getItem(VIEW_KEY) || 'info';
  if (viewMode !== 'info' && viewMode !== 'calendar') viewMode = 'info';

  function setViewMode(mode) {
    viewMode = mode;
    sessionStorage.setItem(VIEW_KEY, mode);
    listEl.dataset.view = mode;

    listEl.querySelectorAll('[data-panel]').forEach(panel => {
      panel.hidden = panel.dataset.panel !== mode;
    });

    listEl.querySelectorAll('[data-view-toggle]').forEach(btn => {
      const on = mode === 'calendar';
      btn.setAttribute('aria-expanded', String(on));
      btn.setAttribute('aria-label', on ? 'Показать описание' : 'Показать занятые даты');
      btn.textContent = on ? '›' : '‹';
    });

    listEl.querySelectorAll('.catalog-card').forEach(card => {
      card.classList.toggle('is-calendar', mode === 'calendar');
    });
  }

  /* =========================================================
     4. Утилиты
     ========================================================= */
  const fmt = n => Number(n).toLocaleString('ru-RU');

  function badgesHTML(item) {
    return (item.badges || []).map(b => `<li>${b}</li>`).join('');
  }

  function calendarOrFree(item) {
    const hasDates = window.SS_AVAILABILITY && window.SS_AVAILABILITY.hasBooked(item.id);
    if (hasDates && window.SS_CALENDAR) {
      return window.SS_CALENDAR.renderPanel(item.id);
    }
    return `<p class="card-free">Все даты свободны — можно бронировать.</p>`;
  }

  /* =========================================================
     5. Единый шаблон карточки
     ========================================================= */
  function unified(item) {
    return `
        <article class="catalog-card" data-id="${item.id}" tabindex="0" role="button"
                aria-label="Подробнее: ${item.title}">
        <div class="catalog-card__media">
            <img src="${item.image}" alt="${item.alt}" class="catalog-card__image" loading="lazy">
            <span class="catalog-card__tag">${item.tag}</span>
        </div>
        <div class="catalog-card__body">

            <div class="catalog-card__top">
            <h3 class="catalog-card__title">${item.title}</h3>
            <div class="catalog-card__price">
                <strong>${fmt(item.priceDay)} ₽</strong>/${item.unit}
                <button class="card-toggle" type="button"
                        aria-label="Показать занятые даты"
                        aria-expanded="false"
                        data-view-toggle>‹</button>
            </div>
            </div>

            <div class="catalog-card__content">
            <div class="catalog-card__panel catalog-card__panel--info" data-panel="info">
                <div class="catalog-card__info-main">
                    <p class="catalog-card__text">${item.short}</p>
                    <ul class="catalog-card__badges">${badgesHTML(item)}</ul>
                </div>
            </div>
            <div class="catalog-card__panel catalog-card__panel--calendar" data-panel="calendar" hidden>
                ${calendarOrFree(item)}
            </div>
            </div>

            <div class="catalog-card__actions">
            <button class="btn btn--primary btn--small" type="button" data-order="${item.id}">
                Заказать
            </button>
            </div>

        </div>
        </article>`;
    }

  /* =========================================================
     6. Рендер списка
     ========================================================= */
  if (!conf.items || !conf.items.length) {
    listEl.innerHTML = `
      <div class="catalog__empty">
        Скоро здесь появятся предложения. Загляните в раздел
        <a href="catalog.html?type=stays" class="catalog__empty-link">жилья</a>.
      </div>`;
    return;
  }

  listEl.innerHTML = conf.items.map(unified).join('');

  /* Помечаем бейджи, которые переполнены, чтобы показать «…» */
  listEl.querySelectorAll('.catalog-card__badges').forEach(el => {
    el.classList.toggle('is-overflow', el.scrollHeight > el.clientHeight + 1);
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    listEl.querySelectorAll('.catalog-card__badges').forEach(el => {
    el.classList.toggle('is-overflow', el.scrollHeight > el.clientHeight + 1);
    });
  }, 100);
  });

  /* =========================================================
     7. Фильтр — рендер
     ========================================================= */
  const prices = conf.items.map(i => i.priceDay);
  const priceMin = Math.min(...prices);
  const priceMax = Math.max(...prices);
  const step = priceMax > 5000 ? 100 : 50;

  function renderFilter() {
    const groupsHTML = (conf.filter.groups || []).map(group => {
      if (group.type === 'checkbox') {
        return `
          <fieldset class="filter__group">
            <legend class="filter__legend">${group.legend}</legend>
            ${group.options.map(o => `
              <label class="filter__option">
                <input type="checkbox" name="${group.name}" value="${o.value}" class="filter__input">
                <span class="filter__label">${o.label}</span>
              </label>`).join('')}
          </fieldset>`;
      }
      if (group.type === 'chips') {
        return `
          <fieldset class="filter__group">
            <legend class="filter__legend">${group.legend}</legend>
            <div class="filter__chips">
              ${group.options.map(o => `
                <label class="filter__chip">
                  <input type="checkbox" name="${group.name}" value="${o.value}">
                  <span>${o.label}</span>
                </label>`).join('')}
            </div>
          </fieldset>`;
      }
      return '';
    }).join('');

    const priceHTML = `
      <fieldset class="filter__group">
        <legend class="filter__legend">
          Цена за сутки
          <output class="filter__price-output" for="priceMin priceMax">
            ${fmt(priceMin)} – ${fmt(priceMax)} ₽
          </output>
        </legend>
        <div class="filter__range">
          <input type="range" id="priceMin" min="${priceMin}" max="${priceMax}" step="${step}"
                 value="${priceMin}" class="filter__range-input" aria-label="Минимальная цена">
          <input type="range" id="priceMax" min="${priceMin}" max="${priceMax}" step="${step}"
                 value="${priceMax}" class="filter__range-input" aria-label="Максимальная цена">
        </div>
        <div class="filter__price-row">
          <label class="filter__price-field">От
            <input type="number" id="priceMinInput" min="${priceMin}" max="${priceMax}"
                   value="${priceMin}" class="filter__price-number">
          </label>
          <label class="filter__price-field">До
            <input type="number" id="priceMaxInput" min="${priceMin}" max="${priceMax}"
                   value="${priceMax}" class="filter__price-number">
          </label>
        </div>
      </fieldset>`;

    asideEl.innerHTML = `
      <div class="filter__head">
        <h3 class="filter__title">Фильтры</h3>
        <button type="reset" class="filter__reset" form="filter-form">Сбросить</button>
      </div>
      <form class="filter__form" id="filter-form">
        ${groupsHTML}
        ${priceHTML}
      </form>`;
  }

  renderFilter();

  /* =========================================================
     8. Фильтрация
     ========================================================= */
  const cards = Array.from(listEl.querySelectorAll('[data-id]'));
  let priceFrom = priceMin;
  let priceTo   = priceMax;

  (function bindPrice() {
    const rMin = document.getElementById('priceMin');
    const rMax = document.getElementById('priceMax');
    const iMin = document.getElementById('priceMinInput');
    const iMax = document.getElementById('priceMaxInput');
    const out  = asideEl.querySelector('.filter__price-output');
    if (!rMin || !rMax || !iMin || !iMax || !out) return;

    function sync() {
      let a = +rMin.value, b = +rMax.value;
      if (a > b) { [a, b] = [b, a]; rMin.value = a; rMax.value = b; }
      iMin.value = a; iMax.value = b;
      out.textContent = `${fmt(a)} – ${fmt(b)} ₽`;
      priceFrom = a; priceTo = b;
      applyFilters();
    }

    rMin.addEventListener('input', sync);
    rMax.addEventListener('input', sync);
    iMin.addEventListener('change', () => { rMin.value = Math.min(+iMin.value, +rMax.value); sync(); });
    iMax.addEventListener('change', () => { rMax.value = Math.max(+iMax.value, +rMin.value); sync(); });
  })();

  function applyFilters() {
    const checked = {};
    asideEl.querySelectorAll('.filter__form input[type="checkbox"]:checked').forEach(c => {
      (checked[c.name] ||= []).push(c.value);
    });

    const subtypeGroup = (conf.filter.groups || []).find(g => g.type === 'checkbox');
    const subtypeVals = subtypeGroup ? checked[subtypeGroup.name] : null;

    const chipsGroup = (conf.filter.groups || []).find(g => g.type === 'chips');
    const chipsVals = chipsGroup ? checked[chipsGroup.name] : null;

    let visible = 0;

    cards.forEach(card => {
      const item = conf.items.find(i => i.id === card.dataset.id);
      if (!item) return;

      const bySubtype = !subtypeVals?.length || subtypeVals.includes(item.subtype);
      const tags = item.filterTags || [];
      const byChips = !chipsVals?.length || chipsVals.every(v => tags.includes(v));
      const byPrice = item.priceDay >= priceFrom && item.priceDay <= priceTo;

      const ok = bySubtype && byChips && byPrice;
      card.hidden = !ok;
      if (ok) visible++;
    });

    let emptyEl = listEl.querySelector('.catalog__empty');
    if (!visible) {
      if (!emptyEl) {
        emptyEl = document.createElement('div');
        emptyEl.className = 'catalog__empty';
        emptyEl.innerHTML = `
          Ничего не найдено под выбранные фильтры.
          <button type="button" class="catalog__empty-link" data-reset-filters>Сбросить</button>`;
        listEl.appendChild(emptyEl);
      }
      emptyEl.hidden = false;
    } else if (emptyEl) {
      emptyEl.hidden = true;
    }
  }

  asideEl.addEventListener('change', applyFilters);
  asideEl.addEventListener('reset', () => {
    setTimeout(() => {
      const rMin = document.getElementById('priceMin');
      const rMax = document.getElementById('priceMax');
      if (rMin) rMin.value = priceMin;
      if (rMax) rMax.value = priceMax;
      priceFrom = priceMin;
      priceTo   = priceMax;
      applyFilters();
    }, 0);
  });

  listEl.addEventListener('click', (e) => {
    const reset = e.target.closest('[data-reset-filters]');
    if (!reset) return;
    const form = asideEl.querySelector('.filter__form');
    if (form) form.reset();
  });

  applyFilters();

  /* =========================================================
     9. Переключение режима info ↔ calendar
     ========================================================= */
  setViewMode(viewMode);

  listEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-view-toggle]');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    setViewMode(viewMode === 'info' ? 'calendar' : 'info');
  });

  if (window.SS_CALENDAR && typeof window.SS_CALENDAR.bind === 'function') {
    window.SS_CALENDAR.bind(listEl);
  }

  /* =========================================================
     10. Модалка «Подробнее» — клик по карточке
     ========================================================= */

  listEl.addEventListener('click', (e) => {
    if (e.target.closest('[data-order], [data-view-toggle], .card-toggle')) return;
    const card = e.target.closest('.catalog-card');
    if (!card) return;
    const id = card.dataset.id;
    if (id) location.href = `item.html?id=${encodeURIComponent(id)}`;
  });

  listEl.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    if (e.target.closest('[data-order], [data-view-toggle], .card-toggle')) return;
    const card = e.target.closest('.catalog-card');
    if (!card) return;
    e.preventDefault();
    const id = card.dataset.id;
    if (id) location.href = `item.html?id=${encodeURIComponent(id)}`;
  });

  /* =========================================================
     11. Кнопка «Заказать» — заглушка до order-modal.js
     ========================================================= */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-order]');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();

    const id = btn.dataset.order;
    console.log('[catalog] order:', id);

    /* TODO: подключить order-modal.js */
    /* window.SS_ORDER.open(id); */
  });

})();