/* Rojas Jardinería y Paisajismo: menú, aparición al hacer scroll, comparador antes/después y barra de contacto. */
(function () {
  'use strict';
  window.rojasListo = true;
  var quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hayIO = 'IntersectionObserver' in window;

  /* ---------- Menú del celular y sombra del encabezado ---------- */
  var h = document.querySelector('header'), b = h && h.querySelector('.menu-btn');
  if (b) {
    var cerrar = function () { h.classList.remove('abierto'); b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-label', 'Abrir menú'); };
    b.addEventListener('click', function () {
      var abierto = h.classList.toggle('abierto');
      b.setAttribute('aria-expanded', abierto);
      b.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
    });
    h.querySelectorAll('nav a').forEach(function (a) { a.addEventListener('click', cerrar); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrar(); });
    document.addEventListener('click', function (e) { if (!h.contains(e.target)) cerrar(); });
  }
  if (h) {
    var sombra = function () { h.classList.toggle('con-sombra', window.scrollY > 8); };
    window.addEventListener('scroll', sombra, { passive: true }); sombra();
  }

  /* ---------- Aparición al hacer scroll (una sola vez) ---------- */
  function alVer(elementos, fn, umbral) {
    if (!elementos.length) return;
    if (!hayIO) { elementos.forEach(fn); return; }
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) { if (en.isIntersecting) { io.unobserve(en.target); fn(en.target); } });
    }, { threshold: umbral || 0.15 });
    elementos.forEach(function (el) { io.observe(el); });
  }
  var todos = function (sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); };

  alVer(todos('.reveal'), function (el) {
    el.classList.add('visible');
    // Al terminar, se quita la clase para que el elemento recupere sus propias transiciones (hover, etc.)
    var fin = function (e) {
      if (e.target !== el || e.propertyName !== 'transform') return;
      el.removeEventListener('transitionend', fin);
      el.classList.remove('reveal', 'visible');
    };
    el.addEventListener('transitionend', fin);
  });
  alVer(todos('.franjas-sep, .pasos-lista'), function (el) { el.classList.add('visible'); }, 0.3);

  /* ---------- Comparador antes / después ---------- */
  todos('.ba').forEach(function (ba) {
    var r = ba.querySelector('.ba-rango'), arrastrando = false, tocado = false;
    function poner(v) { v = Math.max(0, Math.min(100, v)); ba.style.setProperty('--pos', v + '%'); r.value = Math.round(v); }
    function desde(e) { var c = ba.getBoundingClientRect(); poner((e.clientX - c.left) / c.width * 100); }
    r.addEventListener('input', function () { tocado = true; poner(+r.value); });
    ba.addEventListener('pointerdown', function (e) {
      arrastrando = true; tocado = true;
      if (e.pointerType === 'mouse') { desde(e); ba.setPointerCapture(e.pointerId); }
    });
    ba.addEventListener('pointermove', function (e) { if (arrastrando) desde(e); });
    ba.addEventListener('pointerup', function (e) { if (arrastrando) desde(e); arrastrando = false; });
    ['pointercancel', 'pointerleave'].forEach(function (t) { ba.addEventListener(t, function () { arrastrando = false; }); });

    // Vaivén corto la primera vez que se ve: 50 → 35 → 65 → 50 % en 1,2 s
    if (quieto) return;
    alVer([ba], function () {
      var t0 = null, puntos = [50, 35, 65, 50];
      setTimeout(function () {
        requestAnimationFrame(function paso(t) {
          if (tocado) return;
          if (t0 === null) t0 = t;
          var p = Math.min((t - t0) / 1200, 1), tramo = Math.min(Math.floor(p * 3), 2), k = p * 3 - tramo;
          var suave = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
          poner(puntos[tramo] + (puntos[tramo + 1] - puntos[tramo]) * suave);
          if (p < 1) requestAnimationFrame(paso);
        });
      }, 400);
    }, 0.6);
  });

  /* ---------- Barra fija de contacto en el celular ---------- */
  var barra = document.querySelector('.barra-movil');
  if (barra) {
    var portada = document.querySelector('#inicio'), contacto = document.querySelector('#contacto, .cta-art');
    var pasoPortada = !portada, enContacto = false;
    var actualizar = function () { barra.classList.toggle('ver', pasoPortada && !enContacto); };
    if (hayIO) {
      if (portada) new IntersectionObserver(function (en) { pasoPortada = !en[0].isIntersecting; actualizar(); }).observe(portada);
      else {
        var porScroll = function () { pasoPortada = window.scrollY > 300; actualizar(); };
        window.addEventListener('scroll', porScroll, { passive: true }); porScroll();
      }
      if (contacto) new IntersectionObserver(function (en) { enContacto = en[0].isIntersecting; actualizar(); }).observe(contacto);
    } else { barra.classList.add('ver'); }
  }
})();
