/* =========================================================
   Spruce & Sea — данные каталога
   Контракт позиции:
   {
     id, category, subtype, tag, title, short,
     fullDescription,                  // большой текст для «Подробнее»
     gallery: [url, ...],              // доп. картинки для «Подробнее»
     badges: [],
     priceDay, unit: 'сутки',
     image, alt,
     filterTags: [],
     details: [{ title, items?|text? }],
     weakOptions: [{ id, title, price, unit, perGuest? }],
     strongOptions: [{ id, note? }],   // ссылки на другие карточки
     stayDiscount: [{ minDays, percent }],
     comboDiscount: [{ optionId, percent }],  // у родителя — скидка на опцию
     attachedTo: null | id,            // у опции — к какому родителю относится
     isAddon: false | true,
   }
   ========================================================= */
window.SS_DATA = {

  /* =========================================================
     ЖИЛЬЁ (stays) — 4 позиции
     ========================================================= */
  stays: {
    card: 'unified',
    head: {
      eyebrow: 'Жилье у моря',
      title:   'Выберите свой дом среди сосен',
      sub:     'Номера в главном корпусе и приватные коттеджи с террасами и видом на воду.',
    },
    filter: {
      groups: [
        {
          type: 'checkbox',
          name: 'stayType',
          legend: 'Тип размещения',
          options: [
            { value: 'room',    label: 'Номер в отеле' },
            { value: 'cottage', label: 'Коттедж' },
          ],
        },
        {
          type: 'chips',
          name: 'amenity',
          legend: 'Особенности',
          options: [
            { value: 'view-sea',  label: 'Вид на море' },
            { value: 'fireplace', label: 'Камин' },
            { value: 'terrace',   label: 'Терраса' },
            { value: 'kitchen',   label: 'Кухня' },
            { value: 'family',    label: 'Для семьи' },
            { value: 'pets',      label: 'С питомцами' },
          ],
        },
      ],
    },
    items: [

      /* ---------- 1. Номер ---------- */
      {
        id: 'room-forest',
        category: 'stays',
        subtype: 'room',
        tag: 'Номер',
        title: 'Стандарт «Лесной шёпот»',
        short: 'Светлая комната с панорамным окном на вековые сосны. Для пары, ценящей тишину.',
        fullDescription: 'Уютный номер в главном корпусе с панорамным окном во всю стену. По утрам сосны закрывают солнце, и в комнате стоит мягкий зелёный свет. В номере есть всё для короткой поездки: удобная кровать, чайная станция, тёплый пол в душе. Идеально для пары или одного гостя, который хочет тишины и леса за окном.',
        gallery: [
          'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?q=80&w=1200&auto=format&fit=crop',
        ],
        badges: ['👥 3 места', '📏 22 м²', '🌲 Вид на лес', '🚿 Душ'],
        priceDay: 4500,
        unit: 'сутки',
        image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1000&auto=format&fit=crop',
        alt: 'Интерьер номера Лесной шёпот',
        filterTags: ['terrace', 'forest-view'],

        details: [
          { title: 'Состав', items: ['Спальня-гостиная — 3 места', 'Душ', 'Мини-кухня'] },
          { title: 'В номере', text: 'Панорамное окно на сосны, чайная станция, тёплый пол в душе.' },
          { title: 'На территории', text: 'Выход к роще (50 м), общая беседка с мангалом.' },
        ],

        weakOptions: [
          { id: 'breakfast', title: 'Завтрак', price: 800, unit: 'сутки', perGuest: true },
          { id: 'towels',    title: 'Полотенца', price: 300, unit: 'раз' },
        ],
        strongOptions: [],

        stayDiscount: [
          { minDays: 3, percent: 5 },
          { minDays: 7, percent: 15 },
        ],
        comboDiscount: [],

        attachedTo: null,
        isAddon: false,
      },

      {
        id: 'test-overflow',
        category: 'stays',
        subtype: 'cottage',
        tag: 'Тест',
        title: 'Тестовая карточка с очень длинным названием, которое должно обрезаться на второй строке',
        short: 'Это очень длинное краткое описание, которое должно обрезаться на двух строках с многоточием в конце. Оно специально сделано таким длинным, чтобы проверить, как ведёт себя карточка: описание не должно вылезать за пределы отведённой области, не должно толкать теги вниз, не должно перекрывать кнопку «Заказать». Если всё работает правильно, вы увидите ровно две строки текста с троеточием в конце второй строки. = = = = = = = = = = == = = == = = == = = = == ==  == = = == = == = = == == = ==  == == = = == = == = = == = = == = == = = == = == = = = == = =  == ====== == == === = === == === == = ====== ====== == == == ======= ======== == = === ===== ======= == Это очень длинное краткое описание, которое должно обрезаться на двух строках с многоточием в конце. Оно специально сделано таким длинным, чтобы проверить, как ведёт себя карточка: описание не должно вылезать за пределы отведённой области, не должно толкать теги вниз, не должно перекрывать кнопку «Заказать». Если всё работает правильно, вы увидите ровно две строки текста с троеточием в конце второй строки. = = = = = = = = = = == = = == = = == = = = == ==  == = = == = == = = == == = ==  == == = = == = == = = == = = == = == = = == = == = = = == = =  == ====== == == === = === == === == = ====== ====== == == == ======= ======== == = === ===== ======= ==',
        fullDescription: 'Полное описание для модалки. Здесь может быть много текста — оно не влияет на карточку.',
        gallery: [
            'https://images.unsplash.com/photo-1518780664697-55e3ee9d7b82?q=80&w=1200&auto=format&fit=crop',
        ],
        badges: [
            '👥 6 мест', '📏 65 м²', '🔥 Камин', '🌊 Вид на воду',
            '🪑 Терраса', '🍳 Кухня=======================', '🚿 Душ', '🛁 Ванна',
            '🌲 Роща', '🚗 Парковка', '🐶 Питомцы OK', '🧖 Сауна',
            '🎿 Лыжи', '🚴 Велосипед', '🎣 Рыбалка', '🍖 Мангал',
        ],
        priceDay: 12000,
        unit: 'сутки',
        image: 'https://images.unsplash.com/photo-1518780664697-55e3ee9d7b82?q=80&w=1000&auto=format&fit=crop',
        alt: 'Тестовая карточка',
        filterTags: ['fireplace', 'terrace', 'kitchen'],
        details: [
            { title: 'Состав', items: ['Спальня 1 — 2 места', 'Спальня 2 — 2 места', 'Гостиная — 2 места'] },
            { title: 'В доме', text: 'Камин, кухня, терраса.' },
        ],
        weakOptions: [],
        strongOptions: [],
        stayDiscount: [{ minDays: 3, percent: 5 }],
        comboDiscount: [],
        attachedTo: null,
        isAddon: false,
      },

      /* ---------- 2. Номер-люкс ---------- */
      {
        id: 'room-tide',
        category: 'stays',
        subtype: 'room',
        tag: 'Номер Люкс',
        title: 'Полулюкс «Прибой»',
        short: 'Просторный номер с балконом на залив и джакузи с видом на бор.',
        fullDescription: 'Полулюкс на втором этаже главного корпуса. Гостиная зона отделена от спальни лёгкой перегородкой, балкон выходит прямо на Финский залив — закаты здесь особенно хороши. В ванной комнате — джакузи у окна с видом на хвойный бор. Есть фортепиано: если играете — вечером весь корпус будет слушать.',
        gallery: [
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop',
        ],
        badges: ['👥 4 места', '📏 38 м²', '🌊 Вид на море', '🛁 Джакузи'],
        priceDay: 7500,
        unit: 'сутки',
        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1000&auto=format&fit=crop',
        alt: 'Люкс Прибой интерьер',
        filterTags: ['view-sea', 'terrace', 'jacuzzi'],

        details: [
          { title: 'Состав', items: ['Спальня — 2 места', 'Гостиная — 2 места', 'Ванная с джакузи', 'Кухонная ниша'] },
          { title: 'В номере', text: 'Балкон с видом на залив, джакузи, фортепиано, Smart TV 55".' },
          { title: 'На территории', text: 'Выход к морю (120 м), спуск к пляжу.' },
        ],

        weakOptions: [
          { id: 'breakfast', title: 'Завтрак', price: 800, unit: 'сутки', perGuest: true },
          { id: 'late-checkout', title: 'Поздний выезд (до 15:00)', price: 1500, unit: 'раз' },
        ],
        strongOptions: [
          { id: 'massage-pair', note: 'Можно добавить в номер' },
        ],

        stayDiscount: [
          { minDays: 3, percent: 5 },
          { minDays: 7, percent: 15 },
        ],
        comboDiscount: [
          { optionId: 'massage-pair', percent: 10 },
        ],

        attachedTo: null,
        isAddon: false,
      },

      /* ---------- 3. Коттедж ---------- */
      {
        id: 'cottage-spruce',
        category: 'stays',
        subtype: 'cottage',
        tag: 'Коттедж',
        title: 'Домик «Еловая роща»',
        short: 'Отдельный дом с камином и террасой у воды. Кухня, две спальни.',
        fullDescription: 'Отдельный деревянный дом на краю еловой рощи, в 80 метрах от воды. Внутри — настоящий камин, полностью оборудованная кухня и две изолированные спальни. На террасе стоят кресла и маленький стол: хорошо пить кофе и слушать, как шумит лес. На территории домика — финская сауна с отдельным входом: её можно арендовать отдельно, а можно добавить к брони со скидкой.',
        gallery: [
          'https://images.unsplash.com/photo-1518780664697-55e3ee9d7b82?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=1200&auto=format&fit=crop',
        ],
        badges: ['👥 6 мест', '📏 65 м²', '🔥 Камин', '🌊 Вид на воду'],
        priceDay: 12000,
        unit: 'сутки',
        image: 'https://images.unsplash.com/photo-1518780664697-55e3ee9d7b82?q=80&w=1000&auto=format&fit=crop',
        alt: 'Коттедж Еловая роща снаружи',
        filterTags: ['view-sea', 'fireplace', 'terrace', 'kitchen'],

        details: [
          { title: 'Состав', items: ['Спальня 1 — 2 места', 'Спальня 2 — 2 места', 'Гостиная с камином — 2 места', 'Кухня', 'Душ', 'Ванная'] },
          { title: 'В доме', text: 'Настоящий камин, полностью оборудованная кухня, терраса у воды.' },
          { title: 'На территории', text: 'Выход к морю, приватная терраса, мангал. На территории — финская сауна «Пар».' },
        ],

        weakOptions: [
          { id: 'breakfast', title: 'Завтрак', price: 800, unit: 'сутки', perGuest: true },
          { id: 'firewood',  title: 'Дрова для камина', price: 500, unit: 'раз' },
          { id: 'laundry',   title: 'Стирка', price: 500, unit: 'раз' },
        ],
        strongOptions: [
          { id: 'sauna-fin', note: 'На территории домика' },
          { id: 'bike-city', note: 'Для прогулок по лесу' },
        ],

        stayDiscount: [
          { minDays: 3, percent: 5 },
          { minDays: 7, percent: 15 },
        ],
        comboDiscount: [
          { optionId: 'sauna-fin', percent: 20 },
          { optionId: 'bike-city', percent: 10 },
        ],

        attachedTo: null,
        isAddon: false,
      },

      /* ---------- 4. Шале ---------- */
      {
        id: 'chalet-family',
        category: 'stays',
        subtype: 'cottage',
        tag: 'Шале',
        title: 'Шале «Семья»',
        short: 'Большой дом для компании до 9 человек. Детская, второй свет, мангал во дворе.',
        fullDescription: 'Шале на 9 человек — самый просторный дом в нашей усадьбе. Две изолированные спальни, отдельная детская с игрушками, гостиная со вторым светом и большим окном во всю стену. Во дворе — мангал и стол на 8 человек. Можно приезжать с питомцами: для них есть лежанка и миски. На территории — детская площадка и сад с качелями.',
        gallery: [
          'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200&auto=format&fit=crop',
        ],
        badges: ['👥 9 мест', '📏 95 м²', '👨‍👩‍👦 Для семьи', '🐶 Питомцы OK'],
        priceDay: 18000,
        unit: 'сутки',
        image: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?q=80&w=1000&auto=format&fit=crop',
        alt: 'Шале Семья фасад',
        filterTags: ['fireplace', 'kitchen', 'family', 'garden', 'parking', 'pets'],

        details: [
          { title: 'Состав', items: ['Спальня 1 — 2 места', 'Спальня 2 — 2 места', 'Детская — 3 места', 'Гостиная — 2 места', 'Кухня', 'Душ 1', 'Душ 2', 'Ванная'] },
          { title: 'В доме', text: 'Второй свет, детская с игрушками, кухня на 6, мангал во дворе.' },
          { title: 'На территории', text: 'Сад, детская площадка, парковка на 2 авто. Питомцы разрешены.' },
        ],

        weakOptions: [
          { id: 'breakfast', title: 'Завтрак', price: 800, unit: 'сутки', perGuest: true },
          { id: 'firewood',  title: 'Дрова для камина', price: 500, unit: 'раз' },
          { id: 'bbq-kit',   title: 'Набор для барбекю', price: 1200, unit: 'раз' },
          { id: 'pet-fee',   title: 'Размещение с питомцем', price: 500, unit: 'сутки' },
        ],
        strongOptions: [
          { id: 'bath-rus', note: 'Русская баня на территории' },
          { id: 'sup-board', note: 'САП для прогулок по воде' },
        ],

        stayDiscount: [
          { minDays: 3, percent: 5 },
          { minDays: 7, percent: 15 },
        ],
        comboDiscount: [
          { optionId: 'bath-rus', percent: 15 },
          { optionId: 'sup-board', percent: 10 },
        ],

        attachedTo: null,
        isAddon: false,
      },

    ],
  },

  /* =========================================================
     СПА & БАНЯ (spa) — 4 позиции
     ========================================================= */
  spa: {
    card: 'unified',
    head: {
      eyebrow: 'СПА & баня',
      title:   'Тепло, пар и тишина',
      sub:     'Финская сауна, русская баня, купель и массаж — всё посуточно.',
    },
    filter: {
      groups: [
        {
          type: 'checkbox',
          name: 'spaType',
          legend: 'Тип процедуры',
          options: [
            { value: 'sauna',   label: 'Сауна' },
            { value: 'bath',    label: 'Русская баня' },
            { value: 'massage', label: 'Массаж' },
            { value: 'pool',    label: 'Купель' },
          ],
        },
        {
          type: 'chips',
          name: 'spaFeature',
          legend: 'Особенности',
          options: [
            { value: 'group',    label: 'Для компании' },
            { value: 'couple',   label: 'Для двоих' },
            { value: 'aroma',    label: 'Ароматерапия' },
            { value: 'outdoor',  label: 'На улице' },
          ],
        },
      ],
    },
    items: [

      /* ---------- 1. Финская сауна (опция домика) ---------- */
      {
        id: 'sauna-fin',
        category: 'spa',
        subtype: 'sauna',
        tag: 'Сауна',
        title: 'Финская сауна «Пар»',
        short: 'Классическая финская сауна на 6 человек с травяными вениками и купелью.',
        fullDescription: 'Финская сауна на территории коттеджа «Еловая роща», с отдельным входом. Деревянные полки из осины, печь на дровах, травяные веники и купель на террасе. Вмещает до 6 человек. Можно арендовать отдельно — или добавить к брони домика со скидкой 20%. Если домик не забронирован, сауна доступна другим гостям.',
        gallery: [
          'https://images.unsplash.com/photo-1583416750470-965b2707b355?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1200&auto=format&fit=crop',
        ],
        badges: ['👥 До 6 чел.', '🌿 Травы', '🧊 Купель', '🪵 Дрова'],
        priceDay: 2500,
        unit: 'сутки',
        image: 'https://images.unsplash.com/photo-1583416750470-965b2707b355?q=80&w=1000&auto=format&fit=crop',
        alt: 'Финская сауна с деревянными полками',
        filterTags: ['group', 'aroma'],

        details: [
          { title: 'Что входит', items: ['Сауна на день', 'Веники', 'Купель', 'Чай'] },
          { title: 'Расположение', text: 'На территории коттеджа «Еловая роща». Отдельный вход.' },
          { title: 'Важно', text: 'Сауна не входит в стоимость домика. Можно арендовать отдельно или добавить к брони со скидкой.' },
        ],

        weakOptions: [
          { id: 'fresh-brooms', title: 'Свежие веники', price: 400, unit: 'раз' },
          { id: 'firewood',     title: 'Дрова', price: 300, unit: 'раз' },
          { id: 'tea-set',      title: 'Чайный набор', price: 500, unit: 'раз' },
        ],
        strongOptions: [],

        stayDiscount: [
          { minDays: 2, percent: 10 },
        ],
        comboDiscount: [],

        attachedTo: 'cottage-spruce',
        isAddon: true,
      },

      /* ---------- 2. Русская баня (опция шале) ---------- */
      {
        id: 'bath-rus',
        category: 'spa',
        subtype: 'bath',
        tag: 'Баня',
        title: 'Русская баня «Дым»',
        short: 'Баня по-чёрному с берёзовыми вениками, самоваром и ледяной купелью.',
        fullDescription: 'Русская баня по-чёрному на территории шале «Семья». Топится дровами, внутри — берёзовые веники, самовар и ледяная купель во дворе. Вмещает до 8 человек. Хороша для большой компании после долгой прогулки. Можно арендовать отдельно или добавить к брони шале со скидкой 15%.',
        gallery: [
          'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1583416750470-965b2707b355?q=80&w=1200&auto=format&fit=crop',
        ],
        badges: ['👥 До 8 чел.', '🪵 Дрова', '🫖 Самовар', '🧊 Купель'],
        priceDay: 3500,
        unit: 'сутки',
        image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1000&auto=format&fit=crop',
        alt: 'Русская баня с паром',
        filterTags: ['group', 'outdoor'],

        details: [
          { title: 'Что входит', items: ['Баня на день', 'Веники', 'Самовар', 'Купель'] },
          { title: 'Расположение', text: 'На территории шале «Семья». Отдельный вход.' },
          { title: 'Важно', text: 'Баня не входит в стоимость шале. Можно арендовать отдельно.' },
        ],

        weakOptions: [
          { id: 'fresh-brooms', title: 'Свежие веники', price: 400, unit: 'раз' },
          { id: 'firewood',     title: 'Дрова', price: 300, unit: 'раз' },
        ],
        strongOptions: [],

        stayDiscount: [
          { minDays: 2, percent: 10 },
        ],
        comboDiscount: [],

        attachedTo: 'chalet-family',
        isAddon: true,
      },

      /* ---------- 3. Массаж для двоих ---------- */
      {
        id: 'massage-pair',
        category: 'spa',
        subtype: 'massage',
        tag: 'Массаж',
        title: 'Массаж для двоих «Тишина»',
        short: 'Расслабляющий массаж в паре с аромамаслами пихты и лаванды.',
        fullDescription: 'Массаж для двоих в отдельном кабинете с приглушённым светом и свечами. Аромамасла пихты и лаванды, тёплые полотенца, чай после. Два массажиста работают одновременно — не нужно ждать друг друга. Кабинет находится в главном корпусе; можно добавить к брони номера со скидкой 10%.',
        gallery: [
          'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1600334129128-685c5582fd35?q=80&w=1200&auto=format&fit=crop',
        ],
        badges: ['👥 Для двоих', '🌿 Аромамасла', '🕯 Свечи', '🍵 Чай'],
        priceDay: 4000,
        unit: 'сутки',
        image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1000&auto=format&fit=crop',
        alt: 'Массаж для двоих',
        filterTags: ['couple', 'aroma'],

        details: [
          { title: 'Что входит', items: ['Массаж для двоих', 'Аромамасла', 'Чай', 'Тёплые полотенца'] },
          { title: 'Расположение', text: 'Главный корпус, отдельный кабинет.' },
        ],

        weakOptions: [
          { id: 'extra-oil', title: 'Дополнительное масло', price: 500, unit: 'раз' },
        ],
        strongOptions: [],

        stayDiscount: [
          { minDays: 2, percent: 10 },
        ],
        comboDiscount: [],

        attachedTo: null,
        isAddon: true,
      },

      /* ---------- 4. Купель на улице ---------- */
      {
        id: 'pool-outdoor',
        category: 'spa',
        subtype: 'pool',
        tag: 'Купель',
        title: 'Купель на улице «Лёд»',
        short: 'Ледяная купель под открытым небом — после сауны или бани.',
        fullDescription: 'Купель под открытым небом на территории усадьбы. Ледяная вода круглый год, деревянный настил, вид на сосны. Вмещает до 4 человек. Можно арендовать отдельно или добавить к сауне/бане — но скидка совместимости действует только при добавлении из карточки сауны или бани.',
        gallery: [
          'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1200&auto=format&fit=crop',
        ],
        badges: ['👥 До 4 чел.', '🧊 Ледяная вода', '🌲 Вид на лес'],
        priceDay: 1500,
        unit: 'сутки',
        image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1000&auto=format&fit=crop',
        alt: 'Купель под открытым небом',
        filterTags: ['outdoor', 'group'],

        details: [
          { title: 'Что входит', items: ['Купель на день', 'Полотенца', 'Халаты'] },
          { title: 'Расположение', text: 'Территория усадьбы, рядом с сауной и баней.' },
        ],

        weakOptions: [
          { id: 'towels', title: 'Полотенца', price: 300, unit: 'раз' },
          { id: 'robes',  title: 'Халаты', price: 500, unit: 'раз' },
        ],
        strongOptions: [],

        stayDiscount: [
          { minDays: 2, percent: 10 },
        ],
        comboDiscount: [],

        attachedTo: null,
        isAddon: true,
      },

    ],
  },

  /* =========================================================
     ВЕЛОСИПЕДЫ & САПЫ (bikes) — 4 позиции
     ========================================================= */
  bikes: {
    card: 'unified',
    head: {
      eyebrow: 'Велосипеды & сапы',
      title:   'Активный отдых у воды',
      sub:     'Прокат для прогулок по лесным тропам и вдоль берега — посуточно.',
    },
    filter: {
      groups: [
        {
          type: 'checkbox',
          name: 'bikeType',
          legend: 'Что берём',
          options: [
            { value: 'bike', label: 'Велосипед' },
            { value: 'sup',  label: 'САП' },
          ],
        },
        {
          type: 'chips',
          name: 'bikeFeature',
          legend: 'Особенности',
          options: [
            { value: 'kids',     label: 'Детский' },
            { value: 'electric', label: 'Электро' },
            { value: 'helmet',   label: 'Шлем в комплекте' },
            { value: 'vest',     label: 'Спасжилет' },
          ],
        },
      ],
    },
    items: [

      /* ---------- 1. Городской велосипед (опция домика) ---------- */
      {
        id: 'bike-city',
        category: 'bikes',
        subtype: 'bike',
        tag: 'Велосипед',
        title: 'Городской велосипед',
        short: 'Прогулочный велосипед с корзиной и мягким седлом. Для неспешных поездок.',
        fullDescription: 'Прогулочный велосипед с корзиной, мягким седлом и семью скоростями. Подходит для лесных троп и берега. В комплекте шлем и замок. Можно взять на день или добавить к брони коттеджа «Еловая роща» со скидкой 10%.',
        gallery: [
          'https://images.unsplash.com/photo-1502744688674-c619d1586c9e?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1571068316344-75bc76f77890?q=80&w=1200&auto=format&fit=crop',
        ],
        badges: ['⚙️ 7 скоростей', '👤 1 место', '🧺 Корзина', '🪖 Шлем'],
        priceDay: 500,
        unit: 'сутки',
        image: 'https://images.unsplash.com/photo-1502744688674-c619d1586c9e?q=80&w=1000&auto=format&fit=crop',
        alt: 'Городской велосипед с корзиной',
        filterTags: ['helmet'],

        details: [
          { title: 'Что входит', items: ['Велосипед', 'Шлем', 'Замок', 'Корзина'] },
          { title: 'Подходит для', text: 'Лесных троп и берега. Не для горных маршрутов.' },
        ],

        weakOptions: [
          { id: 'kids-seat', title: 'Детское кресло', price: 300, unit: 'сутки' },
          { id: 'basket-extra', title: 'Доп. корзина', price: 200, unit: 'раз' },
        ],
        strongOptions: [],

        stayDiscount: [
          { minDays: 2, percent: 10 },
        ],
        comboDiscount: [],

        attachedTo: 'cottage-spruce',
        isAddon: true,
      },

      /* ---------- 2. Электровелосипед ---------- */
      {
        id: 'bike-electric',
        category: 'bikes',
        subtype: 'bike',
        tag: 'Велосипед',
        title: 'Электровелосипед «Тропа»',
        short: 'Мощный электровелосипед для длинных маршрутов. Батарея на 60 км.',
        fullDescription: 'Электровелосипед с ассистентом до 25 км/ч и батареей на 60 км. Подходит для длинных маршрутов по лесу и вдоль берега. В комплекте шлем, замок и зарядное устройство. Можно взять на день.',
        gallery: [
          'https://images.unsplash.com/photo-1571068316344-75bc76f77890?q=80&w=1200&auto=format&fit=crop',
        ],
        badges: ['⚡ Электро', '🔋 60 км', '👤 1 место', '🪖 Шлем'],
        priceDay: 1200,
        unit: 'сутки',
        image: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?q=80&w=1000&auto=format&fit=crop',
        alt: 'Электровелосипед на лесной тропе',
        filterTags: ['electric', 'helmet'],

        details: [
          { title: 'Что входит', items: ['Электровелосипед', 'Шлем', 'Замок', 'Зарядное'] },
          { title: 'Подходит для', text: 'Длинных маршрутов, лесных троп, берега.' },
        ],

        weakOptions: [
          { id: 'helmet-extra', title: 'Доп. шлем', price: 200, unit: 'раз' },
        ],
        strongOptions: [],

        stayDiscount: [
          { minDays: 2, percent: 10 },
        ],
        comboDiscount: [],

        attachedTo: null,
        isAddon: true,
      },

      /* ---------- 3. САП-борд (опция шале) ---------- */
      {
        id: 'sup-board',
        category: 'bikes',
        subtype: 'sup',
        tag: 'САП',
        title: 'САП-борд «Волна»',
        short: 'Надувной САП 10\'6" с веслом и насосом. Устойчив на спокойной воде.',
        fullDescription: 'Надувной САП-борд 10\'6" с веслом, насосом и чехлом. Устойчив на спокойной воде, подходит новичкам. В комплекте спасжилет. Можно взять на день или добавить к брони шале «Семья» со скидкой 10%.',
        gallery: [
                    'https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=1200&auto=format&fit=crop',
        ],
        badges: ['📏 10\'6"', '👤 1 место', '🦺 Жилет', '🎒 Чехол'],
        priceDay: 800,
        unit: 'сутки',
        image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=1000&auto=format&fit=crop',
        alt: 'САП-борд на воде',
        filterTags: ['vest'],

        details: [
          { title: 'Что входит', items: ['САП-борд', 'Весло', 'Насос', 'Чехол', 'Спасжилет'] },
          { title: 'Подходит для', text: 'Спокойной воды, новичков и опытных.' },
        ],

        weakOptions: [
          { id: 'dry-bag', title: 'Гермомешок', price: 300, unit: 'раз' },
          { id: 'leash',   title: 'Страховочный лиш', price: 200, unit: 'раз' },
        ],
        strongOptions: [],

        stayDiscount: [
          { minDays: 2, percent: 10 },
        ],
        comboDiscount: [],

        attachedTo: 'chalet-family',
        isAddon: true,
      },

      /* ---------- 4. Детский САП ---------- */
      {
        id: 'sup-kids',
        category: 'bikes',
        subtype: 'sup',
        tag: 'САП',
        title: 'Детский САП «Лягушонок»',
        short: 'Маленький устойчивый борд для детей 6–12 лет. Детский жилет и короткое весло.',
        fullDescription: 'Детский надувной САП 8\' для детей 6–12 лет. Устойчивый, с коротким веслом и детским спасжилетом. Родителям можно взять взрослый САП рядом — на воде удобно держаться вместе. Можно взять на день.',
        gallery: [
          'https://images.unsplash.com/photo-1530549387789-4c1017266635?q=80&w=1200&auto=format&fit=crop',
        ],
        badges: ['📏 8\'', '👤 1 ребёнок', '🦺 Детский жилет', '🎒 Чехол'],
        priceDay: 600,
        unit: 'сутки',
        image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?q=80&w=1000&auto=format&fit=crop',
        alt: 'Детский САП-борд',
        filterTags: ['kids', 'vest'],

        details: [
          { title: 'Что входит', items: ['Детский САП', 'Короткое весло', 'Детский жилет', 'Чехол'] },
          { title: 'Подходит для', text: 'Детей 6–12 лет, спокойной воды.' },
        ],

        weakOptions: [
          { id: 'dry-bag', title: 'Гермомешок', price: 300, unit: 'раз' },
        ],
        strongOptions: [],

        stayDiscount: [
          { minDays: 2, percent: 10 },
        ],
        comboDiscount: [],

        attachedTo: null,
        isAddon: true,
      },

    ],
  },

};