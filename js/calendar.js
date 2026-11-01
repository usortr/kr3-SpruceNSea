/* =========================================================
   Spruce & Sea — мини-календарь занятости
   ========================================================= */
window.SS_CALENDAR = (function () {

  const MONTHS = ['январь','февраль','март','апрель','май','июнь',
                  'июль','август','сентябрь','октябрь','ноябрь','декабрь'];
  const WEEKDAYS = ['пн','вт','ср','чт','пт','сб','вс'];

  function startOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  /* Понедельник = 0 */
  function weekdayIndex(date) {
    return (date.getDay() + 6) % 7;
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
          <button type="button" class="cal__nav" data-cal-next aria-label="Следующий месяц">›</button>
        </div>
        <div class="cal__weekdays">
          ${WEEKDAYS.map(d => `<span class="cal__weekday">${d}</span>`).join('')}
        </div>
        <div class="cal__grid">
          ${cells.join('')}
        </div>
        <div class="cal__legend">
          <span class="cal__legend-item"><i class="cal__dot cal__dot--free"></i> свободно</span>
          <span class="cal__legend-item"><i class="cal__dot cal__dot--booked"></i> занято</span>
        </div>
      </div>`;
  }

  /* Публичный API: рендер всей панели календаря для карточки */
  function renderPanel(id) {
    const booked = window.SS_AVAILABILITY.getBooked(id);
    const today  = new Date();
    const view   = { year: today.getFullYear(), month: today.getMonth() };

    return `
      <div class="stay-card__calendar" data-calendar data-cal-id="${id}">
        ${renderMonth(id, view, booked, today)}
      </div>`;
  }

  /* Навигация по месяцам — делегирование внутри панели */
  function bind(root) {
    root.addEventListener('click', (e) => {
      const prev = e.target.closest('[data-cal-prev]');
      const next = e.target.closest('[data-cal-next]');
      if (!prev && !next) return;

      e.preventDefault();
      e.stopPropagation();

      const wrap = root.querySelector('[data-calendar]');
      if (!wrap) return;

      const id = wrap.dataset.calId;
      const titleEl = wrap.querySelector('.cal__title');
      const current = titleEl.textContent.split(' ');
      const monthName = current[0].toLowerCase();
      let month = MONTHS.indexOf(monthName);
      let year  = Number(current[1]);

      if (prev) {
        month -= 1;
        if (month < 0) { month = 11; year -= 1; }
      } else {
        month += 1;
        if (month > 11) { month = 0; year += 1; }
      }

      const booked = window.SS_AVAILABILITY.getBooked(id);
      const today  = new Date();

      /* Перерисовываем только календарь внутри этой панели */
      wrap.innerHTML = renderMonth(id, { year, month }, booked, today);
    });
  }

  return { renderMonth, renderPanel, bind };
})();