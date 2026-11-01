/* =========================================================
   Spruce & Sea — каталог: рендер по типу + фильтрация
   ========================================================= */
(function () {
    const data = window.SS_DATA;
    if (!data) return;

    const listEl  = document.querySelector('[data-catalog-list]');
    const asideEl = document.querySelector('[data-catalog-filter]');
    if (!listEl || !asideEl) return;

    const type = new URL(location.href).searchParams.get('type') || 'stays';
    const conf = data[type];
    if (!conf) return;

    /* ---------- Режим отображения: info | calendar ---------- */
    const VIEW_KEY = 'spruce-sea-view-mode';
    let viewMode = sessionStorage.getItem(VIEW_KEY) || 'info';

    function setViewMode(mode) {
    viewMode = mode;
    sessionStorage.setItem(VIEW_KEY, mode);

    /* Обновляем data-view на контейнере */
    listEl.dataset.view = mode;

    /* Переключаем панели всех карточек */
    listEl.querySelectorAll('[data-panel]').forEach(panel => {
        panel.hidden = panel.dataset.panel !== mode;
    });

    /* Синхронизируем aria-expanded на кнопках */
    listEl.querySelectorAll('[data-view-toggle]').forEach(btn => {
        const on = mode === 'calendar';
        btn.setAttribute('aria-expanded', String(on));
        btn.setAttribute('aria-label', on ? 'Показать описание' : 'Показать занятые даты');
    });

    /* Класс на body карточки — цена переезжает/меняет вид */
    listEl.querySelectorAll('.stay-card, .spa-card, .bike-card').forEach(card => {
        card.classList.toggle('is-calendar', mode === 'calendar');
    });
    }
    /* Заголовок */
    const setText = (sel, val) => {
        const el = document.querySelector(sel);
        if (el) el.textContent = val;
    };
    setText('[data-catalog-eyebrow]', conf.head.eyebrow);
    setText('[data-catalog-title]',   conf.head.title);
    setText('[data-catalog-sub]',     conf.head.sub);

    // ... дальше без изменений: cardTemplates, renderFilter, applyFilters

  /* ---------- 3. Шаблоны карточек ---------- */
  const cardTemplates = {

    /* Жильё — горизонтальная карточка (как была) */
    stay(item) {
    const fmt  = n => n.toLocaleString('ru-RU');
    const beds = item.rooms.reduce((s, r) => s + r.beds, 0);
    const hasDates = window.SS_AVAILABILITY.hasBooked(item.id);

    return `
        <article class="stay-card" data-id="${item.id}">
        <div class="row stay-card__row g-0">
            <div class="col-md-5 col-lg-4">
            <div class="stay-card__media">
                <img src="${item.image}" alt="${item.alt}" class="stay-card__image" loading="lazy">
                <span class="stay-card__tag stay-card__tag--${item.subtype}">${item.tag}</span>
            </div>
            </div>
            <div class="col-md-7 col-lg-8">
            <div class="stay-card__body">

                <!-- ПАНЕЛЬ 1: описание -->
                <div class="stay-card__panel stay-card__panel--info" data-panel="info">
                <div class="stay-card__top">
                    <h3 class="stay-card__title">${item.title}</h3>
                    <div class="stay-card__price">
                    <strong>${fmt(item.priceDay)} ₽</strong>/сутки
                    <button class="stay-card__toggle" type="button"
                            aria-label="Показать занятые даты"
                            aria-expanded="false"
                            data-view-toggle>‹</button>
                    </div>
                </div>
                <p class="stay-card__text">${item.short}</p>
                <ul class="stay-card__meta">
                    <li class="stay-card__meta-item">👥 ${beds} мест</li>
                    <li class="stay-card__meta-item">📏 ${item.area} м²</li>
                    ${item.meta.map(m => `<li class="stay-card__meta-item">${m}</li>`).join('')}
                </ul>
                <details class="stay-card__details">
                    <summary>Состав и особенности</summary>
                    <ul class="stay-card__rooms">
                    ${item.rooms.map(r => `<li>${r.name}${r.beds ? ` — ${r.beds} мест` : ''}</li>`).join('')}
                    </ul>
                    <p class="stay-card__features"><strong>В номере:</strong> ${item.features.join('; ')}</p>
                    <p class="stay-card__features"><strong>На территории:</strong> ${item.territory.join('; ')}</p>
                </details>
                <div class="stay-card__actions">
                    <button class="stay-card__fav" aria-label="Добавить в избранное">♡</button>
                    <a href="#" class="btn btn--primary btn--small" data-book="${item.id}">Забронировать</a>
                </div>
                </div>

                <!-- ПАНЕЛЬ 2: календарь -->
                <div class="stay-card__panel stay-card__panel--calendar" data-panel="calendar" hidden>
                <div class="stay-card__top">
                    <h3 class="stay-card__title">${item.title}</h3>
                    <div class="stay-card__price">
                    <strong>${fmt(item.priceDay)} ₽</strong>/сутки
                    <button class="stay-card__toggle" type="button"
                            aria-label="Показать описание"
                            aria-expanded="true"
                            data-view-toggle>›</button>
                    </div>
                </div>
                ${hasDates
                    ? window.SS_CALENDAR.renderPanel(item.id)
                    : `<p class="stay-card__free">Все даты свободны — можно бронировать.</p>`}
                <div class="stay-card__actions">
                    <a href="#" class="btn btn--primary btn--small" data-book="${item.id}">Забронировать</a>
                </div>
                </div>

            </div>
            </div>
        </div>
        </article>`;
    },

    /* СПА — вертикальная карточка с акцентом на длительность */
    spa(item) {
    const fmt = n => n.toLocaleString('ru-RU');
    const hasDates = window.SS_AVAILABILITY.hasBooked(item.id);

    return `
        <article class="spa-card" data-id="${item.id}">
        <div class="spa-card__media">
            <img src="${item.image}" alt="${item.alt}" class="spa-card__image" loading="lazy">
            <span class="spa-card__tag">${item.tag}</span>
        </div>
        <div class="spa-card__body">
            <div class="spa-card__panel" data-panel="info">
            <h3 class="spa-card__title">${item.title}</h3>
            <p class="spa-card__text">${item.short}</p>
            <ul class="spa-card__meta">${this._meta(item)}</ul>
            <div class="spa-card__foot">
                <div class="spa-card__price">
                <strong>${fmt(item.priceDay)} ₽</strong>/${item.unit}
                <button class="spa-card__toggle" type="button"
                        aria-label="Показать занятые даты"
                        aria-expanded="false" data-view-toggle>‹</button>
                </div>
                <a href="#" class="btn btn--primary btn--small" data-book="${item.id}">Записаться</a>
            </div>
            </div>
            <div class="spa-card__panel" data-panel="calendar" hidden>
            <div class="spa-card__foot">
                <div class="spa-card__price">
                <strong>${fmt(item.priceDay)} ₽</strong>/${item.unit}
                <button class="spa-card__toggle" type="button"
                        aria-label="Показать описание"
                        aria-expanded="true" data-view-toggle>›</button>
                </div>
                <a href="#" class="btn btn--primary btn--small" data-book="${item.id}">Записаться</a>
            </div>
            ${hasDates
                ? window.SS_CALENDAR.renderPanel(item.id)
                : `<p class="stay-card__free">Все даты свободны.</p>`}
            </div>
        </div>
        </article>`;
    },

    bike(item) {
    const fmt = n => n.toLocaleString('ru-RU');
    const hasDates = window.SS_AVAILABILITY.hasBooked(item.id);

    return `
        <article class="bike-card" data-id="${item.id}">
        <div class="bike-card__media">
            <img src="${item.image}" alt="${item.alt}" class="bike-card__image" loading="lazy">
            <span class="bike-card__tag">${item.tag}</span>
        </div>
        <div class="bike-card__body">
            <div class="bike-card__panel" data-panel="info">
            <div class="bike-card__top">
                <h3 class="bike-card__title">${item.title}</h3>
                <div class="bike-card__price">
                <strong>${fmt(item.priceDay)} ₽</strong>/${item.unit}
                <button class="bike-card__toggle" type="button"
                        aria-label="Показать занятые даты"
                        aria-expanded="false" data-view-toggle>‹</button>
                </div>
            </div>
            <p class="bike-card__text">${item.short}</p>
            <ul class="bike-card__meta">${this._meta(item)}</ul>
            <div class="bike-card__actions">
                <a href="#" class="btn btn--primary btn--small" data-book="${item.id}">Взять</a>
            </div>
            </div>
            <div class="bike-card__panel" data-panel="calendar" hidden>
            <div class="bike-card__top">
                <h3 class="bike-card__title">${item.title}</h3>
                <div class="bike-card__price">
                <strong>${fmt(item.priceDay)} ₽</strong>/${item.unit}
                <button class="bike-card__toggle" type="button"
                        aria-label="Показать описание"
                        aria-expanded="true" data-view-toggle>›</button>
                </div>
            </div>
            ${hasDates
                ? window.SS_CALENDAR.renderPanel(item.id)
                : `<p class="stay-card__free">Все даты свободны.</p>`}
            <div class="bike-card__actions">
                <a href="#" class="btn btn--primary btn--small" data-book="${item.id}">Взять</a>
            </div>
            </div>
        </div>
        </article>`;
    },

    _meta(item) {
      return item.meta.map(m => `<li>${m}</li>`).join('');
    },
  };

  /* ---------- 4. Рендер карточек ---------- */
  const template = cardTemplates[conf.card];
  if (!template) return;

  if (!conf.items.length) {
    listEl.innerHTML = `
      <div class="catalog__empty">
        Скоро здесь появятся предложения. Загляните в раздел
        <a href="catalog.html?type=stays" class="catalog__empty-link">жилья</a>.
      </div>`;
    return;
  }

  listEl.classList.add(`catalog__list--${conf.card}`);
  listEl.innerHTML = conf.items.map(template, cardTemplates).join('');

  /* ---------- 5. Рендер фильтра ---------- */
  const priceMax = Math.max(...conf.items.map(i => i.priceDay));
  const priceMin = Math.min(...conf.items.map(i => i.priceDay));

  function renderFilter() {
    const groupsHTML = conf.filter.groups.map(group => {
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

    /* Универсальная группа «Цена» */
    const priceHTML = `
      <fieldset class="filter__group">
        <legend class="filter__legend">
          Цена
          <output class="filter__price-output" for="priceMin priceMax">
            ${priceMin.toLocaleString('ru-RU')} – ${priceMax.toLocaleString('ru-RU')} ₽
          </output>
        </legend>
        <div class="filter__range">
          <input type="range" id="priceMin" min="${priceMin}" max="${priceMax}" step="100"
                 value="${priceMin}" class="filter__range-input">
          <input type="range" id="priceMax" min="${priceMin}" max="${priceMax}" step="100"
                 value="${priceMax}" class="filter__range-input">
        </div>
        <div class="filter__price-row">
          <label class="filter__price-field">От
            <input type="number" id="priceMinInput" value="${priceMin}" class="filter__price-number">
          </label>
          <label class="filter__price-field">До
            <input type="number" id="priceMaxInput" value="${priceMax}" class="filter__price-number">
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

  /* ---------- 6. Фильтрация ---------- */
  const cards = Array.from(listEl.querySelectorAll('[data-id]'));

  let priceFrom = priceMin;
  let priceTo   = priceMax;

  /* Синхронизация ползунков (перенесено сюда из main.js) */
  (function bindPrice() {
    const rMin = document.getElementById('priceMin');
    const rMax = document.getElementById('priceMax');
    const iMin = document.getElementById('priceMinInput');
    const iMax = document.getElementById('priceMaxInput');
    const out  = asideEl.querySelector('.filter__price-output');
    if (!rMin || !rMax) return;

    function sync() {
      let a = +rMin.value, b = +rMax.value;
      if (a > b) { [a, b] = [b, a]; rMin.value = a; rMax.value = b; }
      iMin.value = a; iMax.value = b;
      out.textContent = `${a.toLocaleString('ru-RU')} – ${b.toLocaleString('ru-RU')} ₽`;
      priceFrom = a; priceTo = b;
      applyFilters();
    }

    [rMin, rMax].forEach(r => r.addEventListener('input', sync));
    iMin.addEventListener('change', () => { rMin.value = Math.min(+iMin.value, +rMax.value); sync(); });
    iMax.addEventListener('change', () => { rMax.value = Math.max(+iMax.value, +rMin.value); sync(); });
  })();

  function applyFilters() {
    /* Собираем выбранные значения по каждому name, кроме служебных */
    const checked = {};
    asideEl.querySelectorAll('.filter__form input[type="checkbox"]:checked').forEach(c => {
      (checked[c.name] ||= []).push(c.value);
    });

    cards.forEach(card => {
      const item = conf.items.find(i => i.id === card.dataset.id);
      if (!item) return;

      /* 1. Фильтр по подтипу (первый checkbox-групп) */
      const subtypeName = conf.filter.groups.find(g => g.type === 'checkbox')?.name;
      const subtypeVals = subtypeName ? checked[subtypeName] : null;
      const bySubtype = !subtypeVals?.length || subtypeVals.includes(item.subtype);

      /* 2. Фильтр по chips (второй группа) — все выбранные должны быть в filterTags */
      const chipsName = conf.filter.groups.find(g => g.type === 'chips')?.name;
      const chipsVals = chipsName ? checked[chipsName] : null;
      const byChips = !chipsVals?.length || chipsVals.every(v => item.filterTags.includes(v));

      /* 3. Цена */
      const byPrice = item.priceDay >= priceFrom && item.priceDay <= priceTo;

      card.hidden = !(bySubtype && byChips && byPrice);
    });
  }

  asideEl.addEventListener('change', applyFilters);
  asideEl.addEventListener('reset', () => {
    // после reset — сбросить цену и перерисовать
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

  applyFilters();

  /* ---------- Инициализация режима ---------- */
    setViewMode(viewMode);

    /* Делегирование клика по стрелкам */
    listEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-view-toggle]');
    if (!btn) return;
    e.preventDefault();
    setViewMode(viewMode === 'info' ? 'calendar' : 'info');
    });

    /* Биндинг календарей — один раз на контейнер (делегирование внутри) */
    window.SS_CALENDAR.bind(listEl);
})();