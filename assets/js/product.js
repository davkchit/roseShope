/* Карточка товара во всплывающем окне.
   Компьютер — окно по центру, вырастает из нажатой карточки.
   Телефон — шторка снизу: тянется пальцем 1:1, бросок вниз закрывает, у верхнего края — мягкое сопротивление.
   Анимации на пружине: всегда стартуют с текущего значения и подхватывают скорость, поэтому их можно перехватить в любой момент. */
(() => {
  const CATS = { jeans: 'Джинсы', hudi: 'Худи и куртки', pizhamy: 'Пижамы и халаты', hats: 'Головные уборы' };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const phone = matchMedia('(max-width: 760px)');

  const root = document.createElement('div');
  root.className = 'pm';
  root.hidden = true;
  root.innerHTML = `
    <div class="pm-scrim" data-pm-close></div>
    <div class="pm-panel" tabindex="-1" role="dialog" aria-modal="true" aria-labelledby="pm-title">
      <div class="pm-grab" aria-hidden="true"><i></i></div>
      <button class="pm-close" type="button" data-pm-close aria-label="Закрыть"><svg class="i"><use href="#i-close"/></svg></button>
      <div class="pm-scroll">
        <div class="pm-img"><img class="pm-img-bg" alt="" aria-hidden="true"><img class="pm-img-main" alt=""></div>
        <div class="pm-body">
          <span class="pm-cat"></span>
          <h3 id="pm-title"></h3>
          <p class="pm-desc"></p>
          <ul class="pm-facts">
            <li><svg class="i"><use href="#i-hanger"/></svg>Можно примерить на месте</li>
            <li><svg class="i"><use href="#i-pin"/></svg>Корпус 1 · ряд 1 · места 31–32</li>
            <li><svg class="i"><use href="#i-clock"/></svg>Ежедневно 8:00–18:00</li>
          </ul>
          <a class="btn btn-primary pm-wa" href="${MAX_URL}" target="_blank" rel="noopener">${MAX_IC}Хочу примерить</a>
          <p class="pm-note">Напишите — отложим вещь до вашего прихода.</p>
        </div>
      </div>
    </div>`;
  document.body.append(root);

  const panel = root.querySelector('.pm-panel');
  const scrim = root.querySelector('.pm-scrim');
  const scroller = root.querySelector('.pm-scroll');
  const img = root.querySelector('.pm-img-main');
  const imgBg = root.querySelector('.pm-img-bg');
  const imgBox = root.querySelector('.pm-img');
  // Высота блока фото подстраивается под пропорции снимка — фото видно целиком, без обрезки
  const fit = () => { if (img.naturalWidth) imgBox.style.setProperty('--pm-r', (img.naturalWidth / img.naturalHeight).toFixed(4)); };
  img.addEventListener('load', fit);

  /* ---------- Пружина: damping ratio + response, как у Apple ---------- */
  // p — прогресс открытия: 0 закрыто, 1 открыто. Значение и скорость живут здесь, анимация всегда продолжает с них.
  const s = { p: 0, v: 0, target: 0, raf: 0, damping: 1, response: 0.35, onRest: null };
  const step = (t, last) => {
    // Интегрируем мелкими шагами по реальному времени: даже если кадры пропущены, пружина не «застревает»
    let left = Math.min(0.25, Math.max(0, (t - last) / 1000));
    const k = (2 * Math.PI / s.response) ** 2;
    const c = 4 * Math.PI * s.damping / s.response;
    while (left > 0) {
      const dt = Math.min(0.004, left); left -= dt;
      s.v += (-k * (s.p - s.target) - c * s.v) * dt;
      s.p += s.v * dt;
    }
    paint();
    if (Math.abs(s.v) < 0.002 && Math.abs(s.p - s.target) < 0.0005) {
      s.p = s.target; s.v = 0; s.raf = 0; paint();
      const done = s.onRest; s.onRest = null; done && done();
      return;
    }
    s.raf = requestAnimationFrame(n => step(n, t));
  };
  const springTo = (target, { velocity, damping = 1, response = 0.35, onRest } = {}) => {
    s.target = target; s.damping = damping; s.response = response; s.onRest = onRest || null;
    if (velocity !== undefined) s.v = velocity;
    if (reduce.matches) { s.p = target; s.v = 0; paint(); onRest && onRest(); return; }
    if (!s.raf) s.raf = requestAnimationFrame(t => step(t, t - 16));
  };
  const stop = () => { cancelAnimationFrame(s.raf); s.raf = 0; };

  /* ---------- Отрисовка по прогрессу ---------- */
  let origin = { x: 0, y: 0 };
  const sheetH = () => panel.offsetHeight || innerHeight;
  function paint() {
    const p = s.p;
    scrim.style.opacity = Math.max(0, Math.min(1, p));
    if (reduce.matches) { panel.style.opacity = p; panel.style.transform = 'none'; return; }
    if (phone.matches) {
      // Шторка: выезжает снизу и уходит туда же. p > 1 — тянут вверх, сопротивление уже учтено в p
      panel.style.opacity = 1;
      panel.style.transform = `translate3d(0, ${(1 - p) * sheetH()}px, 0)`;
    } else {
      // Окно растёт из карточки, по которой нажали, и сворачивается обратно в неё
      const q = Math.max(0, p);
      panel.style.opacity = Math.min(1, q * 1.6);
      panel.style.transform = `translate3d(${origin.x * (1 - q)}px, ${origin.y * (1 - q)}px, 0) scale(${0.86 + 0.14 * q})`;
    }
  }

  /* ---------- Открыть / закрыть ---------- */
  let lastFocus = null, isOpen = false;
  window.openProduct = (p, fromEl) => {
    // p.src — готовый путь к фото (категории): тогда окно показывает только фото и название
    const photoOnly = !!p.src;
    root.classList.toggle('pm-photo-only', photoOnly);
    root.querySelector('.pm-cat').textContent = CATS[p.cat] || 'Одежда';
    root.querySelector('#pm-title').textContent = p.name;
    root.querySelector('.pm-desc').textContent = p.desc || '';
    imgBox.style.removeProperty('--pm-r');
    img.src = imgBg.src = p.src || `assets/img/store/${p.img}.jpg`;
    if (img.complete) fit();
    img.alt = p.name;
    if (!photoOnly) Object.assign(root.querySelector('.pm-wa'), { href: MAX_URL }).dataset.max = tryOnText(p.name);
    scroller.scrollTop = 0;

    lastFocus = document.activeElement;
    root.hidden = false;
    document.documentElement.classList.add('pm-lock');
    // Точка, из которой вырастает окно: центр нажатой карточки относительно центра окна
    const r = fromEl ? fromEl.getBoundingClientRect() : null;
    const pr = panel.getBoundingClientRect();
    origin = r ? { x: r.left + r.width / 2 - (pr.left + pr.width / 2), y: r.top + r.height / 2 - (pr.top + pr.height / 2) } : { x: 0, y: 0 };
    if (!isOpen) { s.p = 0; s.v = 0; paint(); }
    isOpen = true;
    springTo(1, { damping: phone.matches ? 0.9 : 1, response: phone.matches ? 0.4 : 0.36 });
    // Фокус на само окно (а не на крестик) — без лишней обводки на телефоне, но Tab/Esc работают
    panel.focus({ preventScroll: true });
  };

  const close = (velocity) => {
    if (!isOpen) return;
    isOpen = false;
    springTo(0, { velocity, damping: 1, response: 0.3, onRest: () => {
      if (isOpen) return; // успели открыть снова — ничего не прячем
      root.hidden = true;
      document.documentElement.classList.remove('pm-lock');
      lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true });
    }});
  };

  root.addEventListener('click', e => { if (e.target.closest('[data-pm-close]')) close(); });
  document.addEventListener('keydown', e => {
    if (root.hidden) return;
    if (e.key === 'Escape') close();
    // Фокус не уходит из окна
    if (e.key === 'Tab') {
      const f = [...panel.querySelectorAll('button, a[href]')].filter(x => x.offsetParent);
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- Шторка на телефоне: тянем пальцем ---------- */
  const rubber = (x, d, c = 0.55) => (x * d * c) / (d + c * Math.abs(x));
  const project = (v, d = 0.998) => (v / 1000) * d / (1 - d);
  let drag = null;

  panel.addEventListener('pointerdown', e => {
    if (!phone.matches || reduce.matches || e.button !== 0) return;
    if (e.target.closest('a, button:not(.pm-grab)')) return;
    // Внутри прокрутки тянуть можно только когда она в самом верху
    if (e.target.closest('.pm-scroll') && scroller.scrollTop > 0) return;
    drag = { id: e.pointerId, y0: e.clientY, p0: s.p, started: false, hist: [{ y: e.clientY, t: e.timeStamp }] };
  });
  panel.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.id) return;
    const dy = e.clientY - drag.y0;
    if (!drag.started) {
      if (Math.abs(dy) < 8) return;            // небольшой порог, чтобы не путать с прокруткой и нажатием
      if (dy < 0 && scroller.scrollTop >= 0 && e.target.closest('.pm-scroll')) { drag = null; return; } // вверх — это прокрутка
      drag.started = true; drag.y0 = e.clientY; stop();
      panel.setPointerCapture(e.pointerId);
      panel.classList.add('is-dragging');
    }
    const h = sheetH();
    const raw = e.clientY - drag.y0;           // + вниз
    const offset = raw < 0 ? rubber(raw, h) : raw; // вверх — с сопротивлением
    s.p = drag.p0 - offset / h; s.v = 0; paint();
    drag.hist.push({ y: e.clientY, t: e.timeStamp });
    if (drag.hist.length > 6) drag.hist.shift();
  });
  const endDrag = e => {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag; drag = null;
    panel.classList.remove('is-dragging');
    if (!d.started) return;
    const a = d.hist[0], b = d.hist[d.hist.length - 1];
    const vy = b.t > a.t ? (b.y - a.y) / ((b.t - a.t) / 1000) : 0; // px/с, + вниз
    const h = sheetH();
    const projected = (1 - s.p) * h + project(vy);   // куда «долетит» шторка по инерции
    const pv = -vy / h;                               // скорость в единицах прогресса
    if (projected > h * 0.35) close(pv);
    else springTo(1, { velocity: pv, damping: 0.8, response: 0.35 }); // бросок был — немного пружинит
  };
  panel.addEventListener('pointerup', endDrag);
  panel.addEventListener('pointercancel', endDrag);
})();

/* Категории: нажатие на карточку открывает окно с фото */
document.querySelectorAll('.mh-grid button.mh-cat').forEach(a => a.addEventListener('click', e => {
  e.preventDefault();
  const im = a.querySelector('img');
  window.openProduct({ src: im.getAttribute('src'), name: a.querySelector('b').textContent }, a.querySelector('.mh-cat-img'));
}));
