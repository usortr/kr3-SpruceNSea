/* =========================================================
   Spruce & Sea — расчёт стоимости заказа
   Чистые функции, без DOM
   ========================================================= */
window.SS_PRICING = (function () {

  function nightsBetween(checkin, checkout) {
    if (!checkin || !checkout) return 0;
    const a = new Date(checkin + 'T00:00:00');
    const b = new Date(checkout + 'T00:00:00');
    const ms = b - a;
    if (!Number.isFinite(ms) || ms <= 0) return 0;
    return Math.round(ms / 86400000);
  }

  /* Скидка за длительность: макс. подходящее правило */
  function calcStayDiscount(item, nights) {
    const rules = item.stayDiscount || [];
    let best = 0;
    rules.forEach(r => {
      if (nights >= r.minDays && r.percent > best) best = r.percent;
    });
    const base = item.priceDay * nights;
    return { percent: best, amount: Math.round(base * best / 100) };
  }

  /* Скидка совместимости для сильной опции */
  function calcStrongDiscount(parent, optionId) {
    const rules = parent.comboDiscount || [];
    const r = rules.find(x => x.optionId === optionId);
    return r ? r.percent : 0;
  }

  /* Слабая опция: цена × qty */
  function calcWeak(opt, { nights, adults, kids }) {
    const guests = (adults || 0) + (kids || 0);
    let qty = 1;
    if (opt.perGuest) qty = Math.max(guests, 1);
    else if (opt.unit === 'сутки') qty = Math.max(nights, 1);

    const total = opt.price * qty;
    return { ...opt, qty, total };
  }

  /* Полный расчёт заказа */
  function calcOrder(item, params) {
    const { checkin, checkout, adults = 1, kids = 0, pets = false, weakIds = [], strongIds = [] } = params;
    const nights = nightsBetween(checkin, checkout);

    /* Базовая цена позиции */
    const baseTotal = item.priceDay * nights;
    const stayDisc = calcStayDiscount(item, nights);

    /* Слабые опции */
    const weakList = (item.weakOptions || [])
      .filter(o => weakIds.includes(o.id))
      .map(o => {
        /* Питомец — отдельная надбавка, если отмечен */
        if (o.id === 'pet-fee' && !pets) return null;
        return calcWeak(o, { nights, adults, kids });
      })
      .filter(Boolean);

    const weakTotal = weakList.reduce((s, o) => s + o.total, 0);

    /* Сильные опции */
    const strongList = (item.strongOptions || [])
      .filter(s => strongIds.includes(s.id))
      .map(s => {
        const sub = findItem(s.id);
        if (!sub) return null;
        const pct = calcStrongDiscount(item, s.id);
        const base = sub.priceDay * nights;
        const disc = Math.round(base * pct / 100);
        return {
          itemId: sub.id,
          title: sub.title,
          priceDay: sub.priceDay,
          unit: sub.unit,
          nights,
          discountPercent: pct,
          baseTotal: base,
          discount: disc,
          total: base - disc,
        };
      })
      .filter(Boolean);

    const strongTotal = strongList.reduce((s, o) => s + o.total, 0);

    const total = baseTotal - stayDisc.amount + weakTotal + strongTotal;

    return {
      nights,
      baseTotal,
      stayDiscountPercent: stayDisc.percent,
      stayDiscount: stayDisc.amount,
      weakList,
      weakTotal,
      strongList,
      strongTotal,
      total,
    };
  }

  /* Поиск позиции по id во всех категориях */
  function findItem(id) {
    const data = window.SS_DATA;
    if (!data) return null;
    for (const cat of Object.keys(data)) {
      const c = data[cat];
      if (!c || !c.items) continue;
      const found = c.items.find(i => i.id === id);
      if (found) return { ...found, category: cat };
    }
    return null;
  }

  return { nightsBetween, calcStayDiscount, calcStrongDiscount, calcWeak, calcOrder, findItem };
})();