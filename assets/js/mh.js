/* Южный × Markthal: шапка, активный пункт меню, карусель категорий, расширение арки */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Тень у шапки после прокрутки
  const header = $('.mh-header');
  const onScroll = () => header && header.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Подсветка текущей страницы в меню
  const page = document.body.dataset.page;
  $$(`[data-page="${page}"]`).forEach(a => a.setAttribute('aria-current', 'page'));

  // Карусель категорий: стрелки по бокам (компьютер) и счётчик 01/13 (телефон)
  const track = $('[data-mh-carousel]');
  if (track) {
    const items = [...track.children];
    const prevs = $$('[data-mh-prev]'), nexts = $$('[data-mh-next]');
    const now = $('[data-mh-now]'), total = $('[data-mh-total]');
    const pad = n => String(n).padStart(2, '0');
    const step = () => items[1] ? items[1].offsetLeft - items[0].offsetLeft : track.clientWidth;
    const index = () => Math.round(track.scrollLeft / step());
    const sides = $$('.mh-side');
    const placeSides = () => {
      const img = $('.mh-cat-img', track);
      if (!img) return;
      const top = img.offsetTop + img.offsetHeight / 2;
      sides.forEach(b => { b.style.top = (top - b.offsetHeight / 2) + 'px'; });
    };
    addEventListener('resize', placeSides);
    addEventListener('load', placeSides);
    placeSides();
    const sync = () => {
      const atStart = track.scrollLeft < 4;
      const atEnd = track.scrollLeft + track.clientWidth > track.scrollWidth - 4;
      prevs.forEach(b => { b.disabled = atStart; b.classList.toggle('mh-round-on', !atStart); });
      nexts.forEach(b => { b.disabled = atEnd; b.classList.toggle('mh-round-on', !atEnd); });
      if (now) now.textContent = pad(Math.min(index() + 1, items.length));
    };
    if (total) total.textContent = pad(items.length);
    prevs.forEach(b => b.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' })));
    nexts.forEach(b => b.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' })));
    track.addEventListener('scroll', sync, { passive: true });
    addEventListener('resize', sync);
    sync();
  }

  // Арка как «Food News» у Markthal: сначала узкая, при прокрутке расширяется до полной ширины
  const arch = $('.mh-arch');
  if (arch && !reduce) {
    let ticking = false;
    const grow = () => {
      ticking = false;
      const r = arch.getBoundingClientRect();
      const vh = innerHeight;
      // 0 — верх арки у нижнего края экрана, 1 — верх арки поднялся на 70% экрана
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.7)));
      const min = innerWidth < 900 ? 0.88 : 0.72;
      arch.style.setProperty('--grow', (min + (1 - min) * p).toFixed(4));
    };
    const ask = () => { if (!ticking) { ticking = true; requestAnimationFrame(grow); } };
    addEventListener('scroll', ask, { passive: true });
    addEventListener('resize', ask);
    grow();
  }
})();

/* Слайдер «Уют» на странице магазина: смена каждые 6 с, точки, пауза при наведении */
(() => {
  const root = document.querySelector('[data-cz]');
  if (!root) return;
  const slides = [...root.querySelectorAll('[data-cz-slide]')];
  const dotsBox = root.querySelector('.cz-dots');
  let i = 0, timer;
  const dots = slides.map((_, n) => {
    const b = document.createElement('button');
    b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-label', `Слайд ${n + 1}`);
    b.addEventListener('click', () => { show(n); restart(); });
    dotsBox.append(b); return b;
  });
  function show(n) {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle('is-on', k === i));
    dots.forEach((d, k) => d.setAttribute('aria-selected', String(k === i)));
  }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const restart = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => show(i + 1), 6000); };
  root.addEventListener('mouseenter', () => clearInterval(timer));
  root.addEventListener('mouseleave', restart);
  show(0); restart();
})();

/* Плавные переходы между страницами и появление блоков при прокрутке */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const html = document.documentElement;

  // Переход по ссылке на другую страницу сайта: страница мягко гаснет, новая проявляется (CSS pageIn)
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || reduce || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target && a.target !== '_self') return;
    const url = new URL(a.href, location.href);
    if (!/\.html$/.test(url.pathname) || url.origin !== location.origin) return;
    if (url.pathname === location.pathname) return; // якорь на этой же странице — обычная плавная прокрутка
    e.preventDefault();
    html.classList.add('is-leaving');
    setTimeout(() => { location.href = url.href; }, 260);
  });
  // Возврат кнопкой «Назад» из кэша — страница не должна остаться погасшей
  addEventListener('pageshow', () => html.classList.remove('is-leaving'));

  if (reduce || !('IntersectionObserver' in window)) return;

  // Какие блоки проявляются: крупные секции целиком, карточки — по очереди с небольшой задержкой
  const groups = [
    ['.mh-intro > *, .mh-page-head > *', 90],
    ['.mh-cats .mh-cat', 70],
    ['.mh-grid .mh-cat', 70],
    ['.mh-center', 0],
    ['.mh-arch-wrap', 0],
    ['.st-card', 110],
    ['.mh-scheme > *', 90],
    ['.rt', 0],
    ['.cz-perks li', 110],
    ['.pn', 0],
  ];
  const items = [];
  groups.forEach(([sel, stagger]) => {
    document.querySelectorAll(sel).forEach((el, i) => {
      if (el.classList.contains('reveal') || el.closest('.reveal')) return; // у этих уже есть своё появление
      el.classList.add('rv');
      el.style.setProperty('--rv-d', `${stagger ? (i % 5) * stagger : 0}ms`);
      items.push(el);
    });
  });
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('rv-in'); io.unobserve(en.target); }
  }), { rootMargin: '0px 0px -10% 0px' });
  items.forEach(el => io.observe(el));
  // Страховка: через 3 с показать всё, что почему-то не проявилось
  setTimeout(() => items.forEach(el => el.classList.add('rv-in')), 3000);
})();
