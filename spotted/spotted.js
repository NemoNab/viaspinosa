/* Собирает главную раздела и страницу проекта из window.PROJECTS и window.SITE (config.js). */
(function () {
  var P = window.PROJECTS || [], CATS = window.CATS || {}, S = window.SITE || {};
  var me = window.V.person(S, "n");
  var page = document.body.getAttribute("data-page");
  var root = document.getElementById("app");
  var V = window.V, esc = V.esc, tx = V.tx, safe = V.safe, UI = V.UI;
  function ph(r, label, h) { return '<div class="ph" style="aspect-ratio:' + r.replace(":", "/") + (h ? ';height:' + h : '') + '">' + esc(label || r) + '</div>'; }
  function url(p) { return "/spotted/" + p.id + "/"; }
  var stText = V.status(S, "n");

  function top(active) {
    return '<header class="top">' +
      '<a href="/spotted/">' + esc(me.name || "Сергей Потапов") + '</a>' +
      ["d", "pr", "a"].map(function (k) { return '<a href="/spotted/#' + k + '"' + (k === active ? ' class="on"' : '') + '>' + esc(UI(CATS[k])) + '</a>'; }).join("") +
      '<div class="tools"><a href="/spotted/cv/auto/">CV</a>' + (safe(me.channel) ? '<a href="' + esc(me.channel) + '">' + esc(UI("канал")) + ' ↗</a>' : '') +
      V.langSwitch() + '</div></header>';
  }
  var draft = '<div class="draft">' + esc(UI("черновик раздела · тексты и картинки в работе")) + '</div>';

  /* ---------- главная ---------- */
  if (page === "home") {
    var h = [draft, top("")];
    h.push('<div class="cols">');
    /* профиль */
    h.push('<div class="col profile"><div><div class="meta">' + esc(UI("Профиль")) + '</div><h1>' + tx(me.name || "Сергей Потапов") + '</h1><p>' + tx(me.desc || "") + '</p></div>');
    if (stText) h.push('<div class="status">' + tx(stText) + '</div>');
    h.push('<div class="meta">' + tx(me.city || "") + '</div>');
    h.push('<div class="legend"><b>[PR]</b> пиар и партнёрства<br><b>[Д]</b> дизайн и картинки<br><b>[А]</b> автоматизация</div>');
    h.push('<div class="pills">' + (safe(me.write) ? '<a class="pill main" href="' + esc(me.write) + '">' + esc(UI("написать")) + ' ↗</a>' : '') +
      '<a class="pill" href="/spotted/cv/auto/">CV</a></div></div>');
    /* три колонки проектов */
    ["d", "pr", "a"].forEach(function (k) {
      h.push('<div class="col" id="' + k + '"><div class="meta chead">' + esc(CATS[k]) + '</div>');
      P.filter(function (p) { return p.cat === k; }).forEach(function (p) {
        h.push('<a class="entry" href="' + url(p) + '">' + (p.cover || p.ph ? V.img(p.cover, p.ph, p.title) : '') +
          '<div class="meta"><i>' + tx(p.title) + '</i>' + (p.year ? ' / ' + esc(p.year) : '') + '</div>' +
          '<p>' + tx(p.line) + '</p><span class="tag">' + esc(p.tags || "") + (p.demo ? ' · <b class="demo-tag">' + esc(UI("демо")) + '</b>' : '') + '</span></a>');
      });
      h.push('</div>');
    });
    /* канал и контакты */
    h.push('<div class="col"><div class="meta">' + esc(UI("Канал и контакты")) + '</div>');
    if (safe(me.channel)) h.push('<a class="entry" href="' + esc(me.channel) + '"><div class="meta"><i>незаметные слова</i></div><p>[о канале одной строкой]</p><span class="tag">' + esc(me.channel.replace(/^https?:\/\//, "")) + ' ↗</span></a>');
    h.push('<div class="entry"><div class="meta">CV</div><p><a href="/spotted/cv/auto/">операционка и автоматизация →</a><br><a href="/spotted/cv/pr/">пиар и проекты →</a></p></div>');
    h.push('<div class="entry"><div class="meta">' + esc(UI("Контакты")) + '</div><p>' + (safe(me.write) ? '<a href="' + esc(me.write) + '">Telegram ↗</a><br>' : '') + '<a href="mailto:nemonab@gmail.com">nemonab@gmail.com</a></p></div>');
    h.push('</div></div>');
    h.push('<div class="bottom"><a href="/">← viaspinosa.art</a><span>viaspinosa.art / spotted</span><span>' + P.length + ' ' + esc(UI("проектов")) + '</span></div>');
    root.innerHTML = h.join("");
    if (location.hash) { var t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
  }

  /* ---------- страница проекта ---------- */
  if (page === "project") {
    var id = document.body.getAttribute("data-id") || decodeURIComponent(location.search.replace(/^\?/, "").split("&")[0]);
    var i = -1; P.forEach(function (p, n) { if (p.id === id) i = n; });
    if (i < 0) { root.innerHTML = draft + top("") + '<div class="ptitle"><a class="back" href="/spotted/">← ' + esc(UI("все проекты")) + '</a><h1>' + esc(UI("такого проекта нет")) + '</h1></div>'; return; }
    var p = P[i], nx = P[(i + 1) % P.length];
    document.title = String(V.pick(p.title)).replace(/[\[\]]/g, "") + " · " + (me.name || "Сергей Потапов") + " · viaspinosa.art";
    var g = [draft, top(p.cat)];
    g.push('<div class="ptitle"><a class="back" href="/spotted/#' + p.cat + '">← ' + esc(UI("все проекты")) + '</a><h1>' + tx(p.title) + '</h1>' +
      (p.concept ? '<span class="tag concept">' + esc(UI("концепт, не внедрён")) + '</span>' : '') +
      (p.demo && /^\/spotted\/demo\//.test(p.demo) ? '<div class="pills" style="margin-top:22px"><a class="pill main" href="' + esc(p.demo) + '">' + esc(UI("демо")) + ' →</a></div>' : '') + '</div>');
    g.push('<div class="pmeta"><div>' + esc(UI("Год")) + '<b>' + tx(p.year || "[год]") + '</b></div><div>' + esc(UI("Где")) + '<b>' + tx(p.where || "[где]") + '</b></div>' +
      '<div>' + esc(UI("Роль")) + '<b>' + tx(p.role || "[роль]") + '</b></div><div>' + esc(UI("Направление")) + '<b>' + esc(p.tags || "") + '</b></div></div>');
    g.push('<div class="pbody"><div class="theses">');
    [["Задача", p.task], ["Что я сделал", p.did], ["Результат", p.result]].forEach(function (t, n) {
      g.push('<div><div class="n">0' + (n + 1) + '</div><h3>' + esc(UI(t[0])) + '</h3><p>' + tx(t[1] || "[текст]") + '</p></div>');
    });
    g.push('<div class="next">' + esc(UI("следующий проект")) + ': <a href="' + url(nx) + '">' + tx(nx.title) + ' →</a></div></div>');
    /* галерея: p.images = [{ src, ratio, cap }]; пока картинок нет — три плашки */
    var imgs = p.images && p.images.length ? p.images : [{ ratio: "3:2", label: "главная картинка 3:2" }, { ratio: "3:4", label: "картинка 3:4" }, { ratio: "1:1", label: "картинка 1:1" }];
    var place = ["grid-column:1/7", "grid-column:1/4;margin-top:80px", "grid-column:4/7"];
    g.push('<div class="pgal">' + imgs.map(function (m, n) {
      return '<figure style="' + (place[n % 3]) + '">' + V.img(m.src, m.ratio, m.cap, m.label) + '<figcaption>' + tx(m.cap || '[подпись]') + '</figcaption></figure>';
    }).join("") + '</div></div>');
    g.push('<div class="bottom"><a href="/spotted/">← ' + esc(UI("все проекты")) + '</a><span>viaspinosa.art / spotted</span><a href="' + url(nx) + '">дальше →</a></div>');
    root.innerHTML = g.join("");
  }
})();
