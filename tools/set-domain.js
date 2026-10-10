// Подставляет адрес сайта во все файлы, где он нужен поисковикам
// (canonical, превью для соцсетей, микроразметка, sitemap.xml, robots.txt).
// Запуск из папки сайта:  node tools/set-domain.js https://ваш-домен.ru
// Можно запускать повторно — если домен поменяется, просто укажите новый.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const cfgFile = path.join(__dirname, 'site.json');
const cfg = JSON.parse(fs.readFileSync(cfgFile, 'utf8'));

let next = (process.argv[2] || '').trim().replace(/\/+$/, '');
if (!/^https:\/\/[a-z0-9а-яё.-]+\.[a-zа-яё]{2,}$/i.test(next)) {
  console.error('Укажите адрес сайта с https и без слэша в конце, например:\n  node tools/set-domain.js https://yuzhny-chelny.ru');
  process.exit(1);
}
// Кириллический домен (.рф) переводим в punycode — так его понимают все поисковики
const url = new URL(next);
next = `${url.protocol}//${url.hostname}`;

const files = ['index.html', 'kategorii.html', 'magazin.html', '404.html', 'sitemap.xml', 'robots.txt'];
let total = 0;
for (const f of files) {
  const p = path.join(root, f);
  if (!fs.existsSync(p)) continue;
  const s = fs.readFileSync(p, 'utf8');
  const n = s.split(cfg.domain).length - 1;
  if (n) { fs.writeFileSync(p, s.split(cfg.domain).join(next)); total += n; console.log(`${f}: ${n}`); }
}
fs.writeFileSync(cfgFile, JSON.stringify({ domain: next }, null, 2) + '\n');
console.log(`Готово: ${cfg.domain} → ${next} (замен: ${total})`);
