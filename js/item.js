/* =========================================================
   Spruce & Sea — страница «Подробнее»
   Читает ?id, находит в SS_DATA, рендерит
   ========================================================= */
(function () {
  'use strict';

  const data = window.SS_DATA;
  if (!data) {
    console.warn('[item] SS_DATA не найден');
    return;
  }

  const contentEl = document.querySelector('[data-item-content]');
  const emptyEl   = document.querySelector('[data-item-empty]');
  if (!contentEl || !emptyEl) return;

  const fmt = n => Number(n).toLocaleString('ru-RU');

  /* ---------- 1. Ищем id во всех категориях ---------- */
  const id = new URL(location.href).searchParams.get('id');

  let item = null;
  let category = null;
  let conf = null;

  if (id) {
    for (const cat of Object.keys(data)) {
      const c = data[cat];
      if (!c || !c.items) continue;
      const found = c.items.find(i => i.id === id);
      if (found) {
        item = found;
        category = cat;
        conf = c;
        break;
      }
    }
  }

  if (!item) {
    emptyEl.hidden = false;
    return;
  }

  contentEl.hidden = false;
  document.title = `${item.title} — Spruce & Sea`;

  /* ---------- 2. Хлебные крошки ---------- */
  const crumbsMap = {
    stays: { label: 'Номера & коттеджи', url: 'catalog.html?type=stays' },
    spa:   { label: 'СПА & баня',       url: 'catalog.html?type=spa' },
    bikes: { label: 'Велосипеды & сапы', url: 'catalog.html?type=bikes' },
  };
  const crumbs = crumbsMap[category];
  const crumbsEl = document.querySelector('[data-item-breadcrumbs]');
  if (crumbsEl && crumbs) {
    crumbsEl.innerHTML = `
      <a href="index.html">Главная</a>
      <span class="item__breadcrumbs-sep">/</span>
      <a href="${crumbs.url}">${crumbs.label}</a>
      <span class="item__breadcrumbs-sep">/</span>
      <span class="item__breadcrumbs-current">${item.title}</span>
    `;
  }

  /* ---------- 3. Галерея ---------- */
  const gallery = (item.gallery && item.gallery.length)
    ? item.gallery
    : (item.image ? [item.image] : []);

  const mainImg = contentEl.querySelector('[data-gallery-main]');
  const tagEl   = contentEl.querySelector('[data-gallery-tag]');
  const thumbsEl = contentEl.querySelector('[data-gallery-thumbs]');

  if (mainImg && gallery.length) {
    mainImg.src = gallery[0];
    mainImg.alt = item.alt || item.title;
  }
  if (tagEl) tagEl.textContent = item.tag || '';

  if (thumbsEl && gallery.length > 1) {
    thumbsEl.innerHTML = gallery.map((src, i) => `
      <button class="item-gallery__thumb${i === 0 ? ' is-active' : ''}"
              type="button" data-gallery-thumb data-index="${i}"
              aria-label="Фото ${i + 1}">
        <img src="${src}" alt="" loading="lazy">
      </button>
    `).join('');

    thumbsEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-gallery-thumb]');
      if (!btn) return;
      const idx = Number(btn.dataset.index);
      if (!Number.isFinite(idx) || !gallery[idx]) return;

      if (mainImg) {
        mainImg.src = gallery[idx];
        mainImg.alt = `${item.alt || item.title} — фото ${idx + 1}`;
      }
      thumbsEl.querySelectorAll('[data-gallery-thumb]').forEach((b, i) => {
        b.classList.toggle('is-active', i === idx);
      });
    });
  }

  /* ---------- 4. Заголовок, цена, описание, бейджи ---------- */
  const titleEl = contentEl.querySelector('[data-item-title]');
  const priceEl = contentEl.querySelector('[data-item-price]');
  const unitEl  = contentEl.querySelector('[data-item-unit]');
  const shortEl = contentEl.querySelector('[data-item-short]');
  const badgesEl = contentEl.querySelector('[data-item-badges]');

  if (titleEl) titleEl.textContent = item.title;
  if (priceEl) priceEl.textContent = `${fmt(item.priceDay)} ₽`;
  if (unitEl)  unitEl.textContent  = `/${item.unit || 'сутки'}`;
  if (shortEl) shortEl.textContent = item.short || '';

  if (badgesEl) {
    badgesEl.innerHTML = (item.badges || []).map(b => `<li>${b}</li>`).join('');
  }

  /* ---------- 5. Календарь ---------- */
  const calWrap = contentEl.querySelector('[data-item-calendar]');
  if (calWrap && window.SS_CALENDAR) {
    const hasDates = window.SS_AVAILABILITY && window.SS_AVAILABILITY.hasBooked(item.id);
    if (hasDates) {
      calWrap.innerHTML = window.SS_CALENDAR.renderPanel(item.id);
      window.SS_CALENDAR.bind(calWrap);
    } else {
      calWrap.innerHTML = `<p class="card-free">Все даты свободны — можно бронировать.</p>`;
    }
  }

  /* ---------- 6. Полное описание ---------- */
  const fullEl = contentEl.querySelector('[data-item-full]');
  if (fullEl) {
    fullEl.textContent = item.fullDescription || item.short || '';
  }

  /* ---------- 7. Секции details ---------- */
  const detailsEl = contentEl.querySelector('[data-item-details]');
  if (detailsEl && item.details && item.details.length) {
    detailsEl.innerHTML = item.details.map(sec => {
      const content = sec.items
        ? `<ul class="item-details__list">${sec.items.map(i => `<li>${i}</li>`).join('')}</ul>`
        : `<p class="item-details__text">${sec.text || ''}</p>`;
      return `
        <div class="item-details__section">
          <h3 class="item-details__subtitle">${sec.title}</h3>
          ${content}
        </div>`;
    }).join('');
  } else if (detailsEl) {
    detailsEl.closest('.item-details').hidden = true;
  }

  /* ---------- 8. Опции ---------- */
  const optionsEl = contentEl.querySelector('[data-item-options]');
  if (optionsEl) {
    const weak = item.weakOptions || [];
    const strong = item.strongOptions || [];

    if (!weak.length && !strong.length) {
      optionsEl.hidden = true;
    } else {
      let html = '<h2 class="item-info__subtitle">Дополнительно</h2>';

      if (weak.length) {
        html += `
          <div class="item-options">
            <h3 class="item-options__subtitle">Опции</h3>
            <ul class="item-options__list">
              ${weak.map(o => `
                <li class="item-options__item">
                  <span>${o.title}</span>
                  <span class="item-options__price">${fmt(o.price)} ₽${o.unit ? ` / ${o.unit}` : ''}${o.perGuest ? ' с гостя' : ''}</span>
                </li>`).join('')}
            </ul>
          </div>`;
      }

      if (strong.length) {
        html += `
          <div class="item-options">
            <h3 class="item-options__subtitle">Можно добавить</h3>
            <ul class="item-options__list">
              ${strong.map(s => {
                const sub = Object.values(data).reduce((acc, c) => {
                  return acc || (c.items && c.items.find(i => i.id === s.id));
                }, null);
                if (!sub) return '';
                return `
                  <li class="item-options__item">
                    <a href="item.html?id=${sub.id}" class="item-options__link">
                      ${sub.title} — ${fmt(sub.priceDay)} ₽/${sub.unit || 'сутки'}
                    </a>
                  </li>`;
              }).join('')}
            </ul>
          </div>`;
      }

      optionsEl.innerHTML = html;
    }
  }

  /* ---------- 9. Кнопки ---------- */
  const orderBtn = contentEl.querySelector('[data-item-order]');
  if (orderBtn) {
    orderBtn.addEventListener('click', () => {
      console.log('[item] order:', item.id);
      /* TODO: order-modal */
    });
  }

  const backBtn = contentEl.querySelector('[data-item-back]');
  if (backBtn && crumbs) {
    backBtn.href = crumbs.url;
    backBtn.textContent = `← Назад в «${crumbs.label}»`;
  }

})();