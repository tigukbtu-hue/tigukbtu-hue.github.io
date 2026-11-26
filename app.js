(function () {
  'use strict';

  var C = window.CONFIG || {};
  var MENU = window.MENU || [];
  var COMBO = window.COMBO;
  var SETS = window.SETS || [];
  var UPSELL = window.UPSELL || [];
  var EVENT_MENU = window.EVENT_MENU || [];
  var EVENT_SERVICES = window.EVENT_SERVICES || [];
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
  var guestsWord = function (n) { return plural(n, 'гостя', 'гостей', 'гостей'); };
  var posWord = function (n) { return plural(n, 'позиция', 'позиции', 'позиций'); };
  var fmtDate = function (d) { return d ? d.split('-').reverse().join('.') : ''; };
  var todayIso = function () {
    var t = new Date();
    t.setMinutes(t.getMinutes() - t.getTimezoneOffset());
    return t.toISOString().slice(0, 10);
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

  // ---------- menu data ----------
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

  // ---------- event (table) data ----------
  var EVI = {};
  var EVCATS = EVENT_MENU.map(function (cat) {
    var items = (cat.items || []).filter(function (x) { return ITEMS[x.id]; }).map(function (x) {
      var base = ITEMS[x.id];
      var it = {
        id: x.id, cat: cat.id,
        name: x.name || base.cartName || base.name,
        unit: x.unit || 'порц.',
        note: x.note != null ? x.note : (base.note || ''),
        price: base.price, img: base.img, emoji: base.emoji, section: base.section,
        perGuest: x.perGuest || 0,
      };
      EVI[x.id] = it;
      return it;
    });
    return { id: cat.id, title: cat.title, nav: cat.nav || cat.title, items: items };
  }).filter(function (c) { return c.items.length; });

  // ---------- state ----------
  var cart = store.get('vk_cart', []).filter(function (r) { return r && r.key && r.qty > 0 && resolve(r.key); });
  var form = Object.assign({
    mode: 'delivery', name: '', phone: '', address: '', entrance: '',
    when: 'asap', time: '', pay: 'kaspi', comment: '',
  }, store.get('vk_form', {}));
  var evSel = store.get('vk_ev', {});
  Object.keys(evSel).forEach(function (k) { if (!EVI[k] || !(evSel[k] > 0)) delete evSel[k]; });
  var evForm = Object.assign({
    guests: window.EVENT_GUESTS || 20, occasion: 'Той', date: '', time: '', address: '', comment: '', svc: {},
  }, store.get('vk_evform', {}));
  EVENT_SERVICES.forEach(function (s) { if (!(s.id in evForm.svc)) evForm.svc[s.id] = !!s.on; });

  var lastOrder = null;
  var lastEvent = null;
  var sheetMode = null;
  var clearArmed = false;
  var currentTab = 'menu';

  // ---------- regular cart ----------
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
    bump('#cartbar');
  }
  function bump(sel) {
    var bar = $(sel);
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
      '<span class="promo-title">Накроем стол</span><span class="promo-sub">Соберите стол и сразу увидите чек</span>' +
      '<span class="promo-pill">Собрать стол</span></div><img src="img/tort-med.jpg" alt=""></button>');
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
  }

  function menuNavLinks() {
    var links = [];
    if (SETS.length) links.push(['sec-sets', '🎁 Сеты']);
    if (COMBO) links.push(['sec-combo', 'Комбо']);
    MENU.forEach(function (s) { if (s.nav) links.push(['sec-' + s.id, s.nav]); });
    return links;
  }

  // ---------- event table builder ----------
  var evQty = function (id) { return evSel[id] || 0; };
  var evLines = function () {
    return EVCATS.reduce(function (a, c) { return a.concat(c.items.filter(function (it) { return evQty(it.id) > 0; })); }, []);
  };
  var evTotal = function () { return evLines().reduce(function (a, it) { return a + it.price * evQty(it.id); }, 0); };
  var needsAddress = function () { return EVENT_SERVICES.some(function (s) { return s.address && evForm.svc[s.id]; }); };
  function saveEv() { store.set('vk_ev', evSel); store.set('vk_evform', evForm); }

  function evCtrlHtml(id) {
    var q = evQty(id), k = esc(id);
    if (!q) return '<button class="add-round" type="button" data-evadd="' + k + '" aria-label="Добавить">+</button>';
    return '<div class="qty"><button type="button" data-evdec="' + k + '" aria-label="Меньше">−</button>' +
      '<input type="number" inputmode="numeric" min="0" max="9999" value="' + q + '" data-evinput="' + k + '" aria-label="Количество">' +
      '<button type="button" data-evinc="' + k + '" aria-label="Больше">+</button></div>';
  }
  function evSumHtml(id) {
    var it = EVI[id], q = evQty(id);
    return q ? q + ' ' + esc(it.unit) + ' = <b>' + fmt(q * it.price) + '</b>' : '';
  }
  function evRow(it) {
    return '<div class="evrow' + (evQty(it.id) ? ' on' : '') + '" data-evrow="' + esc(it.id) + '">' +
      '<div class="thumb">' + media(it) + '</div>' +
      '<div><div class="evrow-name">' + esc(it.name) + '</div>' +
      '<div class="evrow-meta">' + fmt(it.price) + ' / ' + esc(it.unit) + (it.note ? ' · ' + esc(it.note) : '') + '</div>' +
      '<div class="evrow-sum" data-evsum>' + evSumHtml(it.id) + '</div></div>' +
      '<div data-evctrl>' + evCtrlHtml(it.id) + '</div></div>';
  }
  function svcOpt(s) {
    return '<label class="opt"><input type="checkbox" name="svc" value="' + esc(s.id) + '"' + (evForm.svc[s.id] ? ' checked' : '') + '>' +
      '<span><span class="opt-ic">' + (s.emoji || '') + '</span><span class="opt-text"><b>' + esc(s.title) + '</b>' +
      '<small>' + esc(s.sub || '') + (s.price ? ' · ' + esc(s.price) : '') + '</small></span><span class="opt-check"></span></span></label>';
  }
  var autoLabel = function () { return '✨ Подобрать меню на ' + evForm.guests + ' ' + guestsWord(evForm.guests); };

  function renderEvents() {
    var hero = '<section class="ev-hero">' +
      '<h2 class="ev-title">Накроем стол</h2>' +
      '<p class="ev-lead">Соберите стол сами: выберите блюда и количество — сразу увидите полный чек.</p>' +
      '<div class="ev-chips"><span>Той</span><span>Ас</span><span>День рождения</span><span>Корпоратив</span><span>Сватовство</span></div>' +
      '<div class="ev-photos"><img src="img/plov.jpg" alt="Плов"><img src="img/tort-med.jpg" alt="Медовый торт"><img src="img/samsa1.jpg" alt="Самса"></div>' +
      '<ol class="ev-steps"><li><b>1</b>Гости</li><li><b>2</b>Блюда и количество</li><li><b>3</b>Чек и заявка</li></ol>' +
      '<button class="btn btn--gold" type="button" data-go="evs-guests">Собрать стол</button>' +
      '</section>';

    var quick = [10, 20, 30, 50, 100].map(function (n) {
      return '<button type="button" class="gq' + (evForm.guests === n ? ' on' : '') + '" data-gq="' + n + '">' + n + '</button>';
    }).join('');
    var guests = '<section class="sec" id="evs-guests">' + secHead('Сколько гостей?') +
      '<div class="pad"><div class="block">' +
      '<div class="guests"><button type="button" class="g-btn" data-gstep="-1" aria-label="Меньше гостей">−</button>' +
      '<label class="g-val"><input id="evGuests" type="number" inputmode="numeric" min="1" max="2000" value="' + evForm.guests + '" aria-label="Количество гостей"><span>гостей</span></label>' +
      '<button type="button" class="g-btn" data-gstep="1" aria-label="Больше гостей">+</button></div>' +
      '<div class="gq-row">' + quick + '</div>' +
      '<button class="btn btn--gold" type="button" data-evauto id="evAutoBtn">' + autoLabel() + '</button>' +
      '<p class="foot-hint">Положим примерный набор: плов, салаты, самсу, бауырсаки, торт и напитки. Дальше меняйте количество как хотите.</p>' +
      '</div></div></section>';

    var cats = EVCATS.map(function (cat) {
      return '<section class="sec" id="evs-' + esc(cat.id) + '">' +
        secHead(cat.title, '<span class="sec-count" data-evcount="' + esc(cat.id) + '"></span>') +
        '<div class="pad"><div class="block evlist">' + cat.items.map(evRow).join('') + '</div></div></section>';
    }).join('');

    var svc = EVENT_SERVICES.length ? '<section class="sec" id="evs-services">' + secHead('Услуги') +
      '<div class="pad"><div class="opt-list">' + EVENT_SERVICES.map(svcOpt).join('') + '</div></div></section>' : '';

    var help = '<div class="pad" style="margin-top:16px"><p class="note"><span class="note-ic">💬</span><span>Не знаете, что выбрать? ' +
      '<a href="' + esc(waUrl('Здравствуйте! Хочу заказать стол на мероприятие, подскажите по меню.')) + '" target="_blank" rel="noopener">Напишите нам в WhatsApp</a> — подскажем.</span></p></div>';

    $('#view-events').innerHTML = hero + guests + cats + svc + help;
    updateEvCounts();
  }

  function evNavLinks() {
    var links = [['evs-guests', '👥 Гости']];
    EVCATS.forEach(function (c) { links.push(['evs-' + c.id, c.nav]); });
    if (EVENT_SERVICES.length) links.push(['evs-services', '🍽️ Услуги']);
    return links;
  }

  function updateEvRow(id, opts) {
    var row = $('[data-evrow="' + id + '"]');
    if (!row) return;
    var q = evQty(id);
    row.classList.toggle('on', q > 0);
    $('[data-evsum]', row).innerHTML = evSumHtml(id);
    var box = $('[data-evctrl]', row);
    var input = $('input', box);
    if (opts && opts.keepInput && input) return;
    if (input && q > 0) { input.value = q; return; }
    box.innerHTML = evCtrlHtml(id);
  }
  function updateEvCounts() {
    EVCATS.forEach(function (c) {
      var el = $('[data-evcount="' + c.id + '"]');
      if (!el) return;
      var n = c.items.filter(function (it) { return evQty(it.id) > 0; }).length;
      el.textContent = n ? 'выбрано: ' + n : '';
    });
  }
  function setEvQty(id, q, opts) {
    if (!EVI[id]) return;
    q = Math.max(0, Math.min(9999, Math.floor(q || 0)));
    if (q > 0) evSel[id] = q; else delete evSel[id];
    saveEv();
    updateEvRow(id, opts);
    updateBars();
  }
  function setGuests(g) {
    g = Math.max(1, Math.min(2000, Math.floor(g || 0)));
    evForm.guests = g;
    saveEv();
    var inp = $('#evGuests');
    if (inp && document.activeElement !== inp) inp.value = g;
    $$('[data-gq]').forEach(function (b) { b.classList.toggle('on', parseInt(b.getAttribute('data-gq'), 10) === g); });
    var ab = $('#evAutoBtn');
    if (ab) ab.textContent = autoLabel();
    updateBars();
  }
  function autoFill() {
    var g = evForm.guests;
    var n = 0;
    Object.keys(EVI).forEach(function (id) {
      var it = EVI[id];
      if (it.perGuest > 0) {
        evSel[id] = Math.max(1, Math.ceil(it.perGuest * g - 1e-6));
        n++;
      }
    });
    saveEv();
    Object.keys(EVI).forEach(function (id) { updateEvRow(id); });
    updateBars();
    bump('#evbar');
    toast('Подобрали ' + n + ' ' + posWord(n) + ' на ' + g + ' ' + guestsWord(g) + ' — проверьте количество');
  }

  // ---------- tabs & nav ----------
  var navById = {};
  function renderCatnav(tab) {
    var nav = $('#catnav');
    var links = tab === 'events' ? evNavLinks() : menuNavLinks();
    nav.innerHTML = links.map(function (l) {
      return '<a href="#' + l[0] + '" data-target="' + l[0] + '">' + esc(l[1]) + '</a>';
    }).join('');
    navById = {};
    $$('a', nav).forEach(function (a) { navById[a.getAttribute('data-target')] = a; });
    nav.scrollLeft = 0;
  }

  function switchTab(name, opts) {
    currentTab = name;
    $$('.tab').forEach(function (t) { t.setAttribute('aria-selected', String(t.getAttribute('data-tab') === name)); });
    $('#view-menu').hidden = name !== 'menu';
    $('#view-events').hidden = name !== 'events';
    renderCatnav(name);
    updateStickyH();
    updateBars();
    try { history.replaceState(null, '', name === 'events' ? '#events' : location.pathname + location.search); } catch (e) { /* file:// */ }
    if (!opts || opts.scroll !== false) {
      var top = $('#sticky').offsetTop;
      if (window.scrollY > top) window.scrollTo({ top: top, behavior: 'auto' });
    }
  }

  function goTo(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var tab = el.closest('#view-events') ? 'events' : (el.closest('#view-menu') ? 'menu' : currentTab);
    if (tab !== currentTab) switchTab(tab, { scroll: false });
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function updateStickyH() {
    var h = $('#sticky').offsetHeight;
    $$('.sec').forEach(function (s) { s.style.scrollMarginTop = (h + 6) + 'px'; });
  }

  function setupNav() {
    if (!('IntersectionObserver' in window)) return;
    var current = null;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var a = navById[en.target.id];
        if (a && en.target.id !== current) {
          current = en.target.id;
          $$('#catnav a').forEach(function (x) { x.classList.toggle('active', x === a); });
          $('#catnav').scrollTo({ left: a.offsetLeft - 12, behavior: 'smooth' });
        }
      });
    }, { rootMargin: '-130px 0px -65% 0px' });
    $$('section[id^="sec-"], section[id^="evs-"]').forEach(function (s) { io.observe(s); });
  }

  // ---------- bars & refresh ----------
  function updateBars() {
    var sheetOpen = !$('#sheet').hidden;
    var n = count();
    $('#cartbar').hidden = sheetOpen || currentTab !== 'menu' || n === 0;
    $('#cartCount').textContent = n;
    $('#cartSum').textContent = fmt(total());
    var lines = evLines().length;
    $('#evbar').hidden = sheetOpen || currentTab !== 'events' || lines === 0;
    $('#evCount').textContent = lines;
    $('#evSum').textContent = fmt(evTotal());
    $('#evGuestsLbl').textContent = lines + ' ' + posWord(lines) + ' · на ' + evForm.guests + ' ' + guestsWord(evForm.guests);
    updateEvCounts();
  }

  function refresh() {
    $$('[data-ctrl]').forEach(function (el) { el.innerHTML = ctrlHtml(el.getAttribute('data-ctrl'), el.getAttribute('data-v')); });
    var cc = $('#comboCount');
    if (cc) {
      var k = cart.filter(function (r) { return r.key.indexOf('c:') === 0; }).reduce(function (a, r) { return a + r.qty; }, 0);
      cc.textContent = k ? 'В корзине: ' + k + ' шт.' : '';
    }
    updateBars();
    if (sheetMode === 'cart') renderCart();
  }

  var toastTimer;
  function toast(t) {
    var el = $('#toast');
    el.textContent = t;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2000);
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
    $('#evbar').hidden = true;
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

  // Cart, step 1
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
      '<div class="sum-row"><span>Товары, ' + n + ' шт.</span><span>' + fmt(t) + '</span></div>' +
      '<div class="sum-row"><span>Доставка</span><span>по тарифу Яндекса</span></div>' +
      '<div class="sum-row"><span>Самовывоз</span><span>бесплатно</span></div>' +
      '<div class="sum-row sum-row--total"><span>Итого</span><span>' + fmt(t) + '</span></div></div>';
    $$('[data-ctrl]', body).forEach(function (el) { el.innerHTML = ctrlHtml(el.getAttribute('data-ctrl'), el.getAttribute('data-v')); });
    body.scrollTop = scroll;
    setFoot('<button class="btn btn--split" type="button" data-step="checkout"><span>Оформить заказ</span><span>' + fmt(t) + '</span></button>');
  }

  // Cart, step 2: checkout
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
  function thumbsRow(list) {
    var shown = list.slice(0, 12);
    return '<div class="thumbs-row">' + shown.map(function (x) {
      return '<div class="thumb">' + x.thumb + (x.qty > 1 ? '<span class="q">×' + x.qty + '</span>' : '') + '</div>';
    }).join('') + (list.length > shown.length ? '<div class="thumb emo"><span style="font-size:14px;font-weight:900">+' + (list.length - shown.length) + '</span></div>' : '') + '</div>';
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
    var thumbs = thumbsRow(cart.map(function (r) { return { thumb: resolve(r.key).thumb, qty: r.qty }; }));

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
      '<div class="block"><h4 class="block-title">Ваш заказ</h4>' + thumbs +
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

  // ---------- WhatsApp ----------
  function waUrl(text) { return 'https://wa.me/' + digits(C.whatsapp) + '?text=' + encodeURIComponent(text); }
  function openWa(text) {
    var url = waUrl(text);
    var w = window.open(url, '_blank');
    if (!w) window.location.href = url;
  }
  var orderNumber = function () { return String(Date.now()).slice(-4); };

  function markInvalid(formSel, bad) {
    $$(formSel + ' .field').forEach(function (f) { f.classList.remove('invalid'); });
    bad.forEach(function (n) { var f = $(formSel + ' [data-field="' + n + '"]'); if (f) f.classList.add('invalid'); });
    var first = $(formSel + ' .invalid input, ' + formSel + ' .invalid textarea');
    if (first) { first.scrollIntoView({ block: 'center', behavior: 'smooth' }); first.focus({ preventScroll: true }); }
  }

  // ---------- regular order ----------
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
    var errEl = $('#orderErr');
    if (errs.length) {
      errEl.textContent = 'Заполните: ' + errs.join(', ');
      errEl.hidden = false;
      markInvalid('#orderForm', bad);
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

  function trackHtml(steps) {
    return '<div class="block"><ol class="track">' + steps.map(function (s) {
      return '<li class="' + s[0] + '"><span class="track-dot">' + s[1] + '</span><div><b>' + s[2] + '</b><small>' + esc(s[3]) + '</small></div></li>';
    }).join('') + '</ol></div>';
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
      trackHtml(steps) + kaspi + '</div>';
    $('#sheetBody').scrollTop = 0;
    setFoot('<div class="stack"><button class="btn btn--wa" type="button" id="resendWa">' + ICON.wa + ' Открыть WhatsApp ещё раз</button>' +
      '<button class="btn btn--ghost" type="button" data-close>Вернуться в меню</button></div>');
  }

  // ---------- event order: receipt → details → WhatsApp ----------
  function receiptHtml() {
    var g = evForm.guests, t = evTotal(), lines = evLines();
    var body = EVCATS.map(function (cat) {
      var rows = cat.items.filter(function (it) { return evQty(it.id) > 0; });
      if (!rows.length) return '';
      return '<div class="rc-cat">' + esc(cat.title) + '</div>' + rows.map(function (it) {
        var q = evQty(it.id);
        return '<div class="rc-line"><div class="rc-name">' + esc(it.name) + '<small>' + q + ' ' + esc(it.unit) + ' × ' + fmt(it.price) + '</small></div>' +
          '<div class="rc-sum">' + fmt(q * it.price) + '</div></div>';
      }).join('');
    }).join('');
    var svc = EVENT_SERVICES.filter(function (s) { return evForm.svc[s.id]; }).map(function (s) {
      return '<div class="rc-line"><div class="rc-name">' + esc(s.title) + '</div><div class="rc-sum rc-sum--muted">' + esc(s.price || '') + '</div></div>';
    }).join('');
    return '<div class="receipt-wrap"><div class="receipt">' +
      '<div class="rc-top"><div class="rc-logo">Восточка</div>' +
      '<div class="rc-sub">Чек стола · на ' + g + ' ' + guestsWord(g) + '</div>' +
      (evForm.date ? '<div class="rc-sub">' + esc(evForm.occasion) + ' · ' + fmtDate(evForm.date) + (evForm.time ? ', ' + esc(evForm.time) : '') + '</div>' : '') +
      '</div>' + body +
      (svc ? '<div class="rc-sep"></div><div class="rc-cat">Услуги</div>' + svc : '') +
      '<div class="rc-sep"></div>' +
      '<div class="rc-total"><span>Итого</span><span>' + fmt(t) + '</span></div>' +
      '<div class="rc-per">' + lines.length + ' ' + posWord(lines.length) + (g ? ' · ≈ ' + fmt(Math.round(t / g)) + ' на гостя' : '') + '</div>' +
      '<div class="rc-foot">Окончательную сумму подтвердим в WhatsApp</div>' +
      '</div></div>';
  }

  function openEvCheck() {
    openSheet('ev-check', { title: 'Чек стола', full: true });
    renderEvCheck();
    $('#sheetBody').scrollTop = 0;
  }

  function renderEvCheck() {
    if (!evLines().length) {
      $('#sheetBody').innerHTML = '<div class="empty"><div class="empty-ic">🧾</div>Стол пока пустой<br>Выберите блюда и количество</div>';
      setFoot('<button class="btn btn--ghost" type="button" data-close>Выбрать блюда</button>');
      return;
    }
    $('#sheetBody').innerHTML = receiptHtml() +
      '<button class="btn btn--ghost" type="button" data-close style="margin-top:20px">✏️ Изменить состав</button>';
    setFoot('<button class="btn btn--split" type="button" data-evstep><span>Дата и контакты</span><span>' + fmt(evTotal()) + '</span></button>');
  }

  function openEvDetails() {
    openSheet('ev-details', { title: 'Детали мероприятия', full: true, back: true });
    renderEvDetails();
    $('#sheetBody').scrollTop = 0;
  }

  function renderEvDetails() {
    var body = $('#sheetBody');
    var scroll = body.scrollTop;
    var t = evTotal(), lines = evLines(), g = evForm.guests;
    var occ = ['Той', 'Ас / поминки', 'День рождения', 'Корпоратив', 'Сватовство', 'Другое'];
    var thumbs = thumbsRow(lines.map(function (it) { return { thumb: media(it), qty: evQty(it.id) }; }));
    body.innerHTML = '<form id="evOrderForm" class="form" novalidate>' +
      '<div class="block"><h4 class="block-title">Мероприятие</h4><div class="form">' +
      '<label class="field" data-field="occasion"><span>Повод</span><select name="occasion">' + occ.map(function (o) {
        return '<option' + (evForm.occasion === o ? ' selected' : '') + '>' + o + '</option>';
      }).join('') + '</select></label>' +
      '<div class="row2">' + field('date', 'Дата', 'type="date" min="' + todayIso() + '"', evForm.date) +
      field('time', 'Время', 'type="time"', evForm.time) + '</div>' +
      field('guests', 'Гостей', 'type="number" inputmode="numeric" min="1" max="2000"', g) +
      '</div></div>' +
      '<div class="block"><h4 class="block-title">Услуги и адрес</h4><div class="opt-list">' + EVENT_SERVICES.map(svcOpt).join('') + '</div>' +
      '<div style="margin-top:12px">' + (needsAddress()
        ? field('address', 'Адрес или место проведения', 'autocomplete="street-address" placeholder="Улица, дом или название зала"', evForm.address)
        : '<div class="place"><span class="place-ic">' + ICON.pin + '</span><span><b>Самовывоз</b><small>' + esc(C.address || '') + '</small></span></div>') +
      '</div></div>' +
      '<div class="block"><h4 class="block-title">Контакты</h4><div class="row2">' +
      field('name', 'Имя', 'autocomplete="given-name" placeholder="Ваше имя"', form.name) +
      field('phone', 'Телефон', 'type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 7__ ___ __ __"', form.phone) +
      '</div></div>' +
      '<div class="block"><h4 class="block-title">Пожелания</h4>' +
      field('comment', 'Комментарий', 'placeholder="Бюджет, особые пожелания, во сколько накрыть…"', evForm.comment, 'textarea') + '</div>' +
      '<div class="block"><h4 class="block-title">Ваш стол</h4>' + thumbs +
      '<div class="sum-row"><span>Блюда, ' + lines.length + ' ' + posWord(lines.length) + '</span><span>' + fmt(t) + '</span></div>' +
      EVENT_SERVICES.filter(function (s) { return evForm.svc[s.id]; }).map(function (s) {
        return '<div class="sum-row"><span>' + esc(s.title) + '</span><span>' + esc(s.price || '') + '</span></div>';
      }).join('') +
      '<div class="sum-row sum-row--total"><span>Итого</span><span>' + fmt(t) + '</span></div>' +
      '<div class="rc-per">≈ ' + fmt(Math.round(t / Math.max(1, g))) + ' на гостя</div>' +
      '</div></form>';
    body.scrollTop = scroll;
    setFoot('<p class="form-err" id="evErr" hidden style="margin-bottom:8px"></p>' +
      '<button class="btn btn--wa btn--split" type="submit" form="evOrderForm">' +
      '<span style="display:flex;align-items:center;gap:8px">' + ICON.wa + 'Отправить заявку</span><span>' + fmt(t) + '</span></button>' +
      '<p class="foot-hint">Откроется WhatsApp с заявкой и полным чеком — нажмите «Отправить»</p>');
  }

  function buildEventText(no) {
    var g = evForm.guests, t = evTotal();
    var lines = ['🎉 *Заявка на стол №' + no + '* — Восточка', ''];
    lines.push('Повод: ' + evForm.occasion);
    lines.push('Дата: ' + fmtDate(evForm.date) + (evForm.time ? ', ' + evForm.time : ''));
    lines.push('Гостей: ' + g);
    lines.push(needsAddress() ? '📍 Место: ' + evForm.address : '🏪 Самовывоз');
    lines.push('', '🧾 *Чек:*');
    var i = 0;
    EVCATS.forEach(function (cat) {
      var rows = cat.items.filter(function (it) { return evQty(it.id) > 0; });
      if (!rows.length) return;
      lines.push('', '_' + cat.title + '_');
      rows.forEach(function (it) {
        var q = evQty(it.id);
        i++;
        lines.push(i + '. ' + it.name + ' — ' + q + ' ' + it.unit + ' × ' + fmt(it.price) + ' = ' + fmt(q * it.price));
      });
    });
    var svc = EVENT_SERVICES.filter(function (s) { return evForm.svc[s.id]; });
    if (svc.length) {
      lines.push('', '_Услуги_');
      svc.forEach(function (s) { lines.push('• ' + s.title + (s.price ? ' — ' + s.price : '')); });
    }
    lines.push('', '*Итого по меню: ' + fmt(t) + '*');
    lines.push(evLines().length + ' ' + posWord(evLines().length) + ' · ≈ ' + fmt(Math.round(t / Math.max(1, g))) + ' на гостя');
    lines.push('', '👤 ' + form.name + ', ' + form.phone);
    if (evForm.comment) lines.push('💬 ' + evForm.comment);
    return lines.join('\n');
  }

  function submitEv() {
    var errs = [], bad = [];
    if (!evForm.date) { errs.push('дату'); bad.push('date'); }
    if (!(evForm.guests > 0)) { errs.push('число гостей'); bad.push('guests'); }
    if (needsAddress() && String(evForm.address || '').trim().length < 4) { errs.push('адрес'); bad.push('address'); }
    if (!form.name.trim()) { errs.push('имя'); bad.push('name'); }
    if (digits(form.phone).length < 10) { errs.push('телефон'); bad.push('phone'); }
    var errEl = $('#evErr');
    if (errs.length) {
      errEl.textContent = 'Укажите: ' + errs.join(', ');
      errEl.hidden = false;
      markInvalid('#evOrderForm', bad);
      return;
    }
    var no = orderNumber();
    var text = buildEventText(no);
    lastEvent = {
      no: no, text: text, total: evTotal(), lines: evLines().length, guests: evForm.guests,
      receipt: receiptHtml(), delivery: needsAddress(),
    };
    openWa(text);
    evSel = {};
    saveEv();
    Object.keys(EVI).forEach(function (id) { updateEvRow(id); });
    showEvSuccess();
  }

  function showEvSuccess() {
    var e = lastEvent;
    sheetMode = 'ev-success';
    $('#sheetTitle').textContent = 'Заявка №' + e.no;
    $('#sheetBack').hidden = true;
    $('#sheetExtra').innerHTML = '';
    var steps = [
      ['done', '✓', 'Заявка сформирована', e.lines + ' ' + posWord(e.lines) + ' на ' + fmt(e.total)],
      ['', '2', 'Отправьте сообщение в WhatsApp', 'Нажмите «Отправить» в открывшемся чате'],
      ['', '3', 'Мы свяжемся с вами', 'Подтвердим меню, сумму и время'],
      ['', '4', e.delivery ? 'Привезём и накроем' : 'Заберёте заказ', e.delivery ? 'В назначенное время' : (C.address || '')],
    ];
    $('#sheetBody').innerHTML = '<div class="success">' +
      '<div class="success-icon">' + ICON.check + '</div>' +
      '<h4>Почти готово!</h4>' +
      '<p>Мы открыли WhatsApp с вашей заявкой и полным чеком. Если чат не открылся — нажмите кнопку ниже.</p>' +
      trackHtml(steps) + e.receipt + '</div>';
    $('#sheetBody').scrollTop = 0;
    setFoot('<div class="stack"><button class="btn btn--wa" type="button" id="resendEv">' + ICON.wa + ' Открыть WhatsApp ещё раз</button>' +
      '<button class="btn btn--ghost" type="button" data-close>Готово</button></div>');
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
  }

  // ---------- wiring ----------
  document.addEventListener('click', function (e) {
    var t = e.target.closest('button, a, [data-close]');
    if (!t) return;
    var a;
    if (t.hasAttribute('data-add')) { add(t.getAttribute('data-add')); return; }
    if (t.hasAttribute('data-inc')) { a = t.getAttribute('data-inc'); setQty(a, qtyOf(a) + 1); return; }
    if (t.hasAttribute('data-dec')) { a = t.getAttribute('data-dec'); setQty(a, qtyOf(a) - 1); return; }
    if (t.hasAttribute('data-evadd')) { setEvQty(t.getAttribute('data-evadd'), 1); bump('#evbar'); return; }
    if (t.hasAttribute('data-evinc')) { a = t.getAttribute('data-evinc'); setEvQty(a, evQty(a) + 1); return; }
    if (t.hasAttribute('data-evdec')) { a = t.getAttribute('data-evdec'); setEvQty(a, evQty(a) - 1); return; }
    if (t.hasAttribute('data-gstep')) { setGuests(evForm.guests + parseInt(t.getAttribute('data-gstep'), 10)); return; }
    if (t.hasAttribute('data-gq')) { setGuests(parseInt(t.getAttribute('data-gq'), 10)); return; }
    if (t.hasAttribute('data-evauto')) { autoFill(); return; }
    if (t.hasAttribute('data-evstep')) { openEvDetails(); return; }
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
    if (t.id === 'openEv') { openEvCheck(); return; }
    if (t.id === 'sheetBack') { if (sheetMode === 'ev-details') openEvCheck(); else openCart(); return; }
    if (t.id === 'comboAdd') {
      add('c:' + COMBO.groups.map(function (g) { return comboPick[g.key]; }).join(':'));
      closeSheet();
      return;
    }
    if (t.id === 'resendWa' && lastOrder) { openWa(lastOrder.text); return; }
    if (t.id === 'resendEv' && lastEvent) { openWa(lastEvent.text); return; }
    if (t.matches('#catnav a')) { e.preventDefault(); goTo(t.getAttribute('data-target')); }
  });

  // Builder inputs (quantities, guests, services) — anywhere on the page
  document.addEventListener('input', function (e) {
    var el = e.target;
    if (el.hasAttribute('data-evinput')) {
      if (el.value === '') return;
      setEvQty(el.getAttribute('data-evinput'), parseInt(el.value, 10) || 0, { keepInput: true });
    } else if (el.id === 'evGuests') {
      var g = parseInt(el.value, 10);
      if (g > 0) setGuests(g);
    }
  });
  document.addEventListener('change', function (e) {
    var el = e.target;
    if (el.hasAttribute('data-evinput')) {
      setEvQty(el.getAttribute('data-evinput'), parseInt(el.value, 10) || 0);
    } else if (el.id === 'evGuests') {
      setGuests(parseInt(el.value, 10) || evForm.guests);
      el.value = evForm.guests;
    } else if (el.name === 'svc') {
      evForm.svc[el.value] = el.checked;
      saveEv();
      $$('input[name="svc"]').forEach(function (x) { if (x.value === el.value) x.checked = el.checked; });
      if (sheetMode === 'ev-details') renderEvDetails();
    }
  });
  document.addEventListener('focusin', function (e) {
    if (e.target.hasAttribute && e.target.hasAttribute('data-evinput')) e.target.select();
  });

  // Sheet forms
  function evField(el) {
    var n = el.name;
    if (n === 'name' || n === 'phone') { form[n] = el.value; store.set('vk_form', form); }
    else if (n === 'guests') { var g = parseInt(el.value, 10); if (g > 0) setGuests(g); }
    else if (n in evForm && n !== 'svc') { evForm[n] = el.value; saveEv(); }
  }
  function clearInvalid(el, errSel, formSel) {
    var f = el.closest('.field');
    if (f) f.classList.remove('invalid');
    var err = $(errSel);
    if (err && !$(formSel + ' .invalid')) err.hidden = true;
  }

  var sheetBody = $('#sheetBody');
  sheetBody.addEventListener('change', function (e) {
    var el = e.target;
    if (!el.name || el.name === 'svc') return;
    if (sheetMode === 'combo' && el.name.indexOf('combo-') === 0) { comboPick[el.name.slice(6)] = el.value; return; }
    if (sheetMode === 'checkout' && el.name in form) {
      form[el.name] = el.value;
      store.set('vk_form', form);
      if (el.name === 'mode' || el.name === 'when') renderCheckout();
      return;
    }
    if (sheetMode === 'ev-details') evField(el);
  });
  sheetBody.addEventListener('input', function (e) {
    var el = e.target;
    if (!el.name || el.type === 'radio' || el.type === 'checkbox') return;
    if (sheetMode === 'checkout' && el.name in form) {
      form[el.name] = el.value;
      store.set('vk_form', form);
      clearInvalid(el, '#orderErr', '#orderForm');
    } else if (sheetMode === 'ev-details') {
      evField(el);
      clearInvalid(el, '#evErr', '#evOrderForm');
    }
  });
  sheetBody.addEventListener('submit', function (e) {
    if (e.target.id === 'orderForm') { e.preventDefault(); submitOrder(); }
    if (e.target.id === 'evOrderForm') { e.preventDefault(); submitEv(); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && sheetMode) closeSheet(); });
  window.addEventListener('resize', updateStickyH);

  // ---------- init ----------
  renderMenu();
  renderEvents();
  fillInfo();
  renderCatnav('menu');
  refresh();
  setupNav();
  updateStickyH();
  if (location.hash === '#events') switchTab('events', { scroll: false });
})();
