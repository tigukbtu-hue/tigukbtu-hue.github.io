// ============================================================
//  МЕНЮ «ВОСТОЧКИ» — цены в тенге
//  Чтобы поменять цену, исправьте число после price:
//  Чтобы убрать блюдо — удалите его строку целиком.
//  id — внутреннее имя блюда (латиницей, не повторяться).
//  note — мелкая подпись (вес, штуки), preorder: true — «на заказ».
//  img — фото блюда, свой файл: 'img/plov.webp?2' (удобно через tools/photos.py).
//        Нет фото — блюдо показывается строкой без картинки.
//  cartName — как блюдо называется в корзине и в WhatsApp (если отличается).
// ============================================================

window.MENU = [
  {
    id: 'desserts', title: 'Торты и десерты', nav: 'Торты',
    items: [
      // цена 5000 — временная, поменяйте на настоящую
      { id: 'berry-cake', name: 'Торт с ягодами', price: 5000, img: 'img/g-berrycake.webp?2', emoji: '🎂' },
      { id: 'fruit-cake', name: 'Торт с фруктами', price: 5000, img: 'img/g-custom-cake.webp?2', emoji: '🎂' },
      { id: 'maracuja', name: 'Маракуйя чизкейк', price: 5000, img: 'img/g-maracuja.webp?2', emoji: '🍰' },
      { id: 'snickers-roll', name: 'Рулет «Сникерс»', price: 5000, img: 'img/g-snickers.webp?2', emoji: '🍫' },
      { id: 'meringue-roll', name: 'Меренговый рулет', price: 5000, img: 'img/g-meringue.webp?2', emoji: '🍰' },
      { id: 'tartlets-fruit', name: 'Тарталетки с фруктами', price: 5000, img: 'img/g-tart-fruit.webp?2', emoji: '🧁' },
      { id: 'tartlets-berry', name: 'Тарталетки с ягодами', price: 5000, img: 'img/g-tart-berries.webp?2', emoji: '🧁' },
      { id: 'tort-med-slice', name: 'Медовый торт', note: 'кусок', price: 900, img: 'img/medovik.webp?2' },
      { id: 'whoopie-slice', name: 'Вупи пай', note: 'кусок', price: 900 },
      { id: 'banoffee', name: 'Баноффи пай', note: 'кусок', price: 550, img: 'img/banoffee.webp?2' },
      { id: 'brownie', name: 'Брауни', price: 550, emoji: '🍫' },
      { id: 'tvorozhny', name: 'Творожный торт', note: 'кусок', price: 550, img: 'img/spanish.webp?2', emoji: '🍰' },
      { id: 'tort-med-whole', name: 'Медовый торт целиком', price: 8000, img: 'img/medovik.webp?2', preorder: true },
      { id: 'whoopie-whole', name: 'Вупи пай целиком', price: 8000, preorder: true },
      { id: 'bliny-plain', name: 'Блины без начинки', note: '3 шт.', price: 200, emoji: '🥞' },
      { id: 'bliny-tvorog', name: 'Блин с творогом', note: '1 шт.', price: 300, emoji: '🥞' },
      { id: 'bliny-sgush', name: 'Блин со сгущёнкой', note: '1 шт.', price: 250, emoji: '🥞' },
    ],
  },
  {
    id: 'trays', title: 'Наборы к столу', nav: 'Наборы',
    items: [
      { id: 'tray-cheburek', name: 'Чебуреки', note: 'набор', price: 4500, emoji: '🥟' },
      { id: 'tray-bliny', name: 'Блины', note: 'набор', price: 4500, img: 'img/blinchiki.webp?2', emoji: '🥞' },
      { id: 'tray-tvorog', name: 'Пирог творожный', note: 'набор', price: 4500, img: 'img/cheesecake.webp?2', emoji: '🥧' },
      { id: 'tray-brownie', name: 'Брауни', note: 'набор', price: 4500, emoji: '🍫' },
      { id: 'tray-mak', name: 'Пирог маковый', note: 'набор', price: 4500, img: 'img/poppy.webp?2', emoji: '🥧' },
      { id: 'tea-pies', name: 'Пироги к чаю', note: 'набор', price: 5000, img: 'img/g-tea-pies.webp?2', emoji: '🥧' },
      { id: 'set-zhanuya', name: 'Сет «Жанұя»', note: '7 лепёшек, 3 қаттама, 14 самсы, 2 пирога, 12 блинчиков, 15 сочников, 20 орешков, 1 кг бауырсаков', price: 5000, img: 'img/g-boxes.webp?2', emoji: '🧺' },
    ],
  },
  {
    id: 'bakery', title: 'Выпечка', nav: 'Выпечка',
    items: [
      { id: 'samsa-meat', name: 'Самса с мясом', price: 350, img: 'img/samsa.webp?2' },
      { id: 'samsa-chicken', name: 'Самса с курицей', price: 350, img: 'img/samsa.webp?2' },
      { id: 'samsa-cheese', name: 'Самса с сыром', price: 350, img: 'img/samsa.webp?2' },
      { id: 'cheburek', name: 'Чебурек', price: 200, emoji: '🥟' },
      { id: 'bauyrsak', name: 'Бауырсаки', note: '1 кг', price: 2300, img: 'img/bauyrsak.webp?2', preorder: true },
      { id: 'lepeshki', name: 'Лепёшки и қаттама', note: 'набор', price: 5000, img: 'img/g-lepeshki.webp?2', emoji: '🫓' },
    ],
  },
  {
    id: 'hot', title: 'Плов и манты', nav: 'Плов и манты', lead: 'Отправим горячими, в коробках',
    items: [
      { id: 'plov', name: 'Плов ташкентский', price: 1500 },
      { id: 'manty', name: 'Манты', price: 1500, emoji: '🥟' },
    ],
  },
  {
    id: 'breakfast', title: 'Завтраки', nav: 'Завтраки', layout: 'list',
    group: 'Столовая', groupNote: 'Обеды, супы, шашлык и напитки',
    items: [
      { id: 'combo-breakfast', name: 'Комбо-завтрак', note: 'Фуршетный стол', price: 1200, emoji: '🍳', highlight: true },
      { id: 'kasha', name: 'Каша рисовая', price: 700, emoji: '🥣' },
      { id: 'egg', name: 'Яйцо с сосиской', price: 700, emoji: '🍳' },
    ],
  },
  {
    id: 'first', title: 'Первые блюда', nav: 'Первые', layout: 'list',
    items: [
      { id: 'shorpa', name: 'Шорпа', price: 1200, emoji: '🍲' },
      { id: 'naryn', name: 'Нарын', price: 1500, emoji: '🍜' },
      { id: 'pelmeni', name: 'Пельмени', price: 1250, emoji: '🥟' },
      { id: 'mashkhorda', name: 'Машхорда', price: 1200, emoji: '🍲' },
      { id: 'lagman-soup', name: 'Лагман жидкий', price: 1300, emoji: '🍜' },
    ],
  },
  {
    id: 'second', title: 'Вторые блюда', nav: 'Вторые', layout: 'list',
    items: [
      { id: 'bowl', name: 'Боул с курицей', price: 1500 },
      { id: 'lagman-fried', name: 'Лагман жареный', price: 1500, emoji: '🍝' },
      { id: 'lagman-guiru', name: 'Лагман гуйру', price: 1500, emoji: '🍝' },
      { id: 'kuyrdak', name: 'Куырдак', price: 2400, emoji: '🥘' },
      { id: 'kotlety', name: 'Котлеты с гарниром', price: 1500, emoji: '🍽️' },
      { id: 'bifshteks', name: 'Бифштекс', price: 1500, emoji: '🥩' },
      { id: 'brizol', name: 'Бризоль', price: 1600, emoji: '🍳' },
      { id: 'gulyash', name: 'Гуляш', price: 1500, emoji: '🍛' },
    ],
  },
  {
    id: 'shashlik', title: 'Шашлыки', nav: 'Шашлыки', layout: 'list',
    items: [
      { id: 'shashlik-lamb', name: 'Шашлык из баранины', price: 1400 },
      { id: 'shashlik-chicken', name: 'Шашлык из окорочков', price: 1000, emoji: '🍢' },
      { id: 'lulya', name: 'Люля-кебаб', price: 1000, emoji: '🍢' },
    ],
  },
  {
    id: 'garnish', title: 'Гарниры', nav: 'Гарниры', layout: 'list',
    items: [
      { id: 'pure', name: 'Пюре', price: 500, emoji: '🥔' },
      { id: 'ris', name: 'Рис', price: 500, emoji: '🍚' },
      { id: 'grechka', name: 'Гречка', price: 500, emoji: '🌾' },
      { id: 'makarony', name: 'Макароны', price: 500, emoji: '🍝' },
      { id: 'fri', name: 'Картофель фри', price: 600, emoji: '🍟' },
    ],
  },
  {
    id: 'salads', title: 'Салаты', nav: 'Салаты', layout: 'list',
    items: [
      { id: 'salad-fresh', name: 'Салат «Свежий»', price: 700 },
      { id: 'achuchuk', name: 'Салат «Ачучук»', price: 700, emoji: '🍅' },
      { id: 'kapusta', name: 'Квашеная капуста', price: 700, emoji: '🥬' },
    ],
  },
  {
    id: 'drinks', title: 'Напитки', nav: 'Напитки', layout: 'list', hidden: true, // скрыто: нужно только для комбо
    items: [
      { id: 'kompot', name: 'Компот', note: '0,5 л', price: 700, emoji: '🍹' },
      { id: 'tea-black', name: 'Чай чёрный', price: 200, emoji: '🫖' },
      { id: 'tea-green', name: 'Чай зелёный', price: 200, emoji: '🍵' },
      { id: 'tea-lemon', name: 'Чай с лимоном', price: 250, emoji: '🍋' },
      { id: 'tea-milk', name: 'Чай с молоком', price: 250, emoji: '🥛' },
      { id: 'coffee', name: 'Кофе 3 в 1', price: 250, emoji: '☕' },
      // Чай ташкентский — в меню нет цены. Впишите цену и уберите // в начале строки:
      // { id: 'tea-tashkent', name: 'Чай ташкентский', price: 0, emoji: '🫖' },
      { id: 'maxi-tea', name: 'Макси чай', price: 700, emoji: '🧃' },
      { id: 'fuse-tea', name: 'Фьюс чай', price: 700, emoji: '🧃' },
      { id: 'cola', name: 'Кола', price: 700, emoji: '🥤' },
      { id: 'pepsi', name: 'Пепси', price: 700, emoji: '🥤' },
    ],
  },
];

// Комбо: первое + второе + напиток за одну цену
window.COMBO = {
  price: 1800,
  title: 'Комбо-обед',
  subtitle: 'Первое + второе + чай или компот',
  groups: [
    { key: 'first', label: 'Первое блюдо', options: ['shorpa', 'mashkhorda', 'pelmeni', 'naryn'] },
    { key: 'second', label: 'Второе блюдо', options: ['gulyash', 'bifshteks', 'manty', 'plov'] },
    { key: 'drink', label: 'Напиток', options: ['tea-black', 'kompot'] },
  ],
};

// Сеты: цена считается сама из цен блюд минус скидка (discount: 0.10 = 10%),
// округляется до 100 ₸. ЧЕРНОВИК — проверьте состав и скидки.
window.SETS = [
  {
    id: 'family', title: 'Семейный ужин', serves: 'на 4 человек', discount: 0.10,
    items: [['plov', 4], ['salad-fresh', 2], ['samsa-meat', 4]],
  },
  {
    id: 'shashlik', title: 'Шашлычный', serves: 'на 4–5 человек', discount: 0.10,
    items: [['shashlik-lamb', 4], ['lulya', 4], ['shashlik-chicken', 2], ['achuchuk', 2], ['fri', 2]],
  },
  {
    id: 'tea', title: 'К чаю для гостей', serves: 'на 6–8 человек', image: 'img/bauyrsak.webp?2', discount: 0.10,
    items: [['bauyrsak', 1], ['samsa-meat', 6], ['brownie', 2], ['tvorozhny', 2]],
  },
];

// «Добавить к заказу?» — подсказки в корзине
window.UPSELL = ['berry-cake', 'fruit-cake', 'tort-med-whole', 'maracuja', 'snickers-roll', 'set-zhanuya', 'tray-mak', 'tray-tvorog', 'meringue-roll', 'tartlets-fruit'];

// ============================================================
//  «НАКРЫТЬ СТОЛ» — конструктор стола для мероприятий
//  Клиент выбирает блюда и количество — сайт считает полный чек.
//  id   — блюдо из меню выше (цена и фото берутся оттуда автоматически)
//  unit — единица в чеке: 'порц.', 'шт.', 'кг'
//  name — другое название для стола (если нужно)
// ============================================================
window.EVENT_MENU = [
  {
    id: 'hot', title: 'Горячие блюда', nav: 'Горячее',
    items: [
      { id: 'plov', unit: 'порц.' },
      { id: 'manty', unit: 'порц.' },
      { id: 'kuyrdak', unit: 'порц.' },
      { id: 'lagman-fried', unit: 'порц.' },
      { id: 'lagman-guiru', unit: 'порц.' },
      { id: 'gulyash', unit: 'порц.' },
      { id: 'bifshteks', unit: 'порц.' },
      { id: 'brizol', unit: 'порц.' },
      { id: 'kotlety', unit: 'порц.' },
    ],
  },
  {
    id: 'grill', title: 'Шашлык', nav: 'Шашлык',
    items: [
      { id: 'shashlik-lamb', unit: 'порц.' },
      { id: 'shashlik-chicken', unit: 'порц.' },
      { id: 'lulya', unit: 'порц.' },
    ],
  },
  {
    id: 'soup', title: 'Первые блюда', nav: 'Первые',
    items: [
      { id: 'naryn', unit: 'порц.' },
      { id: 'shorpa', unit: 'порц.' },
      { id: 'mashkhorda', unit: 'порц.' },
      { id: 'pelmeni', unit: 'порц.' },
      { id: 'lagman-soup', unit: 'порц.' },
    ],
  },
  {
    id: 'salad', title: 'Салаты и гарниры', nav: 'Салаты',
    items: [
      { id: 'salad-fresh', unit: 'порц.' },
      { id: 'achuchuk', unit: 'порц.' },
      { id: 'kapusta', unit: 'порц.' },
      { id: 'ris', unit: 'порц.' },
      { id: 'pure', unit: 'порц.' },
      { id: 'grechka', unit: 'порц.' },
      { id: 'makarony', unit: 'порц.' },
      { id: 'fri', unit: 'порц.' },
    ],
  },
  {
    id: 'bake', title: 'Выпечка', nav: 'Выпечка',
    items: [
      { id: 'samsa-meat', unit: 'шт.' },
      { id: 'samsa-chicken', unit: 'шт.' },
      { id: 'samsa-cheese', unit: 'шт.' },
      { id: 'cheburek', unit: 'шт.' },
      { id: 'bauyrsak', unit: 'кг', note: '' },
      { id: 'lepeshki', name: 'Лепёшки и қаттама — набор', unit: 'шт.', note: '' },
      { id: 'set-zhanuya', unit: 'шт.', note: '' },
      { id: 'tea-pies', name: 'Пироги к чаю — набор', unit: 'шт.', note: '' },
      { id: 'tray-cheburek', name: 'Чебуреки — набор', unit: 'шт.', note: '' },
      { id: 'tray-bliny', name: 'Блины — набор', unit: 'шт.', note: '' },
    ],
  },
  {
    id: 'sweet', title: 'Торты и десерты', nav: 'Торты',
    items: [
      { id: 'tort-med-whole', unit: 'шт.' },
      { id: 'whoopie-whole', unit: 'шт.' },
      { id: 'tort-med-slice', name: 'Медовый торт, кусок', unit: 'шт.', note: '' },
      { id: 'whoopie-slice', name: 'Вупи пай, кусок', unit: 'шт.', note: '' },
      { id: 'tvorozhny', name: 'Творожный торт, кусок', unit: 'шт.', note: '' },
      { id: 'banoffee', name: 'Баноффи пай, кусок', unit: 'шт.', note: '' },
      { id: 'brownie', unit: 'шт.' },
      { id: 'tray-tvorog', name: 'Пирог творожный — набор', unit: 'шт.', note: '' },
      { id: 'tray-brownie', name: 'Брауни — набор', unit: 'шт.', note: '' },
      { id: 'tray-mak', name: 'Пирог маковый — набор', unit: 'шт.', note: '' },
      { id: 'berry-cake', unit: 'шт.' },
      { id: 'fruit-cake', unit: 'шт.' },
      { id: 'maracuja', unit: 'шт.' },
      { id: 'snickers-roll', unit: 'шт.' },
      { id: 'meringue-roll', unit: 'шт.' },
      { id: 'tartlets-fruit', unit: 'шт.' },
      { id: 'tartlets-berry', unit: 'шт.' },
    ],
  },
];

// Готовые столы на разное число гостей. Клиент может взять готовый и поменять,
// а может собрать свой стол сам. ЧЕРНОВИК — проверьте состав и количество.
// guests — на сколько гостей; items — [id блюда из меню, количество]
window.EVENT_SETS = [
  { guests: 10, items: [['plov', 10], ['salad-fresh', 5], ['achuchuk', 5], ['samsa-meat', 10], ['bauyrsak', 1], ['tort-med-whole', 1]] },
  { guests: 20, items: [['plov', 20], ['salad-fresh', 10], ['achuchuk', 10], ['samsa-meat', 20], ['bauyrsak', 2], ['tort-med-whole', 2]] },
  { guests: 30, items: [['plov', 30], ['salad-fresh', 15], ['achuchuk', 15], ['samsa-meat', 30], ['bauyrsak', 3], ['tort-med-whole', 3]] },
  { guests: 50, items: [['plov', 50], ['salad-fresh', 25], ['achuchuk', 25], ['samsa-meat', 50], ['bauyrsak', 5], ['tort-med-whole', 5]] },
  { guests: 100, items: [['plov', 100], ['salad-fresh', 50], ['achuchuk', 50], ['samsa-meat', 100], ['bauyrsak', 10], ['tort-med-whole', 9]] },
];

// Как получить стол — клиент выбирает один вариант (первый — по умолчанию).
// price — текст вместо цены (в итог не входит). address: true — спрашиваем адрес.
// time — как подписать поле времени.
window.EVENT_SERVICES = [
  { id: 'serve', emoji: '🍽️', title: 'Привезём и накроем стол', sub: 'Привезём, расставим и красиво накроем', price: 'по договорённости', address: true, time: 'Во сколько накрыть' },
  { id: 'delivery', emoji: '🚚', title: 'Только доставка', sub: 'Яндекс Доставкой к нужному времени', price: 'по тарифу', address: true, time: 'К какому времени привезти' },
  { id: 'pickup', emoji: '🛍️', title: 'Заберу сам', sub: '', price: '', address: false, time: 'Когда заберёте' },
];

// ============================================================
//  ПОД ЗАКАЗ — блюда с фото, но без цены. На сайте у них кнопка «Узнать цену» (WhatsApp).
//  Когда будет цена — перенесите блюдо в меню выше и впишите price:.
// ============================================================
window.ON_ORDER = [
  // { name: 'Название', img: 'img/фото.webp?2', note: 'необязательно' },
];

// Фото накрытых столов — на вкладке «Накрыть стол» (нажатием открываются крупно)
window.TABLE_PHOTOS = ['img/t-spread.webp?2', 'img/t-cakes.webp?2', 'img/t-roses.webp?2'];

// Отзывы клиентов — только настоящие (этот — из Instagram)
window.REVIEWS = [
  {
    text: 'Заказываю уже второй раз, очень вкусно, а самое главное — по-домашнему. Баурсаки, лепёшки, выпечка во рту тают. ' +
      'Салаты тоже топ, особенно понравилась заправка. Экономия сил, времени и денег. Цены адекватные, качество супер.',
    author: 'Дина', source: 'отзыв в Instagram',
  },
];

// ============================================================
//  ОПИСАНИЯ БЛЮД — показываются, когда клиент нажимает на блюдо.
//  Это черновик: поправьте под свой рецепт. Нет строки — описания не будет.
// ============================================================
window.DESC = {
  // торты и десерты
  'berry-cake': 'Нежный торт в сливочном креме, сверху свежая клубника, голубика и черешня.',
  'fruit-cake': 'Торт в белом креме с шоколадными подтёками, киви и ягодами. Нужна надпись — напишите её в комментарии к заказу.',
  'maracuja': 'Сливочный чизкейк на песочной основе, сверху соус из маракуйи.',
  'snickers-roll': 'Шоколадный бисквитный рулет с кремом, глазурью и арахисом, украшен клубникой.',
  'meringue-roll': 'Воздушный рулет из безе с нежным кремом и голубикой.',
  'tartlets-fruit': 'Песочные тарталетки с кремом, манго, киви и клубникой.',
  'tartlets-berry': 'Песочные тарталетки с кремом, малиной и ежевикой.',
  'tort-med-slice': 'Медовик: тонкие медовые коржи с нежным кремом. Кусок.',
  'tort-med-whole': 'Медовик целиком: тонкие медовые коржи с нежным кремом. Готовим на заказ.',
  'whoopie-slice': 'Вупи пай: мягкие шоколадные коржи с кремовой прослойкой. Кусок.',
  'whoopie-whole': 'Вупи пай целиком: мягкие шоколадные коржи с кремовой прослойкой. Готовим на заказ.',
  'banoffee': 'Баноффи пай: песочная основа, банан, карамель и взбитые сливки. Кусок.',
  'brownie': 'Шоколадный брауни.',
  'tvorozhny': 'Творожный торт (чизкейк) с клубникой. Кусок.',
  'bliny-tvorog': 'Блин, свёрнутый с творожной начинкой.',
  'bliny-sgush': 'Блин со сгущёнкой.',
  // наборы к столу
  'tray-cheburek': 'Набор чебуреков к столу.',
  'tray-bliny': 'Набор блинчиков с начинкой, свёрнутых конвертиками.',
  'tray-tvorog': 'Творожный пирог на песочном тесте с клубникой.',
  'tray-brownie': 'Набор шоколадных брауни.',
  'tray-mak': 'Маковый пирог с воздушным безе и орехами.',
  'tea-pies': 'Пироги к чаю — набор. Состав уточним в WhatsApp.',
  'set-zhanuya': 'Семейный набор домашней выпечки: лепёшки, қаттама, самса, пироги, блинчики, сочники, орешки и бауырсаки.',
  // выпечка
  'samsa-meat': 'Самса из слоёного теста с мясом, с кунжутом.',
  'samsa-chicken': 'Самса из слоёного теста с курицей.',
  'samsa-cheese': 'Самса из слоёного теста с сыром.',
  'cheburek': 'Хрустящий чебурек с мясной начинкой.',
  'bauyrsak': 'Пышные домашние бауырсаки, 1 кг. Готовим на заказ.',
  'lepeshki': 'Домашние лепёшки и слоёная қаттама — набор.',
  // плов и манты
  'plov': 'Ташкентский плов: рис, мясо и морковь, приготовленные в казане.',
  'manty': 'Манты на пару с мясной начинкой.',
  // столовая
  'combo-breakfast': 'Комбо-завтрак (фуршетный стол). Состав уточним в WhatsApp.',
  'kasha': 'Рисовая каша.',
  'shorpa': 'Шорпа — наваристый мясной бульон с мясом и овощами.',
  'naryn': 'Нарын — тонкая домашняя лапша с мясом.',
  'pelmeni': 'Пельмени с мясом в бульоне.',
  'mashkhorda': 'Машхорда — густой суп из маша с рисом и мясом.',
  'lagman-soup': 'Лагман с бульоном: тянутая лапша, мясо и овощи.',
  'bowl': 'Боул с курицей.',
  'lagman-fried': 'Жареный лагман: тянутая лапша, обжаренная с мясом и овощами.',
  'lagman-guiru': 'Гуйру лагман: лапша с мясом и овощами в густом соусе.',
  'kuyrdak': 'Куырдак — казахское жаркое из мяса с луком.',
  'bifshteks': 'Бифштекс — мясная котлета, обжаренная на сковороде.',
  'brizol': 'Бризоль — мясо, обжаренное в яйце.',
  'gulyash': 'Гуляш — тушёное мясо в соусе.',
  'shashlik-lamb': 'Шашлык из баранины на мангале.',
  'shashlik-chicken': 'Шашлык из куриных окорочков на мангале.',
  'lulya': 'Люля-кебаб из рубленого мяса на мангале.',
  'salad-fresh': 'Свежие помидоры и огурцы.',
  'achuchuk': 'Ачучук — помидоры с луком.',
  'kompot': 'Компот, 0,5 л.',
  'coffee': 'Кофе 3 в 1.',
};
