(() => {
  'use strict';

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const WA = 'https://wa.me/79181703656?text=';
  const HELLO = 'Здравствуйте, Раиса Владимировна! ';
  const pad = (n) => String(n).padStart(2, '0');

  /* ---- появление блоков при прокрутке ---- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  /* ---- вопрос, с которым человек приходит к картам ---- */
  const QUESTIONS = {
    love: ['Что он на самом деле чувствует?', 'Вернётся ли любимый человек?', 'Когда я встречу своего человека?', 'Что мешает нашим отношениям?'],
    money: ['Когда станет легче с деньгами?', 'Открывать ли своё дело?', 'Как увеличить доход?', 'Стоит ли сейчас рисковать?'],
    work: ['Менять ли работу?', 'Оставаться ли на этом месте?', 'Где мой рост?', 'Соглашаться ли на предложение?'],
    move: ['Переезжать ли в другой город?', 'Сейчас или подождать?', 'Покупать ли квартиру?', 'Что ждёт меня на новом месте?'],
  };
  let question = '';
  let drawn = '';
  const askList = document.querySelector('[data-ask-list]');
  const topicBtns = Array.from(document.querySelectorAll('[data-ask-topic]'));
  const waBook = document.querySelector('[data-draw-book]');

  const syncWa = () => {
    let msg = HELLO + 'Хочу разобрать свою карту.';
    if (question) msg += ' Мой вопрос: ' + question;
    if (drawn) msg += ' Мне выпала карта: ' + drawn + '.';
    if (waBook) waBook.href = WA + encodeURIComponent(msg);
  };

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
        syncWa();
      });
      askList.append(b);
    });
  };
  topicBtns.forEach((t) => t.addEventListener('click', () => {
    topicBtns.forEach((o) => o.setAttribute('aria-pressed', String(o === t)));
    fillQuestions(t.dataset.askTopic);
  }));
  if (topicBtns.length) fillQuestions('love');

  /* ---- карта дня ---- */
  const ARCANA = [
    ['Шут', 'Начало без гарантий.', 'Что вы готовы попробовать, не зная исхода?'],
    ['Маг', 'Всё нужное уже под рукой.', 'С чего начнёте сегодня?'],
    ['Верховная жрица', 'Тишина знает больше слов.', 'К чему стоит прислушаться?'],
    ['Императрица', 'Забота, рост, изобилие.', 'О чём вы давно не заботились?'],
    ['Император', 'Порядок и опора.', 'Где сегодня нужна твёрдость?'],
    ['Иерофант', 'Традиция и наставник.', 'Чей совет вы откладываете?'],
    ['Влюблённые', 'Выбор сердцем.', 'Что вы выбираете на самом деле?'],
    ['Колесница', 'Движение вперёд.', 'Куда вы направляете силы?'],
    ['Сила', 'Мягкость сильнее напора.', 'Где можно действовать бережнее?'],
    ['Отшельник', 'Время побыть одному.', 'Какой ответ вы ищете внутри?'],
    ['Колесо фортуны', 'Ход событий меняется.', 'Что уже меняется само?'],
    ['Справедливость', 'Честный счёт.', 'Что требует честного решения?'],
    ['Повешенный', 'Пауза и другой угол зрения.', 'На что стоит взглянуть иначе?'],
    ['Смерть', 'Конец одного этапа.', 'Что пора завершить?'],
    ['Умеренность', 'Мера и равновесие.', 'Где вы торопитесь?'],
    ['Дьявол', 'Привязанность, которая держит.', 'Что вас не отпускает?'],
    ['Башня', 'Резкая ясность.', 'Что держится только по привычке?'],
    ['Звезда', 'Надежда после бури.', 'Во что вы снова готовы верить?'],
    ['Луна', 'Туман и догадки.', 'Где вы додумываете за других?'],
    ['Солнце', 'Ясность и радость.', 'Чему вы сегодня рады?'],
    ['Суд', 'Зов к перемене.', 'Что пора услышать?'],
    ['Мир', 'Завершённый круг.', 'Что уже получилось?'],
  ];
  const KEY = 'raisa-card-of-day';
  const draw = document.querySelector('[data-draw]');
  if (draw) {
    const name = draw.querySelector('[data-draw-name]');
    const line = draw.querySelector('[data-draw-line]');
    const ask = draw.querySelector('[data-draw-ask]');
    const img = draw.querySelector('[data-draw-img]');
    const card = draw.querySelector('.tcard');
    let busy = false;

    const today = () => { const d = new Date(); return [d.getFullYear(), d.getMonth() + 1, d.getDate()].join('-'); };
    const load = () => {
      try {
        const s = JSON.parse(localStorage.getItem(KEY) || 'null');
        return s && s.day === today() && ARCANA[s.i] ? s.i : null;
      } catch (_) { return null; }
    };
    const save = (i) => { try { localStorage.setItem(KEY, JSON.stringify({ day: today(), i })); } catch (_) { /* private mode */ } };
    const setFace = (i) => new Promise((resolve) => {
      const src = 'images/arcana/' + pad(i) + '.jpg';
      const pre = new Image();
      pre.onload = pre.onerror = () => { img.src = src; img.alt = 'Карта Таро: ' + ARCANA[i][0]; resolve(); };
      pre.src = src;
    });
    const settle = (i) => {
      const c = ARCANA[i];
      name.textContent = c[0];
      line.textContent = c[1];
      ask.textContent = c[2];
      drawn = c[0];
      syncWa();
      if (waBook) waBook.hidden = false;
      card.disabled = true;
      card.setAttribute('aria-label', 'Карта открыта: ' + c[0]);
      draw.classList.remove('is-shuffling');
      busy = false;
    };
    const pick = () => {
      if (window.crypto && crypto.getRandomValues) { const b = new Uint32Array(1); crypto.getRandomValues(b); return b[0] % ARCANA.length; }
      return Math.floor(Math.random() * ARCANA.length);
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
        const dist = 120 + Math.random() * 110;
        const x = Math.cos(angle) * dist, y = Math.sin(angle) * dist * 1.25;
        const size = 0.5 + Math.random() * 0.9;
        s.animate([
          { transform: 'translate(-50%, -50%) scale(' + size * 0.5 + ')', opacity: 0 },
          { transform: 'translate(calc(-50% + ' + x * 0.6 + 'px), calc(-50% + ' + y * 0.6 + 'px)) scale(' + size + ') rotate(90deg)', opacity: 1, offset: 0.35 },
          { transform: 'translate(calc(-50% + ' + x + 'px), calc(-50% + ' + y + 'px)) scale(' + size * 0.4 + ') rotate(220deg)', opacity: 0 },
        ], { duration: 1100 + Math.random() * 700, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'forwards' }).onfinish = () => s.remove();
      }
    };

    const saved = load();
    if (saved !== null) {
      const inner = card.querySelector('.tcard__in');
      inner.style.transition = 'none';
      setFace(saved).then(() => {
        card.classList.add('is-flipped');
        settle(saved);
        requestAnimationFrame(() => requestAnimationFrame(() => { inner.style.transition = ''; }));
      });
    }

    card.addEventListener('click', () => {
      if (busy || card.classList.contains('is-flipped')) return;
      busy = true;
      const target = pick();
      save(target);
      const ready = setFace(target);
      if (reduced.matches) { ready.then(() => { card.classList.add('is-flipped'); settle(target); }); return; }
      draw.classList.add('is-shuffling');
      card.classList.add('is-shaking');
      setTimeout(() => {
        card.classList.remove('is-shaking');
        ready.then(() => {
          card.classList.add('is-flipped');
          setTimeout(sparks, 380);
          setTimeout(() => settle(target), 560);
        });
      }, 1000);
    });
  }

  /* ---- форма записи: имя и услуга уходят в WhatsApp ---- */
  const form = document.querySelector('[data-form]');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameVal = form.elements.name.value.trim();
      const svc = form.elements.svc.value;
      let msg = HELLO;
      if (nameVal) msg += 'Меня зовут ' + nameVal + '. ';
      msg += 'Интересует: ' + svc + '.';
      window.open(WA + encodeURIComponent(msg), '_blank', 'noopener');
    });
  }

  /* ---- защита от копирования: меню, перетаскивание, копирование ---- */
  ['contextmenu', 'dragstart', 'copy', 'cut'].forEach((type) => {
    document.addEventListener(type, (e) => {
      if (e.target && e.target.matches && e.target.matches('input, textarea')) return;
      e.preventDefault();
    });
  });

  /* ---- закреплённая кнопка WhatsApp: после первого экрана, до блока записи ---- */
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
