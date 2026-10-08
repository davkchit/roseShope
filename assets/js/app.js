/* ============================================================
   Южный — общий скрипт
   ============================================================ */

// TODO: настоящий номер WhatsApp магазина в формате 79XXXXXXXXX
const WHATSAPP = '70000000000';
// Часы работы рынка (Набережные Челны, UTC+3)
const HOURS = { open: 9, close: 17 };

// Товары магазина: категория, название, описание, фото из assets/img/store/
const PRODUCTS = [
  { cat: 'hudi',   name: 'Спортивный костюм',   desc: 'Худи на молнии и брюки',      img: 'cat-hudi' },
  { cat: 'jeans',  name: 'Джинсы wide leg',     desc: 'Тёмно-серые, высокая посадка', img: 'jeans-wide-legs' },
  { cat: 'pizhamy',name: 'Халат плюшевый',      desc: 'Тёмно-синий, бордовая отделка', img: 'robe-navy' },
  { cat: 'hats',   name: 'Бейсболка',           desc: 'Хаки, регулируется',           img: 'cat-golovnye-ubory' },
  { cat: 'hudi',   name: 'Бордовый костюм',     desc: 'Худи на молнии и брюки',      img: 'hoodie-burgundy' },
  { cat: 'jeans',  name: 'Мом, синие',          desc: 'Резинка и шнурок',             img: 'jeans-street-blue' },
  { cat: 'pizhamy',name: 'Плюшевый комплект',   desc: 'Серый, с сердечками',          img: 'cat-pizhamy' },
  { cat: 'hudi',   name: 'Куртка-рубашка',      desc: 'Клетка, накладные карманы',    img: 'jacket-plaid' },
  { cat: 'jeans',  name: 'Широкие на резинке',  desc: 'Свободный крой, серый деним',  img: 'jeans-wide-bedroom' },
  { cat: 'hudi',   name: 'Шоколадный костюм',   desc: 'Худи на молнии и брюки',      img: 'hoodie-chocolate' },
  { cat: 'jeans',  name: 'Мом на резинке',      desc: 'Серые, со шнурком и отворотами', img: 'jeans-mom-studio' },
  { cat: 'pizhamy',name: 'Пижама в ромбик',     desc: 'Рубашка и брюки, синий узор',  img: 'pajama-diamond' },
  { cat: 'jeans',  name: 'Мом, серые',          desc: 'Высокая посадка, отвороты',    img: 'jeans-street-gray' },
  { cat: 'hudi',   name: 'Флисовый костюм',     desc: 'Свободный крой, на молнии',    img: 'hoodie-brown-fleece' },
  { cat: 'jeans',  name: 'Синие на резинке',    desc: 'Тёмный деним, шнурок',         img: 'jeans-elastic-blue' },
  { cat: 'pizhamy',name: 'Халат в горох',       desc: 'Мягкий плюш, с поясом',        img: 'robe-polka' },
  { cat: 'jeans',  name: 'Прямые с ремнём',     desc: 'Серый деним, классика',        img: 'jeans-straight-belt' },
  { cat: 'jeans',  name: 'Прямые серые',        desc: 'Свободный прямой крой',        img: 'jeans-straight-street' },
  { cat: 'jeans',  name: 'Прямые синие',        desc: 'Высокая посадка, ремень',      img: 'jeans-straight-blue' },
];
const PAGE_SIZE = 8;

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const waLink = text => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;

document.documentElement.classList.replace('no-js', 'js');

/* ---------- Ссылки WhatsApp ---------- */
$$('[data-wa]').forEach(a => {
  a.href = waLink(a.dataset.wa || 'Здравствуйте! Хочу узнать про одежду в магазине на рынке «Южный».');
  a.target = '_blank'; a.rel = 'noopener';
});

/* ---------- Открыто / закрыто ---------- */
$$('[data-open-status]').forEach(el => {
  const now = new Date();
  const h = (now.getUTCHours() + 3) % 24 + now.getUTCMinutes() / 60;
  const pad = n => String(n).padStart(2, '0') + ':00';
  const isOpen = h >= HOURS.open && h < HOURS.close;
  el.classList.toggle('is-closed', !isOpen);
  $('b', el).textContent = isOpen ? `Открыто сейчас — до ${pad(HOURS.close)}` : 'Сейчас закрыто';
  $('small', el).textContent = isOpen
    ? `Ежедневно ${pad(HOURS.open)}–${pad(HOURS.close)}`
    : `Откроемся ${h < HOURS.open ? 'сегодня' : 'завтра'} в ${pad(HOURS.open)}`;
});

/* ---------- Мобильное меню ---------- */
const menu = $('#menu');
if (menu) {
  const toggle = open => {
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
    $('.burger').setAttribute('aria-expanded', String(open));
  };
  $('.burger').addEventListener('click', () => toggle(true));
  menu.addEventListener('click', e => {
    if (e.target === menu || e.target.closest('[data-close], nav a')) toggle(false);
  });
  document.addEventListener('keydown', e => e.key === 'Escape' && toggle(false));
}

/* ---------- Появление при прокрутке ---------- */
const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { rootMargin: '0px 0px -8% 0px' });
const revealables = $$('.reveal, .hero-full');
revealables.forEach(el => io.observe(el));
// Страховка: если наблюдатель не сработал (переход по якорю, старый браузер) — показать всё
const revealVisible = () => revealables.forEach(el => {
  if (el.getBoundingClientRect().top < innerHeight) el.classList.add('in');
});
addEventListener('load', revealVisible);
addEventListener('hashchange', revealVisible);
setTimeout(() => revealables.forEach(el => el.classList.add('in')), 2000);

/* ---------- Каталог ---------- */
const grid = $('#grid');
if (grid) {
  let filter = 'all';
  let shown = PAGE_SIZE;
  const moreBtn = $('#more');

  const card = p => {
    const el = document.createElement('article');
    el.className = 'card';
    el.innerHTML = `
      <button class="card-open" type="button" aria-label="Подробнее: ${p.name}">
        <span class="card-img"><img src="assets/img/store/${p.img}.jpg" alt="${p.name}" loading="lazy" width="600" height="800"></span>
        <h3>${p.name}</h3>
      </button>
      <a class="btn" href="${waLink(`Здравствуйте! Хочу примерить: ${p.name}. Отложите, пожалуйста.`)}" target="_blank" rel="noopener">
        <svg class="i i-fill"><use href="#i-wa"/></svg>Хочу примерить
      </a>`;
    $('.card-open', el).addEventListener('click', () => window.openProduct && openProduct(p, $('.card-img', el)));
    return el;
  };

  const render = () => {
    const list = PRODUCTS.filter(p => filter === 'all' || p.cat === filter);
    grid.replaceChildren(...list.slice(0, shown).map(card));
    moreBtn.hidden = list.length <= shown;
    moreBtn.textContent = `Показать ещё ${Math.min(PAGE_SIZE, list.length - shown)}`;
  };

  const setFilter = f => {
    filter = f; shown = PAGE_SIZE;
    $$('.chip').forEach(c => c.setAttribute('aria-pressed', String(c.dataset.filter === f)));
    render();
  };

  $$('.chip').forEach(c => c.addEventListener('click', () => setFilter(c.dataset.filter)));
  moreBtn.addEventListener('click', () => { shown += PAGE_SIZE; render(); });
  $$('[data-show]').forEach(a => a.addEventListener('click', () => setFilter(a.dataset.show)));
  render();
}

/* ---------- Карусель категорий ---------- */
$$('[data-carousel]').forEach(track => {
  const prev = $('[data-prev]'), next = $('[data-next]');
  if (!prev || !next) return;
  const step = () => track.firstElementChild.offsetWidth + parseFloat(getComputedStyle(track).columnGap || 0);
  const sync = () => {
    prev.disabled = track.scrollLeft < 4;
    next.disabled = track.scrollLeft + track.clientWidth > track.scrollWidth - 4;
  };
  prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  track.addEventListener('scroll', sync, { passive: true });
  window.addEventListener('resize', sync);
  sync();
});

/* ---------- Схема рынка ---------- */
// Тексты — с официального сайта. Нумерация как на официальной схеме: 1 — правый корпус.
const BUILDINGS = {
  c1: { title: 'Корпус 1 · Вещевой', photo: 'korpus-1', action: true,
        text: 'Одежда и обувь, спецодежда и военторг, хозтовары, турецкая бытовая химия, пряжа, карнизы для штор, ТВ и антенны.',
        tags: ['Одежда', 'Обувь', 'Военторг', 'Хозтовары', 'Турецкая химия', 'Пряжа', 'Шторы и карнизы'] },
  c2: { title: 'Корпус 2 · Светофор', photo: 'korpus-2',
        text: 'Магазин-склад низких цен: продукты питания и бытовая химия.',
        tags: ['Продукты', 'Бытовая химия'] },
  c3: { title: 'Корпус 3 · Продуктовая галерея', photo: 'korpus-3',
        text: 'Овощи и фрукты, мясо, кондитерские изделия, хозтовары.',
        tags: ['Овощи и фрукты', 'Мясо', 'Кондитерская', 'Хозтовары'] },
  adm: { title: 'Администрация', photo: 'administraciya',
        text: 'Администрация рынка, лаборатория, туалет и столовая «Щи-Борщи». Рядом парковка.',
        tags: ['Администрация', 'Лаборатория', 'Столовая', 'Туалет'] },
};
const sheet = $('#building');
if (sheet) {
  const part = k => $(`[data-sc="${k}"]`, sheet);
  const open = id => {
    const b = BUILDINGS[id];
    part('photo').src = `assets/img/buildings/${b.photo}.jpg`;
    part('photo').alt = b.title;
    part('title').textContent = b.title;
    part('text').textContent = b.text;
    part('tags').replaceChildren(...b.tags.map(t => Object.assign(document.createElement('span'), { textContent: t })));
    part('action').hidden = !b.action;
    sheet.showModal();
  };
  $$('[data-b]').forEach(el => el.addEventListener('click', () => open(el.dataset.b)));
  $('[data-close-sheet]', sheet).addEventListener('click', () => sheet.close());
  // Клик по затемнению вокруг окна закрывает его
  sheet.addEventListener('click', e => { if (e.target === sheet) sheet.close(); });
}

/* ---------- Фото-тур «Как нас найти» (перенесён с официального сайта) ---------- */
$$('[data-tour]').forEach(root => {
  const items = $$('[data-tour-steps] > li', root);
  const stage = $('.tour-stage', root);
  const spot = $('.tour-spot', stage), spotLabel = $('b', spot), counter = $('.tour-count', stage);
  const prev = $('[data-tour-prev]', root), next = $('[data-tour-next]', root), dotsEl = $('.tour-dots', root);
  const num = (v, d) => (v === undefined || v === '' ? d : parseFloat(v));
  const steps = items.map(li => ({
    img: li.dataset.img, alt: li.dataset.alt || '', label: li.dataset.label || '',
    x: num(li.dataset.x, 50), y: num(li.dataset.y, 50), z: num(li.dataset.zoom, 1),
  }));
  // Один слой на картинку: соседние шаги с той же картинкой приближают её
  const layers = new Map();
  steps.forEach(s => {
    if (layers.has(s.img)) return;
    const layer = Object.assign(document.createElement('div'), { className: 'tour-layer' });
    layer.append(Object.assign(new Image(), { src: s.img, alt: s.alt, decoding: 'async', draggable: false }));
    stage.prepend(layer);
    layers.set(s.img, layer);
  });
  const dots = steps.map((_, i) => {
    const b = Object.assign(document.createElement('button'), { type: 'button', className: 'tour-dot' });
    b.setAttribute('aria-label', `Шаг ${i + 1}`);
    b.addEventListener('click', () => go(i));
    dotsEl.append(b);
    return b;
  });
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  let current = -1, timer = 0;
  function go(n) {
    n = clamp(n, 0, steps.length - 1);
    const s = steps[n], layer = layers.get(s.img);
    const same = current >= 0 && steps[current].img === s.img;
    const tx = clamp(50 - s.x * s.z, 100 - 100 * s.z, 0);
    const ty = clamp(50 - s.y * s.z, 100 - 100 * s.z, 0);
    const transform = `translate(${tx}%, ${ty}%) scale(${s.z})`;
    if (!same) {
      layer.style.transition = 'none'; layer.style.transform = transform; void layer.offsetWidth; layer.style.transition = '';
      layers.forEach(l => l.classList.toggle('is-on', l === layer));
    } else layer.style.transform = transform;
    clearTimeout(timer);
    spot.classList.remove('is-on');
    timer = setTimeout(() => {
      spot.style.left = s.x * s.z + tx + '%';
      spot.style.top = s.y * s.z + ty + '%';
      spotLabel.textContent = s.label;
      spotLabel.style.translate = '-50% 0';
      spot.classList.add('is-on');
      const sr = stage.getBoundingClientRect(), lr = spotLabel.getBoundingClientRect();
      let shift = 0;
      if (lr.right > sr.right - 8) shift = sr.right - 8 - lr.right;
      if (lr.left < sr.left + 8) shift = sr.left + 8 - lr.left;
      if (shift) spotLabel.style.translate = `calc(-50% + ${shift}px) 0`;
    }, same ? 380 : 480);
    counter.textContent = `Шаг ${n + 1} из ${steps.length}`;
    items.forEach((li, i) => li.classList.toggle('is-current', i === n));
    dots.forEach((d, i) => d.classList.toggle('is-on', i === n));
    prev.disabled = n === 0;
    next.firstChild.textContent = n === steps.length - 1 ? 'Сначала ' : 'Дальше ';
    current = n;
  }
  prev.addEventListener('click', () => go(current - 1));
  next.addEventListener('click', () => go(current === steps.length - 1 ? 0 : current + 1));
  items.forEach((li, i) => {
    li.tabIndex = 0; li.setAttribute('role', 'button');
    li.addEventListener('click', () => go(i));
    li.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(i); } });
  });
  let sx = 0, sy = 0;
  stage.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; });
  stage.addEventListener('pointerup', e => {
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) go(current + (dx < 0 ? 1 : -1));
  });
  go(0);
});
