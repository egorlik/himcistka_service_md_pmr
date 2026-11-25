/* =========================================================
   Выездная химчистка · script.js
   Зависимости (CDN): GSAP + ScrollTrigger, Lenis
   ========================================================= */

/* ---------- ЦЕНЫ ДЛЯ КАЛЬКУЛЯТОРА: правьте здесь ----------
   icon — ключ из ICONS ниже.
   Допуслуги: pct — процент к сумме мебели, price — фиксированная сумма. */
const PRICES = [
  { id: 'sofa2',  name: 'Диван 2-местный',   price: 450, icon: 'sofa' },
  { id: 'sofa3',  name: 'Диван 3-местный',   price: 600, icon: 'sofa' },
  { id: 'corner', name: 'Угловой диван',     price: 800, icon: 'corner' },
  { id: 'chair',  name: 'Кресло',            price: 250, icon: 'armchair' },
  { id: 'stool',  name: 'Стул',              price: 80,  icon: 'chair' },
  { id: 'mat1',   name: 'Матрас 1-спальный', price: 350, icon: 'bed' },
  { id: 'mat2',   name: 'Матрас 2-спальный', price: 550, icon: 'bed' },
  { id: 'carpet', name: 'Ковёр, за м²',      price: 50,  icon: 'carpet' },
];
const EXTRAS = [
  { id: 'smell',   name: 'Удаление запахов',       desc: 'Моча животных, табак, сырость',          pct: 20,  icon: 'wind' },
  { id: 'protect', name: 'Защитная пропитка',      desc: 'Ткань хуже впитывает новые пятна',      pct: 25,  icon: 'shield' },
  { id: 'allergy', name: 'Антиаллерген',           desc: 'Обработка от пылевых клещей и бактерий', pct: 15,  icon: 'drops' },
  { id: 'ozone',   name: 'Озонирование',           desc: 'Убирает запах во всей комнате',          price: 200, icon: 'ozone' },
  { id: 'pillows', name: 'Декоративные подушки',   desc: 'До 4 штук, вместе с диваном',            price: 100, icon: 'pillow' },
  { id: 'urgent',  name: 'Срочно сегодня',         desc: 'Приедем в течение 3 часов',              pct: 15,  icon: 'bolt' },
];
const ICONS = {
  sofa: '<path d="M4 11V8a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v3"/><path d="M2 13a2 2 0 0 1 4 0v2h12v-2a2 2 0 0 1 4 0v5H2z"/><path d="M5 18v2M19 18v2"/>',
  corner: '<path d="M3 18V8a2 2 0 0 1 4 0v5h7a2 2 0 0 1 0 4H7"/><path d="M3 18h18v-5a2 2 0 0 0-4 0"/><path d="M7 8V5h12a2 2 0 0 1 2 2v6"/>',
  armchair: '<path d="M6 10V7a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v3"/><path d="M3 12a2 2 0 0 1 4 0v2h10v-2a2 2 0 0 1 4 0v5H3z"/><path d="M6 17v3M18 17v3"/>',
  chair: '<path d="M7 3h10v8H7z"/><path d="M5 11h14v3H5z"/><path d="M7 14v7M17 14v7"/>',
  bed: '<path d="M2 19V6"/><path d="M2 12h20v7"/><path d="M2 16h20"/><rect x="5" y="8" width="5" height="4" rx="1"/>',
  carpet: '<rect x="5" y="2" width="14" height="18" rx="2"/><path d="M9 6h6M9 16h6M12 8.5l2.5 2.5-2.5 2.5-2.5-2.5z"/><path d="M7 20v2M10 20v2M14 20v2M17 20v2"/>',
  wind: '<path d="M3 8h11a3 3 0 1 0-3-3"/><path d="M3 12h16a3 3 0 1 1-3 3"/><path d="M3 16h7"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  drops: '<path d="M8 3s4 4.5 4 7.5a4 4 0 0 1-8 0C4 7.5 8 3 8 3z"/><path d="M17 10s3 3.4 3 5.6a3 3 0 0 1-6 0c0-2.2 3-5.6 3-5.6z"/>',
  ozone: '<circle cx="8" cy="9" r="4"/><circle cx="16" cy="9" r="3"/><circle cx="12" cy="17" r="3.5"/>',
  pillow: '<path d="M5 5c3 1 11 1 14 0-1 3-1 11 0 14-3-1-11-1-14 0 1-3 1-11 0-14z"/>',
  bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
};
const icon = (k, s = 24) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[k] || ''}</svg>`;
const MIN_ORDER = 300;
const CURRENCY = 'руб';

(() => {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine   = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const G      = typeof gsap !== 'undefined';
  const ST     = G && typeof ScrollTrigger !== 'undefined';
  if (ST) gsap.registerPlugin(ScrollTrigger);
  const fmt = n => Math.round(n).toLocaleString('ru-RU');

  /* ---------- Разбивка текста на буквы / слова ---------- */
  function split(el, mode) {
    const out = [];
    const nodes = [...el.childNodes];
    el.textContent = '';
    nodes.forEach(n => {
      if (n.nodeType !== 3) { el.appendChild(n); return; }
      n.textContent.split(/( +|\n+)/).forEach(part => {
        if (!part) return;
        if (/^[ \n]+$/.test(part)) { el.appendChild(document.createTextNode(' ')); return; }
        const w = document.createElement('span');
        w.className = 'w';
        if (mode === 'chars') {
          [...part].forEach(ch => {
            const c = document.createElement('span');
            c.className = 'char';
            c.textContent = ch;
            w.appendChild(c); out.push(c);
          });
        } else {
          const i = document.createElement('span');
          i.className = 'w__in';
          i.textContent = part;
          w.appendChild(i); out.push(i);
        }
        el.appendChild(w);
      });
    });
    return out;
  }

  const heroChars = [];
  $$('.hero__title .split').forEach(el => heroChars.push(...split(el, 'chars')));
  const footerChars = split($('#footerBig'), 'chars');

  /* ---------- Плавный скролл Lenis ---------- */
  let lenis = null;
  if (!reduce && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.14, wheelMultiplier: 1, smoothWheel: true });
    if (ST) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
    lenis.stop();
  }
  const scrollToEl = (el, immediate) => {
    if (lenis) lenis.scrollTo(el, { immediate, force: true });
    else el.scrollIntoView({ behavior: immediate ? 'auto' : 'smooth' });
  };

  const header = $('#header');
  if (!G || reduce) header.classList.remove('is-pre');

  /* ---------- Прелоадер ---------- */
  function preloader(done) {
    const pre = $('#preloader');
    if (!G || reduce) { pre.remove(); done(); return; }
    const word = $('.preloader__word', pre);
    const count = $('#loadCount');
    const bubbles = [];
    for (let i = 0; i < 16; i++) {
      const b = document.createElement('span');
      const s = gsap.utils.random(14, 80);
      b.className = 'pl-bubble';
      b.style.cssText = `width:${s}px;height:${s}px;left:${gsap.utils.random(0, 100)}%`;
      pre.appendChild(b); bubbles.push(b);
      gsap.to(b, { y: -(innerHeight + 160), x: gsap.utils.random(-80, 80), duration: gsap.utils.random(2, 3.8), delay: gsap.utils.random(0, 1.2), ease: 'none', repeat: -1 });
    }
    const o = { p: 0 };
    gsap.timeline()
      .to(o, {
        p: 100, duration: 1.1, ease: 'power2.inOut',
        onUpdate() { count.textContent = Math.round(o.p); word.style.setProperty('--p', o.p + '%'); }
      })
      .to(word, { scale: 1.06, duration: .2, ease: 'power2.out' })
      .to(pre, { clipPath: 'inset(0 0 100% 0)', duration: .75, ease: 'expo.inOut' })
      .add(done, '-=.45')
      .add(() => { gsap.killTweensOf(bubbles); pre.remove(); });
  }

  /* ---------- Интро hero ---------- */
  function heroIntro() {
    document.body.classList.remove('is-loading');
    header.classList.remove('is-pre');
    if (lenis) lenis.start();
    if (!G || reduce) return;
    gsap.timeline({ defaults: { ease: 'expo.out' } })
      .from(heroChars, { yPercent: 120, rotate: 8, duration: 1, stagger: .02 })
      .from('.hero__tag, .hero__text, .hero__actions .btn, .brand-note', { y: 24, opacity: 0, duration: .8, stagger: .05 }, '-=.8')
      .from('.hero__badge', { scale: 0, rotate: -160, duration: 1 }, '-=.9')
      .from('.hero__scroll, .hero__hint', { opacity: 0, duration: .6 }, '-=.6');
  }

  /* ---------- Мыльные пузыри (canvas) ---------- */
  function bubblesCanvas() {
    const hero = $('.hero');
    const cv = $('#bubbles');
    const ctx = cv.getContext('2d');
    let w = 0, h = 0, list = [], parts = [], visible = true;
    const mouse = { x: -9999, y: -9999 };

    const make = initial => {
      const r = 8 + Math.pow(Math.random(), 2) * 64;
      return {
        x: Math.random() * w, y: initial ? Math.random() * h : h + r + Math.random() * 120, r,
        vy: -(0.3 + Math.random() * .7) * (1.25 - r / 90), vx: 0,
        ph: Math.random() * 6.28, hue: Math.random() * 360, s: sprites[Math.floor(Math.random() * sprites.length)]
      };
    };
    const DPR = Math.min(devicePixelRatio || 1, 1.5);
    const sprites = [195, 205, 215].map(hue => {
      const S = 160, c = document.createElement('canvas'), x = c.getContext('2d'), R = S / 2 - 2;
      c.width = c.height = S;
      const g = x.createRadialGradient(S / 2 - R * .35, S / 2 - R * .35, R * .05, S / 2, S / 2, R);
      g.addColorStop(0, 'rgba(255,255,255,.32)');
      g.addColorStop(.55, 'rgba(120,190,255,.04)');
      g.addColorStop(.86, `hsla(${hue},95%,62%,.16)`);
      g.addColorStop(1, `hsla(${hue + 15},100%,72%,.6)`);
      x.beginPath(); x.arc(S / 2, S / 2, R, 0, Math.PI * 2); x.fillStyle = g; x.fill();
      x.lineWidth = 1.5; x.strokeStyle = 'hsla(205,100%,80%,.45)'; x.stroke();
      x.beginPath(); x.ellipse(S / 2 - R * .4, S / 2 - R * .45, R * .22, R * .1, -.7, 0, Math.PI * 2);
      x.fillStyle = 'rgba(255,255,255,.75)'; x.fill();
      return c;
    });
    const resize = () => {
      const dpr = DPR;
      w = hero.clientWidth; h = hero.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const N = w < 700 ? 16 : 34;
    for (let i = 0; i < N; i++) list.push(make(true));
    new ResizeObserver(resize).observe(hero);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(hero);

    hero.addEventListener('pointermove', e => {
      const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    hero.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });
    hero.addEventListener('click', e => {
      if (e.target.closest('a, button')) return;
      const r = cv.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      let popped = false;
      list.forEach((b, i) => {
        if (Math.hypot(b.x - x, b.y - y) < b.r + 8) { pop(b); list[i] = make(false); popped = true; }
      });
      if (!popped) { const nb = make(false); nb.x = x; nb.y = y; nb.r = 30 + Math.random() * 30; list.push(nb); }
    });

    function pop(b) {
      for (let k = 0; k < 16; k++) {
        const a = Math.PI * 2 * k / 16, s = 1 + Math.random() * 3;
        parts.push({ x: b.x + Math.cos(a) * b.r, y: b.y + Math.sin(a) * b.r, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1 });
      }
    }
    function draw(b) {
      ctx.drawImage(b.s, b.x - b.r, b.y - b.r, b.r * 2, b.r * 2);
    }
    function frame(now) {
      const t = now / 1000;
      ctx.clearRect(0, 0, w, h);
      list.forEach((b, i) => {
        b.ph += .02;
        b.x += b.vx + Math.sin(b.ph) * .35;
        b.y += b.vy;
        b.vx *= .93;
        const dx = b.x - mouse.x, dy = b.y - mouse.y, d = Math.hypot(dx, dy), R = 150;
        if (d < R && d > .1) { const f = (1 - d / R) * 1.8; b.vx += dx / d * f; b.y += dy / d * f; }
        if (b.y < -b.r - 30 || b.x < -150 || b.x > w + 150) list[i] = make(false);
        draw(b);
      });
      if (list.length > 70) list.splice(0, list.length - 70);
      parts = parts.filter(p => p.life > 0);
      parts.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += .06; p.life -= .03;
        ctx.beginPath(); ctx.arc(p.x, p.y, 2.2 * p.life + .4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,229,0,${Math.max(p.life, 0)})`; ctx.fill();
      });
    }
    if (reduce) { frame(0); return; }
    const loop = now => { requestAnimationFrame(loop); if (visible) frame(now); };
    requestAnimationFrame(loop);
  }

  /* ---------- Курсор ---------- */
  function cursor() {
    const c = $('#cursor'), d = $('#cursorDot'), txt = $('#cursorText');
    if (!fine || reduce || !G) { c.remove(); d.remove(); return; }
    const xTo = gsap.quickTo(c, 'x', { duration: .55, ease: 'power3' });
    const yTo = gsap.quickTo(c, 'y', { duration: .55, ease: 'power3' });
    const dx = gsap.quickTo(d, 'x', { duration: .08 });
    const dy = gsap.quickTo(d, 'y', { duration: .08 });
    addEventListener('pointermove', e => { xTo(e.clientX); yTo(e.clientY); dx(e.clientX); dy(e.clientY); });
    document.addEventListener('pointerover', e => {
      const ba = e.target.closest('.ba');
      const link = e.target.closest('a, button, label, input, textarea');
      c.classList.toggle('is-text', !!ba);
      c.classList.toggle('is-hover', !ba && !!link);
      txt.textContent = ba ? 'тяни' : '';
    });
  }

  /* ---------- Магнитные кнопки ---------- */
  function magnetic() {
    if (!fine || reduce || !G) return;
    $$('.magnetic').forEach(btn => {
      const inner = $('span', btn);
      const bx = gsap.quickTo(btn, 'x', { duration: .7, ease: 'elastic.out(1,.35)' });
      const by = gsap.quickTo(btn, 'y', { duration: .7, ease: 'elastic.out(1,.35)' });
      const ix = gsap.quickTo(inner, 'x', { duration: .7, ease: 'elastic.out(1,.35)' });
      const iy = gsap.quickTo(inner, 'y', { duration: .7, ease: 'elastic.out(1,.35)' });
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        bx(x * .3); by(y * .4); ix(x * .12); iy(y * .15);
      });
      btn.addEventListener('pointerleave', () => { bx(0); by(0); ix(0); iy(0); });
    });
  }

  /* ---------- Шапка + меню ---------- */
  const burger = $('#burger');
  let lastY = 0;
  function onScroll(y) {
    header.classList.toggle('is-scrolled', y > innerHeight * .85);
    const down = y > lastY && y > 300 && !document.body.classList.contains('menu-open');
    if (Math.abs(y - lastY) > 4) header.classList.toggle('is-hidden', down);
    lastY = y;
  }
  if (lenis) lenis.on('scroll', ({ scroll }) => onScroll(scroll));
  else addEventListener('scroll', () => onScroll(scrollY), { passive: true });

  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    if (lenis) open ? lenis.stop() : lenis.start();
    if (open && G && !reduce) gsap.from('.nav a', { y: 60, opacity: 0, duration: .9, stagger: .06, delay: .2, ease: 'expo.out' });
  }
  burger.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));

  /* ---------- Переход-шторка по ссылкам ---------- */
  let busy = false;
  const bands = $$('#wipe > span');
  const wipeLabel = $('#wipeLabel');
  $$('[data-link]').forEach(a => a.addEventListener('click', e => {
    const target = $(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const wasOpen = document.body.classList.contains('menu-open');
    if (wasOpen) setMenu(false);
    if (!G || reduce) { scrollToEl(target, false); return; }
    if (busy) return;
    busy = true;
    wipeLabel.textContent = target.dataset.title || '';
    gsap.timeline({ onComplete: () => { busy = false; } })
      .set(bands, { transformOrigin: 'bottom' })
      .to(bands, { scaleY: 1, duration: .6, ease: 'expo.in', stagger: .07 })
      .fromTo(wipeLabel, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: .4, ease: 'expo.out' }, '-=.2')
      .add(() => { scrollToEl(target, true); header.classList.remove('is-hidden'); })
      .to(wipeLabel, { opacity: 0, y: -40, duration: .35, ease: 'expo.in' }, '+=.15')
      .set(bands, { transformOrigin: 'top' })
      .to(bands, { scaleY: 0, duration: .75, ease: 'expo.out', stagger: .07 });
  }));

  /* ---------- Диван SVG для «до / после» ---------- */
  function sofaSVG(clean) {
    const c = clean
      ? { main: '#2F86E0', dark: '#1D5FAE', light: '#5AAAF5', pillow: '#FFE500', pillow2: '#FFFFFF', leg: '#1B1B1D', wall: '#FFFFFF' }
      : { main: '#8E896B', dark: '#6A6650', light: '#A29D80', pillow: '#9C9867', pillow2: '#94705E', leg: '#3A2E22', wall: '#CFC7B2' };
    const id = clean ? 'c' : 'd';
    const sparks = clean ? [[300, 300], [1270, 330], [820, 210], [560, 560], [1100, 520], [1460, 520]].map(([x, y], i) =>
      `<path class="spark" transform="translate(${x} ${y}) scale(${i % 2 ? 1.3 : .9})" d="M0,-22 C2,-5 5,-2 22,0 C5,2 2,5 0,22 C-2,5 -5,2 -22,0 C-5,-2 -2,-5 0,-22Z" fill="#fff"/>`).join('') : '';
    const dirt = clean ? '' : `
      <g>
        <ellipse cx="800" cy="572" rx="95" ry="32" fill="url(#brown-${id})"/>
        <ellipse cx="1090" cy="400" rx="70" ry="64" fill="url(#wine-${id})"/>
        <ellipse cx="1055" cy="435" rx="36" ry="30" fill="url(#wine-${id})"/>
        <ellipse cx="300" cy="470" rx="75" ry="40" fill="url(#grime-${id})"/>
        <ellipse cx="1300" cy="470" rx="75" ry="40" fill="url(#grime-${id})"/>
        <ellipse cx="500" cy="380" rx="110" ry="88" fill="url(#dust-${id})"/>
      </g>
      <ellipse cx="800" cy="572" rx="58" ry="16" fill="none" stroke="#3B2915" stroke-width="4" opacity=".45"/>
      <path d="M690 330 q20 -30 40 0 t40 0 t40 0 M700 370 q25 -25 50 5 t50 -5" fill="none" stroke="#3446B0" stroke-width="7" stroke-linecap="round" opacity=".55"/>
      <g fill="#3A2C1C" opacity=".5">
        ${[[1050, 585], [1090, 560], [1130, 590]].map(([x, y]) => `<g transform="translate(${x} ${y})"><ellipse rx="13" ry="11"/><circle cx="-12" cy="-15" r="5"/><circle cx="0" cy="-19" r="5"/><circle cx="12" cy="-15" r="5"/></g>`).join('')}
      </g>
      <g fill="#4A3B28" opacity=".6">
        ${Array.from({ length: 26 }, (_, i) => `<circle cx="${380 + (i * 137) % 860}" cy="${560 + (i * 53) % 60}" r="${2 + (i % 3)}"/>`).join('')}
      </g>
      <g stroke="#5D5A4A" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7">
        <path class="stink" d="M640 230 q-20 -30 0 -60 t0 -60"/>
        <path class="stink" d="M800 210 q20 -30 0 -60 t0 -60"/>
        <path class="stink" d="M960 230 q-20 -30 0 -60 t0 -60"/>
      </g>
      <rect width="1600" height="900" fill="#6B5A3A" opacity=".1"/>`;


    const machine = clean ? `
      <g transform="translate(1400 520)">
        <ellipse cx="80" cy="222" rx="95" ry="14" fill="#000" opacity=".15"/>
        <path d="M10 40 C -70 -10, -60 70, -130 80" fill="none" stroke="#0B0B0C" stroke-width="12" stroke-linecap="round"/>
        <rect x="10" y="60" width="140" height="150" rx="34" fill="#FFE500"/>
        <rect x="10" y="60" width="140" height="40" rx="20" fill="#FFF27A" opacity=".7"/>
        <rect x="25" y="20" width="110" height="50" rx="20" fill="#0B0B0C"/>
        <rect x="60" y="0" width="40" height="30" rx="10" fill="none" stroke="#0B0B0C" stroke-width="10"/>
        <rect x="30" y="130" width="100" height="44" rx="12" fill="#0B0B0C" opacity=".9"/>
        <circle cx="45" cy="212" r="16" fill="#0B0B0C"/><circle cx="115" cy="212" r="16" fill="#0B0B0C"/>
      </g>` : '';
    return `
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <defs>
        ${[['brown', '#4A3520', .6], ['wine', '#5B1F2A', .55], ['grime', '#3D3222', .55], ['dust', '#5C5440', .4]].map(([n, c, o]) =>
          `<radialGradient id="${n}-${id}"><stop offset="0" stop-color="${c}" stop-opacity="${o}"/><stop offset=".6" stop-color="${c}" stop-opacity="${o * .6}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`).join('')}
        <linearGradient id="seat-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.light}"/><stop offset="1" stop-color="${c.main}"/></linearGradient>
        <linearGradient id="back-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.light}"/><stop offset=".6" stop-color="${c.main}"/></linearGradient>
      </defs>
      <!-- картина на стене -->
      <g transform="${clean ? '' : 'rotate(5 800 150)'}">
        <rect x="690" y="70" width="220" height="150" rx="8" fill="${c.wall}" stroke="${clean ? '#0B0B0C' : '#7d745e'}" stroke-width="6"/>
        <circle cx="770" cy="145" r="34" fill="${clean ? '#FFE500' : '#a7a17a'}"/>
        <path d="M720 205 L800 150 L880 205Z" fill="${clean ? '#2F86E0' : '#8b866a'}"/>
      </g>
      <!-- растение -->
      <g transform="translate(130 520)">
        <path d="M0 0 C-60 -80 -40 -170 0 -210 C40 -170 60 -80 0 0Z" fill="${clean ? '#2F9E62' : '#7b7552'}"/>
        <path d="M0 -10 C-90 -40 -110 -120 -90 -150 C-40 -120 -10 -70 0 -10Z" fill="${clean ? '#3DBA75' : '#8a845f'}"/>
        <path d="M0 -10 C90 -40 110 -120 90 -150 C40 -120 10 -70 0 -10Z" fill="${clean ? '#27894F' : '#6f6a4b'}"/>
        <path d="M-60 0 h120 l-18 130 h-84z" fill="${clean ? '#FFE500' : '#8f6f5b'}"/>
      </g>
      <!-- тень -->
      <ellipse cx="800" cy="742" rx="600" ry="36" fill="#000" opacity=".16"/>
      <!-- ножки -->
      <rect x="300" y="690" width="30" height="56" rx="8" fill="${c.leg}"/>
      <rect x="1270" y="690" width="30" height="56" rx="8" fill="${c.leg}"/>
      <!-- каркас спинки -->
      <rect x="320" y="250" width="960" height="340" rx="70" fill="${c.dark}"/>
      <!-- подушки спинки -->
      <rect x="352" y="278" width="292" height="270" rx="58" fill="url(#back-${id})"/>
      <rect x="654" y="278" width="292" height="270" rx="58" fill="url(#back-${id})"/>
      <rect x="956" y="278" width="292" height="270" rx="58" fill="url(#back-${id})"/>
      <!-- основание -->
      <rect x="250" y="560" width="1100" height="150" rx="44" fill="${c.dark}"/>
      <!-- сиденья -->
      <rect x="340" y="518" width="302" height="108" rx="36" fill="url(#seat-${id})"/>
      <rect x="649" y="518" width="302" height="108" rx="36" fill="url(#seat-${id})"/>
      <rect x="958" y="518" width="302" height="108" rx="36" fill="url(#seat-${id})"/>
      <!-- подлокотники -->
      <rect x="205" y="420" width="175" height="290" rx="72" fill="${c.main}"/>
      <rect x="1220" y="420" width="175" height="290" rx="72" fill="${c.main}"/>
      <rect x="225" y="432" width="135" height="40" rx="20" fill="${c.light}" opacity=".7"/>
      <rect x="1240" y="432" width="135" height="40" rx="20" fill="${c.light}" opacity=".7"/>
      <!-- декоративные подушки -->
      <rect x="395" y="398" width="185" height="160" rx="44" fill="${c.pillow}" transform="rotate(-12 487 478)"/>
      <rect x="1030" y="410" width="170" height="148" rx="44" fill="${c.pillow2}" transform="rotate(10 1115 484)"/>
      ${machine}
      ${dirt}
      ${sparks}
    </svg>`;
  }

  function beforeAfter() {
    const ba = $('#ba');
    $('#baAfter').innerHTML = sofaSVG(true);
    $('#baBefore').innerHTML = sofaSVG(false);
    let pos = 50, dragging = false, intro = null;
    const set = p => {
      pos = Math.max(0, Math.min(100, p));
      ba.style.setProperty('--pos', pos + '%');
      ba.setAttribute('aria-valuenow', Math.round(pos));
    };
    const fromEvent = e => { const r = ba.getBoundingClientRect(); set((e.clientX - r.left) / r.width * 100); };
    const stopIntro = () => { if (intro) { intro.kill(); intro = null; } };
    ba.addEventListener('pointerdown', e => { dragging = true; stopIntro(); ba.setPointerCapture(e.pointerId); fromEvent(e); });
    ba.addEventListener('pointermove', e => { if (dragging || e.pointerType === 'mouse') { if (!dragging && intro) return; fromEvent(e); } });
    ba.addEventListener('pointerup', () => { dragging = false; });
    ba.addEventListener('pointercancel', () => { dragging = false; });
    ba.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { stopIntro(); set(pos - 5); e.preventDefault(); }
      if (e.key === 'ArrowRight') { stopIntro(); set(pos + 5); e.preventDefault(); }
    });
    if (ST && !reduce) {
      const o = { p: 50 };
      ScrollTrigger.create({
        trigger: ba, start: 'top 70%', once: true,
        onEnter: () => {
          intro = gsap.timeline({ onUpdate: () => set(o.p), onComplete: () => { intro = null; } })
            .to(o, { p: 92, duration: 1, ease: 'power3.inOut' })
            .to(o, { p: 8, duration: 1.4, ease: 'power3.inOut' })
            .to(o, { p: 50, duration: 1, ease: 'power3.inOut' });
        }
      });
    }
  }

  /* ---------- Калькулятор ---------- */
  function calculator() {
    const itemsBox = $('#calcItems');
    const extrasBox = $('#calcExtras');
    const sumEl = $('#totalSum');
    const listEl = $('#totalList');
    const minEl = $('#totalMin');
    const countEl = $('#totalCount');
    const qty = {};
    PRICES.forEach(p => { qty[p.id] = 0; });
    const plural = n => n % 10 === 1 && n % 100 !== 11 ? 'предмет' : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 'предмета' : 'предметов');
    const extraLabel = x => x.pct ? `+${x.pct}%` : `+${fmt(x.price)} ${CURRENCY}`;

    itemsBox.innerHTML = PRICES.map(p => `
      <div class="item" data-id="${p.id}">
        <div class="item__icon">${icon(p.icon, 26)}</div>
        <div><div class="item__name">${p.name}</div><div class="item__price">${fmt(p.price)} ${CURRENCY}</div></div>
        <div class="qty">
          <button type="button" data-d="-1" aria-label="Убрать: ${p.name}">−</button>
          <output>0</output>
          <button type="button" data-d="1" aria-label="Добавить: ${p.name}">+</button>
        </div>
      </div>`).join('');
    extrasBox.innerHTML = EXTRAS.map(x => `
      <label class="extra">
        <input type="checkbox" value="${x.id}">
        <div class="extra__box">
          <span class="extra__icon">${icon(x.icon, 22)}<span class="ok">✓</span></span>
          <span class="extra__name">${x.name}</span>
          <span class="extra__desc">${x.desc}</span>
          <span class="extra__plus">${extraLabel(x)}</span>
        </div>
      </label>`).join('');

    let shown = 0;
    function render() {
      let base = 0, count = 0;
      const lines = [];
      PRICES.forEach(p => {
        if (!qty[p.id]) return;
        base += p.price * qty[p.id];
        count += qty[p.id];
        lines.push(`<li><span>${p.name} × ${qty[p.id]}</span><span>${fmt(p.price * qty[p.id])}</span></li>`);
      });
      let total = base;
      $$('input', extrasBox).forEach(inp => {
        if (!inp.checked || !base) return;
        const x = EXTRAS.find(e => e.id === inp.value);
        const add = x.pct ? base * x.pct / 100 : x.price;
        total += add;
        lines.push(`<li class="is-extra"><span>+ ${x.name}</span><span>${fmt(add)}</span></li>`);
      });
      if (base && total < MIN_ORDER) total = MIN_ORDER;
      const anyExtra = $$('input:checked', extrasBox).length;
      listEl.innerHTML = lines.length ? lines.join('') : `<li class="is-empty">${anyExtra ? 'Допуслуги считаются вместе с мебелью, выберите её слева' : 'Выберите мебель слева'}</li>`;
      minEl.textContent = base && base < MIN_ORDER ? `Применён минимальный заказ: ${MIN_ORDER} ${CURRENCY}` : `Минимальный заказ: ${MIN_ORDER} ${CURRENCY}`;
      countEl.textContent = `${count} ${plural(count)}`;

      if (G && !reduce) {
        const o = { v: shown };
        gsap.to(o, { v: total, duration: .8, ease: 'power3.out', overwrite: true, onUpdate: () => { sumEl.textContent = fmt(o.v); } });
        gsap.fromTo('.total__sum', { scale: 1.1 }, { scale: 1, duration: .7, ease: 'elastic.out(1,.4)' });
      } else sumEl.textContent = fmt(total);
      shown = total;

      $('#calcBarSum').textContent = fmt(total);
      $('#calcBar').classList.toggle('has-sum', total > 0);
      $('#orderBtn span').textContent = total ? `Заказать за ${fmt(total)} ${CURRENCY}` : 'Оформить заявку';
    }

    itemsBox.addEventListener('click', e => {
      const b = e.target.closest('button[data-d]');
      if (!b) return;
      const item = b.closest('.item');
      const id = item.dataset.id;
      const was = qty[id];
      qty[id] = Math.max(0, Math.min(99, qty[id] + +b.dataset.d));
      $('output', item).textContent = qty[id];
      item.classList.toggle('is-active', qty[id] > 0);
      if (G && !reduce) {
        gsap.fromTo($('output', item), { y: +b.dataset.d > 0 ? -12 : 12, opacity: 0 }, { y: 0, opacity: 1, duration: .35, ease: 'back.out(3)' });
        if (!was && qty[id]) gsap.fromTo($('.item__icon', item), { scale: .6, rotate: -20 }, { scale: 1, rotate: 0, duration: .7, ease: 'elastic.out(1,.4)' });
      }
      render();
    });
    extrasBox.addEventListener('change', e => {
      if (G && !reduce && e.target.checked) gsap.fromTo(e.target.nextElementSibling, { scale: .94 }, { scale: 1, duration: .6, ease: 'elastic.out(1,.4)' });
      render();
    });

    // плавающая плашка на телефоне: видна внутри калькулятора, пока итог не на экране
    const bar = $('#calcBar'), totalBox = $('.total');
    let inCalc = false, totalVisible = false;
    const upd = () => bar.classList.toggle('is-visible', inCalc && !totalVisible && bar.classList.contains('has-sum'));
    new IntersectionObserver(([e]) => { inCalc = e.isIntersecting; upd(); }, { threshold: 0 }).observe($('#calcItems').parentElement);
    new IntersectionObserver(([e]) => { totalVisible = e.isIntersecting; upd(); }, { threshold: .3 }).observe(totalBox);
    itemsBox.addEventListener('click', upd);

    // перенос расчёта в форму заявки
    const fillForm = () => {
      const parts = PRICES.filter(p => qty[p.id]).map(p => `${p.name} × ${qty[p.id]}`);
      const ex = $$('input:checked', extrasBox).map(i => EXTRAS.find(e => e.id === i.value).name);
      if (!parts.length) return;
      $('#fMsg').value = parts.join(', ') + (ex.length ? `; доп.: ${ex.join(', ')}` : '') + `. Расчёт: ${sumEl.textContent} ${CURRENCY}`;
    };
    $('#orderBtn').addEventListener('click', fillForm);
    bar.addEventListener('click', fillForm);
    render();
  }

  /* ---------- FAQ ---------- */
  function faq() {
    $$('.faq__item').forEach(item => {
      const q = $('.faq__q', item), a = $('.faq__a', item);
      q.addEventListener('click', () => {
        const open = !item.classList.contains('is-open');
        $$('.faq__item.is-open').forEach(o => {
          if (o === item) return;
          o.classList.remove('is-open');
          $('.faq__q', o).setAttribute('aria-expanded', 'false');
          const oa = $('.faq__a', o);
          G ? gsap.to(oa, { height: 0, duration: .5, ease: 'expo.inOut' }) : (oa.style.height = '0');
        });
        item.classList.toggle('is-open', open);
        q.setAttribute('aria-expanded', open);
        if (G) gsap.to(a, { height: open ? 'auto' : 0, duration: .65, ease: 'expo.inOut', onComplete: () => ST && ScrollTrigger.refresh() });
        else a.style.height = open ? 'auto' : '0';
      });
    });
  }

  /* ---------- Форма ---------- */
  function form() {
    const f = $('#form');
    const phone = $('#fPhone');
    phone.addEventListener('input', () => {
      phone.value = phone.value.replace(/[^\d+\s()-]/g, '');
      phone.closest('.field').classList.remove('is-error');
    });
    f.addEventListener('submit', e => {
      e.preventDefault();
      if (phone.value.replace(/\D/g, '').length < 6) {
        const fld = phone.closest('.field');
        fld.classList.add('is-error');
        if (G) gsap.fromTo(fld, { x: -10 }, { x: 0, duration: .6, ease: 'elastic.out(1,.3)' });
        phone.focus();
        return;
      }
      /* TODO: отправка заявки — Telegram-бот, почта или CRM.
         Пример: fetch('/send.php', { method: 'POST', body: new FormData(f) }) */
      const ok = $('#formSuccess');
      if (!G || reduce) { ok.style.opacity = 1; ok.style.visibility = 'visible'; return; }
      gsap.timeline()
        .to(ok, { autoAlpha: 1, duration: .5 })
        .from('.form__success-icon', { scale: 0, rotate: -120, duration: 1, ease: 'elastic.out(1,.45)' }, '-=.2')
        .from('.form__success h3, .form__success p', { y: 20, opacity: 0, stagger: .08, duration: .6, ease: 'expo.out' }, '-=.7');
      const r = f.getBoundingClientRect();
      for (let i = 0; i < 26; i++) {
        const b = document.createElement('span');
        b.className = 'burst';
        b.style.left = r.width / 2 + 'px'; b.style.top = r.height / 2 + 'px';
        f.appendChild(b);
        const a = Math.random() * Math.PI * 2, dist = 120 + Math.random() * 220, s = .5 + Math.random() * 2.5;
        gsap.to(b, { x: Math.cos(a) * dist, y: Math.sin(a) * dist, scale: s, opacity: 0, duration: 1.4 + Math.random(), ease: 'power3.out', onComplete: () => b.remove() });
      }
    });
  }

  /* ---------- Анимации при скролле ---------- */
  function scrollAnimations() {
    if (!ST || reduce) return;

    // параллакс hero
    gsap.to('.hero__inner', { yPercent: -18, opacity: .15, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__badge', { yPercent: 120, rotate: 90, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    // заголовки по словам
    $$('[data-split]').forEach(el => {
      const words = split(el, 'words');
      gsap.from(words, { yPercent: 115, rotate: 5, duration: 1.2, ease: 'expo.out', stagger: .07, scrollTrigger: { trigger: el, start: 'top 85%' } });
    });

    // обычные появления
    $$('.reveal').forEach(el => {
      gsap.from(el, { y: 60, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
    });

    // карточки услуг
    gsap.set('.card', { y: 90, opacity: 0, transformPerspective: 900 });
    ScrollTrigger.batch('.card', {
      start: 'top 92%', once: true,
      onEnter: b => gsap.to(b, { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: .1, overwrite: 'auto' })
    });

    // счётчики
    $$('[data-count]').forEach(el => {
      const end = +el.dataset.count, o = { v: 0 };
      el.textContent = '0';
      gsap.to(o, { v: end, duration: 2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%' }, onUpdate: () => { el.textContent = Math.round(o.v); } });
    });

    // бегущая строка реагирует на скорость скролла
    const mq = gsap.to('.marquee__track', { xPercent: -50, duration: 24, ease: 'none', repeat: -1 });
    mq.totalTime(24 * 200);
    let dir = 1, target = 1, cur = 1;
    ScrollTrigger.create({
      onUpdate(self) {
        dir = self.direction;
        target = dir * (1 + Math.min(Math.abs(self.getVelocity()) / 350, 5));
      }
    });
    gsap.ticker.add(() => {
      target += (dir - target) * .04;
      cur += (target - cur) * .12;
      mq.timeScale(cur);
    });

    // горизонтальный скролл «4 шага»
    const mm = gsap.matchMedia();
    mm.add('(min-width: 861px) and (min-height: 620px)', () => {
      document.documentElement.classList.add('js-hscroll');
      const track = $('.process__track');
      const steps = $$('.step');
      const dist = () => Math.max(0, track.scrollWidth - innerWidth);
      const tw = gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: {
          trigger: '.process', start: 'top top', end: () => '+=' + dist(),
          pin: true, scrub: 1, invalidateOnRefresh: true,
          onUpdate: s => {
            gsap.set('.process__progress span', { scaleX: s.progress });
            const n = Math.min(steps.length - 1, Math.floor(s.progress * steps.length * .999 + .25));
            steps.forEach((el, i) => el.classList.toggle('is-active', i === n));
          }
        }
      });
      $$('.step').forEach(s => {
        gsap.from($('.step__num', s), {
          yPercent: 70, opacity: 0, ease: 'none',
          scrollTrigger: { trigger: s, containerAnimation: tw, start: 'left 100%', end: 'left 55%', scrub: true }
        });
      });
      ScrollTrigger.refresh();
      return () => document.documentElement.classList.remove('js-hscroll');
    });
    mm.add('(max-width: 860px), (max-height: 619px)', () => {
      $$('.step').forEach(s => ScrollTrigger.create({
        trigger: s, start: 'top 60%', end: 'bottom 40%',
        onToggle: self => s.classList.toggle('is-active', self.isActive)
      }));
    });

    // футер: буквы подпрыгивают
    gsap.from(footerChars, { yPercent: 100, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: .08, scrollTrigger: { trigger: '.footer', start: 'top 85%' } });
    footerChars.forEach(c => c.addEventListener('pointerenter', () => {
      gsap.fromTo(c, { y: 0 }, { y: -40, duration: .3, ease: 'power2.out', yoyo: true, repeat: 1 });
    }));
  }

  /* ---------- 3D-наклон карточек ---------- */
  function tilt() {
    if (!fine || reduce || !G) return;
    $$('.card').forEach(card => {
      const rx = gsap.quickTo(card, 'rotationX', { duration: .6, ease: 'power3' });
      const ry = gsap.quickTo(card, 'rotationY', { duration: .6, ease: 'power3' });
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        ry((px - .5) * 14); rx((.5 - py) * 14);
        card.style.setProperty('--mx', px * 100 + '%');
        card.style.setProperty('--my', py * 100 + '%');
      });
      card.addEventListener('pointerleave', () => { rx(0); ry(0); });
    });
  }

  /* ---------- Запуск ---------- */
  bubblesCanvas();
  beforeAfter();
  calculator();
  faq();
  form();
  cursor();
  magnetic();
  tilt();
  scrollAnimations();
  preloader(heroIntro);
  addEventListener('load', () => ST && ScrollTrigger.refresh());
})();
