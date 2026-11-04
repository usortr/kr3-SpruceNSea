/* =========================================================
   Spruce & Sea — мини-календарь занятости
   ========================================================= */
window.SS_CALENDAR = (function () {

  const MONTHS = ['январь','февраль','март','апрель','май','июнь',
                  'июль','август','сентябрь','октябрь','ноябрь','декабрь'];
  const WEEKDAYS = ['пн','вт','ср','чт','пт','сб','вс'];

  /* Глобальное состояние месяца — общее для всех календарей */
  let globalView = null;


  function startOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  /* Понедельник = 0 */
  function weekdayIndex(date) {
    return (date.getDay() + 6) % 7;
  }

    function ensureGlobalView() {
    if (globalView) return globalView;
    const today = new Date();
    globalView = { year: today.getFullYear(), month: today.getMonth() };
    return globalView;
  }

  function shiftMonth(delta) {
    const v = ensureGlobalView();
    let month = v.month + delta;
    let year  = v.year;
    if (month < 0)  { month = 11; year -= 1; }
    if (month > 11) { month = 0;  year += 1; }
    globalView = { year, month };
    return globalView;
  }

  /* Рендер календаря на месяц.
     view — { year, month } (0-based month).
     bookedSet — Set<ISO>.
     today — Date «сейчас» (передаём, чтобы тестировать). */
  function renderMonth(id, view, bookedSet, today) {
    const year  = view.year;
    const month = view.month;

    const first = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = weekdayIndex(first);

    const cells = [];

    for (let i = 0; i < offset; i++) {
      cells.push('<span class="cal__cell cal__cell--empty" aria-hidden="true"></span>');
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const iso  = window.SS_AVAILABILITY.toISO(date);

      const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const isToday = date.getTime() === new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
      const isBooked = bookedSet.has(iso);

      const mods = [
        'cal__cell',
        isPast   ? 'cal__cell--past'   : '',
        isToday  ? 'cal__cell--today'  : '',
        isBooked ? 'cal__cell--booked' : '',
        (!isPast && !isBooked) ? 'cal__cell--free' : '',
      ].filter(Boolean).join(' ');

      const label = isBooked ? `${d} — занято` : (isPast ? `${d} — прошедший` : `${d} — свободно`);
      const aria  = (isPast || isBooked) ? 'aria-disabled="true"' : '';

      cells.push(`<span class="${mods}" ${aria} title="${label}">${d}</span>`);
    }

    return `
      <div class="cal" data-cal="${id}">
        <div class="cal__head">
        <button type="button" class="cal__nav" data-cal-prev aria-label="Предыдущий месяц">‹</button>
        <span class="cal__title">${MONTHS[month]} ${year}</span>
        <span class="cal__hint" aria-hidden="true">
            <span class="cal__hint-item"><i class="cal__hint-dot cal__hint-dot--free"></i>свободно</span>
            <span class="cal__hint-item"><i class="cal__hint-dot cal__hint-dot--booked"></i>занято</span>
        </span>
        <button type="button" class="cal__nav" data-cal-next aria-label="Следующий месяц">›</button>
        </div>
        <div class="cal__weekdays">
          ${WEEKDAYS.map(d => `<span class="cal__weekday">${d}</span>`).join('')}
        </div>
        <div class="cal__grid">
          ${cells.join('')}
        </div>
      </div>`;
  }

  /* Публичный API: рендер всей панели календаря для карточки */
  function renderPanel(id) {
    const booked = window.SS_AVAILABILITY.getBooked(id);
    const today  = new Date();
    const view   = { year: today.getFullYear(), month: today.getMonth() };

    return `
        <div class="catalog-card__calendar" data-calendar data-cal-id="${id}">
        ${renderMonth(id, view, booked, today)}
        </div>`;
  }

  /* Перерисовать ВСЕ календари на странице под общий месяц */
  function redrawAll() {
    const today = new Date();
    const view  = ensureGlobalView();

    document.querySelectorAll('[data-calendar]').forEach(wrap => {
      const id = wrap.dataset.calId;
      if (!id) return;
      const booked = window.SS_AVAILABILITY.getBooked(id);
      wrap.innerHTML = renderMonth(id, view, booked, today);
    });
  }

  /* Делегирование кликов — глобально по документу */
  let bound = false;
  function bind(root) {
    if (bound) return;
    bound = true;

    (root || document).addEventListener('click', (e) => {
      const prev = e.target.closest('[data-cal-prev]');
      const next = e.target.closest('[data-cal-next]');
      if (!prev && !next) return;

      e.preventDefault();
      e.stopPropagation();

      shiftMonth(prev ? -1 : 1);
      redrawAll();
    });
  }

  return { renderMonth, renderPanel, bind, redrawAll };
})();