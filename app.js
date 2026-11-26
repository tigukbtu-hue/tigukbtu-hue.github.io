(function () {
  'use strict';

  var C = window.CONFIG || {};
  var MENU = window.MENU || [];
  var COMBO = window.COMBO;
  var SETS = window.SETS || [];
  var POPULAR = window.POPULAR || [];

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

  var store = {
    get: function (k, d) {
      try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; }
    },
    set: function (k, v) {
      try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ }
    },
  };

  // ---------- data ----------
  var ITEMS = {};
  MENU.forEach(function (sec) {
    sec.items.forEach(function (it) { ITEMS[it.id] = it; });
  });
  var itemName = function (id) { var it = ITEMS[id]; return it ? (it.cartName || it.name) : id; };

  function setPrice(s) {
    var sum = s.items.reduce(function (a, p) { return a + (ITEMS[p[0]] ? ITEMS[p[0]].price * p[1] : 0); }, 0);
    var price = Math.round(sum * (1 - (s.discount || 0)) / 100) * 100;
    return { sum: sum, price: price };
  }
  var setById = function (id) { return SETS.filter(function (s) { return s.id === id; })[0]; };

  // Cart key formats:  i:<itemId>   s:<setId>   c:<first>:<second>:<drink>
  function resolve(key) {
    var p = key.split(':');
    if (p[0] === 'i' && ITEMS[p[1]]) {
      var it = ITEMS[p[1]];
      return { name: it.cartName || it.name, details: it.note || '', price: it.price, preorder: !!it.preorder };
    }
    if (p[0] === 's') {
      var s = setById(p[1]);
      if (!s) return null;
      return {
        name: 'Сет «' + s.title + '»',
        details: s.items.map(function (x) { return itemName(x[0]) + ' ×' + x[1]; }).join(', '),
        price: setPrice(s).price,
        preorder: s.items.some(function (x) { return ITEMS[x[0]] && ITEMS[x[0]].preorder; }),
      };
    }
    if (p[0] === 'c' && COMBO && p.length === 4 && ITEMS[p[1]] && ITEMS[p[2]] && ITEMS[p[3]]) {
      return { name: COMBO.title, details: [itemName(p[1]), itemName(p[2]), itemName(p[3])].join(' + '), price: COMBO.price };
    }
    return null;
  }

  // ---------- cart state ----------
  var cart = store.get('vk_cart', []).filter(function (r) { return r && r.key && r.qty > 0 && resolve(r.key); });
  var form = Object.assign({
    mode: 'delivery', name: '', phone: '', address: '', entrance: '',
    when: 'asap', time: '', pay: 'kaspi', comment: '',
  }, store.get('vk_form', {}));
  var lastOrder = null;

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
    if (!was) { var x = resolve(key); if (x) toast('Добавлено: ' + x.name); }
    var bar = $('#cartbar');
    bar.classList.remove('bump'); void bar.offsetWidth; bar.classList.add('bump');
  }

  // ---------- rendering: menu ----------
  function ctrlHtml(key) {
    var q = qtyOf(key);
    if (!q) return '<button class="add" type="button" data-add="' + esc(key) + '" aria-label="Добавить в корзину">+</button>';
    return '<div class="stepper"><button type="button" data-dec="' + esc(key) + '" aria-label="Убрать одну">−</button>' +
      '<span>' + q + '</span><button type="button" data-inc="' + esc(key) + '" aria-label="Добавить ещё">+</button></div>';
  }

  function itemRow(it) {
    var note = '';
    if (it.note || it.preorder) {
      note = '<div class="item-note">' + esc(it.note || '') + (it.preorder ? '<span class="tag-pre">на заказ</span>' : '') + '</div>';
    }
    return '<li class="item' + (it.highlight ? ' item--hl' : '') + '">' +
      '<div class="item-text"><div class="item-line"><span class="item-name">' + esc(it.name) + '</span>' +
      '<span class="dots"></span><span class="item-price">' + num(it.price) + '</span></div>' + note + '</div>' +
      '<div class="ctrl" data-ctrl="i:' + esc(it.id) + '"></div></li>';
  }

  function sectionHtml(sec) {
    var img = sec.image ? '<figure class="sec-img frame" style="margin-top:0"><img src="' + esc(sec.image) + '" alt="' + esc(sec.title) + '" loading="lazy"></figure>' : '';
    var body = img + '<ul class="items">' + sec.items.map(itemRow).join('') + '</ul>';
    return '<section class="sec' + (sec.tint ? ' sec--tint' : '') + '" id="sec-' + esc(sec.id) + '">' +
      '<div class="orn" aria-hidden="true"><span></span></div>' +
      '<h2 class="sec-title">' + esc(sec.title) + '</h2>' +
      (sec.tint ? '<div class="sec-body">' + body + '</div>' : body) + '</section>';
  }

  function popularHtml() {
    var cards = POPULAR.map(function (id) {
      var it = ITEMS[id];
      if (!it) return '';
      return '<article class="pcard">' +
        (it.img ? '<img src="' + esc(it.img) + '" alt="' + esc(it.name) + '" loading="lazy">' : '') +
        '<div class="pcard-body"><div class="pcard-name">' + esc(it.cartName || it.name) + '</div>' +
        '<div class="pcard-foot"><span class="pcard-price">' + fmt(it.price) + '</span>' +
        '<div class="ctrl" data-ctrl="i:' + esc(id) + '"></div></div></div></article>';
    }).join('');
    return '<section class="popular" aria-label="Популярное"><h2 class="sec-title">Популярное</h2><div class="hscroll">' + cards + '</div></section>';
  }

  function setsHtml() {
    if (!SETS.length) return '';
    var cards = SETS.map(function (s) {
      var p = setPrice(s);
      return '<article class="setcard">' +
        '<div class="setcard-img"><img src="' + esc(s.image) + '" alt="" loading="lazy">' +
        (p.sum > p.price ? '<span class="setcard-badge">Выгода ' + fmt(p.sum - p.price) + '</span>' : '') + '</div>' +
        '<div class="setcard-body"><h3 class="setcard-title">' + esc(s.title) + '</h3>' +
        '<div class="setcard-serves">' + esc(s.serves || '') + '</div>' +
        '<ul class="setcard-list">' + s.items.map(function (x) {
          var it = ITEMS[x[0]];
          return '<li>' + esc(itemName(x[0])) + (it && it.note ? ' (' + esc(it.note) + ')' : '') + ' × ' + x[1] + '</li>';
        }).join('') + '</ul>' +
        '<div class="setcard-foot"><div>' + (p.sum > p.price ? '<span class="price-old">' + fmt(p.sum) + '</span>' : '') +
        '<span class="price-new">' + fmt(p.price) + '</span></div>' +
        '<div class="ctrl" data-ctrl="s:' + esc(s.id) + '"></div></div></div></article>';
    }).join('');
    return '<section class="sec" id="sec-sets"><h2 class="sec-title">Сеты<small>Готовые наборы для семьи и компании — выгоднее, чем по отдельности</small></h2>' +
      '<div class="sets">' + cards + '</div></section>';
  }

  function comboHtml() {
    if (!COMBO) return '';
    var lists = COMBO.groups.slice(0, 2).map(function (g) {
      return '<b>' + esc(g.label) + ':</b> ' + g.options.map(itemName).join(', ');
    }).join('<br>');
    return '<section class="sec" id="sec-combo"><div class="orn" aria-hidden="true"><span></span></div>' +
      '<div class="combo"><div class="combo-text">' +
      '<div class="combo-head"><h2 class="combo-title">' + esc(COMBO.title) + '</h2><span class="combo-price">' + fmt(COMBO.price) + '</span></div>' +
      '<div class="combo-sub">' + esc(COMBO.subtitle) + '</div>' +
      '<p class="combo-list">' + lists + '</p>' +
      '<button class="btn btn--sm" type="button" data-open-combo>Собрать комбо</button>' +
      '<div class="combo-count" id="comboCount"></div>' +
      '</div><div class="combo-img"><img src="' + esc(COMBO.image) + '" alt="" loading="lazy"></div></div></section>';
  }

  function renderMenu() {
    var html = popularHtml() + setsHtml() + comboHtml() + MENU.map(sectionHtml).join('');
    $('#menu').innerHTML = html;

    var links = [];
    if (SETS.length) links.push(['sec-sets', 'Сеты']);
    if (COMBO) links.push(['sec-combo', 'Комбо']);
    MENU.forEach(function (s) { if (s.nav) links.push(['sec-' + s.id, s.nav]); });
    links.push(['sec-events', 'Накрыть стол']);
    $('#catnav').innerHTML = links.map(function (l) {
      return '<a href="#' + l[0] + '" data-target="' + l[0] + '">' + esc(l[1]) + '</a>';
    }).join('');
  }

  // ---------- refresh dynamic parts ----------
  function refresh() {
    $$('[data-ctrl]').forEach(function (el) { el.innerHTML = ctrlHtml(el.getAttribute('data-ctrl')); });
    var n = count();
    $('#cartbar').hidden = n === 0 || !$('#sheet').hidden;
    $('#cartCount').textContent = n;
    $('#cartSum').textContent = fmt(total());
    var cc = $('#comboCount');
    if (cc) {
      var k = cart.filter(function (r) { return r.key.indexOf('c:') === 0; }).reduce(function (a, r) { return a + r.qty; }, 0);
      cc.textContent = k ? 'В корзине: ' + k + ' шт.' : '';
    }
    if (sheetMode === 'cart') renderCartSheet();
  }

  // ---------- toast ----------
  var toastTimer;
  function toast(t) {
    var el = $('#toast');
    el.textContent = t;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 1600);
  }

  // ---------- sheet ----------
  var sheetMode = null;
  function openSheet(mode, title) {
    sheetMode = mode;
    $('#sheetTitle').textContent = title;
    $('#sheet').hidden = false;
    $('#cartbar').hidden = true;
    document.body.classList.add('lock');
  }
  function closeSheet() {
    sheetMode = null;
    $('#sheet').hidden = true;
    document.body.classList.remove('lock');
    refresh();
  }

  // Combo picker
  var comboPick = {};
  function openCombo() {
    COMBO.groups.forEach(function (g) { if (!comboPick[g.key]) comboPick[g.key] = g.options[0]; });
    openSheet('combo', COMBO.title + ' · ' + fmt(COMBO.price));
    $('#sheetBody').innerHTML = COMBO.groups.map(function (g) {
      return '<div class="opt-group"><h4>' + esc(g.label) + '</h4><div class="opts">' + g.options.map(function (id) {
        return '<label><input type="radio" name="combo-' + g.key + '" value="' + esc(id) + '"' +
          (comboPick[g.key] === id ? ' checked' : '') + '><span>' + esc(itemName(id)) + '</span></label>';
      }).join('') + '</div></div>';
    }).join('') + '<button class="btn" type="button" id="comboAdd">Добавить в корзину · ' + fmt(COMBO.price) + '</button>';
  }

  // Cart
  function seg(name, value, options) {
    return '<div class="seg" role="radiogroup">' + options.map(function (o) {
      return '<label><input type="radio" name="' + name + '" value="' + o[0] + '"' + (value === o[0] ? ' checked' : '') +
        '><span>' + o[1] + '</span></label>';
    }).join('') + '</div>';
  }
  function field(name, label, attrs, value, tag) {
    if (tag === 'textarea') {
      return '<label class="field" data-field="' + name + '"><span>' + label + '</span><textarea name="' + name + '" rows="2" ' + (attrs || '') + '>' + esc(value) + '</textarea></label>';
    }
    return '<label class="field" data-field="' + name + '"><span>' + label + '</span><input name="' + name + '" ' + (attrs || '') + ' value="' + esc(value) + '"></label>';
  }

  function renderCartSheet() {
    var body = $('#sheetBody');
    if (!cart.length) {
      body.innerHTML = '<div class="empty">Корзина пуста.<br>Добавьте блюда из меню.</div>' +
        '<button class="btn btn--ghost" type="button" data-close>Вернуться в меню</button>';
      return;
    }
    var scroll = body.scrollTop;
    var hasPre = cart.some(function (r) { var x = resolve(r.key); return x && x.preorder; });
    var t = total();
    var minOk = form.mode !== 'delivery' || !C.minOrderDelivery || t >= C.minOrderDelivery;

    var rows = cart.map(function (r) {
      var x = resolve(r.key);
      return '<li class="cart-row"><div><div class="cart-name">' + esc(x.name) + '</div>' +
        (x.details ? '<div class="cart-det">' + esc(x.details) + '</div>' : '') +
        '<div class="cart-price">' + fmt(x.price) + ' × ' + r.qty + ' = <b>' + fmt(x.price * r.qty) + '</b></div></div>' +
        '<div class="ctrl" data-ctrl="' + esc(r.key) + '">' + ctrlHtml(r.key) + '</div></li>';
    }).join('');

    var payOptions = form.mode === 'delivery'
      ? [['kaspi', 'Kaspi перевод']]
      : [['kaspi', 'Kaspi перевод'], ['cash', 'На месте']];
    if (form.mode === 'delivery') form.pay = 'kaspi';

    body.innerHTML =
      '<ul class="cart-list">' + rows + '</ul>' +
      '<div class="cart-total"><span>Итого</span><b>' + fmt(t) + '</b></div>' +
      (form.mode === 'delivery' ? '<p class="cart-sub">+ доставка по тарифу Яндекса</p>' : '<p class="cart-sub">Самовывоз — без доплат</p>') +
      (hasPre ? '<p class="note">В заказе есть позиции <b>на заказ</b> — мы уточним время готовности в WhatsApp.</p>' : '') +
      '<form id="orderForm" class="form" novalidate>' +
      '<div class="h4">Как получить</div>' +
      seg('mode', form.mode, [['delivery', 'Доставка'], ['pickup', 'Самовывоз']]) +
      (form.mode === 'delivery'
        ? field('address', 'Адрес доставки', 'autocomplete="street-address" placeholder="Улица, дом, квартира / офис"', form.address) +
          field('entrance', 'Подъезд, этаж, ориентир', 'placeholder="Необязательно"', form.entrance) +
          '<p class="note">' + esc(C.deliveryNote || '') + '</p>' +
          (!minOk ? '<p class="form-err">Минимальная сумма для доставки — ' + fmt(C.minOrderDelivery) + '</p>' : '')
        : '<p class="note">Самовывоз: ' + esc(C.address || '') + (C.hours ? ' · ' + esc(C.hours) : '') + '</p>') +
      '<div class="h4">Когда</div>' +
      seg('when', form.when, [['asap', 'Как можно скорее'], ['time', 'Ко времени']]) +
      (form.when === 'time' ? field('time', 'Время', 'type="time"', form.time) : '') +
      '<div class="h4">Контакты</div>' +
      '<div class="row2">' +
      field('name', 'Имя', 'autocomplete="given-name"', form.name) +
      field('phone', 'Телефон', 'type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 7__ ___ __ __"', form.phone) +
      '</div>' +
      '<div class="h4">Оплата</div>' +
      seg('pay', form.pay, payOptions) +
      '<p class="note">' + (form.pay === 'kaspi'
        ? 'После подтверждения заказа переведите сумму на Kaspi и пришлите чек в WhatsApp.'
        : 'Оплата наличными или Kaspi при получении.') + '</p>' +
      field('comment', 'Комментарий', 'placeholder="Например: без лука, приборы на 3 человек"', form.comment, 'textarea') +
      '<p class="form-err" id="orderErr" hidden></p>' +
      '<button class="btn btn--wa" type="submit"' + (minOk ? '' : ' disabled style="opacity:.5"') + '>' +
      '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2z"/></svg>' +
      'Отправить заказ в WhatsApp</button>' +
      '</form>';
    body.scrollTop = scroll;
  }

  function openCart() {
    openSheet('cart', 'Ваш заказ');
    renderCartSheet();
    $('#sheetBody').scrollTop = 0;
  }

  // ---------- order ----------
  function waUrl(text) {
    var n = digits(C.whatsapp);
    return 'https://wa.me/' + (n || '') + '?text=' + encodeURIComponent(text);
  }
  function openWa(text) {
    var url = waUrl(text);
    var w = window.open(url, '_blank');
    if (!w) window.location.href = url;
  }

  function orderNumber() {
    return String(Date.now()).slice(-4);
  }

  function buildOrderText(no) {
    var lines = ['🧾 *Заказ №' + no + '* — Восточка', ''];
    cart.forEach(function (r, i) {
      var x = resolve(r.key);
      lines.push((i + 1) + '. ' + x.name + (x.details ? ' (' + x.details + ')' : '') + ' × ' + r.qty + ' = ' + fmt(x.price * r.qty));
    });
    lines.push('', '*Итого: ' + fmt(total()) + '*' + (form.mode === 'delivery' ? ' + доставка' : ''), '');
    if (form.mode === 'delivery') {
      lines.push('🚚 Доставка: ' + form.address + (form.entrance ? ', ' + form.entrance : ''));
    } else {
      lines.push('🏪 Самовывоз');
    }
    lines.push('⏰ ' + (form.when === 'time' ? 'Ко времени: ' + form.time : 'Как можно скорее'));
    lines.push('👤 ' + form.name + ', ' + form.phone);
    lines.push('💳 Оплата: ' + (form.pay === 'kaspi' ? 'перевод Kaspi' : 'на месте'));
    if (form.comment) lines.push('💬 ' + form.comment);
    return lines.join('\n');
  }

  function markInvalid(names) {
    $$('#orderForm .field').forEach(function (f) { f.classList.remove('invalid'); });
    names.forEach(function (n) { var f = $('#orderForm [data-field="' + n + '"]'); if (f) f.classList.add('invalid'); });
  }

  function submitOrder() {
    var errs = [], bad = [];
    if (form.mode === 'delivery' && form.address.trim().length < 4) { errs.push('укажите адрес'); bad.push('address'); }
    if (form.when === 'time' && !form.time) { errs.push('укажите время'); bad.push('time'); }
    if (!form.name.trim()) { errs.push('укажите имя'); bad.push('name'); }
    if (digits(form.phone).length < 10) { errs.push('укажите телефон'); bad.push('phone'); }
    markInvalid(bad);
    var errEl = $('#orderErr');
    if (errs.length) {
      errEl.textContent = 'Пожалуйста, ' + errs.join(', ') + '.';
      errEl.hidden = false;
      var first = $('#orderForm .invalid input, #orderForm .invalid textarea');
      if (first) first.focus();
      return;
    }
    var no = orderNumber();
    var text = buildOrderText(no);
    lastOrder = { no: no, text: text, total: total(), pay: form.pay, mode: form.mode };
    openWa(text);
    cart = [];
    store.set('vk_cart', cart);
    showSuccess();
  }

  function showSuccess() {
    sheetMode = 'success';
    $('#sheetTitle').textContent = 'Заказ №' + lastOrder.no;
    var kaspi = '';
    if (lastOrder.pay === 'kaspi' && (C.kaspiPhone || C.kaspiQr)) {
      kaspi = '<div class="pay-card"><h5>Оплата Kaspi</h5>' +
        '<div>Сумма: <b>' + fmt(lastOrder.total) + '</b>' + (lastOrder.mode === 'delivery' ? ' + доставка (сообщим)' : '') + '</div>' +
        (C.kaspiPhone ? '<div class="pay-num"><span>' + esc(C.kaspiPhone) + '</span>' +
          '<button class="btn btn--sm btn--ghost" type="button" data-copy="' + esc(C.kaspiPhone) + '">Копировать</button></div>' : '') +
        (C.kaspiName ? '<div>Получатель: ' + esc(C.kaspiName) + '</div>' : '') +
        (C.kaspiQr ? '<img src="' + esc(C.kaspiQr) + '" alt="Kaspi QR">' : '') +
        '<p class="cart-sub" style="margin:8px 0 0">Переведите после подтверждения заказа и пришлите чек в WhatsApp.</p></div>';
    }
    $('#sheetBody').innerHTML = '<div class="success">' +
      '<div class="success-icon"><svg viewBox="0 0 24 24" width="38" height="38" aria-hidden="true"><path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg></div>' +
      '<h4>Почти готово!</h4>' +
      '<p>Мы открыли WhatsApp с вашим заказом — <b>нажмите «Отправить»</b>. Мы подтвердим заказ и время.</p>' +
      kaspi +
      '<div class="stack"><button class="btn btn--wa" type="button" id="resendWa">Открыть WhatsApp ещё раз</button>' +
      '<button class="btn btn--ghost" type="button" data-close>Вернуться в меню</button></div></div>';
    $('#sheetBody').scrollTop = 0;
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
    if (bad.length) { err.textContent = 'Заполните дату, число гостей, имя и телефон.'; err.hidden = false; return; }
    err.hidden = true;
    var date = data.date.split('-').reverse().join('.');
    var text = ['🎉 *Заявка: накрыть стол* — Восточка', '',
      'Повод: ' + data.occasion,
      'Дата: ' + date,
      'Гостей: ' + data.guests,
      data.need.length ? 'Нужно: ' + data.need.join(', ') : '',
      data.comment ? 'Пожелания: ' + data.comment : '',
      '', '👤 ' + data.name + ', ' + data.phone,
    ].filter(function (l, i, a) { return l !== '' || (a[i - 1] !== '' && i > 0); }).join('\n');
    openWa(text);
    toast('Заявка открыта в WhatsApp — нажмите «Отправить»');
    form.name = form.name || data.name;
    form.phone = form.phone || data.phone;
    store.set('vk_form', form);
  }

  // ---------- nav highlight ----------
  function setupNav() {
    var nav = $('#catnav');
    var links = $$('a', nav);
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute('data-target')] = a; });
    var activate = function (id) {
      links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('data-target') === id); });
      var a = byId[id];
      if (a) nav.scrollTo({ left: a.offsetLeft - 16, behavior: 'smooth' });
    };
    if (!('IntersectionObserver' in window)) return;
    var current = null;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var id = en.target.id;
          // cold drinks belong to the "Напитки" tab
          if (!byId[id] && id === 'sec-cold-drinks') id = 'sec-hot-drinks';
          if (byId[id] && id !== current) { current = id; activate(id); }
        }
      });
    }, { rootMargin: '-70px 0px -70% 0px' });
    $$('section[id^="sec-"]').forEach(function (s) { io.observe(s); });
  }

  // ---------- static info ----------
  function fillInfo() {
    var wa = digits(C.whatsapp);
    $('#setupNotice').hidden = !!wa;
    $('#waBtn').href = 'https://wa.me/' + wa;
    if (!wa) $('#waBtn').hidden = true;
    if (C.phone) { $('#callBtn').href = 'tel:' + digits(C.phone).replace(/^/, '+'); $('#callBtn').hidden = false; }

    $('#heroMeta').textContent = [C.address, C.hours].filter(Boolean).join(' · ');
    var info = [];
    if (C.address) info.push(esc(C.address));
    if (C.hours) info.push(esc(C.hours));
    if (C.phone) info.push('<a href="tel:+' + digits(C.phone) + '">' + esc(C.phone) + '</a>');
    if (wa) info.push('<a href="https://wa.me/' + wa + '" target="_blank" rel="noopener">WhatsApp</a>');
    if (C.instagram) info.push('<a href="https://instagram.com/' + esc(C.instagram) + '" target="_blank" rel="noopener">Instagram</a>');
    if (C.twoGisLink) info.push('<a href="' + esc(C.twoGisLink) + '" target="_blank" rel="noopener">Мы в 2GIS</a>');
    $('#footerInfo').innerHTML = info.join(' · ');

    var d = $('#eventForm input[name="date"]');
    if (d) {
      var t = new Date(); t.setDate(t.getDate() + 1);
      d.min = t.toISOString().slice(0, 10);
    }
    var ef = $('#eventForm');
    if (ef) {
      ef.elements.namedItem('name').value = form.name || '';
      ef.elements.namedItem('phone').value = form.phone || '';
    }
  }

  // ---------- event wiring ----------
  document.addEventListener('click', function (e) {
    var t = e.target.closest('button, a, [data-close]');
    if (!t) return;
    if (t.hasAttribute('data-add')) { add(t.getAttribute('data-add')); return; }
    if (t.hasAttribute('data-inc')) { var k = t.getAttribute('data-inc'); setQty(k, qtyOf(k) + 1); return; }
    if (t.hasAttribute('data-dec')) { var k2 = t.getAttribute('data-dec'); setQty(k2, qtyOf(k2) - 1); return; }
    if (t.hasAttribute('data-open-combo')) { openCombo(); return; }
    if (t.hasAttribute('data-close')) { closeSheet(); return; }
    if (t.hasAttribute('data-copy')) {
      var v = t.getAttribute('data-copy');
      var done = function () { toast('Номер скопирован'); };
      if (navigator.clipboard) navigator.clipboard.writeText(v).then(done, function () { toast(v); });
      else toast(v);
      return;
    }
    if (t.id === 'openCart') { openCart(); return; }
    if (t.id === 'comboAdd') {
      var key = 'c:' + COMBO.groups.map(function (g) { return comboPick[g.key]; }).join(':');
      add(key);
      closeSheet();
      return;
    }
    if (t.id === 'resendWa' && lastOrder) { openWa(lastOrder.text); return; }
    if (t.matches('#catnav a')) {
      e.preventDefault();
      var target = document.getElementById(t.getAttribute('data-target'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  var sheetBody = $('#sheetBody');
  sheetBody.addEventListener('change', function (e) {
    var el = e.target;
    if (sheetMode === 'combo' && el.name && el.name.indexOf('combo-') === 0) {
      comboPick[el.name.slice(6)] = el.value;
      return;
    }
    if (sheetMode === 'cart' && el.name in form) {
      form[el.name] = el.value;
      store.set('vk_form', form);
      if (el.name === 'mode' || el.name === 'when' || el.name === 'pay') renderCartSheet();
    }
  });
  sheetBody.addEventListener('input', function (e) {
    var el = e.target;
    if (sheetMode === 'cart' && el.name in form && el.type !== 'radio') {
      form[el.name] = el.value;
      store.set('vk_form', form);
      var f = el.closest('.field');
      if (f) f.classList.remove('invalid');
    }
  });
  sheetBody.addEventListener('submit', function (e) {
    if (e.target.id === 'orderForm') { e.preventDefault(); submitOrder(); }
  });
  $('#eventForm').addEventListener('submit', submitEvent);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && sheetMode) closeSheet(); });

  // ---------- init ----------
  renderMenu();
  fillInfo();
  refresh();
  setupNav();
})();
