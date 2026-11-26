(function () {
  'use strict';

  var C = window.CONFIG || {};
  var MENU = window.MENU || [];
  var COMBO = window.COMBO;
  var SETS = window.SETS || [];
  var UPSELL = window.UPSELL || [];
  var EVENT_ITEMS = window.EVENT_ITEMS || [];
  var HITS = ['plov', 'bowl', 'samsa-meat', 'sazan-portion', 'shashlik-lamb', 'manty'];

  // ---------- helpers ----------
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var num = function (n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); };
  var fmt = function (n) { return num(n) + ' ₸'; };
  var digits = function (s) { return String(s || '').replace(/\D/g, ''); };
  var plural = function (n, a, b, c) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return a;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return b;
    return c;
  };

  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } },
  };

  var ICON = {
    wa: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm4.5 12.1c-.25-.12-1.47-.72-1.7-.8-.23-.09-.4-.13-.56.12-.17.25-.64.8-.79.97-.14.17-.29.19-.54.06a6.7 6.7 0 0 1-3.34-2.92c-.25-.43.25-.4.72-1.34.08-.17.04-.31-.02-.43l-.76-1.83c-.2-.48-.4-.41-.56-.42h-.48a.92.92 0 0 0-.66.31 2.8 2.8 0 0 0-.87 2.07 4.85 4.85 0 0 0 1.02 2.58 11.1 11.1 0 0 0 4.25 3.76c1.58.68 2.2.74 3 .62.48-.07 1.47-.6 1.68-1.18.2-.58.2-1.08.14-1.18-.06-.1-.23-.17-.48-.29z"/></svg>',
    pin: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>',
    check: '<svg viewBox="0 0 24 24" width="40" height="40" aria-hidden="true"><path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>',
  };

  // ---------- data ----------
  var ITEMS = {};
  MENU.forEach(function (sec) {
    sec.items.forEach(function (it) { ITEMS[it.id] = Object.assign({ section: sec.id }, it); });
  });
  var itemName = function (id) { var it = ITEMS[id]; return it ? (it.cartName || it.name) : id; };
  var setById = function (id) { return SETS.filter(function (s) { return s.id === id; })[0]; };

  function setPrice(s) {
    var sum = s.items.reduce(function (a, p) { return a + (ITEMS[p[0]] ? ITEMS[p[0]].price * p[1] : 0); }, 0);
    return { sum: sum, price: Math.round(sum * (1 - (s.discount || 0)) / 100) * 100 };
  }

  function media(it) {
    if (it.img) return '<img src="' + esc(it.img) + '" alt="' + esc(it.name) + '" loading="lazy">';
    return '<div class="emo t-' + esc(it.section || '') + '"><span aria-hidden="true">' + (it.emoji || '🍽️') + '</span></div>';
  }

  // Cart key formats:  i:<itemId>   s:<setId>   c:<first>:<second>:<drink>
  function resolve(key) {
    var p = key.split(':');
    if (p[0] === 'i' && ITEMS[p[1]]) {
      var it = ITEMS[p[1]];
      return { name: it.cartName || it.name, details: it.note || '', price: it.price, preorder: !!it.preorder, thumb: media(it) };
    }
    if (p[0] === 's') {
      var s = setById(p[1]);
      if (!s) return null;
      return {
        name: 'Сет «' + s.title + '»',
        details: s.items.map(function (x) { return itemName(x[0]) + ' ×' + x[1]; }).join(', '),
        price: setPrice(s).price,
        preorder: s.items.some(function (x) { return ITEMS[x[0]] && ITEMS[x[0]].preorder; }),
        thumb: '<img src="' + esc(s.image) + '" alt="" loading="lazy">',
      };
    }
    if (p[0] === 'c' && COMBO && p.length === 4 && ITEMS[p[1]] && ITEMS[p[2]] && ITEMS[p[3]]) {
      return {
        name: COMBO.title, details: [itemName(p[1]), itemName(p[2]), itemName(p[3])].join(' + '),
        price: COMBO.price, thumb: '<img src="' + esc(COMBO.image) + '" alt="" loading="lazy">',
      };
    }
    return null;
  }

  // ---------- state ----------
  var cart = store.get('vk_cart', []).filter(function (r) { return r && r.key && r.qty > 0 && resolve(r.key); });
  var form = Object.assign({
    mode: 'delivery', name: '', phone: '', address: '', entrance: '',
    when: 'asap', time: '', pay: 'kaspi', comment: '',
  }, store.get('vk_form', {}));
  var lastOrder = null;
  var sheetMode = null;
  var clearArmed = false;

  var qtyOf = function (key) { var r = cart.filter(function (x) { return x.key === key; })[0]; return r ? r.qty : 0; };
  var count = function () { return cart.reduce(function (a, r) { return a + r.qty; }, 0); };
  var total = function () { return cart.reduce(function (a, r) { var x = resolve(r.key); return a + (x ? x.price * r.qty : 0); }, 0); };

  function setQty(key, q) {
    var r = cart.filter(function (x) { return x.key === key; })[0];
    if (q <= 0) cart = cart.filter(function (x) { return x.key !== key; });
    else if (r) r.qty = q;
    else cart.push({ key: key, qty: q });
    store.set('vk_cart', cart);
    refresh();
  }
  function add(key) {
    var was = qtyOf(key);
    setQty(key, was + 1);
    if (!was && sheetMode !== 'cart') { var x = resolve(key); if (x) toast('Добавлено: ' + x.name); }
    var bar = $('#cartbar');
    bar.classList.remove('bump'); void bar.offsetWidth; bar.classList.add('bump');
  }

  // ---------- controls ----------
  function ctrlHtml(key, v) {
    var q = qtyOf(key);
    var k = esc(key);
    if (v === 'mini') {
      if (!q) {
        var x = resolve(key);
        return '<div class="mini-foot"><span class="mini-price">' + fmt(x ? x.price : 0) + '</span>' +
          '<button class="add-round" type="button" data-add="' + k + '" aria-label="Добавить">+</button></div>';
      }
      v = 'sm';
    }
    if (v === 'sm') {
      if (!q) return '<button class="add-round" type="button" data-add="' + k + '" aria-label="Добавить">+</button>';
      return '<div class="stepper stepper--sm"><button type="button" data-dec="' + k + '" aria-label="Убрать одну">−</button>' +
        '<span>' + q + '</span><button type="button" data-inc="' + k + '" aria-label="Добавить ещё">+</button></div>';
    }
    if (!q) return '<button class="btn-add" type="button" data-add="' + k + '"><b>+</b> Добавить</button>';
    return '<div class="stepper"><button type="button" data-dec="' + k + '" aria-label="Убрать одну">−</button>' +
      '<span>' + q + ' шт.</span><button type="button" data-inc="' + k + '" aria-label="Добавить ещё">+</button></div>';
  }
  var ctrl = function (key, v) { return '<div class="card-ctrl" data-ctrl="' + esc(key) + '"' + (v ? ' data-v="' + v + '"' : '') + '></div>'; };

  // ---------- menu rendering ----------
  function card(it) {
    var badge = it.preorder ? '<span class="badge">На заказ</span>' : (HITS.indexOf(it.id) >= 0 ? '<span class="badge badge--hit">Хит</span>' : '');
    return '<article class="card' + (it.highlight ? ' card--hl' : '') + '">' +
      '<div class="media">' + media(it) + badge + '</div>' +
      '<div class="card-body"><div class="card-price">' + fmt(it.price) + '</div>' +
      '<div class="card-name">' + esc(it.name) + '</div>' +
      (it.note ? '<div class="card-note">' + esc(it.note) + '</div>' : '') +
      ctrl('i:' + it.id) + '</div></article>';
  }

  function secHead(title, extra) {
    return '<div class="sec-head"><h2 class="sec-title">' + esc(title) + '</h2>' + (extra || '') + '</div>';
  }

  function maxSetSaving() {
    return SETS.reduce(function (m, s) { var p = setPrice(s); return Math.max(m, p.sum - p.price); }, 0);
  }

  function promosHtml() {
    var out = [];
    if (SETS.length) {
      out.push('<button class="promo" type="button" data-go="sec-sets"><div class="promo-text">' +
        '<span class="promo-title">Сеты для семьи</span><span class="promo-sub">Ужин на всех в один клик</span>' +
        '<span class="promo-pill">Выгода до ' + fmt(maxSetSaving()) + '</span></div><img src="img/plov2.jpg" alt=""></button>');
    }
    if (COMBO) {
      out.push('<button class="promo promo--gold" type="button" data-go="sec-combo"><div class="promo-text">' +
        '<span class="promo-title">' + esc(COMBO.title) + '</span><span class="promo-sub">' + esc(COMBO.subtitle) + '</span>' +
        '<span class="promo-pill">' + fmt(COMBO.price) + '</span></div><img src="img/bowl.jpg" alt=""></button>');
    }
    out.push('<button class="promo promo--dark" type="button" data-tab-go="events"><div class="promo-text">' +
      '<span class="promo-title">Накроем стол</span><span class="promo-sub">Той, ас, день рождения</span>' +
      '<span class="promo-pill">Оставить заявку</span></div><img src="img/tort-med.jpg" alt=""></button>');
    return out.join('');
  }

  function setsHtml() {
    if (!SETS.length) return '';
    var cards = SETS.map(function (s) {
      var p = setPrice(s);
      return '<article class="setcard">' +
        '<div class="setcard-img"><img src="' + esc(s.image) + '" alt="" loading="lazy">' +
        (p.sum > p.price ? '<span class="setcard-badge">−' + fmt(p.sum - p.price) + '</span>' : '') +
        (s.serves ? '<span class="setcard-serves">' + esc(s.serves) + '</span>' : '') + '</div>' +
        '<div class="setcard-body"><h3 class="setcard-title">' + esc(s.title) + '</h3>' +
        '<ul class="setcard-list">' + s.items.map(function (x) {
          var it = ITEMS[x[0]];
          return '<li>' + esc(itemName(x[0])) + (it && it.note ? ' (' + esc(it.note) + ')' : '') + ' × ' + x[1] + '</li>';
        }).join('') + '</ul>' +
        '<div class="setcard-foot"><div>' + (p.sum > p.price ? '<span class="price-old">' + fmt(p.sum) + '</span>' : '') +
        '<span class="price-new">' + fmt(p.price) + '</span></div>' + ctrl('s:' + s.id) + '</div></div></article>';
    }).join('');
    return '<section class="sec" id="sec-sets">' + secHead('Сеты') +
      '<p class="sec-lead">Готовые наборы для семьи и компании — выгоднее, чем по отдельности</p>' +
      '<div class="hscroll">' + cards + '</div></section>';
  }

  function comboHtml() {
    if (!COMBO) return '';
    var lists = COMBO.groups.slice(0, 2).map(function (g) { return g.options.map(itemName).join(', '); }).join(' · ');
    return '<section class="sec" id="sec-combo">' + secHead(COMBO.title) +
      '<div class="combo"><div class="combo-text">' +
      '<div class="combo-price">' + fmt(COMBO.price) + '</div>' +
      '<div class="combo-sub">' + esc(COMBO.subtitle) + '</div>' +
      '<p class="combo-list">' + esc(lists) + '</p>' +
      '<button class="btn btn--sm" type="button" data-open-combo>Собрать комбо</button>' +
      '<div class="combo-count" id="comboCount"></div>' +
      '</div><div class="combo-img"><img src="' + esc(COMBO.image) + '" alt="" loading="lazy"></div></div></section>';
  }

  function sectionHtml(sec) {
    return '<section class="sec" id="sec-' + esc(sec.id) + '">' +
      secHead(sec.title, '<span class="sec-count">' + sec.items.length + '</span>') +
      '<div class="grid">' + sec.items.map(function (it) { return card(ITEMS[it.id]); }).join('') + '</div></section>';
  }

  function renderMenu() {
    $('#promos').innerHTML = promosHtml();
    $('#menu').innerHTML = setsHtml() + comboHtml() + MENU.map(sectionHtml).join('');
    var links = [];
    if (SETS.length) links.push(['sec-sets', '🎁 Сеты']);
    if (COMBO) links.push(['sec-combo', 'Комбо']);
    MENU.forEach(function (s) { if (s.nav) links.push(['sec-' + s.id, s.nav]); });
    $('#catnav').innerHTML = links.map(function (l) {
      return '<a href="#' + l[0] + '" data-target="' + l[0] + '">' + esc(l[1]) + '</a>';
    }).join('');
  }

  // ---------- events tab ----------
  function renderEvents() {
    var tiles = [
      ['🍛', 'Горячие блюда', 'Плов, манты, шашлык, сазан'],
      ['🥗', 'Салаты', 'Свежие салаты и закуски'],
      ['🥟', 'Выпечка', 'Самса, чебуреки, бауырсаки на кг'],
      ['🎂', 'Торты целиком', 'Медовый, вупи пай'],
      ['🍽️', 'Накроем стол', 'Сервировка под ключ'],
      ['🚚', 'Привезём', 'Доставка по Таразу'],
    ].map(function (t) {
      return '<div class="tile"><div class="tile-ic" aria-hidden="true">' + t[0] + '</div><b>' + t[1] + '</b><small>' + t[2] + '</small></div>';
    }).join('');
    var steps = [
      ['Оставьте заявку', 'Дата, число гостей и что нужно'],
      ['Мы свяжемся с вами', 'Согласуем меню, количество и цену'],
      ['Подтверждение', 'Фиксируем дату, меню и оплату'],
      ['Привезём и накроем', 'Вовремя и красиво — вам останется встречать гостей'],
    ].map(function (s) { return '<li><div><b>' + s[0] + '</b><small>' + s[1] + '</small></div></li>'; }).join('');
    var quick = EVENT_ITEMS.filter(function (id) { return ITEMS[id]; }).map(function (id) { return card(ITEMS[id]); }).join('');
    var needs = [['Горячие блюда', '🍛', true], ['Салаты', '🥗'], ['Выпечка, бауырсаки', '🥟'], ['Торты и десерты', '🎂'], ['Накрыть стол под ключ', '🍽️'], ['Доставка', '🚚']]
      .map(function (n) {
        return '<label><input type="checkbox" name="need" value="' + n[0] + '"' + (n[2] ? ' checked' : '') + '><span>' + n[1] + ' ' + n[0] + '</span></label>';
      }).join('');

    $('#view-events').innerHTML =
      '<section class="ev-hero">' +
      '<h2 class="ev-title">Накроем стол</h2>' +
      '<p class="ev-lead">Приготовим, привезём и красиво накроем — на любой праздник и любое число гостей.</p>' +
      '<div class="ev-chips"><span>Той</span><span>Ас</span><span>День рождения</span><span>Корпоратив</span><span>Сватовство</span></div>' +
      '<div class="ev-photos"><img src="img/plov.jpg" alt="Плов"><img src="img/tort-med.jpg" alt="Медовый торт"><img src="img/samsa1.jpg" alt="Самса"></div>' +
      '<button class="btn btn--gold" type="button" data-go="ev-form">Оставить заявку</button>' +
      '</section>' +
      secHead('Что приготовим') + '<div class="tiles">' + tiles + '</div>' +
      secHead('Как заказать') + '<ol class="steps">' + steps + '</ol>' +
      (quick ? secHead('Можно заказать сразу') + '<p class="sec-lead">Торты целиком, бауырсаки и сазан — добавьте в корзину и оформите как обычный заказ</p><div class="grid">' + quick + '</div>' : '') +
      '<div class="sec" id="ev-form">' + secHead('Заявка на мероприятие') +
      '<div style="padding:0 16px"><form id="eventForm" class="block form" novalidate>' +
      '<label class="field"><span>Повод</span><select name="occasion"><option>Той</option><option>Ас / поминки</option><option>День рождения</option><option>Корпоратив</option><option>Сватовство</option><option>Другое</option></select></label>' +
      '<div class="row2"><label class="field"><span>Дата</span><input type="date" name="date" required></label>' +
      '<label class="field"><span>Гостей</span><input type="number" name="guests" min="1" inputmode="numeric" placeholder="Например, 30" required></label></div>' +
      '<fieldset class="field"><legend>Что нужно</legend><div class="checks">' + needs + '</div></fieldset>' +
      '<div class="row2"><label class="field"><span>Имя</span><input name="name" autocomplete="given-name" placeholder="Как к вам обращаться" required></label>' +
      '<label class="field"><span>Телефон</span><input name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 7__ ___ __ __" required></label></div>' +
      '<label class="field"><span>Пожелания</span><textarea name="comment" rows="3" placeholder="Бюджет, любимые блюда, адрес…"></textarea></label>' +
      '<p class="form-err" id="eventErr" hidden></p>' +
      '<button class="btn btn--wa" type="submit">' + ICON.wa + ' Отправить заявку</button>' +
      '<p class="foot-hint" style="margin:0">Откроется WhatsApp с готовой заявкой</p>' +
      '</form></div></div>';
  }

  // ---------- tabs ----------
  var currentTab = 'menu';
  function switchTab(name, opts) {
    currentTab = name;
    $$('.tab').forEach(function (t) { t.setAttribute('aria-selected', String(t.getAttribute('data-tab') === name)); });
    $('#view-menu').hidden = name !== 'menu';
    $('#view-events').hidden = name !== 'events';
    $('#catnav').hidden = name !== 'menu';
    updateStickyH();
    try { history.replaceState(null, '', name === 'events' ? '#events' : location.pathname + location.search); } catch (e) { /* file:// */ }
    if (!opts || opts.scroll !== false) {
      var top = $('#sticky').offsetTop;
      if (window.scrollY > top) window.scrollTo({ top: top, behavior: 'auto' });
    }
  }

  function goTo(id) {
    var el = document.getElementById(id);
    if (!el) return;
    if (id.indexOf('ev-') === 0 && currentTab !== 'events') switchTab('events', { scroll: false });
    if (id.indexOf('sec-') === 0 && currentTab !== 'menu') switchTab('menu', { scroll: false });
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function updateStickyH() {
    var h = $('#sticky').offsetHeight;
    document.documentElement.style.setProperty('--sticky-h', h + 'px');
    $$('.sec').forEach(function (s) { s.style.scrollMarginTop = (h + 6) + 'px'; });
  }

  // ---------- refresh ----------
  function refresh() {
    $$('[data-ctrl]').forEach(function (el) { el.innerHTML = ctrlHtml(el.getAttribute('data-ctrl'), el.getAttribute('data-v')); });
    var n = count();
    $('#cartbar').hidden = n === 0 || !$('#sheet').hidden;
    $('#cartCount').textContent = n;
    $('#cartSum').textContent = fmt(total());
    var cc = $('#comboCount');
    if (cc) {
      var k = cart.filter(function (r) { return r.key.indexOf('c:') === 0; }).reduce(function (a, r) { return a + r.qty; }, 0);
      cc.textContent = k ? 'В корзине: ' + k + ' шт.' : '';
    }
    if (sheetMode === 'cart') renderCart();
  }

  var toastTimer;
  function toast(t) {
    var el = $('#toast');
    el.textContent = t;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 1600);
  }

  // ---------- sheet ----------
  function openSheet(mode, o) {
    sheetMode = mode;
    o = o || {};
    $('#sheetTitle').textContent = o.title || '';
    $('#sheetBack').hidden = !o.back;
    $('#sheetExtra').innerHTML = o.extra || '';
    $('#sheet').classList.toggle('sheet--full', !!o.full);
    $('#sheet').hidden = false;
    $('#cartbar').hidden = true;
    document.body.classList.add('lock');
  }
  function setFoot(html) {
    var f = $('#sheetFoot');
    f.innerHTML = html || '';
    f.hidden = !html;
  }
  function closeSheet() {
    sheetMode = null;
    clearArmed = false;
    $('#sheet').hidden = true;
    document.body.classList.remove('lock');
    refresh();
  }

  // Combo picker
  var comboPick = {};
  function openCombo() {
    COMBO.groups.forEach(function (g) { if (!comboPick[g.key]) comboPick[g.key] = g.options[0]; });
    openSheet('combo', { title: COMBO.title + ' · ' + fmt(COMBO.price) });
    $('#sheetBody').innerHTML = COMBO.groups.map(function (g) {
      return '<div class="opt-group"><h4>' + esc(g.label) + '</h4><div class="chips">' + g.options.map(function (id) {
        return '<label><input type="radio" name="combo-' + g.key + '" value="' + esc(id) + '"' +
          (comboPick[g.key] === id ? ' checked' : '') + '><span>' + esc(itemName(id)) + '</span></label>';
      }).join('') + '</div></div>';
    }).join('');
    setFoot('<button class="btn btn--split" type="button" id="comboAdd"><span>Добавить в корзину</span><span>' + fmt(COMBO.price) + '</span></button>');
  }

  // Step 1: cart
  function openCart() {
    openSheet('cart', { title: 'Корзина', full: true });
    renderCart();
    $('#sheetBody').scrollTop = 0;
  }

  function renderCart() {
    var body = $('#sheetBody');
    $('#sheetExtra').innerHTML = cart.length ? '<button type="button" data-clear>' + (clearArmed ? 'Точно очистить?' : 'Очистить') + '</button>' : '';
    if (!cart.length) {
      body.innerHTML = '<div class="empty"><div class="empty-ic">🛒</div>В корзине пока пусто<br>Добавьте что-нибудь вкусное</div>';
      setFoot('<button class="btn btn--ghost" type="button" data-close>Перейти в меню</button>');
      return;
    }
    var scroll = body.scrollTop;
    var n = count(), t = total();
    var hasPre = cart.some(function (r) { var x = resolve(r.key); return x && x.preorder; });
    var rows = cart.map(function (r) {
      var x = resolve(r.key);
      return '<div class="ci"><div class="thumb">' + x.thumb + '</div>' +
        '<div><div class="ci-name">' + esc(x.name) + '</div>' +
        (x.details ? '<div class="ci-det">' + esc(x.details) + '</div>' : '') +
        '<div class="ci-price">' + fmt(x.price * r.qty) + '</div></div>' +
        '<div data-ctrl="' + esc(r.key) + '" data-v="sm">' + ctrlHtml(r.key, 'sm') + '</div></div>';
    }).join('');
    var ups = UPSELL.filter(function (id) { return ITEMS[id] && !qtyOf('i:' + id); }).slice(0, 6).map(function (id) {
      var it = ITEMS[id];
      return '<div class="mini"><div class="media">' + media(it) + '</div><div class="mini-body">' +
        '<div class="mini-name">' + esc(it.cartName || it.name) + '</div>' + ctrl('i:' + id, 'mini') + '</div></div>';
    }).join('');

    body.innerHTML =
      '<div class="block">' + rows + '</div>' +
      (hasPre ? '<p class="note"><span class="note-ic">⏳</span><span>В заказе есть позиции <b>на заказ</b> — уточним время готовности в WhatsApp.</span></p>' : '') +
      (ups ? '<h4 class="upsell-title">Добавить к заказу?</h4><div class="hscroll upsell">' + ups + '</div>' : '') +
      '<div class="block" style="margin-top:12px">' +
      '<div class="sum-row"><span>Товары, ' + n + ' ' + plural(n, 'шт.', 'шт.', 'шт.') + '</span><span>' + fmt(t) + '</span></div>' +
      '<div class="sum-row"><span>Доставка</span><span>по тарифу Яндекса</span></div>' +
      '<div class="sum-row"><span>Самовывоз</span><span>бесплатно</span></div>' +
      '<div class="sum-row sum-row--total"><span>Итого</span><span>' + fmt(t) + '</span></div></div>';
    $$('[data-ctrl]', body).forEach(function (el) { el.innerHTML = ctrlHtml(el.getAttribute('data-ctrl'), el.getAttribute('data-v')); });
    body.scrollTop = scroll;
    setFoot('<button class="btn btn--split" type="button" data-step="checkout"><span>Оформить заказ</span><span>' + fmt(t) + '</span></button>');
  }

  // Step 2: checkout
  function seg(name, value, options) {
    return '<div class="seg" role="radiogroup">' + options.map(function (o) {
      return '<label><input type="radio" name="' + name + '" value="' + o[0] + '"' + (value === o[0] ? ' checked' : '') +
        '><span>' + o[1] + '</span></label>';
    }).join('') + '</div>';
  }
  function field(name, label, attrs, value, tag) {
    var input = tag === 'textarea'
      ? '<textarea name="' + name + '" rows="2" ' + (attrs || '') + '>' + esc(value) + '</textarea>'
      : '<input name="' + name + '" ' + (attrs || '') + ' value="' + esc(value) + '">';
    return '<label class="field" data-field="' + name + '"><span>' + label + '</span>' + input + '</label>';
  }
  function opt(name, value, checked, icon, title, sub) {
    return '<label class="opt"><input type="radio" name="' + name + '" value="' + value + '"' + (checked ? ' checked' : '') + '>' +
      '<span>' + icon + '<span class="opt-text"><b>' + title + '</b><small>' + sub + '</small></span><span class="opt-radio"></span></span></label>';
  }

  function openCheckout() {
    clearArmed = false;
    openSheet('checkout', { title: 'Оформление', full: true, back: true });
    renderCheckout();
    $('#sheetBody').scrollTop = 0;
  }

  function renderCheckout() {
    var body = $('#sheetBody');
    var scroll = body.scrollTop;
    var t = total(), n = count();
    if (form.mode === 'delivery') form.pay = 'kaspi';
    var minOk = form.mode !== 'delivery' || !C.minOrderDelivery || t >= C.minOrderDelivery;
    var thumbs = cart.map(function (r) {
      var x = resolve(r.key);
      return '<div class="thumb">' + x.thumb + (r.qty > 1 ? '<span class="q">×' + r.qty + '</span>' : '') + '</div>';
    }).join('');

    body.innerHTML = '<form id="orderForm" class="form" novalidate>' +
      '<div class="block"><h4 class="block-title">Как получить</h4>' +
      seg('mode', form.mode, [['delivery', '🚚 Доставка'], ['pickup', '🛍️ Самовывоз']]) +
      '<div style="margin-top:12px" class="form">' +
      (form.mode === 'delivery'
        ? field('address', 'Адрес доставки', 'autocomplete="street-address" placeholder="Улица, дом, квартира или офис"', form.address) +
          field('entrance', 'Подъезд, этаж, ориентир', 'placeholder="Необязательно"', form.entrance) +
          '<p class="note"><span class="note-ic">🚕</span><span>' + esc(C.deliveryNote || '') + '</span></p>' +
          (!minOk ? '<p class="form-err">Минимальная сумма для доставки — ' + fmt(C.minOrderDelivery) + '</p>' : '')
        : '<div class="place"><span class="place-ic">' + ICON.pin + '</span><span><b>' + esc(C.address || '') + '</b>' +
          '<small>' + esc(C.hours || 'Заберите заказ, когда мы напишем, что он готов') + '</small></span></div>') +
      '</div></div>' +
      '<div class="block"><h4 class="block-title">Когда</h4>' +
      seg('when', form.when, [['asap', '⚡ Как можно скорее'], ['time', '🕐 Ко времени']]) +
      (form.when === 'time' ? '<div style="margin-top:12px">' + field('time', 'Время', 'type="time"', form.time) + '</div>' : '') +
      '</div>' +
      '<div class="block"><h4 class="block-title">Получатель</h4><div class="row2">' +
      field('name', 'Имя', 'autocomplete="given-name" placeholder="Ваше имя"', form.name) +
      field('phone', 'Телефон', 'type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 7__ ___ __ __"', form.phone) +
      '</div></div>' +
      '<div class="block"><h4 class="block-title">Оплата</h4><div class="opt-list">' +
      opt('pay', 'kaspi', form.pay === 'kaspi', '<span class="opt-ic opt-ic--kaspi">Kaspi</span>', 'Перевод Kaspi', 'После подтверждения заказа, чек — в WhatsApp') +
      (form.mode === 'pickup' ? opt('pay', 'cash', form.pay === 'cash', '<span class="opt-ic">💵</span>', 'При получении', 'Наличными или Kaspi на месте') : '') +
      '</div></div>' +
      '<div class="block"><h4 class="block-title">Комментарий</h4>' +
      field('comment', 'К заказу', 'placeholder="Например: без лука, приборы на 3 человек"', form.comment, 'textarea') + '</div>' +
      '<div class="block"><h4 class="block-title">Ваш заказ</h4><div class="thumbs-row">' + thumbs + '</div>' +
      '<div class="sum-row"><span>Товары, ' + n + ' шт.</span><span>' + fmt(t) + '</span></div>' +
      '<div class="sum-row"><span>Доставка</span><span>' + (form.mode === 'delivery' ? 'по тарифу Яндекса' : 'бесплатно') + '</span></div>' +
      '<div class="sum-row sum-row--total"><span>Итого</span><span>' + fmt(t) + (form.mode === 'delivery' ? ' + доставка' : '') + '</span></div>' +
      '</div></form>';
    body.scrollTop = scroll;
    setFoot('<p class="form-err" id="orderErr" hidden style="margin-bottom:8px"></p>' +
      '<button class="btn btn--wa btn--split" type="submit" form="orderForm"' + (minOk ? '' : ' disabled') + '>' +
      '<span style="display:flex;align-items:center;gap:8px">' + ICON.wa + 'Отправить заказ</span><span>' + fmt(t) + '</span></button>' +
      '<p class="foot-hint">Откроется WhatsApp с готовым сообщением — нажмите «Отправить»</p>');
  }

  // ---------- order ----------
  function waUrl(text) { return 'https://wa.me/' + digits(C.whatsapp) + '?text=' + encodeURIComponent(text); }
  function openWa(text) {
    var url = waUrl(text);
    var w = window.open(url, '_blank');
    if (!w) window.location.href = url;
  }
  var orderNumber = function () { return String(Date.now()).slice(-4); };

  function buildOrderText(no) {
    var lines = ['🧾 *Заказ №' + no + '* — Восточка', ''];
    cart.forEach(function (r, i) {
      var x = resolve(r.key);
      lines.push((i + 1) + '. ' + x.name + (x.details ? ' (' + x.details + ')' : '') + ' × ' + r.qty + ' = ' + fmt(x.price * r.qty));
    });
    lines.push('', '*Итого: ' + fmt(total()) + '*' + (form.mode === 'delivery' ? ' + доставка' : ''), '');
    lines.push(form.mode === 'delivery' ? '🚚 Доставка: ' + form.address + (form.entrance ? ', ' + form.entrance : '') : '🏪 Самовывоз');
    lines.push('⏰ ' + (form.when === 'time' ? 'Ко времени: ' + form.time : 'Как можно скорее'));
    lines.push('👤 ' + form.name + ', ' + form.phone);
    lines.push('💳 Оплата: ' + (form.pay === 'kaspi' ? 'перевод Kaspi' : 'при получении'));
    if (form.comment) lines.push('💬 ' + form.comment);
    return lines.join('\n');
  }

  function submitOrder() {
    var errs = [], bad = [];
    if (form.mode === 'delivery' && form.address.trim().length < 4) { errs.push('адрес'); bad.push('address'); }
    if (form.when === 'time' && !form.time) { errs.push('время'); bad.push('time'); }
    if (!form.name.trim()) { errs.push('имя'); bad.push('name'); }
    if (digits(form.phone).length < 10) { errs.push('телефон'); bad.push('phone'); }
    $$('#orderForm .field').forEach(function (f) { f.classList.remove('invalid'); });
    bad.forEach(function (n) { var f = $('#orderForm [data-field="' + n + '"]'); if (f) f.classList.add('invalid'); });
    var errEl = $('#orderErr');
    if (errs.length) {
      errEl.textContent = 'Заполните: ' + errs.join(', ');
      errEl.hidden = false;
      var first = $('#orderForm .invalid input, #orderForm .invalid textarea');
      if (first) { first.scrollIntoView({ block: 'center', behavior: 'smooth' }); first.focus({ preventScroll: true }); }
      return;
    }
    var no = orderNumber();
    var text = buildOrderText(no);
    lastOrder = { no: no, text: text, total: total(), count: count(), pay: form.pay, mode: form.mode };
    openWa(text);
    cart = [];
    store.set('vk_cart', cart);
    showSuccess();
  }

  function showSuccess() {
    sheetMode = 'success';
    $('#sheetTitle').textContent = 'Заказ №' + lastOrder.no;
    $('#sheetBack').hidden = true;
    $('#sheetExtra').innerHTML = '';
    var o = lastOrder;
    var steps = [
      ['done', '✓', 'Заказ сформирован', o.count + ' шт. на ' + fmt(o.total)],
      ['', '2', 'Отправьте сообщение в WhatsApp', 'Нажмите «Отправить» в открывшемся чате'],
      ['', '3', 'Мы подтвердим заказ', o.mode === 'delivery' ? 'И сообщим стоимость доставки' : 'И напишем, когда будет готов'],
    ];
    if (o.pay === 'kaspi') steps.push(['', '4', 'Оплатите на Kaspi', 'Переведите сумму и пришлите чек в WhatsApp']);
    steps.push(['', String(steps.length + 1), o.mode === 'delivery' ? 'Ждите курьера' : 'Заберите заказ', o.mode === 'delivery' ? 'Привезём по вашему адресу' : (C.address || '')]);
    var kaspi = '';
    if (o.pay === 'kaspi' && (C.kaspiPhone || C.kaspiQr)) {
      kaspi = '<div class="block" style="text-align:left"><h4 class="block-title"><span class="opt-ic opt-ic--kaspi" style="width:34px;height:34px;font-size:11px">Kaspi</span> Номер для перевода</h4>' +
        (C.kaspiPhone ? '<div class="pay-num"><span>' + esc(C.kaspiPhone) + '</span>' +
          '<button class="btn btn--sm btn--ghost" type="button" data-copy="' + esc(C.kaspiPhone) + '">Копировать</button></div>' : '') +
        (C.kaspiName ? '<div style="color:var(--muted);margin-top:4px">Получатель: ' + esc(C.kaspiName) + '</div>' : '') +
        (C.kaspiQr ? '<img class="pay-qr" src="' + esc(C.kaspiQr) + '" alt="Kaspi QR">' : '') +
        '<p class="note" style="margin-top:10px"><span class="note-ic">💡</span><span>Сумма: <b>' + fmt(o.total) + '</b>' +
        (o.mode === 'delivery' ? ' + доставка — точную сумму напишем в WhatsApp' : '') + '</span></p></div>';
    }
    $('#sheetBody').innerHTML = '<div class="success">' +
      '<div class="success-icon">' + ICON.check + '</div>' +
      '<h4>Почти готово!</h4>' +
      '<p>Мы открыли WhatsApp с вашим заказом. Если чат не открылся — нажмите кнопку ниже.</p>' +
      '<div class="block"><ol class="track">' + steps.map(function (s) {
        return '<li class="' + s[0] + '"><span class="track-dot">' + s[1] + '</span><div><b>' + s[2] + '</b><small>' + esc(s[3]) + '</small></div></li>';
      }).join('') + '</ol></div>' + kaspi + '</div>';
    $('#sheetBody').scrollTop = 0;
    setFoot('<div class="stack"><button class="btn btn--wa" type="button" id="resendWa">' + ICON.wa + ' Открыть WhatsApp ещё раз</button>' +
      '<button class="btn btn--ghost" type="button" data-close>Вернуться в меню</button></div>');
  }

  // ---------- events form ----------
  function submitEvent(e) {
    e.preventDefault();
    var f = e.target;
    var v = function (n) { return f.elements.namedItem(n).value.trim(); };
    var data = {
      occasion: v('occasion'), date: v('date'), guests: v('guests'),
      name: v('name'), phone: v('phone'), comment: v('comment'),
      need: $$('input[name="need"]:checked', f).map(function (x) { return x.value; }),
    };
    var bad = [];
    if (!data.date) bad.push('date');
    if (!data.guests) bad.push('guests');
    if (!data.name) bad.push('name');
    if (digits(data.phone).length < 10) bad.push('phone');
    $$('.field', f).forEach(function (x) { x.classList.remove('invalid'); });
    bad.forEach(function (n) { var el = f.elements.namedItem(n); if (el && el.closest('.field')) el.closest('.field').classList.add('invalid'); });
    var err = $('#eventErr');
    if (bad.length) { err.textContent = 'Заполните дату, число гостей, имя и телефон'; err.hidden = false; return; }
    err.hidden = true;
    var lines = ['🎉 *Заявка: накрыть стол* — Восточка', '',
      'Повод: ' + data.occasion,
      'Дата: ' + data.date.split('-').reverse().join('.'),
      'Гостей: ' + data.guests];
    if (data.need.length) lines.push('Нужно: ' + data.need.join(', '));
    if (data.comment) lines.push('Пожелания: ' + data.comment);
    lines.push('', '👤 ' + data.name + ', ' + data.phone);
    openWa(lines.join('\n'));
    toast('Заявка открыта в WhatsApp — нажмите «Отправить»');
    if (!form.name) form.name = data.name;
    if (!form.phone) form.phone = data.phone;
    store.set('vk_form', form);
  }

  // ---------- nav highlight ----------
  function setupNav() {
    var nav = $('#catnav');
    var links = $$('a', nav);
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute('data-target')] = a; });
    if (!('IntersectionObserver' in window)) return;
    var current = null;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.id;
        if (byId[id] && id !== current) {
          current = id;
          links.forEach(function (a) { a.classList.toggle('active', a === byId[id]); });
          nav.scrollTo({ left: byId[id].offsetLeft - 12, behavior: 'smooth' });
        }
      });
    }, { rootMargin: '-130px 0px -65% 0px' });
    $$('#menu section[id^="sec-"]').forEach(function (s) { io.observe(s); });
  }

  // ---------- static info ----------
  function fillInfo() {
    var wa = digits(C.whatsapp);
    $('#setupNotice').hidden = !!wa;
    $('#waBtn').href = 'https://wa.me/' + wa;
    if (!wa) $('#waBtn').hidden = true;
    if (C.phone) { $('#callBtn').href = 'tel:+' + digits(C.phone); $('#callBtn').hidden = false; }
    var info = [];
    if (C.address) info.push(esc(C.address));
    if (C.hours) info.push(esc(C.hours));
    if (C.phone) info.push('<a href="tel:+' + digits(C.phone) + '">' + esc(C.phone) + '</a>');
    if (wa) info.push('<a href="https://wa.me/' + wa + '" target="_blank" rel="noopener">WhatsApp</a>');
    if (C.instagram) info.push('<a href="https://instagram.com/' + esc(C.instagram) + '" target="_blank" rel="noopener">Instagram</a>');
    if (C.twoGisLink) info.push('<a href="' + esc(C.twoGisLink) + '" target="_blank" rel="noopener">Мы в 2GIS</a>');
    $('#footerInfo').innerHTML = info.join(' · ');
    var ef = $('#eventForm');
    if (ef) {
      var d = ef.elements.namedItem('date');
      var t = new Date(); t.setDate(t.getDate() + 1);
      d.min = t.toISOString().slice(0, 10);
      ef.elements.namedItem('name').value = form.name || '';
      ef.elements.namedItem('phone').value = form.phone || '';
    }
  }

  // ---------- wiring ----------
  document.addEventListener('click', function (e) {
    var t = e.target.closest('button, a, [data-close]');
    if (!t) return;
    if (t.hasAttribute('data-add')) { add(t.getAttribute('data-add')); return; }
    if (t.hasAttribute('data-inc')) { var k = t.getAttribute('data-inc'); setQty(k, qtyOf(k) + 1); return; }
    if (t.hasAttribute('data-dec')) { var k2 = t.getAttribute('data-dec'); setQty(k2, qtyOf(k2) - 1); return; }
    if (t.hasAttribute('data-open-combo')) { openCombo(); return; }
    if (t.hasAttribute('data-close')) { closeSheet(); return; }
    if (t.hasAttribute('data-tab')) { switchTab(t.getAttribute('data-tab')); return; }
    if (t.hasAttribute('data-tab-go')) { switchTab(t.getAttribute('data-tab-go')); return; }
    if (t.hasAttribute('data-go')) { goTo(t.getAttribute('data-go')); return; }
    if (t.hasAttribute('data-step')) { openCheckout(); return; }
    if (t.hasAttribute('data-clear')) {
      if (!clearArmed) { clearArmed = true; renderCart(); return; }
      clearArmed = false; cart = []; store.set('vk_cart', cart); refresh(); return;
    }
    if (t.hasAttribute('data-copy')) {
      var val = t.getAttribute('data-copy');
      var done = function () { toast('Номер скопирован'); };
      if (navigator.clipboard) navigator.clipboard.writeText(val).then(done, function () { toast(val); });
      else toast(val);
      return;
    }
    if (t.id === 'openCart') { openCart(); return; }
    if (t.id === 'sheetBack') { openCart(); return; }
    if (t.id === 'comboAdd') {
      add('c:' + COMBO.groups.map(function (g) { return comboPick[g.key]; }).join(':'));
      closeSheet();
      return;
    }
    if (t.id === 'resendWa' && lastOrder) { openWa(lastOrder.text); return; }
    if (t.matches('#catnav a')) { e.preventDefault(); goTo(t.getAttribute('data-target')); }
  });

  var sheetBody = $('#sheetBody');
  sheetBody.addEventListener('change', function (e) {
    var el = e.target;
    if (sheetMode === 'combo' && el.name && el.name.indexOf('combo-') === 0) { comboPick[el.name.slice(6)] = el.value; return; }
    if (sheetMode === 'checkout' && el.name in form) {
      form[el.name] = el.value;
      store.set('vk_form', form);
      if (el.name === 'mode' || el.name === 'when') renderCheckout();
    }
  });
  sheetBody.addEventListener('input', function (e) {
    var el = e.target;
    if (sheetMode === 'checkout' && el.name in form && el.type !== 'radio') {
      form[el.name] = el.value;
      store.set('vk_form', form);
      var f = el.closest('.field');
      if (f) f.classList.remove('invalid');
      var err = $('#orderErr');
      if (err && !$('#orderForm .invalid')) err.hidden = true;
    }
  });
  sheetBody.addEventListener('submit', function (e) {
    if (e.target.id === 'orderForm') { e.preventDefault(); submitOrder(); }
  });
  document.addEventListener('submit', function (e) {
    if (e.target.id === 'eventForm') submitEvent(e);
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && sheetMode) closeSheet(); });
  window.addEventListener('resize', updateStickyH);

  // ---------- init ----------
  renderMenu();
  renderEvents();
  fillInfo();
  refresh();
  setupNav();
  updateStickyH();
  if (location.hash === '#events') switchTab('events', { scroll: false });
})();
