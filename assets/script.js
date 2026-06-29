(function () {
  'use strict';

  /* ============ КОНФИГ (замените на реальные данные) ============ */
  var CONFIG = {
    phone: '+7 (___) ___-__-__',
    maxLink: 'https://max.ru/',   // ссылка на ваш профиль/чат MAX
    email: 'info@example.ru',
    formEndpoint: ''              // Formspree/CRM webhook. Пусто = показ успеха без отправки
  };

  function $(s, c) { return (c || document).querySelector(s); }
  function $all(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function goal(name) { try { if (window.ym && window.YM_ID) window.ym(window.YM_ID, 'reachGoal', name); } catch (e) {} }

  /* data-goal → Метрика */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-goal]'); if (t) goal(t.getAttribute('data-goal'));
  });

  /* ============ ГОД ============ */
  var y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  /* ============ ШАПКА: тень при скролле ============ */
  var hdr = $('#hdr');
  function onScroll() { if (hdr) hdr.classList.toggle('scrolled', window.scrollY > 8); }
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  /* ============ МОБИЛЬНОЕ МЕНЮ ============ */
  var burger = $('#burger'), mnav = $('#mobileNav');
  function toggleMenu(open) {
    if (!burger || !mnav) return;
    var willOpen = open === undefined ? !mnav.classList.contains('open') : open;
    mnav.classList.toggle('open', willOpen);
    burger.classList.toggle('open', willOpen);
    document.body.style.overflow = willOpen ? 'hidden' : '';
  }
  if (burger) burger.addEventListener('click', function () { toggleMenu(); });
  if (mnav) $all('a', mnav).forEach(function (a) { a.addEventListener('click', function () { toggleMenu(false); }); });

  /* ============ МОДАЛКА ============ */
  function openModal(id) { var m = $('#' + id); if (m) m.classList.add('open'); document.body.style.overflow = 'hidden'; }
  function closeModal(m) { m.classList.remove('open'); document.body.style.overflow = ''; }
  $all('[data-open]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (mnav && mnav.classList.contains('open')) toggleMenu(false);
      openModal(b.getAttribute('data-open') === 'callback' ? 'callbackModal' : b.getAttribute('data-open'));
    });
  });
  $all('.modal-back').forEach(function (back) {
    back.addEventListener('click', function (e) { if (e.target === back || e.target.closest('[data-close]')) closeModal(back); });
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') $all('.modal-back.open').forEach(closeModal); });

  /* ============ ВЫБОР ВРЕМЕНИ / ОДИНОЧНЫЙ ВЫБОР ============ */
  function singleSelect(gridSel) {
    var grid = $(gridSel); if (!grid) return { value: '' };
    var state = { value: '' };
    $all('.time-opt', grid).forEach(function (opt) {
      opt.addEventListener('click', function () {
        $all('.time-opt', grid).forEach(function (o) { o.classList.remove('sel'); });
        opt.classList.add('sel'); state.value = opt.getAttribute('data-time') || opt.textContent.trim();
      });
    });
    return state;
  }
  var timeSel = singleSelect('#timeGrid');

  /* ============ ОТПРАВКА ЗАЯВКИ ============ */
  function sendLead(data, done) {
    if (CONFIG.formEndpoint) {
      fetch(CONFIG.formEndpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
      }).then(function () { done(); }).catch(function () { done(); });
    } else { done(); }
  }
  function successHTML(title, sub) {
    return '<div class="ok-msg"><div class="tick">✓</div><h3>' + title + '</h3>' +
      '<p class="muted" style="margin:10px 0 18px">' + sub + '</p>' +
      '<a class="btn btn-primary btn-block" target="_blank" rel="noopener" href="' + CONFIG.maxLink + '" data-goal="open_max">Написать в MAX</a></div>';
  }

  /* ---- модалка "Запросить звонок" ---- */
  var cbSubmit = $('#cbSubmit');
  if (cbSubmit) cbSubmit.addEventListener('click', function () {
    var phone = $('#cbPhone').value.trim();
    if (!phone) { $('#cbPhone').focus(); return; }
    sendLead({
      type: 'callback', name: $('#cbName').value.trim(), phone: phone,
      date: $('#cbDate').value, time: timeSel.value
    }, function () {
      $('#callbackForm').innerHTML = successHTML('Заявка принята!',
        'Перезвоним ' + ($('#cbDate').value || 'в ближайшее время') + (timeSel.value ? ', ' + timeSel.value : '') + '.');
    });
  });

  /* ---- форма на странице контактов ---- */
  var leadForm = $('#leadForm');
  if (leadForm) leadForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target;
    sendLead({
      type: 'lead', name: f.name.value.trim(), phone: f.phone.value.trim(),
      message: f.message ? f.message.value.trim() : ''
    }, function () {
      f.innerHTML = successHTML('Спасибо, заявка отправлена!', 'Свяжемся с вами в ближайшее время.');
    });
  });

  /* ============ ПОЯВЛЕНИЕ ПРИ СКРОЛЛЕ ============ */
  var reveals = $all('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else { reveals.forEach(function (el) { el.classList.add('in'); }); }

})();
