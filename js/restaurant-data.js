/* =========================================================
   Spruce & Sea — данные ресторана
   ========================================================= */
window.SS_RESTAURANT = {

  head: {
    title: 'Меню ресторана',
  },

  filter: {
    groups: [
      {
        type: 'checkbox',
        name: 'course',
        legend: 'Тип блюда',
        options: [
          { value: 'breakfast', label: 'Завтраки' },
          { value: 'starter',   label: 'Закуски' },
          { value: 'soup',      label: 'Супы' },
          { value: 'main',      label: 'Горячее' },
          { value: 'dessert',   label: 'Десерты' },
          { value: 'drink',     label: 'Напитки' },
        ],
      },
      {
        type: 'chips',
        name: 'diet',
        legend: 'Особенности',
        options: [
          { value: 'veg',      label: 'Вегетарианское' },
          { value: 'vegan',    label: 'Веганское' },
          { value: 'gluten',   label: 'Без глютена' },
          { value: 'spicy',    label: 'Острое' },
          { value: 'local',    label: 'Локальное' },
        ],
      },
    ],
  },

  items: [
    /* ---------- Завтраки ---------- */
    {
      id: 'dish-porridge',
      course: 'breakfast',
      title: 'Каша на берёзовом соке',
      short: 'Овсяная каша на берёзовом соке с лесными ягодами и мёдом.',
      price: 450,
      image: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?q=80&w=800&auto=format&fit=crop',
      alt: 'Овсяная каша с ягодами',
      diet: ['veg', 'local'],
    },
    {
      id: 'dish-syrniki',
      course: 'breakfast',
      title: 'Сырники с северным вареньем',
      short: 'Сырники из фермерского творога с морошкой и сметаной.',
      price: 550,
      image: 'https://images.unsplash.com/photo-1626082927389-6cd097cee6a6?q=80&w=800&auto=format&fit=crop',
      alt: 'Сырники с вареньем',
      diet: ['veg'],
    },
    {
      id: 'dish-omelette',
      course: 'breakfast',
      title: 'Омлет с грибами',
      short: 'Пышный омлет с лесными грибами и зеленью.',
      price: 500,
      image: 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?q=80&w=800&auto=format&fit=crop',
      alt: 'Омлет с грибами',
      diet: ['veg', 'gluten'],
    },

    /* ---------- Закуски ---------- */
    {
      id: 'dish-fish-plate',
      course: 'starter',
      title: 'Плато северных рыб',
      short: 'Слабосолёный лосось, сиг, ряпушка и муксун с ржаным хлебом.',
      price: 1200,
      image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=800&auto=format&fit=crop',
      alt: 'Плато северных рыб',
      diet: ['local'],
    },
    {
      id: 'dish-mushrooms',
      course: 'starter',
      title: 'Грузди со сметаной',
      short: 'Солёные грузди с луком, сметаной и картофелем.',
      price: 650,
      image: 'https://images.unsplash.com/photo-1504545102780-26774c1bb073?q=80&w=800&auto=format&fit=crop',
      alt: 'Солёные грузди со сметаной',
      diet: ['veg', 'local'],
    },
    {
      id: 'dish-tartar',
      course: 'starter',
      title: 'Тартар из оленины',
      short: 'Сырая оленина с каперсами, луком и желтком.',
      price: 950,
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop',
      alt: 'Тартар из оленины',
      diet: ['local'],
    },

    /* ---------- Супы ---------- */
    {
      id: 'dish-ukha',
      course: 'soup',
      title: 'Уха по-карельски',
      short: 'Наваристая уха из трёх видов рыбы с укропом и картофелем.',
      price: 700,
      image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=800&auto=format&fit=crop',
      alt: 'Уха по-карельски',
      diet: ['local'],
    },
    {
      id: 'dish-mushroom-soup',
      course: 'soup',
      title: 'Грибной крем-суп',
      short: 'Крем-суп из белых грибов с трюфельным маслом.',
      price: 650,
      image: 'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=800&auto=format&fit=crop',
      alt: 'Грибной крем-суп',
      diet: ['veg', 'gluten'],
    },

    /* ---------- Горячее ---------- */
    {
      id: 'dish-deer',
      course: 'main',
      title: 'Оленина с брусникой',
      short: 'Карельская оленина, томлённая с брусникой и розмарином.',
      price: 1800,
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop',
      alt: 'Оленина с брусникой',
      diet: ['local', 'gluten'],
    },
    {
      id: 'dish-whitefish',
      course: 'main',
      title: 'Сиг на углях',
      short: 'Сиг, запечённый на углях, с овощами и лимоном.',
      price: 1500,
      image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=800&auto=format&fit=crop',
      alt: 'Сиг на углях',
      diet: ['local', 'gluten'],
    },
    {
      id: 'dish-pelmeni',
      course: 'main',
      title: 'Пельмени с лососем',
      short: 'Домашние пельмени с лососем и сливочным соусом.',
      price: 1100,
      image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=800&auto=format&fit=crop',
      alt: 'Пельмени с лососем',
      diet: [],
    },

    /* ---------- Десерты ---------- */
    {
      id: 'dish-cloudberry',
      course: 'dessert',
      title: 'Морошковый чизкейк',
      short: 'Нежный чизкейк с северной морошкой.',
      price: 600,
      image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=800&auto=format&fit=crop',
      alt: 'Морошковый чизкейк',
      diet: ['veg'],
    },
    {
      id: 'dish-honey',
      course: 'dessert',
      title: 'Медовик с облепихой',
      short: 'Классический медовик с облепиховым кремом.',
      price: 550,
      image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=800&auto=format&fit=crop',
      alt: 'Медовик с облепихой',
      diet: ['veg'],
    },

    /* ---------- Напитки ---------- */
    {
      id: 'dish-tea',
      course: 'drink',
      title: 'Чай с северными травами',
      short: 'Чай из иван-чая, брусничного листа и мяты.',
      price: 350,
      image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=800&auto=format&fit=crop',
      alt: 'Чай с травами',
      diet: ['veg', 'vegan', 'gluten', 'local'],
    },
    {
      id: 'dish-mors',
      course: 'drink',
      title: 'Морс из морошки',
      short: 'Свежий морс из северной морошки.',
      price: 300,
      image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=800&auto=format&fit=crop',
      alt: 'Морс из морошки',
      diet: ['veg', 'vegan', 'gluten', 'local'],
    },
  ],
};