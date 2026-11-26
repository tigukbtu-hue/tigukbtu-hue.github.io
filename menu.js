// ============================================================
//  МЕНЮ «ВОСТОЧКИ» — цены в тенге
//  Чтобы поменять цену, исправьте число после price:
//  Чтобы убрать блюдо — удалите его строку целиком.
//  id — внутреннее имя блюда (латиницей, не повторяться).
//  note — мелкая подпись под названием, preorder: true — «на заказ».
//  cartName — как блюдо называется в корзине и в WhatsApp (если отличается).
// ============================================================

window.MENU = [
  {
    id: 'breakfast', title: 'Завтраки', nav: 'Завтраки',
    items: [
      { id: 'kasha', name: 'Каша рисовая', price: 700 },
      { id: 'egg', name: 'Яйцо с сосиской', price: 700 },
      { id: 'combo-breakfast', name: 'Комбо-завтрак', note: 'Фуршетный стол', price: 1200, highlight: true },
    ],
  },
  {
    id: 'first', title: 'Первые блюда', nav: 'Первые',
    items: [
      { id: 'shorpa', name: 'Шорпа', price: 1200 },
      { id: 'naryn', name: 'Нарын', price: 1500 },
      { id: 'pelmeni', name: 'Пельмени', price: 1250 },
      { id: 'mashkhorda', name: 'Машхорда', price: 1200 },
      { id: 'lagman-soup', name: 'Лагман жидкий', price: 1300 },
    ],
  },
  {
    id: 'second', title: 'Вторые блюда', nav: 'Вторые', image: 'img/plov.jpg',
    items: [
      { id: 'bowl', name: 'Боул с курицей', price: 1500, img: 'img/bowl.jpg' },
      { id: 'plov', name: 'Плов ташкентский', price: 1500, img: 'img/plov2.jpg' },
      { id: 'lagman-fried', name: 'Лагман жареный', price: 1500 },
      { id: 'lagman-guiru', name: 'Лагман гуйру', price: 1500 },
      { id: 'kotlety', name: 'Котлеты с гарниром', price: 1500 },
      { id: 'bifshteks', name: 'Бифштекс', price: 1500 },
      { id: 'brizol', name: 'Бризоль', price: 1600 },
      { id: 'gulyash', name: 'Гуляш', price: 1500 },
      { id: 'kuyrdak', name: 'Куырдак', price: 2400 },
      { id: 'manty', name: 'Манты', price: 1500 },
    ],
  },
  {
    id: 'shashlik', title: 'Шашлыки', nav: 'Шашлыки', image: 'img/shashlik.jpg',
    items: [
      { id: 'shashlik-lamb', name: 'Баранина', cartName: 'Шашлык из баранины', price: 1400, img: 'img/shashlik.jpg' },
      { id: 'shashlik-chicken', name: 'Окорочка', cartName: 'Шашлык из окорочков', price: 1000 },
      { id: 'lulya', name: 'Люля-кебаб', price: 1000 },
    ],
  },
  {
    id: 'sazan', title: 'Сазан', nav: 'Сазан', image: 'img/sazan.jpg', tint: true,
    items: [
      { id: 'sazan-1kg', name: 'Сазан · 1 кг', note: '12–14 шт.', price: 6000 },
      { id: 'sazan-05', name: 'Сазан · 0,5 кг', note: '6–8 шт.', price: 3000 },
      { id: 'sazan-portion', name: 'Сазан · 1 порция', note: '4 шт.', price: 2200, img: 'img/sazan.jpg' },
    ],
  },
  {
    id: 'garnish', title: 'Гарниры', nav: 'Гарниры',
    items: [
      { id: 'pure', name: 'Пюре', price: 500 },
      { id: 'ris', name: 'Рис', price: 500 },
      { id: 'grechka', name: 'Гречка', price: 500 },
      { id: 'makarony', name: 'Макароны', price: 500 },
      { id: 'fri', name: 'Фри', price: 600 },
    ],
  },
  {
    id: 'salads', title: 'Салаты', nav: 'Салаты', image: 'img/salad.jpg',
    items: [
      { id: 'salad-fresh', name: 'Свежий', cartName: 'Салат «Свежий»', price: 700 },
      { id: 'achuchuk', name: 'Ачучук', cartName: 'Салат «Ачучук»', price: 700 },
      { id: 'kapusta', name: 'Квашеная капуста', price: 700 },
    ],
  },
  {
    id: 'bakery', title: 'Горячая выпечка', nav: 'Выпечка', image: 'img/samsa.jpg',
    items: [
      { id: 'samsa-meat', name: 'Самса с мясом', price: 350, img: 'img/samsa.jpg' },
      { id: 'samsa-chicken', name: 'Самса с курицей', price: 350 },
      { id: 'samsa-cheese', name: 'Самса с сыром', price: 350 },
      { id: 'cheburek', name: 'Чебурек', price: 200 },
      { id: 'bauyrsak', name: 'Бауырсаки', note: '1 кг', price: 2300, preorder: true },
    ],
  },
  {
    id: 'desserts', title: 'Десерты и торты', nav: 'Десерты', image: 'img/desserts.jpg',
    items: [
      { id: 'bliny-plain', name: 'Блины без начинки', note: '3 шт.', price: 200 },
      { id: 'bliny-tvorog', name: 'Блин с творогом', note: '1 шт.', price: 300 },
      { id: 'bliny-sgush', name: 'Блин со сгущёнкой', note: '1 шт.', price: 250 },
      { id: 'tort-med-slice', name: 'Торт медовый · кусок', price: 900, img: 'img/desserts.jpg' },
      { id: 'tort-med-whole', name: 'Торт медовый · целиком', price: 8000, preorder: true },
      { id: 'whoopie-slice', name: 'Вупи пай · кусок', price: 900 },
      { id: 'whoopie-whole', name: 'Вупи пай · целиком', price: 8000, preorder: true },
      { id: 'brownie', name: 'Брауни', price: 550 },
      { id: 'tvorozhny', name: 'Творожный торт · кусок', price: 550 },
      { id: 'banoffee', name: 'Баноффи пай · кусок', price: 550 },
    ],
  },
  {
    id: 'hot-drinks', title: 'Горячие напитки', nav: 'Напитки',
    items: [
      { id: 'tea-black', name: 'Чай чёрный', price: 200 },
      { id: 'tea-green', name: 'Чай зелёный', price: 200 },
      { id: 'tea-lemon', name: 'Чай с лимоном', price: 250 },
      { id: 'tea-milk', name: 'Чай с молоком', price: 250 },
      { id: 'coffee', name: 'Кофе 3 в 1', price: 250 },
      // Чай ташкентский — в меню нет цены. Впишите цену и уберите // в начале строки:
      // { id: 'tea-tashkent', name: 'Чай ташкентский', price: 0 },
    ],
  },
  {
    id: 'cold-drinks', title: 'Холодные напитки',
    items: [
      { id: 'kompot', name: 'Компот', note: '0,5 л', price: 700 },
      { id: 'maxi-tea', name: 'Макси чай', price: 700 },
      { id: 'fuse-tea', name: 'Фьюс чай', price: 700 },
      { id: 'cola', name: 'Кола', price: 700 },
      { id: 'pepsi', name: 'Пепси', price: 700 },
    ],
  },
];

// Комбо: первое + второе + напиток за одну цену
window.COMBO = {
  price: 1800,
  title: 'Комбо',
  subtitle: 'Первое + второе + компот или чай',
  image: 'img/plov2.jpg',
  groups: [
    { key: 'first', label: 'Первое блюдо', options: ['naryn', 'shorpa', 'mashkhorda', 'pelmeni'] },
    { key: 'second', label: 'Второе блюдо', options: ['plov', 'manty', 'gulyash', 'bifshteks'] },
    { key: 'drink', label: 'Напиток', options: ['kompot', 'tea-black'] },
  ],
};

// Сеты: цена считается сама из цен блюд минус скидка (discount: 0.10 = 10%),
// округляется до 100 ₸. ЧЕРНОВИК — проверьте состав и скидки.
window.SETS = [
  {
    id: 'family', title: 'Семейный ужин', serves: 'на 4 человек', image: 'img/plov2.jpg', discount: 0.10,
    items: [['plov', 4], ['salad-fresh', 2], ['samsa-meat', 4], ['kompot', 2]],
  },
  {
    id: 'shashlik', title: 'Шашлычный', serves: 'на 4–5 человек', image: 'img/shashlik.jpg', discount: 0.10,
    items: [['shashlik-lamb', 4], ['lulya', 4], ['shashlik-chicken', 2], ['achuchuk', 2], ['fri', 2]],
  },
  {
    id: 'sazan', title: 'Сазан для семьи', serves: 'на 3–4 человек', image: 'img/sazan.jpg', discount: 0.10,
    items: [['sazan-1kg', 1], ['fri', 2], ['salad-fresh', 2], ['kompot', 2]],
  },
  {
    id: 'tea', title: 'К чаю для гостей', serves: 'на 6–8 человек', image: 'img/desserts.jpg', discount: 0.10,
    items: [['bauyrsak', 1], ['samsa-meat', 6], ['brownie', 2], ['tvorozhny', 2], ['tea-black', 6]],
  },
];

// Популярное — карточки с фото вверху страницы
window.POPULAR = ['bowl', 'plov', 'sazan-portion', 'shashlik-lamb', 'samsa-meat', 'tort-med-slice'];
