(() => {
  'use strict';

  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- заголовки: каждое слово в свою обёртку, чтобы проявлять из размытия ---- */
  document.querySelectorAll('[data-blur]').forEach((el) => {
    let n = 0;
    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(' '); return; }
            const s = document.createElement('span');
            s.className = 'w';
            s.style.setProperty('--w', n);
            n += 1;
            s.textContent = part;
            frag.append(s);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    };
    walk(el);
  });

  /* ---- появление при прокрутке: блоки, заголовки, фото-шторки ---- */
  const watch = document.querySelectorAll('[data-reveal], [data-blur]:not([data-blur-hero]), [data-wipe]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    watch.forEach((el) => io.observe(el));
  } else {
    watch.forEach((el) => el.classList.add('is-in'));
  }

  /* ---- первый экран открывается после заставки ---- */
  const reveal = () => {
    root.classList.add('is-ready');
    const h = document.querySelector('[data-blur-hero]');
    if (h) h.classList.add('is-in');
  };

  /* ---- заставка: золотая карта рисуется линиями, имя из размытия, счётчик, шторки ---- */
  const scene = () => {
    const NAME = 'Раиса Владимировна';
    const WIDTHS = [13, 21, 9, 25, 14, 18];
    const ORDER = [2, 0, 4, 1, 5, 3];
    const el = document.createElement('div');
    el.className = 'scene';
    el.setAttribute('aria-hidden', 'true');
    const panels = document.createElement('div');
    panels.className = 'scene__panels';
    const pEls = WIDTHS.map((w) => {
      const p = document.createElement('div');
      p.className = 'scene__panel';
      p.style.width = w + '%';
      panels.append(p);
      return p;
    });
    const wrap = document.createElement('div');
    wrap.className = 'scene__wrap';
    const parts = [
      '<rect x="6" y="6" width="108" height="168" rx="8" pathLength="1"/>',
      '<rect x="14" y="14" width="92" height="152" rx="4" pathLength="1"/>',
      '<circle cx="60" cy="84" r="24" pathLength="1"/>',
      '<path d="M70 70a18 18 0 1 0 0 28 14 14 0 1 1 0-28z" pathLength="1"/>',
      '<path d="M60 48v-8M60 128v-8M96 84h-8M32 84h-8M85 59l-5 5M40 104l-5 5M85 109l-5-5M40 64l-5-5" pathLength="1"/>',
      '<path d="M60 22l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" pathLength="1"/>',
      '<path d="M32 148c8-6 14 6 22 0s14 6 22 0 8-3 12-1" pathLength="1"/>',
      '<path d="M28 30l1 3 3 1-3 1-1 3-1-3-3-1 3-1zM92 30l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" pathLength="1"/>',
    ];
    const svg = '<svg class="scene__card" viewBox="0 0 120 180">' + parts.map((p, k) => p.replace('pathLength', 'style="--k:' + k + '" pathLength')).join('') + '</svg>';
    const name = document.createElement('p');
    name.className = 'scene__name';
    const chars = NAME.split('').map((c) => {
      const s = document.createElement('span');
      s.textContent = c === ' ' ? ' ' : c;
      name.append(s);
      return s;
    });
    const meta = document.createElement('div');
    meta.className = 'scene__meta';
    const label = document.createElement('span');
    label.textContent = 'Ясновидящая';
    const rule = document.createElement('i');
    const count = document.createElement('span');
    count.textContent = '000';
    meta.append(label, rule, count);
    wrap.innerHTML = svg;
    wrap.append(name, meta);
    el.append(panels, wrap);
    document.body.append(el);

    const TOTAL = 2300;
    const t0 = performance.now();
    chars.forEach((s, k) => setTimeout(() => s.classList.add('is-on'), 500 + k * 55));
    const tick = (now) => {
      const k = Math.min(1, (now - t0) / TOTAL);
      count.textContent = String(Math.round(k * 100)).padStart(3, '0');
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    setTimeout(() => {
      wrap.classList.add('is-out');
      ORDER.forEach((idx, k) => setTimeout(() => pEls[idx].classList.add('is-up'), 250 + k * 85));
      setTimeout(reveal, 420);
      setTimeout(() => el.remove(), 250 + ORDER.length * 85 + 950);
    }, TOTAL + 150);
  };

  let seen = false;
  try { seen = sessionStorage.getItem('raisa-scene') === '1'; sessionStorage.setItem('raisa-scene', '1'); } catch (_) { /* private mode */ }
  if (reduced || seen) reveal(); else scene();
  setTimeout(reveal, 6000); // страховка: первый экран откроется в любом случае

  /* ---- шапка: фон после первого экрана, прячется при прокрутке вниз ---- */
  const header = document.querySelector('[data-header]');
  const par = Array.from(document.querySelectorAll('[data-parallax]'));
  let lastY = window.scrollY, ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = window.scrollY;
    if (header) {
      header.classList.toggle('is-solid', y > 40);
      header.classList.toggle('is-hidden', y > 400 && y > lastY);
    }
    if (!reduced && window.innerWidth > 1000) {
      par.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        el.style.transform = 'translate3d(0,' + (y * parseFloat(el.dataset.parallax)).toFixed(1) + 'px,0)';
      });
    }
    lastY = y;
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---- видеоотзывы не звучат одновременно ---- */
  const vids = Array.from(document.querySelectorAll('video[controls]'));
  vids.forEach((v) => v.addEventListener('play', () => vids.forEach((o) => { if (o !== v) o.pause(); })));

  /* ---- защита от копирования ---- */
  ['contextmenu', 'dragstart', 'copy', 'cut'].forEach((type) => {
    document.addEventListener(type, (e) => e.preventDefault());
  });

  /* ---- закреплённая кнопка WhatsApp на телефоне ---- */
  const bar = document.querySelector('[data-bar]');
  const hero = document.querySelector('.hero');
  const close = document.querySelector('#zapis');
  if (bar && hero && close && 'IntersectionObserver' in window) {
    const s = { hero: true, close: false };
    const sync = () => { const on = !s.hero && !s.close; bar.classList.toggle('is-on', on); bar.inert = !on; };
    new IntersectionObserver(([e]) => { s.hero = e.isIntersecting; sync(); }).observe(hero);
    new IntersectionObserver(([e]) => { s.close = e.isIntersecting; sync(); }, { rootMargin: '0px 0px -20% 0px' }).observe(close);
  }
})();
