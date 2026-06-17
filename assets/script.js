/* ===== ИНЖСТРОЙМОНТАЖ — landing logic ===== */
(function () {
  'use strict';

  /* ---- CONFIG (замените на реальные данные клиента) ---- */
  var CONFIG = {
    maxLink: 'https://max.ru/',       // ссылка на ваш профиль/чат MAX
    tgLink: 'https://t.me/',          // ссылка на ваш Telegram
    phone: '+7 (495) 000-00-00',
    formEndpoint: ''                  // Formspree/CRM webhook. Пусто = показ успеха + кнопки мессенджеров
  };

  function goal(name) {            // Яндекс.Метрика цель (если счётчик подключён)
    try { if (window.ym && window.YM_ID) window.ym(window.YM_ID, 'reachGoal', name); } catch (e) {}
  }
  function $(s, c) { return (c || document).querySelector(s); }
  function $all(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  /* data-goal → Метрика */
  document.addEventListener('click', function (e) { var t = e.target.closest('[data-goal]'); if (t) goal(t.getAttribute('data-goal')); });

  /* ---- Header scroll ---- */
  var hdr = $('#hdr');
  function onScroll() { hdr.classList.toggle('scrolled', window.scrollY > 30); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---- Burger / mobile nav ---- */
  var burger = $('#burger'), mnav = $('#mobileNav');
  function toggleMenu(open) {
    burger.classList.toggle('open', open);
    mnav.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { toggleMenu(!mnav.classList.contains('open')); });
  $all('a', mnav).forEach(function (a) { a.addEventListener('click', function () { toggleMenu(false); }); });

  /* ---- Reveal on scroll ---- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    $all('.reveal').forEach(function (el) { io.observe(el); });
  } else { $all('.reveal').forEach(function (el) { el.classList.add('in'); }); }

  /* ---- Year ---- */
  $('#year').textContent = new Date().getFullYear();

  /* ---- Countdown (акция, перезапуск на 3 дня) ---- */
  (function () {
    var KEY = 'ism_deal_deadline';
    var dl = parseInt(localStorage.getItem(KEY), 10);
    var now = Date.now();
    if (!dl || dl < now) { dl = now + 3 * 24 * 3600 * 1000; localStorage.setItem(KEY, dl); }
    function pad(n) { return n < 10 ? '0' + n : '' + n; }
    function tick() {
      var d = Math.max(0, dl - Date.now()), s = Math.floor(d / 1000);
      $('#cdD').textContent = pad(Math.floor(s / 86400));
      $('#cdH').textContent = pad(Math.floor((s % 86400) / 3600));
      $('#cdM').textContent = pad(Math.floor((s % 3600) / 60));
      $('#cdS').textContent = pad(s % 60);
    }
    tick(); setInterval(tick, 1000);
  })();

  /* ---- Modals ---- */
  function openModal(id) { var m = $('#' + id); if (m) { m.classList.add('open'); document.body.style.overflow = 'hidden'; } }
  function closeModal(m) { m.classList.remove('open'); document.body.style.overflow = ''; }
  $all('[data-open]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (mnav.classList.contains('open')) toggleMenu(false);
      openModal(b.getAttribute('data-open') === 'callback' ? 'callbackModal' : b.getAttribute('data-open'));
    });
  });
  $all('.modal-back').forEach(function (m) {
    m.addEventListener('click', function (e) { if (e.target === m) closeModal(m); });
    $all('[data-close]', m).forEach(function (c) { c.addEventListener('click', function () { closeModal(m); }); });
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') $all('.modal-back.open').forEach(closeModal); });

  /* ---- Single-select chip groups (time / channel) ---- */
  function chipGroup(grid, attr) {
    var sel = { value: '' };
    $all('.time-opt', grid).forEach(function (b) {
      b.addEventListener('click', function () {
        $all('.time-opt', grid).forEach(function (x) { x.classList.remove('sel'); });
        b.classList.add('sel'); sel.value = b.getAttribute(attr);
      });
    });
    return sel;
  }
  var timeSel = chipGroup($('#timeGrid'), 'data-time');
  var chSel = chipGroup($('#channelGrid'), 'data-ch');

  /* default date = tomorrow */
  (function () { var d = new Date(Date.now() + 86400000); $('#cbDate').value = d.toISOString().slice(0, 10); })();

  function successHTML(title, sub) {
    return '<div class="ok-msg"><div class="tick">✓</div><h3>' + title + '</h3><p class="muted" style="margin:10px 0 18px">' + sub + '</p>' +
      '<a class="btn btn-max btn-block" target="_blank" rel="noopener" href="' + CONFIG.maxLink + '" data-goal="open_messenger">Написать в MAX</a>' +
      '<a class="btn btn-tg btn-block" style="margin-top:10px" target="_blank" rel="noopener" href="' + CONFIG.tgLink + '" data-goal="open_messenger">Telegram</a></div>';
  }
  function sendLead(payload, onDone) {
    goal('submit_lead');
    if (CONFIG.formEndpoint) {
      fetch(CONFIG.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        .then(function () { onDone(true); }).catch(function () { onDone(false); });
    } else { onDone(true); }   // нет backend — показываем успех + WhatsApp-дубль
  }

  /* ---- Callback submit ---- */
  $('#cbSubmit').addEventListener('click', function () {
    var name = $('#cbName').value.trim(), phone = $('#cbPhone').value.trim();
    if (!phone) { $('#cbPhone').focus(); return; }
    sendLead({ type: 'callback', name: name, phone: phone, date: $('#cbDate').value, time: timeSel.value, channel: chSel.value }, function () {
      $('#callbackForm').innerHTML = successHTML('Заявка принята!', 'Перезвоним ' + ($('#cbDate').value || 'в ближайшее время') + (timeSel.value ? ', ' + timeSel.value : '') + '.');
    });
  });

  /* ---- Lead form (final) ---- */
  $('#leadForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target, name = f.name.value.trim(), phone = f.phone.value.trim(), obj = f.object.value.trim();
    sendLead({ type: 'lead', name: name, phone: phone, object: obj }, function () {
      f.innerHTML = successHTML('Спасибо, заявка отправлена!', 'Свяжемся с вами в течение рабочего дня с расчётом и сроками.');
    });
  });

  /* ---- Exit popup ---- */
  (function () {
    var shown = sessionStorage.getItem('ism_exit') === '1';
    function trigger() {
      if (shown) return; shown = true; sessionStorage.setItem('ism_exit', '1'); openModal('exitModal');
    }
    document.addEventListener('mouseout', function (e) { if (!e.relatedTarget && e.clientY <= 0) trigger(); });
    // mobile fallback: показ после 35 c или на быстрый скролл вверх
    setTimeout(function () { if (!shown && window.scrollY > 400) trigger(); }, 35000);
    $('#exSubmit').addEventListener('click', function () {
      var c = $('#exContact').value.trim(); if (!c) { $('#exContact').focus(); return; }
      sendLead({ type: 'checklist', contact: c }, function () {
        $('#exitForm').innerHTML = successHTML('Готово!', 'Чек-лист отправим на ' + c + '. Проверьте сообщения.');
      });
    });
  })();

  /* ================= QUIZ ================= */
  var STEPS = [
    { key: 'object', q: 'Какой у вас объект?', multi: false, opts: [
      { v: 'aux', t: 'Вспомогательное / малое (до 500 м²)' },
      { v: 'wh', t: 'Склад / производство' },
      { v: 'ind', t: 'Промышленный / инфраструктурный' },
      { v: 'other', t: 'Другое' }
    ]},
    { key: 'area', q: 'Площадь объекта', multi: false, opts: [
      { v: 400, t: 'До 500 м²' },
      { v: 1200, t: '500–2 000 м²' },
      { v: 3500, t: '2 000–5 000 м²' },
      { v: 7000, t: 'Более 5 000 м²' }
    ]},
    { key: 'sections', q: 'Какие разделы нужны?', multi: true, opts: [
      { v: 'ov', t: 'Отопление и вентиляция (ОВ)' },
      { v: 'vk', t: 'Водоснабжение и канализация (ВК)' },
      { v: 'eom', t: 'Электроснабжение (ЭОМ)' },
      { v: 'ss', t: 'Слаботочка / безопасность' },
      { v: 'out', t: 'Наружные сети' },
      { v: 'all', t: 'Все разделы — под ключ' }
    ]},
    { key: 'approvals', q: 'Нужны согласования и экспертиза?', multi: true, opts: [
      { v: 'exp', t: 'Прохождение экспертизы' },
      { v: 'net', t: 'Согласование в МОЭК / МОЭСК / Россетях' },
      { v: 'none', t: 'Только проект' },
      { v: 'unknown', t: 'Пока не знаю' }
    ]},
    { key: 'contact', q: 'Куда прислать расчёт?', contact: true }
  ];
  var qState = { i: 0, data: {} };

  function estimate() {
    var area = qState.data.area || 1200;
    var secs = qState.data.sections || [];
    var rate;
    if (secs.indexOf('all') > -1) rate = 180;
    else { var n = secs.filter(function (s) { return s !== 'all'; }).length || 1; rate = Math.max(25, n * 35); }
    var base = area * rate;
    var appr = qState.data.approvals || [];
    if (appr.indexOf('exp') > -1) base += 150000;
    if (appr.indexOf('net') > -1) base += 120000;
    if (qState.data.object === 'ind') base *= 1.25;
    var withDeal = Math.round(base * 0.85 / 1000) * 1000;   // -15%
    return withDeal;
  }
  function fmt(n) { return n.toLocaleString('ru-RU') + ' ₽'; }

  function renderQuiz() {
    var body = $('#quizBody'), step = STEPS[qState.i];
    $('#quizProgress').style.width = ((qState.i) / (STEPS.length - 1) * 100) + '%';
    $('#quizStepLabel').textContent = 'Шаг ' + (qState.i + 1) + ' из ' + STEPS.length;

    if (step.contact) {
      body.innerHTML =
        '<h3>' + step.q + '</h3>' +
        '<input class="quiz-field" id="qName" type="text" placeholder="Ваше имя">' +
        '<input class="quiz-field" id="qPhone" type="tel" placeholder="Телефон" required>' +
        '<div class="quiz-nav"><button class="btn btn-ghost" id="qBack">Назад</button>' +
        '<button class="btn btn-gold" id="qSubmit">Получить расчёт со скидкой 15%</button></div>';
      $('#qBack').addEventListener('click', back);
      $('#qSubmit').addEventListener('click', function () {
        var ph = $('#qPhone').value.trim(); if (!ph) { $('#qPhone').focus(); return; }
        qState.data.name = $('#qName').value.trim(); qState.data.phone = ph;
        finishQuiz();
      });
      return;
    }

    var chosen = qState.data[step.key];
    var optsHTML = step.opts.map(function (o) {
      var sel = step.multi ? (chosen || []).indexOf(o.v) > -1 : chosen === o.v;
      return '<button class="opt' + (sel ? ' sel' : '') + '" data-v="' + o.v + '"><span class="box">' + (sel ? '✓' : '') + '</span>' + o.t + '</button>';
    }).join('');
    body.innerHTML = '<h3>' + step.q + '</h3><div class="opts">' + optsHTML + '</div>' +
      '<div class="quiz-nav">' + (qState.i > 0 ? '<button class="btn btn-ghost" id="qBack">Назад</button>' : '<span></span>') +
      (step.multi ? '<button class="btn btn-gold" id="qNext">Далее</button>' : '<span></span>') + '</div>';

    $all('.opt', body).forEach(function (b) {
      b.addEventListener('click', function () {
        var v = b.getAttribute('data-v');
        var numeric = !isNaN(parseFloat(v)) && step.key === 'area';
        var val = numeric ? parseFloat(v) : v;
        if (step.multi) {
          var arr = qState.data[step.key] || [];
          var idx = arr.indexOf(val);
          if (idx > -1) arr.splice(idx, 1); else arr.push(val);
          qState.data[step.key] = arr;
          b.classList.toggle('sel'); $('.box', b).textContent = b.classList.contains('sel') ? '✓' : '';
        } else {
          qState.data[step.key] = val; next();
        }
      });
    });
    if ($('#qBack')) $('#qBack').addEventListener('click', back);
    if ($('#qNext')) $('#qNext').addEventListener('click', next);
  }
  function next() { if (qState.i < STEPS.length - 1) { qState.i++; renderQuiz(); } }
  function back() { if (qState.i > 0) { qState.i--; renderQuiz(); } }
  function finishQuiz() {
    goal('quiz_complete'); goal('submit_lead');
    var price = estimate();
    sendLead({ type: 'quiz', data: qState.data, estimate: price }, function () {
      $('#quizProgress').style.width = '100%';
      $('#quizStepLabel').textContent = 'Готово';
      $('#quizBody').innerHTML =
        '<div class="quiz-result"><h3>Предварительная стоимость с учётом скидки 15%</h3>' +
        '<div class="big gold-text">от ' + fmt(price) + '</div>' +
        '<p class="muted" style="margin-bottom:18px">Это ориентир. Точную смету и сроки пришлём после бесплатного аудита исходных данных.</p>' +
        '<a class="btn btn-max btn-block" target="_blank" rel="noopener" href="' + CONFIG.maxLink + '" data-goal="open_messenger">Отправить заявку в MAX</a>' +
        '<a class="btn btn-tg btn-block" style="margin-top:10px" target="_blank" rel="noopener" href="' + CONFIG.tgLink + '" data-goal="open_messenger">Отправить в Telegram</a></div>';
    });
  }
  renderQuiz();

})();
