/* Собирает главную раздела и страницу проекта из window.PROJECTS и window.SITE (config.js). */
(function () {
  var P = window.PROJECTS || [], CATS = window.CATS || {}, S = window.SITE || {};
  var me = (S.people && S.people.n) || {};
  var page = document.body.getAttribute("data-page");
  var root = document.getElementById("app");
  var SHORT = /(^|[\s(«])([А-Яа-яЁёA-Za-z]{1,2}|без|для|над|под|при|про|что|как|или|это|все|так) (?=\S)/g;
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function nb(t) { t = String(t || "").replace(/ (—|–)/g, " $1"); var p; do { p = t; t = t.replace(SHORT, "$1$2 "); } while (p !== t); return t; }
  function tx(s) { return esc(nb(s)).replace(/\[([^\]]*)\]/g, function (m, x) { return /^(PR|Д|А|Т)$/.test(x) ? m : '<span class="ph-t">' + x + '</span>'; }); }
  function safe(u) { return typeof u === "string" && /^(https?:|mailto:|tg:)/i.test(u); }
  function ph(r, label, h) { return '<div class="ph" style="aspect-ratio:' + r.replace(":", "/") + (h ? ';height:' + h : '') + '">' + esc(label || r) + '</div>'; }
  function url(p) { return "/spotted/p/?" + p.id; }
  var status = (S.status && (S.status.n || S.status)) || {};

  function top(active) {
    return '<header class="top">' +
      '<a href="/spotted/">Сергей Потапов</a>' +
      ["d", "pr", "a"].map(function (k) { return '<a href="/spotted/#' + k + '"' + (k === active ? ' class="on"' : '') + '>' + esc(CATS[k]) + '</a>'; }).join("") +
      '<div class="tools"><a href="/spotted/cv/auto/">CV</a>' + (safe(me.channel) ? '<a href="' + esc(me.channel) + '">Канал ↗</a>' : '') +
      '<span><b>RU</b> / EN</span></div></header>';
  }
  var draft = '<div class="draft">черновик раздела · тексты и картинки в работе</div>';

  /* ---------- главная ---------- */
  if (page === "home") {
    var h = [draft, top("")];
    h.push('<div class="cols">');
    /* профиль */
    h.push('<div class="col profile"><div><div class="meta">Профиль</div><h1>' + tx(me.name || "Сергей Потапов") + '</h1><p>' + tx(me.desc || "") + '</p></div>');
    if (status.on && status.text) h.push('<div class="status">' + tx(status.text) + '</div>');
    h.push('<div class="meta">' + tx(me.city || "") + '</div>');
    h.push('<div class="legend"><b>[PR]</b> пиар и партнёрства<br><b>[Д]</b> дизайн и картинки<br><b>[А]</b> автоматизация</div>');
    h.push('<div class="pills">' + (safe(me.write) ? '<a class="pill main" href="' + esc(me.write) + '">написать ↗</a>' : '') +
      '<a class="pill" href="/spotted/cv/auto/">CV</a></div></div>');
    /* три колонки проектов */
    ["d", "pr", "a"].forEach(function (k) {
      h.push('<div class="col" id="' + k + '"><div class="meta chead">' + esc(CATS[k]) + '</div>');
      P.filter(function (p) { return p.cat === k; }).forEach(function (p) {
        h.push('<a class="entry" href="' + url(p) + '">' + (p.ph ? ph(p.ph) : '') +
          '<div class="meta"><i>' + tx(p.title) + '</i>' + (p.year ? ' / ' + esc(p.year) : '') + '</div>' +
          '<p>' + tx(p.line) + '</p><span class="tag">' + esc(p.tags || "") + '</span></a>');
      });
      h.push('</div>');
    });
    /* канал и контакты */
    h.push('<div class="col"><div class="meta">Канал и контакты</div>');
    if (safe(me.channel)) h.push('<a class="entry" href="' + esc(me.channel) + '"><div class="meta"><i>незаметные слова</i></div><p>[о канале одной строкой]</p><span class="tag">' + esc(me.channel.replace(/^https?:\/\//, "")) + ' ↗</span></a>');
    h.push('<div class="entry"><div class="meta">CV</div><p><a href="/spotted/cv/auto/">операционка и автоматизация →</a><br><a href="/spotted/cv/pr/">пиар и проекты →</a></p></div>');
    h.push('<div class="entry"><div class="meta">Контакты</div><p>' + (safe(me.write) ? '<a href="' + esc(me.write) + '">Telegram ↗</a><br>' : '') + '<a href="mailto:nemonab@gmail.com">nemonab@gmail.com</a></p></div>');
    h.push('</div></div>');
    h.push('<div class="bottom"><a href="/">← viaspinosa.art</a><span>viaspinosa.art / spotted</span><span>' + P.length + ' проектов</span></div>');
    root.innerHTML = h.join("");
    if (location.hash) { var t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
  }

  /* ---------- страница проекта ---------- */
  if (page === "project") {
    var id = decodeURIComponent(location.search.replace(/^\?/, "").split("&")[0]);
    var i = -1; P.forEach(function (p, n) { if (p.id === id) i = n; });
    if (i < 0) { root.innerHTML = draft + top("") + '<div class="ptitle"><a class="back" href="/spotted/">← все проекты</a><h1>такого проекта нет</h1></div>'; return; }
    var p = P[i], nx = P[(i + 1) % P.length];
    document.title = p.title + " · Сергей Потапов · viaspinosa.art";
    var g = [draft, top(p.cat)];
    g.push('<div class="ptitle"><a class="back" href="/spotted/#' + p.cat + '">← все проекты</a><h1>' + tx(p.title) + '</h1>' +
      (p.concept ? '<span class="tag concept">концепт, не внедрён</span>' : '') + '</div>');
    g.push('<div class="pmeta"><div>Год<b>' + tx(p.year || "[год]") + '</b></div><div>Где<b>' + tx(p.where || "[где]") + '</b></div>' +
      '<div>Роль<b>' + tx(p.role || "[роль]") + '</b></div><div>Направление<b>' + esc(p.tags || "") + '</b></div></div>');
    g.push('<div class="pbody"><div class="theses">');
    [["Задача", p.task], ["Что я сделал", p.did], ["Результат", p.result]].forEach(function (t, n) {
      g.push('<div><div class="n">0' + (n + 1) + '</div><h3>' + esc(t[0]) + '</h3><p>' + tx(t[1] || "[текст]") + '</p></div>');
    });
    g.push('<div class="next">следующий проект: <a href="' + url(nx) + '">' + tx(nx.title) + ' →</a></div></div>');
    g.push('<div class="pgal">' +
      '<figure style="grid-column:1/7">' + ph("3:2", "главная картинка 3:2") + '<figcaption>' + tx('[подпись]') + '</figcaption></figure>' +
      '<figure style="grid-column:1/4;margin-top:80px">' + ph("3:4", "картинка 3:4") + '<figcaption>' + tx('[подпись]') + '</figcaption></figure>' +
      '<figure style="grid-column:4/7">' + ph("1:1", "картинка 1:1") + '<figcaption>' + tx('[подпись]') + '</figcaption></figure></div></div>');
    g.push('<div class="bottom"><a href="/spotted/">← все проекты</a><span>viaspinosa.art / spotted</span><a href="' + url(nx) + '">дальше →</a></div>');
    root.innerHTML = g.join("");
  }
})();
