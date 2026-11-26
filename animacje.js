/* =====================================================================
   ANIMACJE – skrypt (bez bibliotek, ok. 3 KB)
   Użycie: na końcu strony, przed </body>:
     <script src="animacje.js"></script>
     <script>Animacje.init({ map: [ ['section h2','clip'], ['.card','rise'] ] });</script>
   Albo bez mapy: wpisz data-anim="up" itp. bezpośrednio w HTML.
   ===================================================================== */
(function (w, d) {
  'use strict';

  var DEF = {
    map: [],               // [ [selektor CSS, rodzaj wejścia], ... ] – nadaje data-anim automatycznie
    hero: '.hero, header', // elementy w tej części animują się od razu po wejściu na stronę
    maxStagger: 6,         // najwięcej kroków opóźnienia w jednej grupie
    progress: true,        // pasek postępu przewijania u góry
    parallax: '.an-band',  // pasy ze zdjęciem: obraz .an-band-bg przesuwa się wolniej
    parallaxSpeed: 0.12,
    countTime: 1400        // czas odliczania liczb [data-count]
  };

  function init(opts) {
    var o = {}, k;
    for (k in DEF) o[k] = DEF[k];
    for (k in (opts || {})) o[k] = opts[k];

    var still = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* pasek postępu i paralaksa */
    var bar = null;
    if (o.progress) { bar = d.createElement('div'); bar.id = 'an-prog'; bar.setAttribute('aria-hidden', 'true'); d.body.appendChild(bar); }
    function onScroll() {
      var de = d.documentElement, max = de.scrollHeight - de.clientHeight, y = w.scrollY || de.scrollTop;
      if (bar) bar.style.width = (max > 0 ? y / max * 100 : 0) + '%';
      if (still || !o.parallax) return;
      d.querySelectorAll(o.parallax).forEach(function (b) {
        var r = b.getBoundingClientRect(); if (r.bottom < 0 || r.top > w.innerHeight) return;
        var img = b.querySelector('.an-band-bg');
        if (img) img.style.transform = 'translateY(' + ((r.top + r.height / 2 - w.innerHeight / 2) * -o.parallaxSpeed) + 'px)';
      });
    }
    w.addEventListener('scroll', onScroll, { passive: true }); onScroll();

    /* bez obsługi albo z wyłączonymi animacjami: liczby od razu, nic nie ukrywamy */
    if (still || !('IntersectionObserver' in w)) return;
    d.documentElement.classList.add('an-js');

    /* 1. nadaj data-anim według mapy (element w już animowanym rodzicu pomijamy) */
    o.map.forEach(function (m) {
      d.querySelectorAll(m[0]).forEach(function (el) {
        if (el.hasAttribute('data-anim') || (el.parentElement && el.parentElement.closest('[data-anim]'))) return;
        el.setAttribute('data-anim', m[1]);
      });
    });
    var els = [].slice.call(d.querySelectorAll('[data-anim]'));

    /* 2. rodzeństwo z tym samym rodzajem wejścia pojawia się po kolei */
    els.forEach(function (el) {
      var p = el.parentNode, g = p.__anG || (p.__anG = {}), t = el.getAttribute('data-anim');
      g[t] = (g[t] === undefined ? 0 : g[t] + 1);
      if (g[t] > 0) el.style.setProperty('--an-i', Math.min(g[t], o.maxStagger));
    });

    /* 3. pokazanie elementu */
    function show(el) {
      if (el.classList.contains('an-in')) return;
      el.classList.add('an-in');
      var i = +(el.style.getPropertyValue('--an-i') || 0);
      setTimeout(function () { el.classList.add('an-done'); }, 1100 + i * 90);
      if (el.hasAttribute('data-count')) count(el);
      el.querySelectorAll('[data-count]').forEach(count);
    }
    function count(n) {
      if (n.__anC) return; n.__anC = 1;
      var to = +n.getAttribute('data-count'), t0 = null;
      function f(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / o.countTime); n.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); }
      n.textContent = '0'; requestAnimationFrame(f);
    }

    /* 4. obserwacja. Element z maską (clip) ma zerowy widoczny obszar,
          więc przeglądarka go „nie widzi” – obserwujemy wtedy jego rodzica. */
    var proxy = new Map();
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var list = proxy.get(e.target); if (list) list.forEach(show);
        if (e.target.hasAttribute('data-anim')) show(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: .08, rootMargin: '0px 0px -8% 0px' });

    els.forEach(function (el) {
      if (o.hero && el.closest(o.hero)) return;
      if (el.getAttribute('data-anim') === 'clip') {
        var par = el.parentNode;
        if (!proxy.has(par)) { proxy.set(par, []); io.observe(par); }
        proxy.get(par).push(el);
      } else io.observe(el);
    });

    /* 5. górna część strony od razu po wejściu */
    if (o.hero) setTimeout(function () { d.querySelectorAll(o.hero).forEach(function (h) { h.querySelectorAll('[data-anim]').forEach(show); }); }, 80);

    /* liczby poza animowanymi elementami */
    d.querySelectorAll('[data-count]').forEach(function (n) {
      if (n.closest('[data-anim]')) return;
      var once = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { count(n); once.disconnect(); } }, { threshold: .5 });
      once.observe(n);
    });
  }

  w.Animacje = { init: init };
})(window, document);
