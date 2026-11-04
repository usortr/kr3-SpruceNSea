/* =========================================================
   Spruce & Sea — занятость дат
   ========================================================= */
window.SS_AVAILABILITY = (function () {

  /* Занятые даты по id позиции (ISO YYYY-MM-DD) */
  const BOOKED = {
    /* Номера */
    'room-forest':   ['2026-11-14','2026-11-15','2026-11-16','2026-12-05','2026-12-06'],
    'room-tide':     ['2026-11-20','2026-11-21','2026-11-22','2026-12-31'],
    'room-family':   ['2026-11-25','2026-11-26','2026-11-27','2026-12-20','2026-12-21'],
    'room-attic':    ['2026-11-18','2026-11-19'],
    'room-pine':     ['2026-12-01','2026-12-02'],
    'room-sunrise':  ['2026-11-28','2026-11-29','2026-11-30'],
    'room-balcony':  ['2026-12-10','2026-12-11'],
    'room-studio':   ['2026-11-22','2026-11-23'],
    'room-suite-lake':  ['2026-11-30','2026-12-01','2026-12-02','2026-12-03'],
    'room-suite-birch': ['2026-12-12','2026-12-13','2026-12-14'],
    'room-duplex':   ['2026-11-16','2026-11-17','2026-11-18'],
    'room-library':  ['2026-12-18','2026-12-19'],
    'room-sea-view': ['2026-11-24','2026-11-25'],
    'room-garden':   ['2026-12-03','2026-12-04'],
    'test-overflow': ['2026-11-25','2026-11-26','2026-11-27','2026-12-20','2026-12-21'],

    /* Коттеджи */
    'cottage-spruce':   [],
    'chalet-family':    ['2026-12-25','2026-12-26','2026-12-27','2026-12-28','2026-12-29'],
    'cottage-lake':     ['2026-11-28','2026-11-29','2026-11-30'],
    'cottage-pine':     ['2026-12-08','2026-12-09','2026-12-10'],
    'cottage-garden':   ['2026-11-15','2026-11-16'],
    'cottage-dune':     ['2026-12-30','2026-12-31','2027-01-01','2027-01-02','2027-01-03'],

    /* СПА */
    'sauna-fin':     ['2026-11-17','2026-11-18','2026-11-24'],
    'bath-rus':      ['2026-11-22','2026-12-05','2026-12-06'],
    'massage-pair':  ['2026-11-29','2026-11-30'],

    /* Прокат */
    'bike-city':     ['2026-11-16','2026-11-17'],
    'bike-electric': ['2026-11-23','2026-11-24'],
    'sup-board':     ['2026-11-30','2026-12-01'],
    'sup-kids':      ['2026-12-02'],
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