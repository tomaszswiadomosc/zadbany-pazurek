/* =====================================================================
   ANIMACJE – skrypt w stylu zen.com (czysty JS, bez bibliotek)
   Użycie na końcu strony:
     <script src="animacje.js"></script>
     <script>Animacje.init({ map: [ ['.card','rise'] ] });</script>
   Przy „ogranicz ruch” skrypt nic nie robi: treść zostaje taka, jak w HTML.
   ===================================================================== */
(function (w, d) {
  'use strict';

  var DEF = {
    map: [],                       // [selektor, rodzaj wejścia] dla kart i bloków
    hero: '.hero',                 // górna część strony
    heroTitle: '.hero h1',         // nagłówek: słowo po słowie spod maski
    heroSeq: ['.hero .eyebrow', '.hero .slogan', '.hero .sub', '.hero .cta-row', '.hero .fine'],
    heroMain: '.hero-pics .big',   // główne zdjęcie: przybliżenie i obrót
    heroPop: ['.hero-pics img:not(.big)', '.hero .logo-ic'], // „plakietki” na końcu
    heroDrift: '.hero-pics',       // paralaksa w hero
    titles: 'section h2',          // nagłówki sekcji
    highlight: '.an-band h2',      // hasło na pasie: podświetlanie słowo po słowie
    stack: '.steps',               // kroki jako karty w stosie
    counters: '[data-count], .price .tag, .proof-total b, .fact b',
    bands: '.an-band',             // pasy ze zdjęciem w tle (.an-band-bg)
    drift: '.pic img',             // duże zdjęcia: lekki ruch w kadrze
    zoomSkip: '.hero, .an-band, .cmp, .phone, .logo, .quote',
    maxStagger: 6,
    countTime: 1400,
    smooth: true
  };

  var o, still, vh = w.innerHeight;

  /* ---------- pomocnicze ---------- */
  function $$(s, root) { return s ? [].slice.call((root || d).querySelectorAll(s)) : []; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* podział tekstu na słowa; zwykła spacja dzieli, twarda (&nbsp;) trzyma razem */
  function split(el, cls) {
    var n = 0;
    (function walk(node) {
      [].slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var parts = c.nodeValue.split(/([ \t\n\r]+)/), frag = d.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^[ \t\n\r]+$/.test(p)) { frag.appendChild(d.createTextNode(' ')); return; }
            var outer = d.createElement('span'), inner = d.createElement('span');
            outer.className = cls; inner.className = cls + 'i';
            inner.style.setProperty('--wi', n++);
            inner.textContent = p; outer.appendChild(inner); frag.appendChild(outer);
          });
          node.replaceChild(frag, c);
        } else if (c.nodeType === 1 && c.tagName !== 'BR') walk(c);
      });
    })(el);
    el.classList.add(cls + 's');
    return n;
  }

  /* ---------- obserwacja wejść ---------- */
  var io;
  function watch(el, fn, opts) {
    var once = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { fn(e.target); once.unobserve(e.target); } });
    }, opts || { threshold: .12, rootMargin: '0px 0px -8% 0px' });
    once.observe(el);
  }

  /* ---------- liczniki (polski zapis: przecinek, spacja tysięcy) ---------- */
  function fmt(v, dec) {
    var s = v.toFixed(dec).split('.'), i = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return dec ? i + ',' + s[1] : i;
  }
  function prepCounter(n) {
    if (n.children.length && !n.hasAttribute('data-count')) return null;   // tylko czysty tekst
    var t = n.textContent;
    if (/\d\s*[–-]\s*\d/.test(t)) return null;                             // przedziały typu 1–4 zostają
    var m = t.match(/(\d{1,3}(?:[  ]\d{3})+|\d+)(?:,(\d+))?/);
    if (!m) return null;
    var dec = m[2] ? m[2].length : 0;
    var to = parseFloat(m[1].replace(/[  ]/g, '') + (dec ? '.' + m[2] : ''));
    if (!to) return null;
    var c = { el: n, to: to, dec: dec, pre: t.slice(0, m.index), post: t.slice(m.index + m[0].length) };
    n.classList.add('an-num');
    n.textContent = c.pre + fmt(0, dec) + c.post;
    return c;
  }
  function runCounter(c) {
    var t0 = null;
    function f(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / o.countTime), e = 1 - Math.pow(1 - p, 3);
      c.el.textContent = c.pre + fmt(p < 1 ? c.to * e : c.to, c.dec) + c.post;
      if (p < 1) requestAnimationFrame(f);
    }
    requestAnimationFrame(f);
  }

  /* ---------- miękkie przewijanie kółkiem (tylko komputer) ---------- */
  function smoothWheel() {
    var target = w.scrollY, cur = w.scrollY, raf = 0;
    function scrollable(el) {
      for (; el && el !== d.body && el !== d.documentElement; el = el.parentElement) {
        var s = getComputedStyle(el);
        if (/(auto|scroll)/.test(s.overflowY) && el.scrollHeight > el.clientHeight + 1) return true;
        if (el.tagName === 'IFRAME' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA' || el.isContentEditable) return true;
        if (el.hasAttribute('data-native-scroll')) return true;
      }
      return false;
    }
    function max() { return d.documentElement.scrollHeight - w.innerHeight; }
    var html = d.documentElement;
    function loop() {
      cur += (target - cur) * 0.12;
      if (Math.abs(target - cur) < 0.5) cur = target;
      html.style.scrollBehavior = 'auto';            // CSS „smooth” nie może się wtrącać
      w.scrollTo(0, cur);
      if (cur !== target) raf = requestAnimationFrame(loop);
      else { raf = 0; html.style.scrollBehavior = ''; }
    }
    w.addEventListener('wheel', function (e) {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (scrollable(e.target)) return;
      e.preventDefault();
      var dy = e.deltaY * (e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? w.innerHeight : 1);
      if (!raf) { cur = w.scrollY; target = cur; }
      target = clamp(target + dy, 0, max());
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: false });
    /* kotwice, klawiatura, pasek przewijania: przejmujemy aktualną pozycję */
    w.addEventListener('scroll', function () {
      if (raf && Math.abs(w.scrollY - Math.round(cur)) < 3) return;   // to nasz ruch
      if (raf) { cancelAnimationFrame(raf); raf = 0; html.style.scrollBehavior = ''; }
      cur = target = w.scrollY;
    }, { passive: true });
  }

  /* ===================================================================== */
  function init(opts) {
    o = {}; var k;
    for (k in DEF) o[k] = DEF[k];
    for (k in (opts || {})) o[k] = opts[k];

    still = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (still || !('IntersectionObserver' in w)) return;   // treść zostaje bez zmian
    var root = d.documentElement;
    root.classList.add('an-js');

    /* 9. pasek postępu */
    var bar = d.createElement('div'); bar.id = 'an-prog'; bar.setAttribute('aria-hidden', 'true'); d.body.appendChild(bar);

    /* 1. start strony */
    var hero = d.querySelector(o.hero), t = 0;
    if (hero) {
      var h1 = d.querySelector(o.heroTitle), words = 0;
      var seq = [];
      o.heroSeq.forEach(function (s) { $$(s).forEach(function (el) { seq.push(el); }); });
      // kolejność od góry: elementy nad nagłówkiem, nagłówek, elementy pod nim
      seq.sort(function (a, b) { return a.getBoundingClientRect().top - b.getBoundingClientRect().top; });
      var hTop = h1 ? h1.getBoundingClientRect().top : 0, before = 0;
      if (h1) words = split(h1, 'an-w');
      seq.forEach(function (el) {
        el.classList.add('an-hs');
        var top = el.getBoundingClientRect().top;
        if (h1 && top < hTop) { el.style.setProperty('--hd', (before++ * 0.1) + 's'); }
      });
      var hStart = before * 0.1 + 0.05, hEnd = hStart + words * 0.07 + 0.35, after = 0;
      if (h1) h1.style.setProperty('--hd', hStart + 's');
      seq.forEach(function (el) { if (!h1 || el.getBoundingClientRect().top >= hTop) el.style.setProperty('--hd', (hEnd + after++ * 0.12) + 's'); });
      $$(o.heroMain).forEach(function (el) { el.classList.add('an-hm'); });
      var popAt = hEnd + after * 0.12 + 0.1;
      o.heroPop.forEach(function (s) { $$(s).forEach(function (el, i) { el.classList.add('an-hp'); el.style.setProperty('--hd', (popAt + i * 0.12) + 's'); }); });
      requestAnimationFrame(function () { requestAnimationFrame(function () { hero.classList.add('an-go'); }); });
    }

    /* 3. nagłówki sekcji: słowa spod spodu */
    var hl = $$(o.highlight);
    $$(o.titles).forEach(function (h) {
      if (hl.indexOf(h) > -1 || (hero && hero.contains(h))) return;
      split(h, 'an-w');
      watch(h, function (el) { el.classList.add('an-in'); setTimeout(function () { el.classList.add('an-done'); }, 1600); });
    });

    /* 8. hasło na pasie: podświetlanie słowo po słowie */
    var hlItems = hl.map(function (h) { var n = split(h, 'an-hw'); return { el: h, n: n, words: $$('.an-hwi', h) }; });

    /* 4. karty i bloki: wejście od dołu, sąsiedzi z opóźnieniem */
    o.map.forEach(function (m) {
      $$(m[0]).forEach(function (el) {
        if (el.hasAttribute('data-anim') || (el.parentElement && el.parentElement.closest('[data-anim]'))) return;
        if (hero && hero.contains(el)) return;
        el.setAttribute('data-anim', m[1]);
      });
    });
    $$('[data-anim]').forEach(function (el) {
      var p = el.parentNode, g = p.__anG || (p.__anG = {}), ty = el.getAttribute('data-anim');
      g[ty] = (g[ty] === undefined ? 0 : g[ty] + 1);
      if (g[ty] > 0) el.style.setProperty('--an-i', Math.min(g[ty], o.maxStagger));
      watch(el, function (e) {
        e.classList.add('an-in');
        var i = +(e.style.getPropertyValue('--an-i') || 0);
        setTimeout(function () { e.classList.add('an-done'); }, 1100 + i * 90);
      });
    });

    /* 5. zdjęcia: oddalenie ze 120% do 100% (tylko w ramce z overflow:hidden) */
    var driftImgs = $$(o.drift);
    $$('section img').forEach(function (img) {
      if (img.closest(o.zoomSkip) || img.classList.contains('an-band-bg')) return;
      var p = img.parentElement, s = p && getComputedStyle(p);
      if (!s || !/(hidden|clip)/.test(s.overflow + s.overflowX)) return;
      img.classList.add('an-zoom-in');
      if (driftImgs.indexOf(img) > -1) img.classList.add('an-drift');
      watch(img, function (e) { e.classList.add('an-in'); }, { threshold: .05 });
    });

    /* 7. liczniki */
    $$(o.counters).forEach(function (n) {
      if (n.closest('.cmp, .phone')) return;
      var c = prepCounter(n);
      if (c) watch(n, function () { runCounter(c); }, { threshold: .6 });
    });

    /* 6. karty w stosie */
    var stacks = $$(o.stack).map(function (s) {
      s.classList.add('an-stack');
      var items = [].slice.call(s.children);
      items.forEach(function (li, i) { li.style.setProperty('--si', i); });
      return items;
    });

    /* przewijanie: pasek, paralaksa, stos, podświetlanie */
    var drift = hero && d.querySelector(o.heroDrift), bands = $$(o.bands), ticking = false;
    function frame() {
      ticking = false;
      var de = root, y = w.scrollY, mx = de.scrollHeight - de.clientHeight;
      bar.style.transform = 'scaleX(' + (mx > 0 ? y / mx : 0) + ')';
      // 2. hero odpływa wolniej
      if (drift && y < vh * 1.2) drift.style.translate = '0 ' + (y * 0.18).toFixed(1) + 'px';
      bands.forEach(function (b) {
        var r = b.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return;
        var img = b.querySelector('.an-band-bg');
        if (img) img.style.translate = '0 ' + ((r.top + r.height / 2 - vh / 2) * -0.12).toFixed(1) + 'px';
      });
      d.querySelectorAll('.an-drift').forEach(function (img) {
        var r = img.parentElement.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return;
        img.style.translate = '0 ' + ((r.top + r.height / 2 - vh / 2) * -0.05).toFixed(1) + 'px';
      });
      // 6. poprzednia karta maleje i ciemnieje, gdy następna na nią najeżdża
      stacks.forEach(function (items) {
        for (var i = 0; i < items.length - 1; i++) {
          var a = items[i].getBoundingClientRect(), b = items[i + 1].getBoundingClientRect();
          var p = clamp(1 - (b.top - a.top) / Math.max(a.height, 1), 0, 1);
          items[i].style.scale = (1 - p * 0.06).toFixed(4);
          items[i].style.filter = p > 0.01 ? 'brightness(' + (1 - p * 0.22).toFixed(3) + ')' : '';
        }
      });
      // 8. podświetlanie hasła
      hlItems.forEach(function (h) {
        var r = h.el.getBoundingClientRect();
        var p = clamp((vh * 0.88 - r.top) / (vh * 0.55), 0, 1), lit = Math.round(p * h.n);
        h.words.forEach(function (wd, i) { wd.classList.toggle('on', i < lit); });
      });
    }
    function req() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
    w.addEventListener('scroll', req, { passive: true });
    w.addEventListener('resize', function () { vh = w.innerHeight; req(); });
    frame();

    /* 10. miękki scroll kółkiem: tylko mysz/gładzik na komputerze */
    if (o.smooth && w.matchMedia('(hover: hover) and (pointer: fine)').matches) smoothWheel();
  }

  w.Animacje = { init: init };
})(window, document);
