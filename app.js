(function () {
  'use strict';

  var C = window.CONFIG || {};
  var PH = window.PH || function () { return ''; };
  var MENU = window.MENU || [];
  var COMBO = window.COMBO;
  var SETS = window.SETS || [];
  var UPSELL = window.UPSELL || [];
  var EVENT_MENU = window.EVENT_MENU || [];
  var EVENT_SETS = (window.EVENT_SETS || []).slice().sort(function (a, b) { return a.guests - b.guests; });
  var EVENT_SERVICES = window.EVENT_SERVICES || [];
  var OCCASIONS = ['Той', 'Ас / поминки', 'День рождения', 'Корпоратив', 'Сватовство', 'Другое'];
  var OCC_CHIPS = [['Той', 'Той'], ['Ас', 'Ас / поминки'], ['День рождения', 'День рождения'], ['Корпоратив', 'Корпоратив'], ['Сватовство', 'Сватовство']];
  var LAST_TTL = 12 * 60 * 60 * 1000;
  var REPEAT_TTL = 30 * 24 * 60 * 60 * 1000;

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
  var guestsNom = function (n) { return plural(n, 'гость', 'гостя', 'гостей'); };
  var posWord = function (n) { return plural(n, 'позиция', 'позиции', 'позиций'); };
  var fmtDate = function (d) { return d ? d.split('-').reverse().join('.') : ''; };
  var WD = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
  function fmtDateW(iso) {
    if (!iso) return '';
    var p = iso.split('-');
    return WD[new Date(+p[0], +p[1] - 1, +p[2]).getDay()] + ', ' + fmtDate(iso);
  }
  function isoPlus(days) {
    var t = new Date();
    t.setDate(t.getDate() + days);
    t.setMinutes(t.getMinutes() - t.getTimezoneOffset());
    return t.toISOString().slice(0, 10);
  }
  function nowHM() { var d = new Date(); return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); }
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
    truck: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9 1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>',
    bag: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm6 16H6V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h4v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z"/></svg>',
    cash: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M19 14V6c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zm-9-1c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm13-6v11c0 1.1-.9 2-2 2H4v-2h17V7h2z"/></svg>',
    serve: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M2 17h20v2H2zm11.84-9.21c.1-.24.16-.51.16-.79 0-1.1-.9-2-2-2s-2 .9-2 2c0 .28.06.55.16.79C6.25 8.6 3.27 11.93 3 16h18c-.27-4.07-3.25-7.4-7.16-8.21z"/></svg>',
    receipt: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M19.5 3.5 18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2v20l1.5-1.5L9 22l1.5-1.5L12 22l1.5-1.5L15 22l1.5-1.5L18 22l1.5-1.5L21 22V2l-1.5 1.5zM19 19.09H5V4.91h14v14.18zM6 15h12v2H6zm0-4h12v2H6zm0-4h12v2H6z"/></svg>',
    edit: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>',
    clock: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>',
    copy: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>',
    info: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>',
    table: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M12 6c1.11 0 2-.9 2-2 0-.38-.1-.73-.29-1.03L12 0l-1.71 2.97c-.19.3-.29.65-.29 1.03 0 1.1.9 2 2 2zm4.6 9.99-1.07-1.07-1.08 1.07c-1.3 1.3-3.58 1.31-4.89 0l-1.07-1.07-1.09 1.07C6.75 16.64 5.88 17 4.96 17c-.73 0-1.4-.23-1.96-.61V21c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-4.61c-.56.38-1.23.61-1.96.61-.92 0-1.79-.36-2.44-1.01zM18 9h-5V7h-2v2H6c-1.66 0-3 1.34-3 3v1.54c0 1.08.88 1.96 1.96 1.96.52 0 1.02-.2 1.38-.57l2.14-2.13 2.13 2.13c.74.74 2.03.74 2.77 0l2.14-2.13 2.13 2.13c.37.37.86.57 1.38.57 1.08 0 1.96-.88 1.96-1.96V12C21 10.34 19.66 9 18 9z"/></svg>',
  };
  var SVC_ICON = { serve: ICON.serve, delivery: ICON.truck, pickup: ICON.bag };

  // Kaspi: red round icon + the word «Kaspi»
  function kaspiMark(big) {
    return '<span class="kaspi-brand' + (big ? ' kaspi-brand--big' : '') + '">' +
      (C.kaspiLogo ? '<span class="kaspi-ic"><img src="' + esc(C.kaspiLogo) + '" alt="" onerror="this.parentNode.remove()"></span>' : '') +
      '<span class="kaspi-word">Kaspi</span></span>';
  }

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

  function emoTile(it) {
    return '<div class="emo t-' + esc(it.section || '') + '"><span aria-hidden="true">' + (it.emoji || '🍽️') + '</span></div>';
  }
  var POS = {};
  Object.keys(window.PHOTOS || {}).forEach(function (k) { var p = window.PHOTOS[k]; if (p.pos) POS[p.src] = p.pos; });
  function media(it) {
    if (!it.img) return emoTile(it);
    return '<img src="' + esc(it.img) + '" alt="' + esc(it.name) + '" loading="lazy" data-fb="' + esc(emoTile(it)) + '"' +
      (POS[it.img] ? ' style="object-position:' + esc(POS[it.img]) + '"' : '') +
      ' onerror="this.outerHTML=this.getAttribute(\'data-fb\')">';
  }
  function mediaBox(it, extra) {
    return '<div class="media' + (it.img && it.fit === 'contain' ? ' media--contain' : '') + '">' + media(it) + (extra || '') + '</div>';
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
        details: s.items.map(function (x) {
          var si = ITEMS[x[0]];
          return itemName(x[0]) + (si && si.note ? ' (' + si.note + ')' : '') + ' ×' + x[1] + (si && si.preorder ? ' — на заказ' : '');
        }).join(', '),
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
        price: base.price, img: base.img, fit: base.fit, emoji: base.emoji, section: base.section, preorder: !!base.preorder,
      };
      EVI[x.id] = it;
      return it;
    });
    return { id: cat.id, title: cat.title, nav: cat.nav || cat.title, items: items };
  }).filter(function (c) { return c.items.length; });

  function tableSetTotal(s) {
    return s.items.reduce(function (a, p) { return a + (EVI[p[0]] ? EVI[p[0]].price * p[1] : 0); }, 0);
  }
  // A ready table recalculated for another number of guests
  function scaledItems(s, to) {
    var out = {};
    s.items.forEach(function (p) {
      if (!EVI[p[0]] || !(p[1] > 0)) return;
      var q = p[1];
      if (to !== s.guests) {
        q = p[1] * to / s.guests;
        if (q < 0.5) return; // e.g. a whole cake for 1–5 guests is not added
        q = Math.ceil(q - 1e-9);
      }
      out[p[0]] = q;
    });
    return out;
  }
  function scaledTotal(s, to) {
    var it = scaledItems(s, to);
    return Object.keys(it).reduce(function (a, id) { return a + EVI[id].price * it[id]; }, 0);
  }

  // ---------- state ----------
  var cart = store.get('vk_cart', []).filter(function (r) { return r && r.key && r.qty > 0 && resolve(r.key); });
  var form = Object.assign({
    mode: 'delivery', name: '', phone: '', address: '', entrance: '',
    when: 'asap', day: 'today', date: '', time: '', pay: 'kaspi', comment: '',
  }, store.get('vk_form', {}));
  if (form.date && form.date < todayIso()) { form.date = ''; form.day = 'today'; }
  var evSel = store.get('vk_ev', {});
  Object.keys(evSel).forEach(function (k) { if (!EVI[k] || !(evSel[k] > 0)) delete evSel[k]; });
  var evForm = Object.assign({
    guests: '', occasion: '', date: '', time: '', address: '', comment: '', how: '', base: '',
  }, store.get('vk_evform', {}));
  delete evForm.svc;
  if (OCCASIONS.indexOf(evForm.occasion) < 0) evForm.occasion = '';
  if (evForm.date && evForm.date < todayIso()) evForm.date = '';
  if (!svcById(evForm.how)) evForm.how = EVENT_SERVICES.length ? EVENT_SERVICES[0].id : '';
  var G = function () { return parseInt(evForm.guests, 10) || 0; };

  var lastOrder = null;
  var lastEvent = null;
  var sheetMode = null;
  var clearArmed = false;
  var armedSet = null;
  var takenSet = null;
  var currentTab = 'menu';
  var sheetDepth = 0;
  var ignorePop = false;
  var orderTried = false;
  var evTried = false;
  var freshTime = false;
  var commentOpen = false;
  var evCommentOpen = false;
  var openDet = {};

  // ---------- last order / request (survives a reload while the customer is in WhatsApp) ----------
  function loadLast(kind) {
    var l = store.get('vk_last_' + kind, null);
    if (!l || !l.ts || Date.now() - l.ts > LAST_TTL) return null;
    return l.data;
  }
  function saveLast(kind, data) {
    store.set('vk_last_' + kind, { data: data, ts: Date.now() });
    renderLastBanner();
  }
  function bannerRow(kind, ic, title, sub, mod) {
    return '<div class="last-row' + (mod ? ' last-row--' + mod : '') + '"><button class="last-open" type="button" data-last-open="' + kind + '">' +
      '<span class="last-ic" aria-hidden="true">' + ic + '</span>' +
      '<span class="last-text"><b>' + esc(title) + '</b><small>' + esc(sub) + '</small></span></button>' +
      '<button class="last-x" type="button" data-last-close="' + kind + '" aria-label="Скрыть напоминание">×</button></div>';
  }
  function renderLastBanner() {
    var el = $('#lastBanner');
    if (!el) return;
    var onMenu = currentTab === 'menu';
    var o = onMenu ? loadLast('order') : null, e = onMenu ? null : loadLast('event');
    var rows = [];
    if (o) {
      var kIc = C.kaspiLogo ? '<span class="kaspi-ic kaspi-ic--sm"><img src="' + esc(C.kaspiLogo) + '" alt=""></span>' : ICON.receipt;
      rows.push(o.pay === 'kaspi'
        ? bannerRow('order', kIc, 'Заказ №' + o.no, o.mode === 'delivery'
          ? 'Ждём итог с доставкой · затем Kaspi'
          : 'Оплатить ' + fmt(o.total) + ' в Kaspi · отправить чек', 'kaspi')
        : bannerRow('order', ICON.receipt, 'Заказ №' + o.no + ' · ' + fmt(o.total), 'Детали заказа'));
    }
    var rp = onMenu && !o && !cart.length ? loadRepeat() : null;
    if (rp) {
      var thumbs = '<span class="last-thumbs">' + rp.cart.slice(0, 3).map(function (r) { return '<span>' + resolve(r.key).thumb + '</span>'; }).join('') + '</span>';
      rows.push(bannerRow('repeat', thumbs, 'Повторить заказ', rp.cart.length + ' ' + posWord(rp.cart.length) + ' · ' + fmt(rp.total), 'repeat'));
    }
    if (e) rows.push(bannerRow('event', ICON.table, 'Заявка на стол №' + e.no, 'Открыть заявку'));
    el.innerHTML = rows.join('');
    el.hidden = !rows.length;
  }
  // the last cart, to repeat the order in one tap (30 days)
  function loadRepeat() {
    var l = store.get('vk_last_repeat', null);
    if (!l || !l.ts || Date.now() - l.ts > REPEAT_TTL || !l.data || !l.data.cart) return null;
    var items = l.data.cart.filter(function (r) { return r && r.key && r.qty > 0 && resolve(r.key); });
    if (!items.length) return null;
    var tot = items.reduce(function (a, r) { return a + resolve(r.key).price * r.qty; }, 0);
    var first = resolve(items[0].key).name;
    return { cart: items, total: tot, label: first + (items.length > 1 ? ' и ещё ' + (items.length - 1) : '') };
  }
  function repeatOrder() {
    var rp = loadRepeat();
    if (!rp) { renderLastBanner(); return; }
    cart = rp.cart.map(function (r) { return { key: r.key, qty: r.qty }; });
    store.set('vk_cart', cart);
    refresh();
    openCart();
  }
  try { localStorage.removeItem('vk_last'); } catch (e) { /* old format */ }
  lastOrder = loadLast('order');
  lastEvent = loadLast('event');

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
    var x = resolve(key);
    var nm = esc(x ? x.name : '');
    if (v === 'sheet') {
      if (!q) {
        return '<button class="btn btn--split" type="button" data-add="' + k + '"><span>Добавить</span><span>' + fmt(x ? x.price : 0) + '</span></button>';
      }
      return '<div class="item-qty"><div class="stepper"><button type="button" data-dec="' + k + '" aria-label="Убрать одну: ' + nm + '">−</button>' +
        '<span>' + q + '</span><button type="button" data-inc="' + k + '" aria-label="Добавить ещё: ' + nm + '">+</button></div>' +
        '<button class="btn" type="button" data-close>Готово · ' + fmt((x ? x.price : 0) * q) + '</button></div>';
    }
    if (v === 'card') {
      if (!q) {
        return '<div class="card-row"><span class="card-price">' + fmt(x ? x.price : 0) + '</span>' +
          '<button class="add-round add-round--red" type="button" data-add="' + k + '" aria-label="Добавить: ' + nm + '">+</button></div>';
      }
      return '<div class="card-price card-price--on">' + fmt(x ? x.price : 0) + '</div>' + ctrlHtml(key, '');
    }
    if (v === 'mini') {
      if (!q) {
        return '<div class="mini-foot"><span class="mini-price">' + fmt(x ? x.price : 0) + '</span>' +
          '<button class="add-round" type="button" data-add="' + k + '" aria-label="Добавить: ' + nm + '">+</button></div>';
      }
      v = 'sm';
    }
    if (v === 'sm') {
      if (!q) return '<button class="add-round" type="button" data-add="' + k + '" aria-label="Добавить: ' + nm + '">+</button>';
      return '<div class="stepper stepper--sm"><button type="button" data-dec="' + k + '" aria-label="Убрать одну: ' + nm + '">−</button>' +
        '<span>' + q + '</span><button type="button" data-inc="' + k + '" aria-label="Добавить ещё: ' + nm + '">+</button></div>';
    }
    if (!q) return '<button class="btn-add" type="button" data-add="' + k + '" aria-label="Добавить: ' + nm + '"><b aria-hidden="true">+</b> Добавить</button>';
    return '<div class="stepper"><button type="button" data-dec="' + k + '" aria-label="Убрать одну: ' + nm + '">−</button>' +
      '<span>' + q + '</span><button type="button" data-inc="' + k + '" aria-label="Добавить ещё: ' + nm + '">+</button></div>';
  }
  var ctrl = function (key, v) { return '<div class="card-ctrl" data-ctrl="' + esc(key) + '"' + (v ? ' data-v="' + v + '"' : '') + '></div>'; };

  // ---------- menu rendering ----------
  function card(it) {
    var badge = it.preorder ? '<span class="badge">На заказ</span>' : '';
    return '<article class="card' + (it.highlight ? ' card--hl' : '') + '" data-item="' + esc(it.id) + '">' +
      mediaBox(it, badge) +
      '<div class="card-body"><div class="card-name">' + esc(it.name) + '</div>' +
      (it.note && it.note.length <= 24 ? '<div class="card-note">' + esc(it.note) + '</div>' : '') +
      ctrl('i:' + it.id, 'card') + '</div></article>';
  }

  function secHead(title, extra) {
    return '<div class="sec-head"><h2 class="sec-title">' + esc(title) + '</h2>' + (extra || '') + '</div>';
  }

  function maxSetSaving() {
    return SETS.reduce(function (m, s) { var p = setPrice(s); return Math.max(m, p.sum - p.price); }, 0);
  }

  function evTopHtml() {
    var gs = EVENT_SETS.map(function (s) { return s.guests; });
    var range = gs.length ? gs[0] + '–' + gs[gs.length - 1] + ' гостей' : '';
    return '<section class="evtop"><button class="evtop-card" type="button" data-tab-go="events">' +
      '<span class="evtop-img"><img src="' + esc(PH('table')) + '" alt=""><span class="evtop-kicker">Той · Ас · День рождения</span></span>' +
      '<span class="evtop-body"><b class="evtop-title">Накроем стол для гостей</b>' +
      '<small>' + (range ? 'Готовые столы на ' + range + ' или соберите свой' : 'Соберите стол из наших блюд') + ' — сразу увидите полный чек</small>' +
      '<span class="evtop-cta">Собрать стол <span aria-hidden="true">→</span></span></span></button></section>';
  }
  function evPromoHtml() {
    return '<section class="sec"><button class="evpromo" type="button" data-tab-go="events">' +
      '<img src="' + esc(PH('table')) + '" alt="">' +
      '<span class="evpromo-text"><b>Накроем стол</b><small>Той, ас, день рождения — соберите стол и сразу увидите чек</small></span>' +
      '<span class="evpromo-go" aria-hidden="true">›</span></button></section>';
  }

  function setsHtml() {
    if (!SETS.length) return '';
    var cards = SETS.map(function (s) {
      var p = setPrice(s);
      return '<article class="setcard">' +
        '<div class="setcard-img' + (s.imageFit === 'contain' ? ' setcard-img--contain' : '') + '"><img src="' + esc(s.image) + '" alt="" loading="lazy">' +
        (p.sum > p.price ? '<span class="setcard-badge">−' + fmt(p.sum - p.price) + '</span>' : '') +
        (s.serves ? '<span class="setcard-serves">' + esc(s.serves) + '</span>' : '') + '</div>' +
        '<div class="setcard-body"><h3 class="setcard-title">' + esc(s.title) + '</h3>' +
        '<ul class="setcard-list">' + s.items.map(function (x) {
          var it = ITEMS[x[0]];
          return '<li>' + esc(itemName(x[0])) + (it && it.note ? ' (' + esc(it.note) + ')' : '') + ' × ' + x[1] + '</li>';
        }).join('') + '</ul>' +
        '<div class="setcard-foot"><div>' + (p.sum > p.price ? '<span class="price-old">' + fmt(p.sum) + '</span>' : '') +
        '<span class="price-new">' + fmt(p.price) + '</span></div>' + ctrl('s:' + s.id, 'sm') + '</div></div></article>';
    }).join('');
    return '<section class="sec" id="sec-sets">' + secHead('Сеты') +

      '<div class="hscroll">' + cards + '</div></section>';
  }

  function comboHtml() {
    if (!COMBO) return '';
    var lists = COMBO.groups.slice(0, 2).map(function (g) {
      return '<b>' + esc(g.label.split(' ')[0]) + ':</b> ' + esc(g.options.map(itemName).join(', '));
    }).join('<br>');
    return '<section class="sec" id="sec-combo">' + secHead(COMBO.title) +
      '<div class="combo"><div class="combo-text">' +
      '<div class="combo-price">' + fmt(COMBO.price) + '</div>' +
      '<div class="combo-sub">' + esc(COMBO.subtitle) + '</div>' +
      '<p class="combo-list">' + lists + '</p>' +
      '<button class="btn btn--sm" type="button" data-open-combo>Собрать комбо</button>' +
      '<div class="combo-count" id="comboCount"></div>' +
      '</div><div class="combo-img"><img src="' + esc(COMBO.image) + '" alt="" loading="lazy"></div></div></section>';
  }

  // A section without any photo is shown as a compact list, with photos — as a grid of cards.
  // In menu.js a section can force it: layout: 'grid' or layout: 'list'.
  function sectionLayout(sec) {
    if (sec.layout === 'grid' || sec.layout === 'list') return sec.layout;
    return sec.items.some(function (it) { return it.img; }) ? 'grid' : 'list';
  }
  function rowCard(it) {
    var note = [it.note, it.preorder ? 'на заказ' : ''].filter(Boolean).join(' · ');
    return '<article class="mrow' + (it.highlight ? ' mrow--hl' : '') + '" data-item="' + esc(it.id) + '"><div class="thumb">' + media(it) + '</div>' +
      '<div class="mrow-main"><div class="mrow-name">' + esc(it.name) + '</div>' +
      (note ? '<div class="card-note">' + esc(note) + '</div>' : '') +
      '<div class="mrow-price">' + fmt(it.price) + '</div></div>' +
      ctrl('i:' + it.id, 'sm') + '</article>';
  }
  function sectionHtml(sec) {
    var list = sectionLayout(sec) === 'list';
    return (sec.group ? '<div class="group-head"><b>' + esc(sec.group) + '</b>' + (sec.groupNote ? '<small>' + esc(sec.groupNote) + '</small>' : '') + '</div>' : '') +
      '<section class="sec" id="sec-' + esc(sec.id) + '">' + secHead(sec.title) + (sec.lead ? '<p class="sec-lead">' + esc(sec.lead) + '</p>' : '') +
      (list
        ? '<div class="mlist">' + sec.items.map(function (it) { return rowCard(ITEMS[it.id]); }).join('') + '</div>'
        : '<div class="grid">' + sec.items.map(function (it) { return card(ITEMS[it.id]); }).join('') + '</div>') +
      '</section>';
  }

  // extra blocks placed after a menu section (by section id)
  var MENU_AFTER = {
    desserts: function () { return onOrderHtml(); },
    bakery: function () { return setsHtml(); },
    hot: function () { return reviewsHtml('sec-reviews'); },
    second: function () { return comboHtml(); },
  };

  function onOrderHtml() {
    var L = window.ON_ORDER || [];
    if (!L.length) return '';
    return '<section class="sec" id="sec-order">' + secHead('Под заказ') +
      '<p class="sec-lead">Цену подскажем в WhatsApp</p><div class="grid">' + L.map(function (g, i) {
        return '<article class="card card--order"><button class="media media-btn" type="button" data-zoom="' + esc(g.img) + '" aria-label="Фото: ' + esc(g.name) + '">' +
          '<img src="' + esc(g.img) + '" alt="' + esc(g.name) + '" loading="lazy"></button>' +
          '<div class="card-body"><div class="card-name">' + esc(g.name) + '</div>' +
          (g.note ? '<div class="card-note">' + esc(g.note) + '</div>' : '') +
          '<button class="ask-btn" type="button" data-ask="' + i + '">' + ICON.wa + '<span>Узнать цену</span></button></div></article>';
      }).join('') + '</div></section>';
  }

  function reviewsHtml(id) {
    var R = window.REVIEWS || [];
    if (!R.length) return '';
    return '<section class="sec" id="' + id + '">' + secHead('Отзывы') + '<div class="pad">' + R.map(function (r) {
      return '<figure class="review"><blockquote>' + esc(r.text) + '</blockquote>' +
        '<figcaption>' + esc(r.author) + (r.source ? ' · ' + esc(r.source) : '') + '</figcaption></figure>';
    }).join('') +
      (C.instagram ? '<a class="review-more" href="https://instagram.com/' + esc(C.instagram) + '" target="_blank" rel="noopener">Больше отзывов и фото в Instagram →</a>' : '') +
      '</div></section>';
  }

  // the dish card: big photo, price, description, add to cart
  function openItem(id) {
    var it = ITEMS[id];
    if (!it) return;
    var desc = it.desc || (window.DESC || {})[id] || '';
    var longNote = it.note && it.note.length > 24;
    openSheet('item', { title: '' });
    $('#sheetBody').innerHTML =
      '<div class="item-photo' + (it.img && it.fit === 'contain' ? ' media--contain' : '') + '">' + media(it) +
        (it.preorder ? '<span class="badge">На заказ</span>' : '') + '</div>' +
      '<h2 class="item-name">' + esc(it.name) + '</h2>' +
      '<div class="item-meta"><span class="item-price">' + fmt(it.price) + '</span>' +
        (it.note && !longNote ? '<span class="item-pill">' + esc(it.note) + '</span>' : '') + '</div>' +
      (desc ? '<p class="item-desc">' + esc(desc) + '</p>' : '') +
      (longNote ? '<p class="item-desc"><b>Состав:</b> ' + esc(it.note) + '</p>' : '');
    $('#sheetBody').scrollTop = 0;
    setFoot('<div data-ctrl="i:' + esc(id) + '" data-v="sheet">' + ctrlHtml('i:' + id, 'sheet') + '</div>');
  }

  function renderMenu() {
    var ids = MENU.map(function (x) { return x.id; });
    var rest = Object.keys(MENU_AFTER).filter(function (k) { return ids.indexOf(k) < 0; });
    $('#menu').innerHTML = evTopHtml() + MENU.map(function (sec) {
      return sectionHtml(sec) + (MENU_AFTER[sec.id] ? MENU_AFTER[sec.id]() : '');
    }).join('') + rest.map(function (k) { return MENU_AFTER[k](); }).join('');
  }

  function menuNavLinks() {
    var links = [];
    MENU.forEach(function (s) {
      if (s.nav) links.push(['sec-' + s.id, s.nav]);
      if (s.id === 'desserts' && (window.ON_ORDER || []).length) links.push(['sec-order', 'Под заказ']);
      if (s.id === 'bakery' && SETS.length) links.push(['sec-sets', 'Сеты']);
      if (s.id === 'second' && COMBO) links.push(['sec-combo', 'Комбо']);
    });
    return links;
  }

  // ---------- event table builder ----------
  var evQty = function (id) { return evSel[id] || 0; };
  var evLines = function () {
    return EVCATS.reduce(function (a, c) { return a.concat(c.items.filter(function (it) { return evQty(it.id) > 0; })); }, []);
  };
  var evTotal = function () { return evLines().reduce(function (a, it) { return a + it.price * evQty(it.id); }, 0); };
  function svcById(id) { return EVENT_SERVICES.filter(function (s) { return s.id === id; })[0]; }
  var needsAddress = function () { var s = svcById(evForm.how); return !!(s && s.address); };
  var evTimeLabel = function () { var s = svcById(evForm.how); return (s && s.time) || 'Время'; };
  function saveEv() { store.set('vk_ev', evSel); store.set('vk_evform', evForm); }

  function evCtrlHtml(id) {
    var q = evQty(id), k = esc(id), nm = esc(EVI[id].name);
    if (!q) return '<button class="add-round" type="button" data-evadd="' + k + '" aria-label="Добавить: ' + nm + '">+</button>';
    return '<div class="qty"><button type="button" data-evdec="' + k + '" aria-label="Меньше: ' + nm + '">−</button>' +
      '<input type="number" inputmode="numeric" min="0" max="9999" value="' + q + '" data-evinput="' + k + '" aria-label="Количество: ' + nm + '">' +
      '<button type="button" data-evinc="' + k + '" aria-label="Больше: ' + nm + '">+</button></div>';
  }
  function evSumHtml(id) {
    var it = EVI[id], q = evQty(id);
    return q ? '= <b>' + fmt(q * it.price) + '</b>' : '';
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
    var sub = s.sub || (s.address ? '' : C.address || '');
    return '<label class="opt"><input type="radio" name="how" value="' + esc(s.id) + '"' + (evForm.how === s.id ? ' checked' : '') + '>' +
      '<span><span class="opt-ic">' + (SVC_ICON[s.id] || s.emoji || '') + '</span><span class="opt-text"><b>' + esc(s.title) + '</b>' +
      '<small>' + esc([sub, s.price].filter(Boolean).join(' · ')) + '</small></span><span class="opt-radio"></span></span></label>';
  }
  function tsetInner(s, to, badge) {
    var q = scaledItems(s, to);
    var t = Object.keys(q).reduce(function (a, id) { return a + EVI[id].price * q[id]; }, 0);
    var list = s.items.filter(function (p) { return q[p[0]]; }).map(function (p) {
      var it = EVI[p[0]];
      return '<li><span>' + esc(it.name) + '</span><span>' + q[p[0]] + ' ' + esc(it.unit) + '</span></li>';
    }).join('');
    return '<div class="tset-head">' + (badge ? '<span class="tset-badge">' + esc(badge) + '</span>' : '') +
      '<span class="tset-g">' + to + '<small>' + guestsWord(to) + '</small></span>' +
      (to !== s.guests ? '<span class="tset-from">готовый стол на ' + s.guests + ', пересчитан</span>' : '') + '</div>' +
      '<div class="tset-body"><ul class="tset-list">' + list + '</ul>' +
      '<div class="tset-total">' + fmt(t) + '</div>' +
      '<div class="tset-per">≈ ' + fmt(Math.round(t / to)) + ' на гостя</div>' +
      '<button class="btn btn--sm" type="button" data-tset-take="' + s.guests + '">Взять этот стол</button></div>';
  }
  function tableSetCard(s) {
    return '<article class="tset" data-tset="' + s.guests + '">' + tsetInner(s, s.guests, '') + '</article>';
  }
  function occChipsHtml() {
    return OCC_CHIPS.map(function (o) {
      var on = evForm.occasion === o[1];
      return '<button type="button" class="ev-chip' + (on ? ' on' : '') + '" data-occ="' + esc(o[1]) + '" aria-pressed="' + on + '">' + esc(o[0]) + '</button>';
    }).join('');
  }

  function renderEvents() {
    var quick = [10, 20, 30, 50, 100].map(function (n) {
      return '<button type="button" class="gq' + (G() === n ? ' on' : '') + '" data-gq="' + n + '">' + n + '</button>';
    }).join('');
    var hero = '<section class="sec ev-hero" id="evs-guests">' +
      '<h2 class="ev-title">Накроем стол</h2>' +

      '<div class="ev-guests"><div class="ev-guests-title">Сколько гостей?</div>' +
      '<div class="guests"><button type="button" class="g-btn" data-gstep="-1" aria-label="Меньше гостей">−</button>' +
      '<label class="g-val"><input id="evGuests" type="number" inputmode="numeric" min="1" max="2000" placeholder="—" value="' + (G() || '') + '" aria-label="Количество гостей">' +
      '<span id="evGuestsWord">' + (G() ? guestsNom(G()) : 'гостей') + '</span></label>' +
      '<button type="button" class="g-btn" data-gstep="1" aria-label="Больше гостей">+</button></div>' +
      '<div class="gq-row">' + quick + '</div>' +
      '<button type="button" class="rescale" id="evRescale" data-rescale hidden></button></div>' +

      '</section>';

    var TP = window.TABLE_PHOTOS || [];
    var photos = TP.length ? '<section class="sec" id="evs-photos">' + secHead('Так мы накрываем') +
      '<div class="hscroll tphotos">' + TP.map(function (src) {
        return '<button type="button" class="tphoto" data-zoom="' + esc(src) + '" aria-label="Фото стола"><img src="' + esc(src) + '" alt="Накрытый стол" loading="lazy"></button>';
      }).join('') + '</div></section>' : '';

    var sets = EVENT_SETS.length ? '<section class="sec" id="evs-sets">' + secHead('Готовые столы') +
      '<p class="sec-lead" id="tsetHint"></p>' +
      '<div class="hscroll" id="tsetRow">' + EVENT_SETS.map(tableSetCard).join('') + '</div></section>' : '';

    var intro = '<div class="pad" id="evs-build"><h3 class="build-title">Или соберите стол сами</h3></div>';

    var cats = EVCATS.map(function (cat) {
      return '<section class="sec" id="evs-' + esc(cat.id) + '">' +
        secHead(cat.title, '<span class="sec-count" data-evcount="' + esc(cat.id) + '"></span>') +
        '<div class="pad"><div class="block evlist">' + cat.items.map(evRow).join('') + '</div></div></section>';
    }).join('');

    $('#view-events').innerHTML = hero + photos + sets + intro + cats + reviewsHtml('evs-reviews');
    markMatchingSet(false);
    updateEvCounts();
    updateRescale();
  }

  function evNavLinks() {
    var links = [['evs-guests', 'Гости']];
    if ((window.TABLE_PHOTOS || []).length) links.push(['evs-photos', 'Фото']);
    if (EVENT_SETS.length) links.push(['evs-sets', 'Готовые столы']);
    EVCATS.forEach(function (c) { links.push(['evs-' + c.id, c.nav]); });
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
    if (!evLines().length) evForm.base = '';
    else if (!evForm.base && G()) evForm.base = G();
    saveEv();
    updateEvRow(id, opts);
    if (armedSet !== null || takenSet) { armedSet = null; renderSetButtons(); }
    updateBars();
    updateRescale();
  }
  // guests changed after the dishes were chosen: offer to recalculate the quantities
  function updateRescale() {
    var b = $('#evRescale');
    if (!b) return;
    var base = parseInt(evForm.base, 10) || 0, g = G();
    var show = base > 0 && g > 0 && g !== base && evLines().length > 0;
    b.hidden = !show;
    b.textContent = show ? '↻ Пересчитать на ' + g + ' ' + guestsWord(g) : '';
  }
  function rescaleTo() {
    var base = parseInt(evForm.base, 10) || 0, g = G();
    if (!base || !g) return;
    var s = takenSet && takenSet.sig === evSig() ? EVENT_SETS.filter(function (x) { return x.guests === takenSet.sg; })[0] : null;
    if (s) {
      evSel = scaledItems(s, g);
    } else {
      Object.keys(evSel).forEach(function (id) { evSel[id] = Math.max(1, Math.ceil(evSel[id] * g / base - 1e-9)); });
    }
    evForm.base = g;
    saveEv();
    Object.keys(EVI).forEach(function (id) { updateEvRow(id); });
    takenSet = s ? { sg: s.guests, to: g, sig: evSig() } : null;
    markMatchingSet(false);
    updateBars();
    updateRescale();
    bump('#evbar');
    toast('Количество пересчитано на ' + g + ' ' + guestsWord(g));
  }

  function setGuests(v, opts) {
    var g = parseInt(v, 10);
    evForm.guests = g > 0 ? Math.min(2000, g) : '';
    if (!evLines().length) evForm.base = '';
    else if (!evForm.base) evForm.base = G() || '';
    saveEv();
    var inp = $('#evGuests');
    if (inp && document.activeElement !== inp) inp.value = evForm.guests;
    var word = $('#evGuestsWord');
    if (word) word.textContent = G() ? guestsNom(G()) : 'гостей';
    $$('[data-gq]').forEach(function (b) { b.classList.toggle('on', parseInt(b.getAttribute('data-gq'), 10) === G()); });
    var per = $('#evPer');
    if (per) per.textContent = G() ? '≈ ' + fmt(Math.round(evTotal() / G())) + ' на гостя' : '';
    markMatchingSet(opts && opts.scroll);
    updateBars();
    updateRescale();
  }

  // the ready table closest to the number of guests (a tie goes to the bigger one)
  function nearestSet(g) {
    if (!g || !EVENT_SETS.length) return null;
    var best = EVENT_SETS[0];
    EVENT_SETS.forEach(function (s) {
      var d = Math.abs(s.guests - g), bd = Math.abs(best.guests - g);
      if (d < bd || (d === bd && s.guests > best.guests)) best = s;
    });
    return best;
  }
  function markMatchingSet(scroll) {
    var g = G();
    var m = nearestSet(g);
    var exact = !!m && m.guests === g;
    $$('.tset').forEach(function (c) {
      var sg = parseInt(c.getAttribute('data-tset'), 10);
      var s = EVENT_SETS.filter(function (x) { return x.guests === sg; })[0];
      var on = !!m && sg === m.guests;
      c.classList.toggle('match', on);
      c.innerHTML = tsetInner(s, on && g ? g : sg, on ? 'Вам подходит' : '');
      if (on && scroll) c.parentNode.scrollTo({ left: c.offsetLeft - 16, behavior: scroll === 'instant' ? 'auto' : 'smooth' });
    });
    var hint = $('#tsetHint');
    if (hint) {
      if (!m) hint.textContent = 'Возьмите готовый стол — количество можно поменять.';
      else if (exact) hint.textContent = 'Готовый стол на ' + g + ' ' + guestsWord(g) + ' — количество можно поменять.';
      else hint.textContent = 'Стол на ' + m.guests + ' пересчитан на ' + g + ' ' + guestsWord(g) + '.';
    }
    renderSetButtons();
  }
  function evSig() { return Object.keys(evSel).sort().map(function (k) { return k + ':' + evSel[k]; }).join(','); }
  function setTargetFor(sg) {
    var g = G(), m = nearestSet(g);
    return (m && m.guests === sg && g && g !== sg) ? g : sg;
  }
  function isTaken(sg) {
    return !!takenSet && takenSet.sg === sg && takenSet.to === setTargetFor(sg) && (!G() || G() === takenSet.to) && takenSet.sig === evSig();
  }
  function renderSetButtons() {
    $$('[data-tset-take]').forEach(function (b) {
      var sg = parseInt(b.getAttribute('data-tset-take'), 10);
      var armed = armedSet === sg;
      var taken = !armed && isTaken(sg);
      var to = setTargetFor(sg);
      b.textContent = armed ? 'Заменить мой выбор?' : taken ? '✓ Стол в чеке' : 'Взять этот стол';
      b.classList.toggle('btn--gold', armed);
      b.classList.toggle('btn--done', taken);
    });
  }
  function takeSet(sg) {
    var s = EVENT_SETS.filter(function (x) { return x.guests === sg; })[0];
    if (!s) return;
    if (isTaken(sg)) { toast('Этот стол уже выбран — нажмите «Ваш стол» внизу'); return; }
    if (evLines().length && armedSet !== sg) {
      armedSet = sg;
      renderSetButtons();
      return;
    }
    armedSet = null;
    var g = G();
    var to = setTargetFor(sg);
    evSel = scaledItems(s, to);
    evForm.base = to;
    saveEv();
    Object.keys(EVI).forEach(function (id) { updateEvRow(id); });
    if (!g) setGuests(sg);
    takenSet = { sg: sg, to: to, sig: evSig() };
    renderSetButtons();
    updateBars();
    updateRescale();
    bump('#evbar');
    toast(to === sg
      ? 'Стол на ' + sg + ' ' + guestsWord(sg) + ' в чеке. Количество можно менять ниже'
      : 'Стол пересчитан на ' + to + ' ' + guestsWord(to) + '. Количество можно менять ниже');
  }
  function setOccasion(v) {
    evForm.occasion = evForm.occasion === v ? '' : v;
    saveEv();
    var box = $('#occChips');
    if (box) box.innerHTML = occChipsHtml();
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
    navCurrent = null;
  }

  function switchTab(name, opts) {
    currentTab = name;
    $$('.tab').forEach(function (t) { t.setAttribute('aria-selected', String(t.getAttribute('data-tab') === name)); });
    $('#view-menu').hidden = name !== 'menu';
    $('#view-events').hidden = name !== 'events';
    renderCatnav(name);
    renderLastBanner();
    updateStickyH();
    updateBars();
    if (name === 'events') markMatchingSet('instant');
    try { history.replaceState(history.state, '', name === 'events' ? '#events' : location.pathname + location.search); } catch (e) { /* file:// */ }
    if (!opts || opts.scroll !== false) {
      var top = $('#sticky').offsetTop;
      if (window.scrollY > top) window.scrollTo({ top: top, behavior: 'auto' });
    }
    navUpdate();
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
    $$('.sec, #evs-build').forEach(function (s) { s.style.scrollMarginTop = (h + 6) + 'px'; });
  }

  var navCurrent = null;
  var navTicking = false;
  function navUpdate() {
    navTicking = false;
    var line = $('#sticky').offsetHeight + 12;
    var cur = null;
    $$(currentTab === 'events' ? '#view-events [id^="evs-"]' : '#view-menu section[id^="sec-"]').forEach(function (s) {
      if (navById[s.id] && s.getBoundingClientRect().top <= line) cur = s.id;
    });
    if (cur === navCurrent) return;
    navCurrent = cur;
    $$('#catnav a').forEach(function (x) { x.classList.toggle('active', x.getAttribute('data-target') === cur); });
    var a = cur && navById[cur];
    if (a) $('#catnav').scrollTo({ left: a.offsetLeft - 12, behavior: 'smooth' });
  }
  function setupNav() {
    window.addEventListener('scroll', function () {
      if (navTicking) return;
      navTicking = true;
      requestAnimationFrame(navUpdate);
    }, { passive: true });
    navUpdate();
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
    var base = parseInt(evForm.base, 10) || 0;
    $('#evGuestsLbl').textContent = lines + ' ' + posWord(lines) + (base && G() && base !== G()
      ? ' · на ' + base + ' ' + guestsWord(base) + ' · гостей стало ' + G()
      : (G() ? ' · на ' + G() + ' ' + guestsWord(G()) : ''));
    document.body.classList.toggle('has-bar', $('#cartbar').hidden === false || $('#evbar').hidden === false);
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
    renderLastBanner();
    if (sheetMode === 'cart') renderCart();
  }

  var toastTimer;
  function toast(t) {
    var el = $('#toast');
    el.textContent = t;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2400);
  }

  // ---------- sheet (with phone "Back" button support) ----------
  function openSheet(mode, o) {
    o = o || {};
    if (!o.noPush) {
      try { history.pushState({ vk: 1 }, ''); sheetDepth++; } catch (e) { /* ignore */ }
    }
    sheetMode = mode;
    $('#sheetTitle').textContent = o.title || '';
    $('#sheetBack').hidden = !o.back;
    $('#sheetExtra').innerHTML = o.extra || '';
    $('#sheet').classList.toggle('sheet--full', !!o.full);
    $('#sheet').classList.toggle('sheet--item', mode === 'item');
    $('#sheet').hidden = false;
    $('#cartbar').hidden = true;
    $('#evbar').hidden = true;
    $('#toast').classList.remove('show');
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
    if (sheetDepth > 0) {
      var d = sheetDepth;
      sheetDepth = 0;
      ignorePop = true;
      try { history.go(-d); } catch (e) { ignorePop = false; }
    }
    refresh();
  }
  function sheetBack() {
    if (sheetDepth > 1) { history.back(); return; }
    if (sheetMode === 'ev-details') openEvCheck(true); else openCart(true);
  }
  window.addEventListener('popstate', function () {
    if (ignorePop) { ignorePop = false; return; }
    if (!sheetMode) return;
    sheetDepth = Math.max(0, sheetDepth - 1);
    if (sheetMode === 'checkout' && sheetDepth > 0) { openCart(true); return; }
    if (sheetMode === 'ev-details' && sheetDepth > 0) { openEvCheck(true); return; }
    closeSheet();
  });

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
  function openCart(noPush) {
    openSheet('cart', { title: 'Корзина', full: true, noPush: noPush });
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
      var det = [x.details, x.preorder && r.key.indexOf('i:') === 0 ? 'на заказ' : ''].filter(Boolean).join(' · ');
      return '<div class="ci"><div class="thumb">' + x.thumb + '</div>' +
        '<div class="ci-main"><div class="ci-name">' + esc(x.name) + '</div>' +
        (det ? '<div class="ci-det' + (openDet[r.key] ? ' open' : '') + '" data-clamp="' + esc(r.key) + '">' + esc(det) + '</div>' : '') +
        '<div class="ci-bottom"><div class="ci-price">' + fmt(x.price * r.qty) + '</div>' +
        '<div data-ctrl="' + esc(r.key) + '" data-v="sm">' + ctrlHtml(r.key, 'sm') + '</div></div></div></div>';
    }).join('');
    var inCart = cartItemIds();
    var hasDrink = inCart.some(function (id) { return ITEMS[id] && ITEMS[id].section === 'drinks'; });
    var upList = cart.some(function (r) { return r.key.indexOf('s:') === 0; }) ? ['tort-med-whole', 'tray-brownie'].concat(UPSELL) : UPSELL;
    var ups = upList.filter(function (id, i) {
      return ITEMS[id] && upList.indexOf(id) === i && inCart.indexOf(id) < 0 && !(hasDrink && ITEMS[id].section === 'drinks');
    }).slice(0, 6).map(function (id) {
      var it = ITEMS[id];
      return '<div class="mini">' + mediaBox(it) + '<div class="mini-body">' +
        '<div class="mini-name">' + esc((it.cartName || it.name) + (it.note ? ' · ' + it.note : '')) + '</div>' + ctrl('i:' + id, 'mini') + '</div></div>';
    }).join('');

    body.innerHTML =
      '<div class="block">' + rows + '</div>' +
      (hasPre ? '<p class="note"><span class="note-ic">' + ICON.clock + '</span><span>В заказе есть позиции <b>на заказ</b> — уточним время готовности в WhatsApp.</span></p>' : '') +
      (ups ? '<h4 class="upsell-title">Добавить к заказу?</h4><div class="hscroll upsell">' + ups + '</div>' : '') +
      '<div class="block sum-solo"><div class="sum-row sum-row--total"><span>Итого, ' + n + ' шт.</span><span>' + fmt(t) + '</span></div></div>';
    $$('[data-ctrl]', body).forEach(function (el) { el.innerHTML = ctrlHtml(el.getAttribute('data-ctrl'), el.getAttribute('data-v')); });
    body.scrollTop = scroll;
    setFoot('<button class="btn btn--split" type="button" data-step="checkout"><span>Оформить заказ</span><span>' + fmt(t) + '</span></button>');
  }

  // everything the cart contains, including the dishes inside sets and combos
  function cartItemIds() {
    var ids = [];
    cart.forEach(function (r) {
      var p = r.key.split(':');
      if (p[0] === 'i') ids.push(p[1]);
      else if (p[0] === 's') { var s = setById(p[1]); if (s) s.items.forEach(function (x) { ids.push(x[0]); }); }
      else if (p[0] === 'c') ids.push(p[1], p[2], p[3]);
    });
    return ids;
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
    return '<label class="field" data-field="' + name + '">' + (label ? '<span>' + label + '</span>' : '') + input + '</label>';
  }
  function opt(name, value, checked, icon, title, sub) {
    return '<label class="opt"><input type="radio" name="' + name + '" value="' + value + '"' + (checked ? ' checked' : '') + '>' +
      '<span>' + icon + '<span class="opt-text"><b>' + title + '</b><small>' + sub + '</small></span><span class="opt-radio"></span></span></label>';
  }
  function payHtml() {
    // delivery has only Kaspi: no checkmark, just how it works
    var kaspi = form.mode === 'delivery'
      ? '<div class="paybtn paybtn--only"><span class="paybtn-box">' + kaspiMark() +
        '<span class="paybtn-text">Перевод<small>одним платежом после итога с доставкой</small></span></span></div>'
      : '<label class="paybtn"><input type="radio" name="pay" value="kaspi"' + (form.pay === 'kaspi' ? ' checked' : '') + '>' +
        '<span class="paybtn-box">' + kaspiMark() +
        '<span class="paybtn-text">Перевод</span>' +
        '<span class="paybtn-check" aria-hidden="true"></span></span></label>';
    var cash = form.mode === 'pickup'
      ? opt('pay', 'cash', form.pay === 'cash', '<span class="opt-ic">' + ICON.cash + '</span>', 'Наличными', 'При получении заказа')
      : '';
    return '<div class="opt-list">' + kaspi + cash + '</div>';
  }
  function thumbsRow(list) {
    var shown = list.slice(0, 12);
    return '<div class="thumbs-row">' + shown.map(function (x) {
      return '<div class="thumb">' + x.thumb + (x.qty > 1 ? '<span class="q">×' + x.qty + '</span>' : '') + '</div>';
    }).join('') + (list.length > shown.length ? '<div class="thumb thumb--more">+' + (list.length - shown.length) + '</div>' : '') + '</div>';
  }

  function openCheckout() {
    clearArmed = false;
    orderTried = false;
    freshTime = false;
    commentOpen = false;
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
      seg('mode', form.mode, [['delivery', 'Доставка'], ['pickup', 'Самовывоз']]) +
      '<div style="margin-top:12px" class="form">' +
      (form.mode === 'delivery'
        ? field('address', 'Адрес доставки', 'autocomplete="street-address" placeholder="Улица, дом, квартира или офис"', form.address) +
          field('entrance', 'Подъезд, этаж, ориентир', 'placeholder="Необязательно"', form.entrance) +

          (!minOk ? '<p class="form-err">Минимальная сумма для доставки — ' + fmt(C.minOrderDelivery) + '</p>' : '')
        : '<div class="place"><span class="place-ic">' + ICON.pin + '</span><span><b>' + esc(C.address || '') + '</b>' +
          '<small>' + esc(C.hours || 'Заберите заказ, когда мы напишем, что он готов') + '</small></span></div>') +
      '</div></div>' +
      '<div class="block"><h4 class="block-title">Когда</h4>' +
      seg('when', form.when, [['asap', 'Как можно скорее'], ['time', 'Ко времени']]) +
      (form.when === 'time'
        ? '<div style="margin-top:12px"><div class="chips chips--sm" role="radiogroup">' +
          [['today', 'Сегодня'], ['tomorrow', 'Завтра'], ['date', 'Другой день']].map(function (o) {
            return '<label><input type="radio" name="day" value="' + o[0] + '"' + (form.day === o[0] ? ' checked' : '') + '><span>' + o[1] + '</span></label>';
          }).join('') + '</div>' +
          '<div class="' + (form.day === 'date' ? 'row2' : '') + '" style="margin-top:12px">' +
          (form.day === 'date' ? field('date', 'Дата', 'type="date" min="' + isoPlus(2) + '"', form.date) : '') +
          field('time', 'Время', 'type="time"', form.time) + '</div></div>'
        : '') +
      '</div>' +
      '<div class="block"><h4 class="block-title">Получатель</h4><div class="row2">' +
      field('name', 'Имя', 'autocomplete="given-name" placeholder="Ваше имя"', form.name) +
      field('phone', 'Телефон <i class="fl-opt">· необязательно</i>', 'type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 7__ ___ __ __"', form.phone) +
      '</div></div>' +
      '<div class="block"><h4 class="block-title">Оплата</h4>' + payHtml() + '</div>' +
      (form.comment || commentOpen
        ? '<div class="block"><h4 class="block-title">Комментарий</h4>' +
          field('comment', '', 'placeholder="Например: без лука, приборы на 3 человек" aria-label="Комментарий к заказу"', form.comment, 'textarea') + '</div>'
        : '<button type="button" class="addlink" data-comment-open>+ Добавить комментарий</button>') +
      '<div class="block"><h4 class="block-title">Ваш заказ</h4>' + thumbs +
      '<div class="sum-row"><span>Доставка</span><span>' + (form.mode === 'delivery' ? 'по тарифу Яндекса' : 'самовывоз, бесплатно') + '</span></div>' +
      '<div class="sum-row sum-row--total"><span>Итого</span><span>' + fmt(t) + (form.mode === 'delivery' ? ' + доставка' : '') + '</span></div>' +
      '</div></form>';
    body.scrollTop = scroll;
    setFoot('<p class="form-err" id="orderErr" hidden style="margin-bottom:8px"></p>' +
      '<button class="btn btn--wa btn--split" type="submit" form="orderForm"' + (minOk ? '' : ' disabled') + '>' +
      '<span style="display:flex;align-items:center;gap:8px">' + ICON.wa + '<span>Отправить<span class="lbl-x"> заказ</span></span></span>' +
      '<span class="btn-sum">' + fmt(t) + (form.mode === 'delivery' ? '<small>+ доставка</small>' : '') + '</span></button>' +
      '<p class="foot-hint">Откроется WhatsApp — нажмите «Отправить»</p>');
    if (orderTried) showErrors('#orderForm', '#orderErr', shownOrderErrors(), 'Заполните: ', false);
  }

  // ---------- WhatsApp ----------
  function waUrl(text) { return 'https://wa.me/' + digits(C.whatsapp) + '?text=' + encodeURIComponent(text); }
  function openWa(text) {
    var url = waUrl(text);
    var w = window.open(url, '_blank');
    if (!w) window.location.href = url;
  }
  var orderNumber = function () { return String(Date.now()).slice(-4); };
  function whenText() {
    if (form.when !== 'time') return 'как можно скорее';
    return (form.day === 'tomorrow' ? 'завтра' : form.day === 'date' ? fmtDateW(form.date) : 'сегодня') + ', ' + form.time;
  }

  // ---------- validation ----------
  function orderErrors() {
    var errs = [], bad = [];
    if (form.mode === 'delivery' && String(form.address || '').trim().length < 4) { errs.push('адрес'); bad.push('address'); }
    if (form.when === 'time') {
      if (form.day === 'date' && !form.date) { errs.push('дату'); bad.push('date'); }
      if (!form.time) { errs.push('время'); bad.push('time'); }
      else if (form.day === 'today' && form.time <= nowHM()) { errs.push('время (уже прошло)'); bad.push('time'); }
    }
    if (!String(form.name || '').trim()) { errs.push('имя'); bad.push('name'); }
    var pd = digits(form.phone).length;
    if (pd && pd < 10) { errs.push('телефон (не хватает цифр)'); bad.push('phone'); }
    return { errs: errs, bad: bad };
  }
  function evErrors() {
    var errs = [], bad = [];
    if (!evForm.date) { errs.push('дату'); bad.push('date'); }
    else if (evForm.date < todayIso()) { errs.push('дату не раньше сегодняшней'); bad.push('date'); }
    if (!G()) { errs.push('число гостей'); bad.push('guests'); }
    if (needsAddress() && String(evForm.address || '').trim().length < 4) { errs.push('адрес'); bad.push('address'); }
    if (!String(form.name || '').trim()) { errs.push('имя'); bad.push('name'); }
    var pd = digits(form.phone).length;
    if (pd && pd < 10) { errs.push('телефон (не хватает цифр)'); bad.push('phone'); }
    return { errs: errs, bad: bad };
  }
  // a time field that has just appeared is not marked red until the next "send"
  function shownOrderErrors() {
    var res = orderErrors();
    if (!freshTime) return res;
    for (var i = res.bad.length - 1; i >= 0; i--) {
      if (res.bad[i] === 'time' || res.bad[i] === 'date') { res.bad.splice(i, 1); res.errs.splice(i, 1); }
    }
    return res;
  }
  function showErrors(formSel, errSel, res, prefix, focus) {
    $$(formSel + ' .field').forEach(function (f) { f.classList.remove('invalid'); });
    res.bad.forEach(function (n) { var f = $(formSel + ' [data-field="' + n + '"]'); if (f) f.classList.add('invalid'); });
    var errEl = $(errSel);
    if (errEl) {
      errEl.textContent = res.errs.length ? prefix + res.errs.join(', ') : '';
      errEl.hidden = !res.errs.length;
    }
    if (focus) {
      var first = $(formSel + ' .invalid input, ' + formSel + ' .invalid textarea');
      if (first) { first.scrollIntoView({ block: 'center', behavior: 'smooth' }); first.focus({ preventScroll: true }); }
    }
  }

  // ---------- regular order ----------
  function buildOrderText(no) {
    var deliv = form.mode === 'delivery';
    var lines = ['🧾 *Заказ №' + no + ' · ' + (deliv ? 'ДОСТАВКА' : 'САМОВЫВОЗ') + ' · ' + whenText() + '*', ''];
    cart.forEach(function (r, i) {
      var x = resolve(r.key);
      var p = r.key.split(':');
      var s = p[0] === 's' ? setById(p[1]) : null;
      lines.push((i + 1) + '. ' + x.name + (!s && x.details ? ' (' + x.details + ')' : '') + ' × ' + r.qty + ' = ' + fmt(x.price * r.qty) +
        (x.preorder && p[0] === 'i' ? ' — на заказ' : ''));
      if (s) {
        s.items.forEach(function (it) {
          var si = ITEMS[it[0]];
          lines.push('    – ' + itemName(it[0]) + (si && si.note ? ' (' + si.note + ')' : '') + ' ×' + (it[1] * r.qty) + (si && si.preorder ? ' — на заказ' : ''));
        });
      }
    });
    lines.push('', '*Итого: ' + fmt(total()) + '*' + (deliv ? ' + доставка' : ''), '');
    if (deliv) lines.push('🚚 Адрес: ' + form.address + (form.entrance ? ', ' + form.entrance : ''));
    lines.push('👤 ' + form.name + (digits(form.phone) ? ', ' + form.phone : ''));
    if (form.comment) lines.push('💬 ' + form.comment);
    lines.push('');
    if (form.pay === 'kaspi' && deliv) {
      lines.push('💳 *Оплата Kaspi:* ' + fmt(total()) + ' + доставка');
      if (C.kaspiPhone) lines.push('Номер Kaspi: ' + C.kaspiPhone);
      lines.push('Напишите итог с доставкой — переведу одним платежом и пришлю чек сюда.');
    } else if (form.pay === 'kaspi') {
      lines.push('💳 *Оплата Kaspi:* ' + fmt(total()));
      if (C.kaspiPhone) lines.push('Номер Kaspi: ' + C.kaspiPhone);
      lines.push('Переведу и пришлю чек в этот чат.');
    } else {
      lines.push('💵 Оплата: наличными при получении');
    }
    return lines.join('\n');
  }

  function submitOrder() {
    orderTried = true;
    freshTime = false;
    var res = orderErrors();
    if (res.errs.length) { showErrors('#orderForm', '#orderErr', res, 'Заполните: ', true); return; }
    var no = orderNumber();
    var text = buildOrderText(no);
    lastOrder = { no: no, text: text, total: total(), count: count(), pay: form.pay, mode: form.mode };
    store.set('vk_last_repeat', { data: { cart: cart.map(function (r) { return { key: r.key, qty: r.qty }; }) }, ts: Date.now() });
    saveLast('order', lastOrder);
    openWa(text);
    cart = [];
    store.set('vk_cart', cart);
    // keep the contacts and address, reset the one-off choices
    form.when = 'asap'; form.day = 'today'; form.date = ''; form.time = ''; form.comment = ''; form.pay = 'kaspi';
    store.set('vk_form', form);
    orderTried = false;
    showSuccess();
  }

  function sblock(n, title, text, extra) {
    return '<div class="sblock"><span class="sblock-n">' + n + '</span><div><b>' + title + '</b>' +
      (text ? '<p>' + esc(text) + '</p>' : '') + (extra || '') + '</div></div>';
  }

  function kaspiBlock(n, o) {
    var deliv = o.mode === 'delivery';
    var copyBtn = function (val, msg) {
      return '<button type="button" class="kc-copy" data-copy="' + esc(val) + '" data-copy-msg="' + msg + '" aria-label="Скопировать">' + ICON.copy + '</button>';
    };
    return '<div class="sblock sblock--kaspi"><div>' +
      '<div class="kaspi-step">Шаг ' + n + ' · оплата</div>' +
      '<div class="kaspi-title">' + kaspiMark(true) + '<span>Перевод</span></div>' +
      '<div class="kaspi-card">' +
        '<div class="kc-row"><span class="kc-text"><span class="kc-label">' + (deliv ? 'К оплате' : 'Сумма') + '</span>' +
          '<span class="kc-val">' + fmt(o.total) + (deliv ? ' <small>+ доставка</small>' : '') + '</span></span>' +
          (deliv ? '' : copyBtn(Math.round(o.total), 'Сумма скопирована')) + '</div>' +
        (C.kaspiPhone ? '<div class="kc-row"><span class="kc-text"><span class="kc-label">Номер Kaspi</span>' +
          '<span class="kc-val">' + esc(C.kaspiPhone) + '</span></span>' + copyBtn(C.kaspiPhone, 'Номер скопирован') + '</div>' : '') +
      '</div>' +
      (C.kaspiName ? '<p class="kaspi-sub">Получатель: ' + esc(C.kaspiName) + '</p>' : '') +
      (C.kaspiQr ? '<img class="pay-qr" src="' + esc(C.kaspiQr) + '" alt="Kaspi QR">' : '') +
      (deliv
        ? '<p class="kaspi-sub">Переведите одним платежом, когда напишем итог. Чек пришлите в тот же чат.</p>'
        : '<button class="btn btn--white kaspi-send" type="button" id="sendCheck">' + ICON.wa + '<span>Отправить чек</span></button>') +
      '</div></div>';
  }

  function showSuccess(fromBanner) {
    var o = lastOrder;
    if (!o) return;
    if (fromBanner) openSheet('success', { full: true });
    sheetMode = 'success';
    $('#sheetTitle').textContent = 'Заказ №' + o.no;
    $('#sheetBack').hidden = true;
    $('#sheetExtra').innerHTML = '';
    var n = 1;
    var kaspi = o.pay === 'kaspi' && (C.kaspiPhone || C.kaspiQr);
    var html;
    if (fromBanner) {
      // back from WhatsApp: payment comes first
      html = '<p class="success-sub">' + fmt(o.total) + (o.mode === 'delivery' ? ' + доставка · доставка' : ' · самовывоз') + '</p>';
      if (!kaspi) {
        html += sblock(n++, 'Если ещё не отправили заказ', 'Откройте WhatsApp — сообщение с заказом подставится само, останется нажать «Отправить».',
          '<button class="linkbtn" type="button" id="resendWa">Открыть WhatsApp с заказом</button>');
      }
    } else {
      html = '<div class="success"><div class="success-icon success-icon--wa">' + ICON.wa + '</div><h4>Осталось отправить заказ</h4></div>' +
        sblock(n++, 'Нажмите «Отправить» в WhatsApp', 'Чат с вашим заказом уже открыт.',
          '<button class="linkbtn" type="button" id="resendWa">Чат не открылся? Открыть ещё раз</button>');
    }
    if (o.mode === 'delivery') {
      // delivery: the total with delivery comes first, then the payment
      html += sblock(n++, 'Дождитесь итога', 'Напишем в WhatsApp сумму с доставкой и время.');
      if (kaspi) html += kaspiBlock(n++, o);
    } else {
      if (kaspi) html += kaspiBlock(n++, o);
      html += sblock(n++, 'Заберите заказ', (C.address ? C.address + '. ' : '') + (o.pay === 'cash' ? 'Оплата при получении: ' + fmt(o.total) + '. ' : '') + 'Напишем в WhatsApp, когда будет готов.');
    }
    if (fromBanner && kaspi) {
      html += '<p class="resend-line">Ещё не отправили заказ? <button class="linkbtn" type="button" id="resendWa">Открыть WhatsApp с заказом</button></p>';
    }
    $('#sheetBody').innerHTML = html;
    $('#sheetBody').scrollTop = 0;
    setFoot('<button class="btn btn--ghost" type="button" data-close>Вернуться в меню</button>');
  }

  // ---------- event order: receipt → details → WhatsApp ----------
  function receiptHtml() {
    var g = G(), t = evTotal(), lines = evLines();
    var body = EVCATS.map(function (cat) {
      var rows = cat.items.filter(function (it) { return evQty(it.id) > 0; });
      if (!rows.length) return '';
      var por = rows.reduce(function (a, it) { return a + (it.unit === 'порц.' ? evQty(it.id) : 0); }, 0);
      var cov = g && por ? '<span class="rc-cov"> · ≈ ' + String(Math.round(por / g * 10) / 10).replace('.', ',') + ' порц. на гостя</span>' : '';
      return '<div class="rc-cat">' + esc(cat.title) + cov + '</div>' + rows.map(function (it) {
        var q = evQty(it.id);
        return '<div class="rc-line"><div class="rc-name">' + esc(it.name) + '<small>' + q + ' ' + esc(it.unit) + ' × ' + fmt(it.price) + (it.preorder ? ' · на заказ' : '') + '</small></div>' +
          '<div class="rc-sum">' + fmt(q * it.price) + '</div></div>';
      }).join('');
    }).join('');
    var sv = svcById(evForm.how);
    var svc = sv ? '<div class="rc-line"><div class="rc-name">' + esc(sv.title) + '</div><div class="rc-sum rc-sum--muted">' + esc(sv.price || 'бесплатно') + '</div></div>' : '';
    var when = [evForm.occasion, evForm.date ? fmtDateW(evForm.date) + (evForm.time ? ', ' + evForm.time : '') : ''].filter(Boolean).join(' · ');
    return '<div class="receipt-wrap"><div class="receipt">' +
      '<div class="rc-top"><div class="rc-logo">Восточка</div>' +
      '<div class="rc-sub">Чек стола' + (g ? ' · на ' + g + ' ' + guestsWord(g) : '') + '</div>' +
      (when ? '<div class="rc-sub">' + esc(when) + '</div>' : '') +
      '</div>' + body +
      (svc ? '<div class="rc-sep"></div><div class="rc-cat">Как доставить</div>' + svc : '') +
      '<div class="rc-sep"></div>' +
      '<div class="rc-total"><span>Итого по меню</span><span>' + fmt(t) + '</span></div>' +
      '<div class="rc-per">' + lines.length + ' ' + posWord(lines.length) + (g ? ' · ≈ ' + fmt(Math.round(t / g)) + ' на гостя' : '') + '</div>' +
      '<div class="rc-foot">Окончательную сумму подтвердим в WhatsApp</div>' +
      '</div></div>';
  }

  function openEvCheck(noPush) {
    openSheet('ev-check', { title: 'Чек стола', full: true, noPush: noPush });
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
      '<button class="btn btn--ghost" type="button" data-close style="margin-top:20px">' + ICON.edit + ' Изменить состав</button>';
    setFoot('<button class="btn btn--split" type="button" data-evstep><span>Далее<span class="lbl-x">: дата и контакты</span></span><span>' + fmt(evTotal()) + '</span></button>');
  }

  function openEvDetails() {
    evTried = false;
    evCommentOpen = false;
    openSheet('ev-details', { title: 'Оформление стола', full: true });
    renderEvDetails();
    $('#sheetBody').scrollTop = 0;
  }

  function renderEvDetails() {
    var body = $('#sheetBody');
    var scroll = body.scrollTop;
    var t = evTotal(), lines = evLines(), g = G();
    var thumbs = thumbsRow(lines.map(function (it) { return { thumb: media(it), qty: evQty(it.id) }; }));
    // the same blocks, in the same order, as the regular checkout
    body.innerHTML = '<form id="evOrderForm" class="form" novalidate>' +
      '<div class="block"><h4 class="block-title">Как получить</h4><div class="opt-list">' + EVENT_SERVICES.map(svcOpt).join('') + '</div>' +
      (needsAddress()
        ? '<div style="margin-top:12px">' + field('address', 'Адрес или место проведения', 'autocomplete="street-address" placeholder="Улица, дом или название зала"', evForm.address) + '</div>'
        : '') +
      '</div>' +
      '<div class="block"><h4 class="block-title">Когда</h4><div class="form">' +
      '<div class="row2">' + field('date', 'Дата', 'type="date" min="' + todayIso() + '"', evForm.date) +
      field('time', evTimeLabel(), 'type="time"', evForm.time) + '</div>' +
      '<p class="note note--warn" id="evUrgentBox"' + (urgentText() ? '' : ' hidden') + '><span class="note-ic">' + ICON.clock + '</span>' +
      '<span id="evUrgent">' + urgentText() + '</span></p>' +
      '<div class="row2">' + field('guests', 'Гостей', 'type="number" inputmode="numeric" min="1" max="2000" placeholder="Сколько?"', g || '') +
      '<label class="field" data-field="occasion"><span>Повод <i class="fl-opt">· необязательно</i></span><select name="occasion">' +
      '<option value=""' + (evForm.occasion ? '' : ' selected') + '>Не выбран</option>' +
      OCCASIONS.map(function (o) {
        return '<option' + (evForm.occasion === o ? ' selected' : '') + '>' + o + '</option>';
      }).join('') + '</select></label></div>' +
      '</div></div>' +
      '<div class="block"><h4 class="block-title">Получатель</h4><div class="row2">' +
      field('name', 'Имя', 'autocomplete="given-name" placeholder="Ваше имя"', form.name) +
      field('phone', 'Телефон <i class="fl-opt">· необязательно</i>', 'type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 7__ ___ __ __"', form.phone) +
      '</div></div>' +
      (evForm.comment || evCommentOpen
        ? '<div class="block"><h4 class="block-title">Пожелания</h4>' +
          field('comment', '', 'placeholder="Бюджет, особые пожелания" aria-label="Пожелания"', evForm.comment, 'textarea') + '</div>'
        : '<button type="button" class="addlink" data-evcomment-open>+ Добавить пожелания</button>') +
      '<div class="block"><h4 class="block-title">Ваш стол</h4>' + thumbs +
      [svcById(evForm.how)].filter(Boolean).map(function (s) {
        return '<div class="sum-row"><span>' + esc(s.title) + '</span><span>' + esc(s.price || 'бесплатно') + '</span></div>';
      }).join('') +
      '<div class="sum-row sum-row--total"><span>Итого по меню</span><span>' + fmt(t) + '</span></div>' +
      '<div class="rc-per" id="evPer">' + (g ? '≈ ' + fmt(Math.round(t / g)) + ' на гостя' : '') + '</div>' +
      '</div></form>';
    body.scrollTop = scroll;
    setFoot('<p class="form-err" id="evErr" hidden style="margin-bottom:8px"></p>' +
      '<button class="btn btn--wa btn--split" type="submit" form="evOrderForm">' +
      '<span style="display:flex;align-items:center;gap:8px">' + ICON.wa + '<span>Отправить<span class="lbl-x"> заявку</span></span></span><span class="btn-sum">' + fmt(t) + '</span></button>' +
      '<p class="foot-hint">Откроется WhatsApp — нажмите «Отправить»</p>');
    if (evTried) showErrors('#evOrderForm', '#evErr', evErrors(), 'Укажите: ', false);
  }

  // a table for today or tomorrow is flagged as urgent
  function urgentText() {
    if (!evForm.date) return '';
    if (evForm.date === todayIso()) return 'Стол на сегодня — срочная заявка. Подтвердим в WhatsApp, успеем ли.';
    if (evForm.date === isoPlus(1)) return 'Стол на завтра — срочная заявка. Подтвердим в WhatsApp, успеем ли.';
    return '';
  }

  function buildEventText(no) {
    var g = G(), t = evTotal();
    var lines = ['🎉 *Заявка на стол №' + no + '* — Восточка', ''];
    if (evForm.occasion) lines.push('Повод: ' + evForm.occasion);
    var sv = svcById(evForm.how);
    lines.push('Дата: ' + fmtDateW(evForm.date) + (evForm.date === todayIso() ? ' (сегодня — срочно)' : evForm.date === isoPlus(1) ? ' (завтра — срочно)' : ''));
    if (evForm.time) lines.push(evTimeLabel() + ': ' + evForm.time);
    lines.push('Гостей: ' + g);
    if (sv) lines.push((sv.emoji ? sv.emoji + ' ' : '') + sv.title + (sv.price ? ' — ' + sv.price : ''));
    if (needsAddress()) lines.push('📍 Место: ' + evForm.address);
    lines.push('', '🧾 *Чек:*');
    var i = 0;
    EVCATS.forEach(function (cat) {
      var rows = cat.items.filter(function (it) { return evQty(it.id) > 0; });
      if (!rows.length) return;
      lines.push('', '_' + cat.title + '_');
      rows.forEach(function (it) {
        var q = evQty(it.id);
        i++;
        lines.push(i + '. ' + it.name + ' — ' + q + ' ' + it.unit + ' × ' + fmt(it.price) + ' = ' + fmt(q * it.price) + (it.preorder ? ' (на заказ)' : ''));
      });
    });
    lines.push('', '*Итого по меню: ' + fmt(t) + '*');
    lines.push(evLines().length + ' ' + posWord(evLines().length) + (g ? ' · ≈ ' + fmt(Math.round(t / g)) + ' на гостя' : ''));
    lines.push('', '👤 ' + form.name + (digits(form.phone) ? ', ' + form.phone : ''));
    if (evForm.comment) lines.push('💬 ' + evForm.comment);
    return lines.join('\n');
  }

  function submitEv() {
    evTried = true;
    var res = evErrors();
    if (res.errs.length) { showErrors('#evOrderForm', '#evErr', res, 'Укажите: ', true); return; }
    var no = orderNumber();
    var text = buildEventText(no);
    lastEvent = { no: no, text: text };
    saveLast('event', lastEvent);
    openWa(text);
    // the table is sent: start the next one from scratch (contacts stay)
    evSel = {};
    takenSet = null;
    evForm.guests = ''; evForm.occasion = ''; evForm.date = ''; evForm.time = ''; evForm.address = ''; evForm.comment = ''; evForm.base = '';
    saveEv();
    evTried = false;
    Object.keys(EVI).forEach(function (id) { updateEvRow(id); });
    setGuests('');
    var box = $('#occChips');
    if (box) box.innerHTML = occChipsHtml();
    showEvSuccess();
  }

  function showEvSuccess(fromBanner) {
    var e = lastEvent;
    if (!e) return;
    if (fromBanner) openSheet('ev-success', { full: true });
    sheetMode = 'ev-success';
    $('#sheetTitle').textContent = 'Заявка №' + e.no;
    $('#sheetBack').hidden = true;
    $('#sheetExtra').innerHTML = '';
    $('#sheetBody').innerHTML = (fromBanner
        ? '<div class="success"><h4>Ваша заявка №' + e.no + '</h4></div>' +
          sblock(1, 'Если ещё не отправили заявку', 'Откройте WhatsApp — заявка подставится сама, останется нажать «Отправить».',
            '<button class="linkbtn" type="button" id="resendEv">Открыть WhatsApp с заявкой</button>')
        : '<div class="success"><div class="success-icon success-icon--wa">' + ICON.wa + '</div><h4>Осталось отправить заявку</h4></div>' +
          sblock(1, 'Нажмите «Отправить» в WhatsApp', 'Чат с заявкой уже открыт.',
            '<button class="linkbtn" type="button" id="resendEv">Чат не открылся? Открыть ещё раз</button>')) +
      sblock(2, 'Мы свяжемся с вами', 'Подтвердим меню, сумму и время.');
    $('#sheetBody').scrollTop = 0;
    setFoot('<button class="btn btn--ghost" type="button" data-close>Готово</button>');
  }

  // ---------- photo credits (Wikimedia Commons licenses need the author and the license) ----------
  function openCredits() {
    var P = window.PHOTOS || {};
    openSheet('credits', { title: 'Авторы фото', full: true });
    $('#sheetBody').innerHTML =
      '<p class="note"><span class="note-ic">' + ICON.info + '</span><span>Фото блюд — для примера, с Wikimedia Commons. Подача в «Восточке» может отличаться.</span></p>' +
      '<div class="block credits">' + Object.keys(P).filter(function (k) {
        // only example photos that are on the site now; own photos need no credit
        var src = P[k].src;
        return !P[k].own && (Object.keys(ITEMS).some(function (id) { return ITEMS[id].img === src; }) ||
          SETS.some(function (s) { return s.image === src; }) || (COMBO && COMBO.image === src));
      }).map(function (k) {
        var p = P[k];
        return '<div class="credit"><img src="' + esc(p.src) + '" alt="" loading="lazy"><div><b>' + esc(p.name || k) + '</b>' +
          '<small>' + esc(p.author || 'автор не указан') + ' · ' + esc(p.license || '') +
          ' · <a href="' + esc(p.page) + '" target="_blank" rel="noopener">источник</a></small></div></div>';
      }).join('') + '</div>';
    $('#sheetBody').scrollTop = 0;
    setFoot('<button class="btn btn--ghost" type="button" data-close>Закрыть</button>');
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
    $('#photoCredits').hidden = !Object.keys(window.PHOTOS || {}).length;
  }

  // ---------- wiring ----------
  document.addEventListener('click', function (e) {
    var cl = e.target.closest('[data-clamp]');
    if (cl) {
      var ck = cl.getAttribute('data-clamp');
      openDet[ck] = !openDet[ck];
      cl.classList.toggle('open', !!openDet[ck]);
      return;
    }
    var t = e.target.closest('button, a, [data-close]');
    if (!t) {
      var di = e.target.closest('[data-item]');
      if (di) openItem(di.getAttribute('data-item'));
      return;
    }
    var a;
    if (t.hasAttribute('data-add')) { add(t.getAttribute('data-add')); return; }
    if (t.hasAttribute('data-inc')) { a = t.getAttribute('data-inc'); setQty(a, qtyOf(a) + 1); return; }
    if (t.hasAttribute('data-dec')) { a = t.getAttribute('data-dec'); setQty(a, qtyOf(a) - 1); return; }
    if (t.hasAttribute('data-evadd')) {
      // portions: the first tap puts one per guest
      a = t.getAttribute('data-evadd');
      var it0 = EVI[a], g0 = G();
      // a second dish of the same kind is not put for every guest
      var catHas = !!it0 && EVCATS.some(function (c) {
        return c.id === it0.cat && c.items.some(function (x) { return x.id !== a && x.unit === 'порц.' && evQty(x.id) > 0; });
      });
      var q0 = it0 && it0.unit === 'порц.' && g0 > 1 && !catHas ? g0 : 1;
      setEvQty(a, q0);
      bump('#evbar');
      if (q0 > 1) toast(q0 + ' порц. — по одной на гостя. Можно изменить');
      else if (catHas && g0 > 1) toast('Добавили 1 порц. — укажите, сколько нужно');
      return;
    }
    if (t.hasAttribute('data-evinc')) { a = t.getAttribute('data-evinc'); setEvQty(a, evQty(a) + 1); return; }
    if (t.hasAttribute('data-evdec')) { a = t.getAttribute('data-evdec'); setEvQty(a, evQty(a) - 1); return; }
    if (t.hasAttribute('data-gstep')) {
      var step = parseInt(t.getAttribute('data-gstep'), 10);
      if (!G() && step < 0) return;
      setGuests(Math.max(1, G() + step), { scroll: true });
      return;
    }
    if (t.hasAttribute('data-gq')) { setGuests(parseInt(t.getAttribute('data-gq'), 10), { scroll: true }); return; }
    if (t.hasAttribute('data-tset-take')) { takeSet(parseInt(t.getAttribute('data-tset-take'), 10)); return; }
    if (t.hasAttribute('data-occ')) { setOccasion(t.getAttribute('data-occ')); return; }
    if (t.hasAttribute('data-evstep')) { openEvDetails(); return; }
    if (t.hasAttribute('data-open-combo')) { openCombo(); return; }
    if (t.hasAttribute('data-close')) { closeSheet(); return; }
    if (t.hasAttribute('data-tab')) { switchTab(t.getAttribute('data-tab')); return; }
    if (t.hasAttribute('data-tab-go')) { switchTab(t.getAttribute('data-tab-go')); return; }
    if (t.hasAttribute('data-go')) { goTo(t.getAttribute('data-go')); return; }
    if (t.hasAttribute('data-step')) { openCheckout(); return; }
    if (t.hasAttribute('data-credits')) { openCredits(); return; }
    if (t.hasAttribute('data-ask')) {
      var g2 = (window.ON_ORDER || [])[parseInt(t.getAttribute('data-ask'), 10)];
      if (g2) openWa('Здравствуйте! Хочу заказать «' + g2.name + '». Подскажите, пожалуйста, цену.');
      return;
    }
    if (t.hasAttribute('data-zoom')) {
      openSheet('photo', { title: '', full: true });
      $('#sheetBody').innerHTML = '<img class="zoom-img" src="' + esc(t.getAttribute('data-zoom')) + '" alt="">';
      setFoot('<button class="btn btn--ghost" type="button" data-close>Закрыть</button>');
      return;
    }
    if (t.hasAttribute('data-rescale')) { rescaleTo(); return; }
    if (t.hasAttribute('data-ev-help')) {
      var g1 = G();
      openWa('Здравствуйте! Хочу заказать стол' + (evForm.occasion ? ' (' + evForm.occasion + ')' : '') +
        (g1 ? ' на ' + g1 + ' ' + guestsWord(g1) : '') + (evForm.date ? ', ' + fmtDateW(evForm.date) : '') + '. Подскажите по меню.');
      return;
    }
    if (t.hasAttribute('data-evcomment-open')) {
      evCommentOpen = true;
      renderEvDetails();
      var et = $('#evOrderForm textarea[name="comment"]');
      if (et) et.focus();
      return;
    }
    if (t.hasAttribute('data-comment-open')) {
      commentOpen = true;
      renderCheckout();
      var ta = $('#orderForm textarea[name="comment"]');
      if (ta) ta.focus();
      return;
    }
    if (t.hasAttribute('data-last-open')) {
      var kind = t.getAttribute('data-last-open');
      var d = loadLast(kind);
      if (kind === 'repeat') { repeatOrder(); return; }
      if (d && kind === 'order') { lastOrder = d; showSuccess(true); }
      else if (d && kind === 'event') { lastEvent = d; showEvSuccess(true); }
      else renderLastBanner();
      return;
    }
    if (t.hasAttribute('data-last-close')) { store.set('vk_last_' + t.getAttribute('data-last-close'), null); renderLastBanner(); return; }
    if (t.hasAttribute('data-clear')) {
      if (!clearArmed) { clearArmed = true; renderCart(); return; }
      clearArmed = false; cart = []; store.set('vk_cart', cart); refresh(); return;
    }
    if (t.hasAttribute('data-copy')) {
      var val = t.getAttribute('data-copy');
      var msg = t.getAttribute('data-copy-msg') || 'Скопировано';
      var done = function () { toast(msg + ': ' + val); };
      if (navigator.clipboard) navigator.clipboard.writeText(val).then(done, function () { toast(val); });
      else toast(val);
      return;
    }
    if (t.id === 'openCart') { openCart(); return; }
    if (t.id === 'openEv') { openEvDetails(); return; }
    if (t.id === 'sheetBack') { sheetBack(); return; }
    if (t.id === 'comboAdd') {
      add('c:' + COMBO.groups.map(function (g) { return comboPick[g.key]; }).join(':'));
      closeSheet();
      return;
    }
    if (t.id === 'resendWa' && lastOrder) { openWa(lastOrder.text); return; }
    if (t.id === 'sendCheck' && lastOrder) {
      openWa('Здравствуйте! Отправляю чек об оплате заказа №' + lastOrder.no + (lastOrder.mode === 'delivery' ? '' : ' на ' + fmt(lastOrder.total)) + ' (Kaspi).');
      return;
    }
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
      setGuests(el.value);
    }
  });
  document.addEventListener('change', function (e) {
    var el = e.target;
    if (el.hasAttribute('data-evinput')) {
      setEvQty(el.getAttribute('data-evinput'), parseInt(el.value, 10) || 0);
    } else if (el.id === 'evGuests') {
      setGuests(el.value, { scroll: true });
      el.value = evForm.guests;
    } else if (el.name === 'how') {
      evForm.how = el.value;
      saveEv();
      $$('input[name="how"]').forEach(function (x) { x.checked = x.value === el.value; });
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
    else if (n === 'guests') setGuests(el.value);
    else if (n === 'occasion') {
      evForm.occasion = el.value; saveEv();
      var box = $('#occChips'); if (box) box.innerHTML = occChipsHtml();
    }
    else if (n in evForm && n !== 'how') {
      evForm[n] = el.value;
      saveEv();
      if (n === 'date') {
        var u = $('#evUrgent'), ub = $('#evUrgentBox');
        if (u) u.textContent = urgentText();
        if (ub) ub.hidden = !urgentText();
      }
    }
  }

  var sheetBody = $('#sheetBody');
  sheetBody.addEventListener('change', function (e) {
    var el = e.target;
    if (!el.name || el.name === 'how') return;
    if (sheetMode === 'combo' && el.name.indexOf('combo-') === 0) { comboPick[el.name.slice(6)] = el.value; return; }
    if (sheetMode === 'checkout' && el.name in form) {
      form[el.name] = el.value;
      store.set('vk_form', form);
      if (el.name === 'when' || el.name === 'day') freshTime = true;
      if (el.name === 'mode' || el.name === 'when' || el.name === 'pay' || el.name === 'day') renderCheckout();
      return;
    }
    if (sheetMode === 'ev-details') {
      evField(el);
      if (evTried) showErrors('#evOrderForm', '#evErr', evErrors(), 'Укажите: ', false);
    }
  });
  sheetBody.addEventListener('input', function (e) {
    var el = e.target;
    if (!el.name || el.type === 'radio' || el.type === 'checkbox') return;
    if (sheetMode === 'checkout' && el.name in form) {
      form[el.name] = el.value;
      store.set('vk_form', form);
      if (orderTried) showErrors('#orderForm', '#orderErr', shownOrderErrors(), 'Заполните: ', false);
    } else if (sheetMode === 'ev-details') {
      evField(el);
      if (evTried) showErrors('#evOrderForm', '#evErr', evErrors(), 'Укажите: ', false);
    }
  });
  sheetBody.addEventListener('submit', function (e) {
    if (e.target.id === 'orderForm') { e.preventDefault(); submitOrder(); }
    if (e.target.id === 'evOrderForm') { e.preventDefault(); submitEv(); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && sheetMode) closeSheet(); });
  window.addEventListener('resize', updateStickyH);

  // ---------- init ----------
  try { if (history.state && history.state.vk) history.replaceState(null, ''); } catch (e) { /* ignore */ }
  renderMenu();
  renderEvents();
  fillInfo();
  renderCatnav('menu');
  refresh();
  setupNav();
  updateStickyH();
  renderLastBanner();
  if (location.hash === '#events') switchTab('events', { scroll: false });
})();
