/* ============================================================
   main.js — поведение сайта Regina Nails:
   - подстановка контактов из RN_CONFIG (data-cfg / data-href)
   - шапка, мобильное меню, FAB, reveal-on-scroll, счётчики
   - «рука» с ногтями (SVG): конструктор маникюра + галерея работ
   - смена цвета лака во флаконе героя, блёстки за курсором
   - карусель отзывов, форма записи → WhatsApp / Telegram
   ============================================================ */
(function () {
  'use strict';

  const cfg = window.RN_CONFIG || {};
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------- Подстановка контактов -------- */
  function applyConfig() {
    $$('[data-cfg]').forEach(el => {
      const v = el.getAttribute('data-cfg').split('.').reduce((a, k) => (a == null ? a : a[k]), cfg);
      if (v != null && v !== '') el.textContent = v;
    });
    $$('[data-href]').forEach(el => {
      const key = el.getAttribute('data-href');
      const url = key === 'phone' ? (cfg.phoneClean ? 'tel:' + cfg.phoneClean : '') : cfg[key];
      if (url) el.href = url;
      else if (el.hasAttribute('data-hide-empty')) el.hidden = true;
    });
    const map = $('#map-frame');
    if (map && cfg.mapEmbed) map.src = cfg.mapEmbed;
    $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
  }

  /* -------- Шапка и меню -------- */
  function setupHeader() {
    const h = $('.header');
    if (!h) return;
    const onScroll = () => h.classList.toggle('is-scrolled', window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const burger = $('.burger'), menu = $('.mobile-menu');
    if (!burger || !menu) return;
    const toggle = (open) => {
      const isOpen = open ?? !menu.classList.contains('is-open');
      menu.classList.toggle('is-open', isOpen);
      document.body.classList.toggle('no-scroll', isOpen);
      burger.setAttribute('aria-expanded', String(isOpen));
    };
    burger.addEventListener('click', () => toggle());
    $$('a', menu).forEach(a => a.addEventListener('click', () => toggle(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') toggle(false); });
  }

  function setupFab() {
    const fab = $('.fab');
    if (!fab) return;
    const t = $('.fab__toggle', fab);
    const set = (open) => { fab.classList.toggle('is-open', open); t.setAttribute('aria-expanded', String(open)); };
    t.addEventListener('click', () => set(!fab.classList.contains('is-open')));
    document.addEventListener('click', e => { if (!fab.contains(e.target)) set(false); });
  }

  /* -------- Reveal + счётчики -------- */
  function setupReveals() {
    const els = $$('.reveal');
    const counters = $$('[data-counter]');
    const fmt = n => Math.round(n).toLocaleString('ru-RU');
    const count = el => {
      const target = parseFloat(el.dataset.counter) || 0;
      if (reduced) { el.textContent = fmt(target); return; }
      const t0 = performance.now();
      const step = now => {
        const p = Math.min(1, (now - t0) / 1600);
        el.textContent = fmt(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (!('IntersectionObserver' in window) || reduced) {
      els.forEach(el => el.classList.add('is-in'));
      counters.forEach(c => { c.textContent = fmt(parseFloat(c.dataset.counter) || 0); });
      return;
    }
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        if (e.target.dataset.counter != null) count(e.target);
        else e.target.classList.add('is-in');
        obs.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    els.forEach(el => obs.observe(el));
    counters.forEach(el => obs.observe(el));
    /* для скриншот-тестов: показать всё сразу */
    window.__revealAll = () => els.forEach(el => el.classList.add('is-in'));
  }

  /* ============================================================
     «Рука» с ногтями — SVG, рисуется кодом.
     Используется в конструкторе (#studio) и в галерее (#works).
     ============================================================ */
  const SHAPES = [
    { id: 'almond',    name: 'Миндаль',        ext: .72 },
    { id: 'oval',      name: 'Овал',           ext: .42 },
    { id: 'squoval',   name: 'Мягкий квадрат', ext: .32 },
    { id: 'square',    name: 'Квадрат',        ext: .3 },
    { id: 'ballerina', name: 'Балерина',       ext: .8 }
  ];
  const FINISHES = [
    { id: 'gloss',   name: 'Глянец' },
    { id: 'matte',   name: 'Матовый' },
    { id: 'french',  name: 'Френч' },
    { id: 'chrome',  name: 'Втирка-хром' },
    { id: 'cat',     name: 'Кошачий глаз' },
    { id: 'glitter', name: 'Блёстки' }
  ];
  const COLORS = [
    ['#F2D4CB', 'молочный нюд'], ['#E8B4B0', 'пудровая роза'], ['#D98C95', 'розовый кварц'], ['#F4F1EC', 'белый жемчуг'],
    ['#F28C7A', 'коралл'],       ['#C8102E', 'классический красный'], ['#8E2F4D', 'ягодный'], ['#5A1428', 'бордо'],
    ['#9C6B57', 'мокко'],        ['#4E3329', 'шоколад'],     ['#E0B44C', 'золото'],      ['#9DB5A0', 'шалфей'],
    ['#B8A4D6', 'лаванда'],      ['#9FC3E0', 'небесный'],    ['#1F2A44', 'ночной синий'], ['#151214', 'чёрный']
  ];
  const colorName = hex => (COLORS.find(c => c[0].toLowerCase() === String(hex).toLowerCase()) || [0, 'свой оттенок'])[1];

  /* смешать цвет с белым/чёрным: t от 0 до 1 */
  function mix(hex, to, t) {
    const a = parseInt(hex.slice(1), 16), b = parseInt(to.slice(1), 16);
    const ch = (x, s) => (x >> s) & 255;
    const m = s => Math.round(ch(a, s) + (ch(b, s) - ch(a, s)) * t);
    return '#' + ((1 << 24) + (m(16) << 16) + (m(8) << 8) + m(0)).toString(16).slice(1);
  }

  /* пальцы: x центра, ширина, верх; большой палец повёрнут */
  const FINGERS = [
    { cx: 82,  w: 50, top: 158 },
    { cx: 142, w: 58, top: 84 },
    { cx: 208, w: 62, top: 54 },
    { cx: 274, w: 58, top: 92 },
    { cx: 336, w: 60, top: 236, rot: 22 }
  ];
  const SKIN = '#F2D2C2', SKIN_SH = '#E2B29F';

  /* контур ногтя: основание (кутикула) внизу, свободный край вверху */
  function nailPath(shape, cx, bottom, w, top) {
    const L = cx - w / 2, R = cx + w / 2, h = bottom - top, c = w * .32;
    const base = `M${L},${bottom - c} Q${L},${bottom} ${cx},${bottom} Q${R},${bottom} ${R},${bottom - c} `;
    switch (shape) {
      case 'square':
        return base + `L${R},${top + 3} Q${R},${top} ${R - 3},${top} L${L + 3},${top} Q${L},${top} ${L},${top + 3} Z`;
      case 'squoval': {
        const r = w * .3;
        return base + `L${R},${top + r} Q${R},${top} ${R - r},${top} L${L + r},${top} Q${L},${top} ${L},${top + r} Z`;
      }
      case 'oval':
        return base + `L${R},${top + w * .5} A${w / 2},${w * .5} 0 0 0 ${L},${top + w * .5} Z`;
      case 'ballerina':
        return base + `L${R},${top + h * .42} L${cx + w * .2},${top + 3} Q${cx + w * .2},${top} ${cx + w * .14},${top} ` +
          `L${cx - w * .14},${top} Q${cx - w * .2},${top} ${cx - w * .2},${top + 3} L${L},${top + h * .42} Z`;
      default: /* almond */
        return base + `L${R},${top + h * .44} C${R},${top + h * .14} ${cx + w * .14},${top} ${cx},${top} ` +
          `C${cx - w * .14},${top} ${L},${top + h * .14} ${L},${top + h * .44} Z`;
    }
  }

  let uidSeq = 0;
  /* набор ногтей (5 групп <g>) для одного дизайна */
  function nailsMarkup(d, paintAnim) {
    const uid = 'n' + (++uidSeq);
    const shape = SHAPES.find(s => s.id === d.shape) || SHAPES[0];
    const col = d.color;
    let defs = '', out = '';
    if (d.finish === 'chrome') {
      defs += `<linearGradient id="${uid}ch" x1="0" y1="0" x2="1" y2="1">` +
        `<stop offset="0" stop-color="${mix(col, '#ffffff', .7)}"/><stop offset=".35" stop-color="${mix(col, '#000000', .18)}"/>` +
        `<stop offset=".5" stop-color="#ffffff"/><stop offset=".68" stop-color="${mix(col, '#000000', .28)}"/>` +
        `<stop offset="1" stop-color="${mix(col, '#ffffff', .55)}"/></linearGradient>`;
    }
    if (d.finish === 'cat') {
      defs += `<radialGradient id="${uid}cat"><stop offset="0" stop-color="${mix(col, '#ffffff', .8)}" stop-opacity=".95"/>` +
        `<stop offset="1" stop-color="${mix(col, '#ffffff', .5)}" stop-opacity="0"/></radialGradient>`;
    }
    FINGERS.forEach((f, i) => {
      const nw = f.w * .74;
      const bottom = f.top + f.w * 1.18;
      const tip = f.top + f.w * .14 - nw * shape.ext;
      const p = nailPath(shape.id, f.cx, bottom, nw, tip);
      const L = f.cx - nw / 2, R = f.cx + nw / 2;
      const rot = f.rot ? ` transform="rotate(${f.rot} ${f.cx} 420)"` : '';
      let body;
      switch (d.finish) {
        case 'french': {
          const ys = f.top + f.w * .2;
          body = `<path d="${p}" fill="#F7DCD4"/>` +
            `<path d="M${L - 4},${ys + nw * .34} Q${f.cx},${ys - nw * .3} ${R + 4},${ys + nw * .34} L${R + 4},${tip - 4} L${L - 4},${tip - 4} Z" fill="${col}"/>`;
          break;
        }
        case 'chrome':
          body = `<path d="${p}" fill="url(#${uid}ch)"/>`;
          break;
        case 'cat':
          body = `<path d="${p}" fill="${mix(col, '#000000', .35)}"/>` +
            `<ellipse class="cat-band" cx="${f.cx}" cy="${(tip + bottom) / 2}" rx="${nw * .75}" ry="${nw * .32}" fill="url(#${uid}cat)" transform="rotate(-24 ${f.cx} ${(tip + bottom) / 2})"/>`;
          break;
        case 'glitter': {
          body = `<path d="${p}" fill="${col}"/>`;
          for (let k = 0; k < 16; k++) {
            /* детерминированный «рандом» — рисунок не прыгает между рендерами */
            const rx = L + ((k * 37 + i * 13) % 100) / 100 * nw;
            const ry = tip + ((k * 61 + i * 29) % 100) / 100 * (bottom - tip);
            const fill = k % 3 ? '#ffffff' : mix(col, '#ffffff', .6);
            body += `<circle${k % 4 === 0 ? ' class="glint"' : ''} cx="${rx.toFixed(1)}" cy="${ry.toFixed(1)}" r="${(1 + (k % 3) * .6).toFixed(1)}" fill="${fill}" style="animation-delay:${(k % 5) * .4}s"/>`;
          }
          break;
        }
        case 'matte':
          body = `<path d="${p}" fill="${col}"/><path d="${p}" fill="#ffffff" opacity=".07"/>`;
          break;
        default:
          body = `<path d="${p}" fill="${col}"/>`;
      }
      /* объём: тень по краю + блик (у матового блика нет) */
      body += `<path d="${p}" fill="none" stroke="${mix(col === '#151214' ? '#555555' : col, '#000000', .25)}" stroke-opacity=".35" stroke-width="1.2"/>`;
      if (d.finish !== 'matte') {
        body += `<path d="M${L + nw * .24},${bottom - nw * .5} Q${L + nw * .16},${(tip + bottom) / 2} ${L + nw * .32},${tip + nw * .45}" ` +
          `fill="none" stroke="#fff" stroke-width="${(nw * .12).toFixed(1)}" stroke-linecap="round" opacity=".6"/>`;
      }
      defs += `<clipPath id="${uid}c${i}"><path d="${p}"/></clipPath>`;
      const anim = paintAnim ? ` class="paint" style="animation-delay:${i * .08}s"` : '';
      out += `<g${rot}><g clip-path="url(#${uid}c${i})"${anim}>${body}</g></g>`;
    });
    return `<defs>${defs}</defs>${out}`;
  }

  function handMarkup(bg) {
    let fingers = '';
    FINGERS.forEach(f => {
      const rot = f.rot ? ` transform="rotate(${f.rot} ${f.cx} 420)"` : '';
      fingers += `<rect${rot} x="${f.cx - f.w / 2}" y="${f.top}" width="${f.w}" height="${430 - f.top}" rx="${f.w / 2}" fill="${SKIN}" stroke="${SKIN_SH}" stroke-width="1.4"/>`;
      /* складочки на суставах */
      if (!f.rot) fingers += `<path d="M${f.cx - f.w * .22},${f.top + f.w * 2.2} q${f.w * .22},6 ${f.w * .44},0" stroke="${SKIN_SH}" stroke-width="1.3" fill="none" opacity=".6"/>`;
    });
    return (bg || '') +
      `<rect x="62" y="300" width="262" height="140" rx="40" fill="${SKIN}"/>` + fingers;
  }

  function handSvg(d, bg) {
    return `<svg viewBox="-5 0 430 420" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="xMidYMax slice">` +
      handMarkup(bg) + `<g>${nailsMarkup(d, false)}</g></svg>`;
  }

  /* -------- Конструктор маникюра -------- */
  let studioApi = null;
  function setupStudio() {
    const root = $('#studio-hand');
    if (!root) return;
    const state = { shape: 'almond', color: '#8E2F4D', finish: 'gloss' };
    root.innerHTML = handMarkup('') + '<g id="nails-old"></g><g id="nails-new"></g>';
    const gOld = $('#nails-old', root), gNew = $('#nails-new', root);
    const label = $('#studio-label');

    const build = (wrap, items, key, render) => {
      items.forEach(it => {
        const b = document.createElement('button');
        b.type = 'button';
        render(b, it);
        b.addEventListener('click', () => { state[key] = it.id || it[0]; paint(); });
        wrap.appendChild(b);
      });
    };
    build($('#opt-shape'), SHAPES, 'shape', (b, s) => { b.className = 'opt'; b.dataset.v = s.id; b.textContent = s.name; });
    build($('#opt-finish'), FINISHES, 'finish', (b, s) => { b.className = 'opt'; b.dataset.v = s.id; b.textContent = s.name; });
    build($('#opt-color'), COLORS, 'color', (b, c) => {
      b.className = 'color'; b.dataset.v = c[0]; b.style.setProperty('--c', c[0]);
      b.setAttribute('aria-label', 'Цвет: ' + c[1]); b.title = c[1];
    });

    function sync() {
      $$('#opt-shape .opt').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === state.shape)));
      $$('#opt-finish .opt').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === state.finish)));
      $$('#opt-color .color').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v.toLowerCase() === state.color.toLowerCase())));
      const s = SHAPES.find(x => x.id === state.shape), f = FINISHES.find(x => x.id === state.finish);
      const text = `${s.name} · ${colorName(state.color)} · ${f.name.toLowerCase()}`;
      label.textContent = text;
      $('#cap-shape').textContent = s.name;
      $('#cap-color').textContent = colorName(state.color);
      $('#cap-finish').textContent = f.name;
      const msg = `Здравствуйте, Регина! Хочу записаться на маникюр. Дизайн из конструктора на сайте: форма — ${s.name.toLowerCase()}, цвет — ${colorName(state.color)}, покрытие — ${f.name.toLowerCase()}.`;
      const wa = $('#studio-book');
      if (wa) wa.href = waLink(msg);
    }
    function paint() {
      gOld.innerHTML = gNew.innerHTML;
      gNew.innerHTML = nailsMarkup(state, !reduced);
      sync();
    }
    $('#studio-random')?.addEventListener('click', () => {
      const r = a => a[Math.floor(Math.random() * a.length)];
      state.shape = r(SHAPES).id; state.finish = r(FINISHES).id; state.color = r(COLORS)[0];
      paint();
    });
    paint();
    studioApi = d => { Object.assign(state, d); paint(); };
  }

  /* -------- Галерея работ -------- */
  const BGS = [['#FFFFFF', '#F1DAD5'], ['#FBF3E6', '#EBD3B4'], ['#F7EEF2', '#E3C6D3'], ['#F4F1EC', '#DCD3CC']];
  function setupWorks() {
    const grid = $('#works-grid');
    if (!grid || !window.RN_WORKS) return;
    window.RN_WORKS.forEach((w, i) => {
      const card = document.createElement('article');
      card.className = 'work reveal';
      card.style.setProperty('--delay', (i % 4) * .08 + 's');
      const bg = BGS[i % BGS.length];
      const bgDef = `<defs><radialGradient id="wbg${i}" cx=".5" cy=".2" r="1"><stop offset="0" stop-color="${bg[0]}"/><stop offset="1" stop-color="${bg[1]}"/></radialGradient></defs>` +
        `<rect x="-200" y="-200" width="800" height="820" fill="url(#wbg${i})"/>`;
      const media = w.img
        ? `<img src="${w.img}" alt="${w.name} — маникюр, работа Регины" loading="lazy" width="600" height="750">`
        : handSvg(w, bgDef);
      card.innerHTML = media +
        `<div class="work__cap"><div><div class="work__name"></div><div class="work__tag"></div></div>` +
        `<button type="button" class="work__try">Примерить</button></div>`;
      $('.work__name', card).textContent = w.name;
      $('.work__tag', card).textContent = w.tag;
      card.addEventListener('click', () => {
        if (!studioApi) return;
        studioApi({ shape: w.shape, color: w.color, finish: w.finish });
        $('#studio').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
      });
      grid.appendChild(card);
    });
  }

  /* -------- Флакон в герое: лак переливается цветами веера -------- */
  function setupBottle() {
    const fill = $('.bottle__fill');
    if (!fill || reduced) return;
    const tips = $$('.fan__item').map(t => t.style.getPropertyValue('--tip-c')).filter(Boolean);
    if (!tips.length) return;
    let i = 0;
    setInterval(() => { i = (i + 1) % tips.length; fill.setAttribute('fill', tips[i]); }, 2600);
  }

  /* -------- Блёстки за курсором (только мышь) -------- */
  function setupGlitter() {
    if (reduced || !window.matchMedia('(pointer: fine)').matches) return;
    const cv = document.createElement('canvas');
    cv.id = 'glitter'; cv.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cv);
    const ctx = cv.getContext('2d');
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let W, H, parts = [], running = false, last = 0;
    const resize = () => { W = innerWidth; H = innerHeight; cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0); };
    resize(); addEventListener('resize', resize);
    const COLS = ['#C9A36A', '#E8CFA0', '#D79CA2', '#ffffff', '#B5546F'];
    const star = (x, y, r) => {
      ctx.beginPath();
      for (let k = 0; k < 8; k++) {
        const a = k * Math.PI / 4, rr = k % 2 ? r * .35 : r;
        ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
      }
      ctx.closePath(); ctx.fill();
    };
    const step = () => {
      ctx.clearRect(0, 0, W, H);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.x += p.vx; p.y += p.vy; p.vy += .04; p.life -= .022;
        if (p.life <= 0) { parts.splice(i, 1); continue; }
        ctx.globalAlpha = p.life; ctx.fillStyle = p.c;
        star(p.x, p.y, p.r * (0.6 + p.life * .4));
      }
      ctx.globalAlpha = 1;
      if (parts.length) requestAnimationFrame(step); else running = false;
    };
    addEventListener('pointermove', e => {
      const now = performance.now();
      if (now - last < 28 || parts.length > 90) return;
      last = now;
      parts.push({ x: e.clientX, y: e.clientY, vx: (Math.random() - .5) * 1.2, vy: Math.random() * -.6,
        r: 2.5 + Math.random() * 3.5, c: COLS[(Math.random() * COLS.length) | 0], life: 1 });
      if (!running) { running = true; requestAnimationFrame(step); }
    }, { passive: true });
  }

  /* -------- Отзывы -------- */
  function setupReviews() {
    const track = $('.reviews__track');
    if (!track) return;
    const by = dir => {
      const card = $('.review', track);
      track.scrollBy({ left: dir * (card ? card.offsetWidth + 22 : 300), behavior: reduced ? 'auto' : 'smooth' });
    };
    $('[data-rev="prev"]')?.addEventListener('click', () => by(-1));
    $('[data-rev="next"]')?.addEventListener('click', () => by(1));
  }

  /* -------- Запись: сообщение в мессенджер -------- */
  function waLink(text) {
    const base = cfg.whatsapp || 'https://wa.me/';
    return base + (base.includes('?') ? '&' : '?') + 'text=' + encodeURIComponent(text);
  }
  function setupBooking() {
    const form = $('#booking-form');
    if (!form) return;
    const hint = $('#booking-hint');
    const message = () => {
      const v = n => (form.elements[n]?.value || '').trim();
      let m = 'Здравствуйте, Регина! Хочу записаться.';
      if (v('service')) m += `\nУслуга: ${v('service')}`;
      if (v('day')) m += `\nЖелаемый день: ${v('day')}`;
      if (v('time')) m += `\nВремя: ${v('time')}`;
      if (v('name')) m += `\nМеня зовут ${v('name')}.`;
      if (v('comment')) m += `\n${v('comment')}`;
      return m;
    };
    form.addEventListener('submit', e => {
      e.preventDefault();
      window.open(waLink(message()), '_blank', 'noopener');
    });
    $('#booking-tg')?.addEventListener('click', () => {
      const text = message();
      const go = () => window.open(cfg.telegram || 'https://t.me/', '_blank', 'noopener');
      /* Telegram не принимает текст в ссылке на профиль — копируем его */
      (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject())
        .then(() => { hint.textContent = 'Текст заявки скопирован — вставьте его в чат Telegram.'; hint.classList.add('is-ok'); })
        .catch(() => {})
        .finally(go);
    });
    /* минимальная дата — сегодня */
    const day = form.elements.day;
    if (day && day.type === 'date') day.min = new Date().toISOString().slice(0, 10);
  }

  /* быстрые ссылки «записаться» с готовым текстом */
  function setupQuickLinks() {
    $$('[data-wa-text]').forEach(a => { a.href = waLink(a.dataset.waText); });
  }

  document.addEventListener('DOMContentLoaded', () => {
    applyConfig();
    setupHeader();
    setupFab();
    setupStudio();
    setupWorks();
    setupReveals();
    setupBottle();
    setupGlitter();
    setupReviews();
    setupBooking();
    setupQuickLinks();
  });
})();
