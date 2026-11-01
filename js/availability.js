/* =========================================================
   Spruce & Sea — занятость дат
   ========================================================= */
window.SS_AVAILABILITY = (function () {

  /* Занятые даты по id позиции (ISO YYYY-MM-DD) */
  const BOOKED = {
    'room-forest':   ['2025-12-20','2025-12-21','2025-12-22','2026-01-03','2026-01-04'],
    'room-tide':     ['2025-12-28','2025-12-29','2025-12-30','2025-12-31'],
    'room-family':   ['2026-01-02','2026-01-03','2026-01-04','2026-01-05'],
    'room-attic':    ['2025-12-24','2025-12-25'],
    'room-pine':     ['2025-12-31','2026-01-01'],
    'room-sunrise':  ['2026-01-10','2026-01-11','2026-01-12'],
    'room-balcony':  ['2025-12-27','2025-12-28'],
    'room-studio':   ['2026-01-07','2026-01-08'],
    'room-suite-lake':   ['2025-12-30','2025-12-31','2026-01-01','2026-01-02'],
    'room-suite-birch':  ['2026-01-15','2026-01-16','2026-01-17'],
    'room-duplex':   ['2025-12-22','2025-12-23','2025-12-24'],
    'room-library':  ['2026-01-20','2026-01-21'],
    'room-sea-view': ['2025-12-29','2025-12-30'],
    'room-garden':   ['2026-01-05','2026-01-06'],

    'cottage-spruce':   ['2025-12-25','2025-12-26','2025-12-27','2025-12-28'],
    'chalet-family':    ['2026-01-03','2026-01-04','2026-01-05','2026-01-06','2026-01-07'],
    'cottage-lake':     ['2025-12-31','2026-01-01','2026-01-02'],
    'cottage-pine':     ['2026-01-12','2026-01-13','2026-01-14'],
    'cottage-garden':   ['2025-12-23','2025-12-24'],
    'cottage-dune':     ['2025-12-28','2025-12-29','2025-12-30','2025-12-31','2026-01-01'],

    /* СПА */
    'sauna-fin':     ['2025-12-22','2025-12-23','2025-12-27'],
    'bath-rus':      ['2025-12-25','2026-01-01','2026-01-02'],
    'massage-pair':  ['2026-01-04','2026-01-05'],

    /* Прокат */
    'bike-city':     ['2025-12-24','2025-12-25'],
    'bike-electric': ['2025-12-30','2025-12-31'],
    'sup-board':     ['2026-01-06','2026-01-07'],
    'sup-kids':      ['2026-01-08'],
  };

  /* ISO → Date (локально, без UTC-сдвига) */
  function toDate(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  /* Date → ISO */
  function toISO(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function getBooked(id) {
    return new Set(BOOKED[id] || []);
  }

  function isBooked(id, iso) {
    return getBooked(id).has(iso);
  }

  /* Есть ли вообще занятые даты (для бейджа на кнопке) */
  function hasBooked(id) {
    return (BOOKED[id] || []).length > 0;
  }

  return { getBooked, isBooked, hasBooked, toDate, toISO, BOOKED };
})();