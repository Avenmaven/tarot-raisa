(() => {
  'use strict';

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const pad = (n) => String(n).padStart(2, '0');

  /* ---- reveal on scroll ---- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  /* ---- hero: the three cards fan out once ---- */
  const fan = document.querySelector('[data-fan]');
  if (fan) requestAnimationFrame(() => requestAnimationFrame(() => fan.classList.add('is-in')));

  /* ---- hero: the arch leans toward the pointer ---- */
  const tilt = document.querySelector('[data-tilt]');
  const heroEl = document.querySelector('.hero');
  if (tilt && heroEl && matchMedia('(hover: hover) and (pointer: fine)').matches && !reduced.matches) {
    let queued = false, px = 0, py = 0;
    heroEl.addEventListener('pointermove', (e) => {
      const r = heroEl.getBoundingClientRect();
      px = (e.clientX - r.left) / r.width - 0.5;
      py = (e.clientY - r.top) / r.height - 0.5;
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        tilt.style.transform = 'perspective(1100px) rotateY(' + (px * 10).toFixed(2) + 'deg) rotateX(' + (-py * 8).toFixed(2) + 'deg)';
      });
    });
    heroEl.addEventListener('pointerleave', () => { tilt.style.transform = ''; });
  }

  /* ---- hero: a quiet night sky ---- */
  const canvas = document.querySelector('[data-stars]');
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    const css = getComputedStyle(document.documentElement);
    const ink = css.getPropertyValue('--color-ink').trim() || 'white';
    const gold = css.getPropertyValue('--color-accent').trim() || ink;
    let stars = [];
    let w = 0, h = 0, raf = 0, visible = true, last = 0;
    let comet = null, nextComet = 2500;

    const seed = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(220, Math.round((w * h) / 6500));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() < 0.08 ? 1.5 + Math.random() * 0.7 : 0.4 + Math.random() * 0.8,
        base: 0.25 + Math.random() * 0.55,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 1.1,
        gold: Math.random() < 0.18,
      }));
    };
    const paint = (t) => {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const tw = reduced.matches ? 1 : 0.6 + 0.4 * Math.sin(s.phase + t * 0.001 * s.speed);
        ctx.globalAlpha = s.base * tw;
        ctx.fillStyle = s.gold ? gold : ink;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (reduced.matches) return;
      if (!comet && t > nextComet) {
        comet = { x: w * (0.15 + Math.random() * 0.6), y: h * Math.random() * 0.35, born: t, life: 900 + Math.random() * 500, len: 140 + Math.random() * 120 };
      }
      if (comet) {
        const k = (t - comet.born) / comet.life;
        if (k >= 1) { comet = null; nextComet = t + 4000 + Math.random() * 6000; }
        else {
          const hx = comet.x + k * w * 0.32, hy = comet.y + k * w * 0.16;
          const tx = hx - comet.len * 0.894, ty = hy - comet.len * 0.447;
          const g = ctx.createLinearGradient(hx, hy, tx, ty);
          g.addColorStop(0, gold); g.addColorStop(1, 'transparent');
          ctx.globalAlpha = Math.sin(Math.PI * k);
          ctx.strokeStyle = g; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(tx, ty); ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    };
    const loop = (t) => {
      raf = 0;
      if (!visible || reduced.matches || document.hidden) return;
      paint(t); last = t;
      raf = requestAnimationFrame(loop);
    };
    const start = () => { if (!raf && visible && !reduced.matches) raf = requestAnimationFrame(loop); };

    seed(); paint(0); start();
    let resizeTimer = 0;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { if (canvas.clientWidth !== w || canvas.clientHeight !== h) { seed(); paint(0); } }, 150);
    });
    document.addEventListener('visibilitychange', start);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; start(); }).observe(canvas);
    }
  }

  /* ---- hero: her portrait, once the file is in the folder ---- */
  const arch = document.querySelector('[data-arch] [data-slot="portrait"]');
  if (arch) {
    const me = new Image();
    me.onload = () => {
      me.alt = 'Раиса, таролог';
      me.style.objectPosition = '50% 20%';
      arch.querySelectorAll(':scope > img').forEach((o) => o.remove());
      arch.prepend(me);
    };
    me.src = 'images/portrait.jpg';
  }

  /* ---- the question a visitor brings to the cards ---- */
  const QUESTIONS = {
    love: ['Что он на самом деле чувствует?', 'Вернётся ли человек из прошлого?', 'Когда я встречу своего человека?', 'Что мешает нашим отношениям?'],
    money: ['Когда станет легче с деньгами?', 'Открывать ли своё дело?', 'Как увеличить доход?', 'Стоит ли сейчас рисковать?'],
    work: ['Менять ли работу?', 'Оставаться ли на этом месте?', 'Где мой рост?', 'Соглашаться ли на предложение?'],
    move: ['Переезжать ли в другой город?', 'Сейчас или подождать?', 'Покупать ли квартиру?', 'Что ждёт меня на новом месте?'],
  };
  let question = '';
  const askList = document.querySelector('[data-ask-list]');
  const topicBtns = Array.from(document.querySelectorAll('[data-ask-topic]'));
  const onQuestion = [];
  const fillQuestions = (topic) => {
    if (!askList) return;
    askList.textContent = '';
    QUESTIONS[topic].forEach((q) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'ask__q';
      b.textContent = q;
      b.setAttribute('aria-pressed', String(q === question));
      b.addEventListener('click', () => {
        question = q;
        askList.querySelectorAll('.ask__q').forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
        onQuestion.forEach((fn) => fn(q));
      });
      askList.append(b);
    });
  };
  topicBtns.forEach((t) => t.addEventListener('click', () => {
    topicBtns.forEach((o) => o.setAttribute('aria-pressed', String(o === t)));
    fillQuestions(t.dataset.askTopic);
  }));
  if (topicBtns.length) fillQuestions('love');

  /* ---- card of the day ---- */
  const ARCANA = [
    ['0', 'Шут', 'Начало без гарантий.', 'Что вы готовы попробовать, не зная исхода?'],
    ['I', 'Маг', 'Всё нужное уже под рукой.', 'С чего начнёте сегодня?'],
    ['II', 'Верховная жрица', 'Тишина знает больше слов.', 'К чему стоит прислушаться?'],
    ['III', 'Императрица', 'Забота, рост, изобилие.', 'О чём вы давно не заботились?'],
    ['IV', 'Император', 'Порядок и опора.', 'Где сегодня нужна твёрдость?'],
    ['V', 'Иерофант', 'Традиция и наставник.', 'Чей совет вы откладываете?'],
    ['VI', 'Влюблённые', 'Выбор сердцем.', 'Что вы выбираете на самом деле?'],
    ['VII', 'Колесница', 'Движение вперёд.', 'Куда вы направляете силы?'],
    ['VIII', 'Сила', 'Мягкость сильнее напора.', 'Где можно действовать бережнее?'],
    ['IX', 'Отшельник', 'Время побыть одному.', 'Какой ответ вы ищете внутри?'],
    ['X', 'Колесо фортуны', 'Ход событий меняется.', 'Что уже меняется само?'],
    ['XI', 'Справедливость', 'Честный счёт.', 'Что требует честного решения?'],
    ['XII', 'Повешенный', 'Пауза и другой угол зрения.', 'На что стоит взглянуть иначе?'],
    ['XIII', 'Смерть', 'Конец одного этапа.', 'Что пора завершить?'],
    ['XIV', 'Умеренность', 'Мера и равновесие.', 'Где вы торопитесь?'],
    ['XV', 'Дьявол', 'Привязанность, которая держит.', 'Что вас не отпускает?'],
    ['XVI', 'Башня', 'Резкая ясность.', 'Что держится только по привычке?'],
    ['XVII', 'Звезда', 'Надежда после бури.', 'Во что вы снова готовы верить?'],
    ['XVIII', 'Луна', 'Туман и догадки.', 'Где вы додумываете за других?'],
    ['XIX', 'Солнце', 'Ясность и радость.', 'Чему вы сегодня рады?'],
    ['XX', 'Суд', 'Зов к перемене.', 'Что пора услышать?'],
    ['XXI', 'Мир', 'Завершённый круг.', 'Что уже получилось?'],
  ];
  const KEY = 'raisa-card-of-day';

  const draw = document.querySelector('[data-draw]');
  const cells = Array.from(document.querySelectorAll('[data-arcana] li'));
  if (draw) {
    const name = draw.querySelector('[data-draw-name]');
    const line = draw.querySelector('[data-draw-line]');
    const ask = draw.querySelector('[data-draw-ask]');
    const img = draw.querySelector('[data-draw-img]');
    const card = draw.querySelector('.tcard');
    const btn = draw.querySelector('.btn[data-draw-btn]');
    const book = draw.querySelector('[data-draw-book]');
    let busy = false;

    const today = () => {
      const d = new Date();
      return [d.getFullYear(), d.getMonth() + 1, d.getDate()].join('-');
    };
    const load = () => {
      try {
        const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
        return saved && saved.day === today() && ARCANA[saved.i] ? saved.i : null;
      } catch (_) { return null; }
    };
    const save = (i) => { try { localStorage.setItem(KEY, JSON.stringify({ day: today(), i })); } catch (_) { /* private mode */ } };

    const setFace = (i) => new Promise((resolve) => {
      const src = 'images/arcana/' + pad(i) + '.jpg';
      const pre = new Image();
      pre.onload = pre.onerror = () => { img.src = src; img.alt = 'Карта Таро: ' + ARCANA[i][1]; resolve(); };
      pre.src = src;
    });
    const setText = (i) => {
      const c = ARCANA[i];
      name.textContent = c[1];
      line.textContent = c[2];
      ask.textContent = c[3];
    };
    const settle = () => {
      btn.hidden = true;
      book.hidden = false;
      card.disabled = true;
      card.setAttribute('aria-label', 'Карта дня открыта');
      draw.classList.remove('is-shuffling');
      busy = false;
    };

    const pick = () => {
      if (window.crypto && crypto.getRandomValues) {
        const buf = new Uint32Array(1);
        crypto.getRandomValues(buf);
        return buf[0] % ARCANA.length;
      }
      return Math.floor(Math.random() * ARCANA.length);
    };

    onQuestion.push((q) => {
      if (card.classList.contains('is-flipped') || busy) return;
      name.textContent = q;
      line.textContent = 'Коснитесь колоды.';
    });

    const saved = load();
    if (saved !== null) {
      // Already drawn today: show it face up, without replaying the ritual.
      const inner = card.querySelector('.tcard__in');
      inner.style.transition = 'none';
      setFace(saved).then(() => {
        card.classList.add('is-flipped');
        setText(saved);
        settle();
        requestAnimationFrame(() => requestAnimationFrame(() => { inner.style.transition = ''; }));
      });
    }

    const run = () => {
      if (busy || card.classList.contains('is-flipped')) return;
      busy = true;
      const target = pick();
      save(target);
      const ready = setFace(target);

      if (reduced.matches) {
        ready.then(() => { card.classList.add('is-flipped'); setText(target); settle(); });
        return;
      }

      // The deck is riffled, the card turns in a burst of light, sparks fly, the reading arrives.
      draw.classList.add('is-shuffling');
      card.classList.add('is-shaking');
      setTimeout(() => {
        card.classList.remove('is-shaking');
        ready.then(() => {
          card.classList.add('is-flipped');
          setTimeout(sparks, 380);
          setTimeout(() => { setText(target); settle(); }, 560);
        });
      }, 1000);
    };

    const sparks = () => {
      if (!card.animate) return;
      for (let k = 0; k < 18; k += 1) {
        const s = document.createElement('span');
        s.className = 'spark';
        s.textContent = '✦';
        s.setAttribute('aria-hidden', 'true');
        card.append(s);
        const angle = (Math.PI * 2 * k) / 18 + Math.random() * 0.4;
        const dist = 150 + Math.random() * 130;
        const x = Math.cos(angle) * dist, y = Math.sin(angle) * dist * 1.25;
        const size = 0.5 + Math.random() * 0.9;
        s.animate([
          { transform: 'translate(-50%, -50%) scale(' + size * 0.5 + ')', opacity: 0 },
          { transform: 'translate(calc(-50% + ' + x * 0.6 + 'px), calc(-50% + ' + y * 0.6 + 'px)) scale(' + size + ') rotate(90deg)', opacity: 1, offset: 0.35 },
          { transform: 'translate(calc(-50% + ' + x + 'px), calc(-50% + ' + y + 'px)) scale(' + size * 0.4 + ') rotate(220deg)', opacity: 0 },
        ], { duration: 1100 + Math.random() * 700, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'forwards' }).onfinish = () => s.remove();
      }
    };
    card.addEventListener('click', run);
    btn.addEventListener('click', run);
  }

  /* ---- booking: the row a visitor picked sets the word to send ---- */
  const code = document.querySelector('[data-code]');
  const copyBtn = document.querySelector('[data-copy]');
  const copyNote = document.querySelector('[data-copy-note]');
  let word = code ? code.textContent : '';
  onQuestion.push((q) => { word = q; if (code) code.textContent = q; if (copyNote) copyNote.textContent = ''; });

  document.querySelectorAll('[data-topic]').forEach((a) => {
    a.addEventListener('click', () => {
      const topic = a.dataset.topic;
      word = topic === 'Годовой расклад' ? '2027' : topic;
      if (code) code.textContent = word;
      if (copyNote) copyNote.textContent = '';
    });
  });

  if (copyBtn && navigator.clipboard) {
    copyBtn.hidden = false;
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(word).then(
        () => { copyNote.textContent = '«' + word + '» скопировано. Вставьте в сообщение.'; },
        () => { copyNote.textContent = 'Не получилось скопировать. Наберите слово вручную.'; }
      );
    });
  }

  /* ---- sticky booking bar: on once the hero is gone, off at the booking ---- */
  const bar = document.querySelector('[data-bookbar]');
  const hero = document.querySelector('.hero');
  const close = document.querySelector('#zapis');
  if (bar && hero && close && 'IntersectionObserver' in window) {
    const seen = { hero: true, close: false };
    const sync = () => {
      const on = !seen.hero && !seen.close;
      bar.classList.toggle('is-on', on);
      bar.inert = !on;
    };
    new IntersectionObserver(([e]) => { seen.hero = e.isIntersecting; sync(); }).observe(hero);
    new IntersectionObserver(([e]) => { seen.close = e.isIntersecting; sync(); }, { rootMargin: '0px 0px -20% 0px' }).observe(close);
  }
})();
