// Сборка страниц сайта из файлов данных.
// Запуск из корня репозитория: node tools/build.mjs
// Создаёт страницы разделов, короткие адреса для каждого проекта и работы (/spotted/veranda/, /strangejell/work-1/),
// переадресации со старых адресов, sitemap.xml. Тексты страниц берутся из данных в браузере, здесь только каркас.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const SITE_URL = "https://viaspinosa.art";
const RESERVED = new Set(["cv", "p", "w", "demo", "assets"]);

function load(file) {
  const ctx = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, file), "utf8"), ctx, { filename: file });
  return ctx.window;
}
function write(rel, html) {
  const f = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, html);
  written.push(rel);
}
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const plain = (v) => String(v && typeof v === "object" ? v.ru ?? "" : v ?? "").replace(/[\[\]]/g, "").trim();
const fonts = fs.readFileSync(path.join(ROOT, "assets/fonts.css"), "utf8").trim();
const written = [];

function page({ title, desc, url, css, scripts, body = "", noindex = true, image = "/og.jpg" }) {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
${noindex ? '<meta name="robots" content="noindex">\n' : ""}<link rel="canonical" href="${SITE_URL}${url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="viaspinosa.art">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${SITE_URL}${url}">
<meta property="og:image" content="${SITE_URL}${image}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="stylesheet" href="/assets/grain.css">
<style>
${fonts}
</style>
<link rel="stylesheet" href="${css}">
</head>
<body ${body}>
<div class="gfix grain-surface" aria-hidden="true"></div>
<main id="app"></main>
<noscript><p style="padding:24px">Для этой страницы нужен JavaScript. Написать: <a href="https://t.me/nemonab">t.me/nemonab</a></p></noscript>
<script src="/config.js"></script>
<script src="/assets/site.js"></script>
${scripts.map((s) => `<script src="${s}"></script>`).join("\n")}
<script src="/assets/links.js" defer></script>
</body>
</html>
`;
}
function redirect(to) {
  return `<!DOCTYPE html>
<html lang="ru"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Переадресация</title><meta http-equiv="refresh" content="0; url=${to}"><script>location.replace("${to}"+location.hash)</script></head><body><a href="${to}">${to}</a></body></html>
`;
}
function checkIds(list, where) {
  const seen = new Set();
  for (const x of list) {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(x.id)) throw new Error(`${where}: id «${x.id}» — только латиница, цифры и дефис`);
    if (RESERVED.has(x.id)) throw new Error(`${where}: id «${x.id}» занят служебной страницей`);
    if (seen.has(x.id)) throw new Error(`${where}: id «${x.id}» повторяется`);
    seen.add(x.id);
  }
}

/* ---------- раздел Сергея ---------- */
const SP = load("spotted/projects.js").PROJECTS || [];
checkIds(SP, "spotted/projects.js");
const spScripts = ["/spotted/projects.js", "/spotted/spotted.js"];
write("spotted/index.html", page({
  title: "Сергей Потапов · viaspinosa.art", desc: "Пиар, картинки и маленькие системы: проекты Сергея Потапова.",
  url: "/spotted/", css: "/spotted/spotted.css", scripts: spScripts, body: 'data-page="home"' }));
for (const p of SP) {
  write(`spotted/${p.id}/index.html`, page({
    title: `${plain(p.title)} · Сергей Потапов · viaspinosa.art`, desc: plain(p.line) || `Проект Сергея Потапова: ${plain(p.title)}.`,
    url: `/spotted/${p.id}/`, css: "/spotted/spotted.css", scripts: spScripts, body: `data-page="project" data-id="${p.id}"` }));
}
/* старые адреса /spotted/p/?id → /spotted/id/ */
write("spotted/p/index.html", `<!DOCTYPE html>
<html lang="ru"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Переадресация</title>
<script>var id=location.search.replace(/^\\?/,"").split("&")[0];location.replace(/^[a-z0-9-]+$/.test(id)?"/spotted/"+id+"/":"/spotted/");</script>
</head><body><a href="/spotted/">/spotted/</a></body></html>
`);

/* CV Сергея */
for (const [v, label] of [["auto", "операционка и автоматизация"], ["pr", "пиар и проекты"]]) {
  write(`spotted/cv/${v}/index.html`, page({
    title: `Сергей Потапов — CV, ${label} · viaspinosa.art`, desc: `CV Сергея Потапова: ${label}.`,
    url: `/spotted/cv/${v}/`, css: "/spotted/cv/cv.css", scripts: ["/spotted/cv/data.js", "/spotted/cv/cv.js"], body: `data-version="${v}"` }).replace('<main id="app"></main>', '<main id="cv"></main>'));
}
write("spotted/cv/index.html", redirect("/spotted/cv/auto/"));

/* ---------- раздел Лизы ---------- */
const LZ = load("strangejell/data.js").LIZA || {};
const works = LZ.works || [];
checkIds(works, "strangejell/data.js");
const lzScripts = ["/strangejell/data.js", "/strangejell/strangejell.js"];
write("strangejell/index.html", page({
  title: "Лиза Конышева · viaspinosa.art", desc: "Лиза Конышева: 2D-анимация, иллюстрация, арт-дирекшн.",
  url: "/strangejell/", css: "/strangejell/strangejell.css", scripts: lzScripts, body: 'data-page="home"' }));
for (const w of works) {
  write(`strangejell/${w.id}/index.html`, page({
    title: `${plain(w.title)} · Лиза Конышева · viaspinosa.art`, desc: plain(w.line) || `Работа Лизы Конышевой.`,
    url: `/strangejell/${w.id}/`, css: "/strangejell/strangejell.css", scripts: lzScripts, body: `data-page="work" data-id="${w.id}"` }));
}
write("strangejell/cv/index.html", page({
  title: "Лиза Конышева — CV · viaspinosa.art", desc: "CV Лизы Конышевой: образование, опыт, выставки, программы.",
  url: "/strangejell/cv/", css: "/strangejell/strangejell.css", scripts: lzScripts, body: 'data-page="cv"' }));

/* ---------- лишние страницы от удалённых проектов ---------- */
for (const [dir, ids] of [["spotted", SP.map((p) => p.id)], ["strangejell", works.map((w) => w.id)]]) {
  for (const d of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    if (!d.isDirectory() || RESERVED.has(d.name) || ids.includes(d.name)) continue;
    const f = path.join(ROOT, dir, d.name, "index.html");
    if (fs.existsSync(f) && fs.readFileSync(f, "utf8").includes('data-page="')) { fs.rmSync(path.join(ROOT, dir, d.name), { recursive: true }); console.log("удалено:", `${dir}/${d.name}/`); }
  }
}

/* ---------- sitemap: только открытые страницы (без черновиков) ---------- */
const open = ["/"];
fs.writeFileSync(path.join(ROOT, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  open.map((u) => `  <url><loc>${SITE_URL}${u}</loc></url>`).join("\n") + `\n</urlset>\n`);

console.log(`готово: ${written.length} страниц`);
