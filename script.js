(() => {
  'use strict';

  const WA = 'https://wa.me/79181703656?text=';
  const HELLO = 'Здравствуйте, Раиса Владимировна! ';
  const pad = (n) => String(n).padStart(2, '0');
  const waUrl = (text) => WA + encodeURIComponent(HELLO + text);

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

  /* ---- карты с вопросами: тема, вопрос, открытая карта Таро ---- */
  const QUESTIONS = {
    love: ['Что он на самом деле чувствует?', 'Вернётся ли любимый человек?', 'Когда я встречу своего человека?', 'Что мешает нашим отношениям?'],
    money: ['Когда станет легче с деньгами?', 'Как увеличить доход?', 'Вернут ли мне долг?', 'Стоит ли сейчас рисковать?'],
    work: ['Менять ли работу?', 'Открывать ли своё дело?', 'Где мой рост?', 'Соглашаться ли на предложение?'],
    family: ['Как сохранить семью?', 'Когда в доме будет мир?', 'Что ждёт моих детей?', 'Переезжать ли нам?'],
  };
  const ARCANA = ['Шут', 'Маг', 'Верховная жрица', 'Императрица', 'Император', 'Иерофант', 'Влюблённые', 'Колесница', 'Сила', 'Отшельник', 'Колесо фортуны', 'Справедливость', 'Повешенный', 'Смерть', 'Умеренность', 'Дьявол', 'Башня', 'Звезда', 'Луна', 'Солнце', 'Суд', 'Мир'];

  const grid = document.querySelector('[data-qcards]');
  const result = document.querySelector('[data-qresult]');
  const resultText = document.querySelector('[data-qtext]');
  const resultWa = document.querySelector('[data-qwa]');
  const tabs = Array.from(document.querySelectorAll('[data-topic]'));

  const shuffled = () => {
    const a = ARCANA.map((_, i) => i);
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const fill = (topic) => {
    if (!grid) return;
    grid.textContent = '';
    if (result) result.hidden = true;
    const deck = shuffled();
    QUESTIONS[topic].forEach((q, k) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'qcard';
      card.setAttribute('aria-label', 'Открыть карту: ' + q);
      const inner = document.createElement('span');
      inner.className = 'qcard__in';
      const face = document.createElement('span');
      face.className = 'qcard__face';
      const seal = document.createElement('span');
      seal.className = 'qcard__seal';
      seal.textContent = '♥';
      const text = document.createElement('span');
      text.className = 'qcard__q';
      text.textContent = q;
      face.append(seal, text);
      const back = document.createElement('span');
      back.className = 'qcard__back';
      inner.append(face, back);
      card.append(inner);

      card.addEventListener('click', () => {
        const i = deck[k];
        const show = () => {
          card.classList.add('is-open');
          card.setAttribute('aria-label', q + ' Карта: ' + ARCANA[i]);
          if (result && resultText && resultWa) {
            resultText.textContent = '';
            resultText.append('На вопрос «' + q.replace(/\?$/, '') + '?» вам выпала карта ');
            const b = document.createElement('b');
            b.textContent = ARCANA[i];
            resultText.append(b);
            resultWa.href = waUrl('Мой вопрос: ' + q + ' Мне выпала карта: ' + ARCANA[i] + '. Хочу узнать ответ.');
            result.hidden = false;
          }
        };
        if (back.firstChild) { show(); return; }
        const img = new Image();
        img.alt = 'Карта Таро: ' + ARCANA[i];
        img.onload = img.onerror = () => { back.append(img); requestAnimationFrame(show); };
        img.src = 'images/arcana/' + pad(i) + '.jpg';
      });
      grid.append(card);
    });
  };
  tabs.forEach((t) => t.addEventListener('click', () => {
    tabs.forEach((o) => o.setAttribute('aria-pressed', String(o === t)));
    fill(t.dataset.topic);
  }));
  if (tabs.length) fill('love');

  /* ---- «Узнаёте себя?»: отмеченное уходит в сообщение ---- */
  const pains = Array.from(document.querySelectorAll('[data-pains] button'));
  const painWa = document.querySelector('[data-pwa]');
  pains.forEach((b) => b.addEventListener('click', () => {
    b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true'));
    const picked = pains.filter((p) => p.getAttribute('aria-pressed') === 'true').map((p) => p.textContent.trim());
    if (painWa) painWa.href = waUrl(picked.length ? 'Моя ситуация: ' + picked.join('; ') + '.' : 'Хочу разобраться в своей ситуации.');
  }));

  /* ---- ролики: играют без звука, пока видны; отзывы не звучат одновременно ---- */
  const loops = Array.from(document.querySelectorAll('video[data-loop]'));
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (loops.length && 'IntersectionObserver' in window && !still) {
    const vio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const v = e.target;
        if (e.isIntersecting) { v.muted = true; const p = v.play(); if (p && p.catch) p.catch(() => {}); }
        else v.pause();
      });
    }, { threshold: 0.35 });
    loops.forEach((v) => vio.observe(v));
  } else {
    loops.forEach((v) => { v.controls = true; });
  }
  const talkies = Array.from(document.querySelectorAll('video[controls]'));
  talkies.forEach((v) => v.addEventListener('play', () => talkies.forEach((o) => { if (o !== v) o.pause(); })));

  /* ---- защита от копирования ---- */
  ['contextmenu', 'dragstart', 'copy', 'cut'].forEach((type) => {
    document.addEventListener(type, (e) => e.preventDefault());
  });

  /* ---- закреплённая кнопка WhatsApp на телефоне ---- */
  const bar = document.querySelector('[data-bar]');
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
