// ============================================================
//  МЕНЮ «ВОСТОЧКИ» — цены в тенге
//  Чтобы поменять цену, исправьте число после price:
//  Чтобы убрать блюдо — удалите его строку целиком.
//  id — внутреннее имя блюда (латиницей, не повторяться).
//  note — мелкая подпись (вес, штуки), preorder: true — «на заказ».
//  img — фото блюда: PH('ключ') — фото для примера из photos.js, или свой файл 'img/plov.jpg'.
//        emoji — значок, если фото нет или оно не загрузилось.
//  cartName — как блюдо называется в корзине и в WhatsApp (если отличается).
// ============================================================

window.MENU = [
  {
    id: 'breakfast', title: 'Завтраки', nav: 'Завтраки',
    items: [
      { id: 'combo-breakfast', name: 'Комбо-завтрак', note: 'Фуршетный стол', price: 1200, img: PH('breakfast'), emoji: '🍳', highlight: true },
      { id: 'kasha', name: 'Каша рисовая', price: 700, img: PH('kasha'), emoji: '🥣' },
      { id: 'egg', name: 'Яйцо с сосиской', price: 700, img: PH('egg'), emoji: '🍳' },
    ],
  },
  {
    id: 'first', title: 'Первые блюда', nav: 'Первые',
    items: [
      { id: 'shorpa', name: 'Шорпа', price: 1200, img: PH('shorpa'), emoji: '🍲' },
      { id: 'naryn', name: 'Нарын', price: 1500, img: PH('naryn'), emoji: '🍜' },
      { id: 'pelmeni', name: 'Пельмени', price: 1250, img: PH('pelmeni'), emoji: '🥟' },
      { id: 'mashkhorda', name: 'Машхорда', price: 1200, img: PH('mashkhorda'), emoji: '🍲' },
      { id: 'lagman-soup', name: 'Лагман жидкий', price: 1300, img: PH('lagman-soup'), emoji: '🍜' },
    ],
  },
  {
    id: 'second', title: 'Вторые блюда', nav: 'Вторые',
    items: [
      { id: 'plov', name: 'Плов ташкентский', price: 1500, img: PH('plov') },
      { id: 'bowl', name: 'Боул с курицей', price: 1500, img: PH('bowl') },
      { id: 'manty', name: 'Манты', price: 1500, img: PH('manty'), emoji: '🥟' },
      { id: 'lagman-fried', name: 'Лагман жареный', price: 1500, img: PH('lagman-fried'), emoji: '🍝' },
      { id: 'lagman-guiru', name: 'Лагман гуйру', price: 1500, img: PH('lagman-guiru'), emoji: '🍝' },
      { id: 'kuyrdak', name: 'Куырдак', price: 2400, img: PH('kuyrdak'), emoji: '🥘' },
      { id: 'kotlety', name: 'Котлеты с гарниром', price: 1500, img: PH('kotlety'), emoji: '🍽️' },
      { id: 'bifshteks', name: 'Бифштекс', price: 1500, img: PH('bifshteks'), emoji: '🥩' },
      { id: 'brizol', name: 'Бризоль', price: 1600, img: PH('brizol'), emoji: '🍳' },
      { id: 'gulyash', name: 'Гуляш', price: 1500, img: PH('gulyash'), emoji: '🍛' },
    ],
  },
  {
    id: 'shashlik', title: 'Шашлыки', nav: 'Шашлыки',
    items: [
      { id: 'shashlik-lamb', name: 'Шашлык из баранины', price: 1400, img: PH('shashlik-lamb') },
      { id: 'shashlik-chicken', name: 'Шашлык из окорочков', price: 1000, img: PH('shashlik-chicken'), emoji: '🍢' },
      { id: 'lulya', name: 'Люля-кебаб', price: 1000, img: PH('lulya'), emoji: '🍢' },
    ],
  },
  {
    id: 'garnish', title: 'Гарниры', nav: 'Гарниры', layout: 'list',
    items: [
      { id: 'pure', name: 'Пюре', price: 500, img: PH('pure'), emoji: '🥔' },
      { id: 'ris', name: 'Рис', price: 500, img: PH('ris'), emoji: '🍚' },
      { id: 'grechka', name: 'Гречка', price: 500, img: PH('grechka'), emoji: '🌾' },
      { id: 'makarony', name: 'Макароны', price: 500, img: PH('makarony'), emoji: '🍝' },
      { id: 'fri', name: 'Картофель фри', price: 600, img: PH('fri'), emoji: '🍟' },
    ],
  },
  {
    id: 'salads', title: 'Салаты', nav: 'Салаты',
    items: [
      { id: 'salad-fresh', name: 'Салат «Свежий»', price: 700, img: PH('salad-fresh') },
      { id: 'achuchuk', name: 'Салат «Ачучук»', price: 700, img: PH('achuchuk'), emoji: '🍅' },
      { id: 'kapusta', name: 'Квашеная капуста', price: 700, img: PH('kapusta'), emoji: '🥬' },
    ],
  },
  {
    id: 'bakery', title: 'Горячая выпечка', nav: 'Выпечка',
    items: [
      { id: 'samsa-meat', name: 'Самса с мясом', price: 350, img: 'img/samsa.webp' },
      { id: 'samsa-chicken', name: 'Самса с курицей', price: 350, img: 'img/samsa.webp' },
      { id: 'samsa-cheese', name: 'Самса с сыром', price: 350, img: 'img/samsa.webp' },
      { id: 'cheburek', name: 'Чебурек', price: 200, img: PH('cheburek'), emoji: '🥟' },
      { id: 'bauyrsak', name: 'Бауырсаки', note: '1 кг', price: 2300, img: 'img/bauyrsak.webp', preorder: true },
    ],
  },
  {
    id: 'trays', title: 'Наборы к столу', nav: 'Наборы',
    items: [
      { id: 'tray-cheburek', name: 'Чебуреки', note: 'набор', price: 4500, img: PH('cheburek-tray'), emoji: '🥟' },
      { id: 'tray-bliny', name: 'Блины', note: 'набор', price: 4500, img: PH('bliny-stack'), emoji: '🥞' },
      { id: 'tray-tvorog', name: 'Пирог творожный', note: 'набор', price: 4500, img: 'img/cheesecake.webp', emoji: '🥧' },
      { id: 'tray-brownie', name: 'Брауни', note: 'набор', price: 4500, img: PH('brownie-tray'), emoji: '🍫' },
      { id: 'tray-mak', name: 'Пирог маковый', note: 'набор', price: 4500, img: 'img/poppy.webp', emoji: '🥧' },
    ],
  },
  {
    id: 'desserts', title: 'Десерты и торты', nav: 'Десерты',
    items: [
      { id: 'tort-med-slice', name: 'Медовый торт', note: 'кусок', price: 900, img: PH('medovik-slice') },
      { id: 'whoopie-slice', name: 'Вупи пай', note: 'кусок', price: 900, img: PH('whoopie-slice') },
      { id: 'banoffee', name: 'Баноффи пай', note: 'кусок', price: 550, img: 'img/banoffee.webp' },
      { id: 'brownie', name: 'Брауни', price: 550, img: PH('brownie'), emoji: '🍫' },
      { id: 'tvorozhny', name: 'Творожный торт', note: 'кусок', price: 550, img: 'img/spanish.webp', emoji: '🍰' },
      { id: 'tort-med-whole', name: 'Медовый торт целиком', price: 8000, img: PH('medovik'), preorder: true },
      { id: 'whoopie-whole', name: 'Вупи пай целиком', price: 8000, img: PH('whoopie'), preorder: true },
      { id: 'bliny-plain', name: 'Блины без начинки', note: '3 шт.', price: 200, img: PH('bliny-plain'), emoji: '🥞' },
      { id: 'bliny-tvorog', name: 'Блин с творогом', note: '1 шт.', price: 300, img: PH('bliny-tvorog'), emoji: '🥞' },
      { id: 'bliny-sgush', name: 'Блин со сгущёнкой', note: '1 шт.', price: 250, img: PH('bliny-sgush'), emoji: '🥞' },
    ],
  },
  {
    id: 'drinks', title: 'Напитки', nav: 'Напитки', layout: 'list',
    items: [
      { id: 'kompot', name: 'Компот', note: '0,5 л', price: 700, img: PH('kompot'), emoji: '🍹' },
      { id: 'tea-black', name: 'Чай чёрный', price: 200, img: PH('tea-black'), emoji: '🫖' },
      { id: 'tea-green', name: 'Чай зелёный', price: 200, img: PH('tea-green'), emoji: '🍵' },
      { id: 'tea-lemon', name: 'Чай с лимоном', price: 250, img: PH('tea-lemon'), emoji: '🍋' },
      { id: 'tea-milk', name: 'Чай с молоком', price: 250, img: PH('tea-milk'), emoji: '🥛' },
      { id: 'coffee', name: 'Кофе 3 в 1', price: 250, img: PH('coffee'), emoji: '☕' },
      // Чай ташкентский — в меню нет цены. Впишите цену и уберите // в начале строки:
      // { id: 'tea-tashkent', name: 'Чай ташкентский', price: 0, emoji: '🫖' },
      { id: 'maxi-tea', name: 'Макси чай', price: 700, img: PH('icetea'), emoji: '🧃' },
      { id: 'fuse-tea', name: 'Фьюс чай', price: 700, img: PH('icetea-2'), emoji: '🧃' },
      { id: 'cola', name: 'Кола', price: 700, img: PH('cola'), emoji: '🥤' },
      { id: 'pepsi', name: 'Пепси', price: 700, img: PH('cola-2'), emoji: '🥤' },
    ],
  },
];

// Комбо: первое + второе + напиток за одну цену
window.COMBO = {
  price: 1800,
  title: 'Комбо-обед',
  subtitle: 'Первое + второе + чай или компот',
  image: PH('plov'),
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
    id: 'family', title: 'Семейный ужин', serves: 'на 4 человек', image: PH('plov-plate'), discount: 0.10,
    items: [['plov', 4], ['salad-fresh', 2], ['samsa-meat', 4], ['kompot', 2]],
  },
  {
    id: 'shashlik', title: 'Шашлычный', serves: 'на 4–5 человек', image: PH('shashlik-grill'), discount: 0.10,
    items: [['shashlik-lamb', 4], ['lulya', 4], ['shashlik-chicken', 2], ['achuchuk', 2], ['fri', 2]],
  },
  {
    id: 'tea', title: 'К чаю для гостей', serves: 'на 6–8 человек', image: 'img/bauyrsak.webp', discount: 0.10,
    items: [['bauyrsak', 1], ['samsa-meat', 6], ['brownie', 2], ['tvorozhny', 2], ['tea-black', 6]],
  },
];

// «Добавить к заказу?» — подсказки в корзине
window.UPSELL = ['kompot', 'samsa-meat', 'tea-black', 'achuchuk', 'cheburek', 'tort-med-slice', 'fri'];

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
    ],
  },
  {
    id: 'drinks', title: 'Напитки', nav: 'Напитки',
    items: [
      { id: 'kompot', name: 'Компот 0,5 л', unit: 'шт.', note: '' },
      { id: 'tea-black', unit: 'порц.' },
      { id: 'tea-green', unit: 'порц.' },
      { id: 'tea-lemon', unit: 'порц.' },
      { id: 'cola', unit: 'шт.' },
      { id: 'pepsi', unit: 'шт.' },
      { id: 'fuse-tea', unit: 'шт.' },
      { id: 'maxi-tea', unit: 'шт.' },
    ],
  },
];

// Готовые столы на разное число гостей. Клиент может взять готовый и поменять,
// а может собрать свой стол сам. ЧЕРНОВИК — проверьте состав и количество.
// guests — на сколько гостей; items — [id блюда из меню, количество]
window.EVENT_SETS = [
  { guests: 10, items: [['plov', 10], ['salad-fresh', 5], ['achuchuk', 5], ['samsa-meat', 10], ['bauyrsak', 1], ['tort-med-whole', 1], ['kompot', 10], ['tea-black', 10]] },
  { guests: 20, items: [['plov', 20], ['salad-fresh', 10], ['achuchuk', 10], ['samsa-meat', 20], ['bauyrsak', 2], ['tort-med-whole', 2], ['kompot', 20], ['tea-black', 20]] },
  { guests: 30, items: [['plov', 30], ['salad-fresh', 15], ['achuchuk', 15], ['samsa-meat', 30], ['bauyrsak', 3], ['tort-med-whole', 3], ['kompot', 30], ['tea-black', 30]] },
  { guests: 50, items: [['plov', 50], ['salad-fresh', 25], ['achuchuk', 25], ['samsa-meat', 50], ['bauyrsak', 5], ['tort-med-whole', 5], ['kompot', 50], ['tea-black', 50]] },
  { guests: 100, items: [['plov', 100], ['salad-fresh', 50], ['achuchuk', 50], ['samsa-meat', 100], ['bauyrsak', 10], ['tort-med-whole', 9], ['kompot', 100], ['tea-black', 100]] },
];

// Как получить стол — клиент выбирает один вариант (первый — по умолчанию).
// price — текст вместо цены (в итог не входит). address: true — спрашиваем адрес.
// time — как подписать поле времени.
window.EVENT_SERVICES = [
  { id: 'serve', emoji: '🍽️', title: 'Привезём и накроем стол', sub: 'Привезём, расставим и красиво накроем', price: 'по договорённости', address: true, time: 'Во сколько накрыть' },
  { id: 'delivery', emoji: '🚚', title: 'Только доставка', sub: 'Яндекс Доставкой к нужному времени', price: 'по тарифу', address: true, time: 'К какому времени привезти' },
  { id: 'pickup', emoji: '🛍️', title: 'Заберу сам', sub: '', price: '', address: false, time: 'Когда заберёте' },
];
