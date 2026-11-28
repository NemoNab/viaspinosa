/* Раздел Лизы /strangejell/: главная, страница работы, CV. Данные — strangejell/data.js и config.js.
   Сетка та же, что у Сергея (/spotted/spotted.css): 5 колонок, у Лизы сверху шоурил на три средние. */
(function () {
  var L = window.LIZA || {}, S = window.SITE || {}, V = window.V;
  var me = V.person(S, "l"), tx = V.tx, esc = V.esc, UI = V.UI, safe = V.safe;
  var page = document.body.getAttribute("data-page"), root = document.getElementById("app");
  var BASE = "/strangejell/";
  document.body.classList.add("sj");

  /* светлая палитра Лизы из пульта (первая включённая с её меткой) → переменные сетки */
  var pal = (S.palettes || []).filter(function (p) { return p.by === "l" && p.on !== false; })[0] || { bg: "#e5e4de", fg: "#b83f45", grain: .3 };
  var ink = "#1d1c19", r = document.documentElement.style;
  function mix(c, p, d) { return "color-mix(in srgb, " + c + " " + p + "%, " + (d || pal.bg) + ")"; }
  r.setProperty("--bg", pal.bg); r.setProperty("--f", pal.fg); r.setProperty("--i", ink);
  r.setProperty("--t", mix(ink, 82)); r.setProperty("--m", mix(ink, 52)); r.setProperty("--dim", mix(ink, 38));
  r.setProperty("--ln", mix(ink, 12, "transparent")); r.setProperty("--ln2", mix(ink, 24, "transparent"));
  r.setProperty("--ph", mix(pal.fg, 9, "transparent")); r.setProperty("--g-a", pal.grain == null ? .2 : pal.grain);

  /* направления: [А] анимация, [И] иллюстрация, [О] объекты */
  var K = L.kinds || [];
  function kx(k) { return K.filter(function (y) { return y.k === V.pick(k); })[0]; }
  function kname(x) { return V.lang === "en" && x.en ? x.en : x.k; }
  function ktag(x) { return V.lang === "en" && x.tagEn ? x.tagEn : x.tag; }
  function kl(k) { var x = kx(k); return x ? ktag(x) + " " + kname(x) : V.pick(k) || ""; }
  function cap(s) { s = String(s || ""); return s.charAt(0).toUpperCase() + s.slice(1); }
  function wurl(w) { return BASE + w.id + "/"; }
  function filled(v) { v = V.pick(v); return v && !/^\[/.test(v) ? v : ""; }
  var stText = V.status(S, "l");
  var draft = L.draft ? '<div class="draft">' + esc(UI("черновик раздела · тексты и картинки в работе")) + '</div>' : "";

  function top(active) {
    return '<header class="top"><a href="' + BASE + '">' + esc(me.name || "Лиза Конышева") + '</a>' +
      K.map(function (x, n) { return '<a href="' + BASE + '#k' + (n + 1) + '"' + (active === x.k ? ' class="on"' : '') + '>' + esc(cap(kname(x))) + '</a>'; }).join("") +
      '<div class="tools"><a href="' + BASE + 'cv/"' + (active === "cv" ? ' class="on"' : '') + '>CV</a>' + (safe(me.channel) ? '<a href="' + esc(me.channel) + '">' + esc(UI("канал")) + ' ↗</a>' : '') + V.langSwitch() + '</div></header>';
  }
  function contactLinks() {
    var c = [];
    if (safe(me.write)) c.push('<a href="' + esc(me.write) + '">Telegram ↗</a>');
    if (L.links && L.links.email) c.push('<a href="mailto:' + esc(L.links.email) + '">' + esc(L.links.email) + '</a>');
    [["instagram", "Instagram"], ["behance", "Behance"], ["youtube", "YouTube"]].forEach(function (k) { if (L.links && safe(L.links[k[0]])) c.push('<a href="' + esc(L.links[k[0]]) + '">' + k[1] + ' ↗</a>'); });
    if (safe(me.channel)) c.push('<a href="' + esc(me.channel) + '">' + esc(UI("канал")) + ' ↗</a>');
    return c.join("<br>");
  }
  function bottom(right) {
    return '<div class="bottom"><a href="/">← viaspinosa.art</a><span>viaspinosa.art / strangejell</span><span>' + right + '</span></div>';
  }

  /* ---------- главная ---------- */
  if (page === "home") {
    var h = [draft, top(""), '<div class="cols">'];
    /* профиль: слева на всю высоту */
    h.push('<div class="col profile"><div><div class="meta">' + esc(UI("Профиль")) + '</div><h1>' + tx(me.name || "Лиза Конышева") + '</h1><p>' + tx(me.desc || "") + '</p></div>');
    if (stText) h.push('<div class="status">' + tx(stText) + '</div>');
    h.push('<div class="meta">' + tx(me.city || "") + '</div>');
    h.push('<div class="legend">' + K.map(function (x) { return '<b>' + esc(ktag(x)) + '</b> ' + esc(kname(x)); }).join("<br>") + '</div>');
    h.push('<div class="pills">' + (safe(me.write) ? '<a class="pill main" href="' + esc(me.write) + '">' + esc(UI("написать")) + ' ↗</a>' : '') + '<a class="pill" href="' + BASE + 'cv/">CV</a></div></div>');

    /* шоурил на три средние колонки; самый свежий по последнему году — первым */
    var RE = (L.showreels || []).slice();
    function ly(x) { var m = String(x.years || "").match(/\d{4}/g); return m ? +m[m.length - 1] : 0; }
    RE.sort(function (a, b) { return ly(b) - ly(a); });
    /* пока ролика нет — его год не показываем; заглушка остаётся, только если роликов нет вовсе */
    var withVideo = RE.filter(function (x) { return x.url && safe(x.url); }); if (withVideo.length) RE = withVideo;
    h.push('<div class="reelrow" id="reel"><div class="rhead"><div class="meta">' + esc(UI("шоурил")) + '</div>' +
      (RE.length > 1 ? '<div class="years">' + RE.map(function (x, n) { return '<button type="button" data-r="' + n + '"' + (n ? '' : ' class="on"') + '>' + esc(x.years || "—") + '</button>'; }).join("") + '</div>' : '') +
      '</div><div class="reelbox"></div></div>');

    /* три колонки работ */
    K.forEach(function (x, n) {
      h.push('<div class="col k' + (n + 1) + '" id="k' + (n + 1) + '"><div class="meta chead">' + esc(cap(kname(x))) + '</div>');
      var list = (L.works || []).filter(function (w) { return V.pick(w.kind) === x.k; });
      if (!list.length) h.push('<div class="entry"><p>' + tx("[работы появятся здесь]") + '</p></div>');
      list.forEach(function (w) {
        h.push('<a class="entry" href="' + wurl(w) + '">' + V.img(w.cover, w.ph, w.title) +
          '<div class="meta"><i>' + tx(w.title) + '</i>' + (w.year ? ' / ' + esc(w.year) : '') + '</div>' +
          '<p>' + tx(w.line) + '</p><span class="tag"><b>' + esc(ktag(x)) + '</b>' + (filled(w.role) ? ' · ' + tx(w.role) : '') + '</span></a>');
      });
      h.push('</div>');
    });

    /* справа: обо мне, с кем хочет работать, покупка, CV, контакты */
    h.push('<div class="col side" id="about"><div class="meta">' + esc(UI("обо мне")) + '</div>');
    h.push('<div class="entry about">' + String(V.pick(L.about) || "").split(/\n\s*\n/).map(function (p) { return '<p>' + tx(p) + '</p>'; }).join("") + '</div>');
    if (V.pick(L.clients)) h.push('<div class="entry"><div class="meta">' + esc(UI("хочу работать с")) + '</div><p>' + tx(L.clients) + '</p></div>');
    h.push('<div class="entry"><div class="meta">' + esc(UI("купить работу")) + '</div><p>' + tx(L.buy) + '</p></div>');
    h.push('<div class="entry"><div class="meta">CV</div><p><a href="' + BASE + 'cv/">' + esc(UI("образование, опыт, выставки")) + ' →</a></p></div>');
    h.push('<div class="entry"><div class="meta">' + esc(UI("Контакты")) + '</div><p>' + contactLinks() + '</p></div></div>');
    h.push('</div>');
    h.push(bottom((L.works || []).length + ' ' + esc(UI("работ"))));
    root.innerHTML = h.join("");

    function show(n) {
      var x = RE[n] || {}, u = x.url && safe(x.url) ? x.url : "", box = root.querySelector(".reelbox"), v;
      if (!u) v = '<div class="ph" style="aspect-ratio:16/9">' + esc(UI("шоурил") + " " + (x.years || "")) + '</div>';
      else if (/youtube|youtu\.be|vimeo/.test(u)) v = '<iframe src="' + esc(u) + '" allowfullscreen loading="lazy" title="showreel"></iframe>';
      else v = '<video src="' + esc(u) + '" controls playsinline preload="metadata"' + (x.poster && safe(x.poster) ? ' poster="' + esc(x.poster) + '"' : '') + '></video>';
      box.innerHTML = v + (V.pick(x.caption) ? '<p>' + tx(x.caption) + '</p>' : '');
    }
    show(0);
    Array.prototype.forEach.call(root.querySelectorAll(".years button"), function (b, n, all) {
      b.addEventListener("click", function () { Array.prototype.forEach.call(all, function (y) { y.classList.toggle("on", y === b); }); show(+b.getAttribute("data-r")); });
    });
    if (location.hash) { var t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
  }

  /* ---------- страница работы: как страница проекта у Сергея ---------- */
  if (page === "work") {
    var id = document.body.getAttribute("data-id") || decodeURIComponent(location.search.replace(/^\?/, "").split("&")[0]);
    var W = L.works || [], i = -1; W.forEach(function (w, n) { if (w.id === id) i = n; });
    if (i < 0) { root.innerHTML = draft + top("") + '<div class="ptitle"><a class="back" href="' + BASE + '">← ' + esc(UI("все работы")) + '</a><h1>' + esc(UI("такого проекта нет")) + '</h1></div>'; return; }
    var w = W[i], nx = W[(i + 1) % W.length], x = kx(w.kind) || {}, kn = K.indexOf(x) + 1;
    document.title = V.pick(w.title).replace(/[\[\]]/g, "") + " · " + (me.name || "Лиза Конышева") + " · viaspinosa.art";
    var g = [draft, top(x.k)];
    g.push('<div class="ptitle"><a class="back" href="' + BASE + (kn ? '#k' + kn : '') + '">← ' + esc(UI("все работы")) + '</a><h1>' + tx(w.title) + '</h1></div>');
    g.push('<div class="pmeta"><div>' + esc(UI("Год")) + '<b>' + tx(w.year || "[год]") + '</b></div><div>' + esc(UI("Роль")) + '<b>' + tx(w.role || "[роль]") + '</b></div>' +
      '<div>' + esc(UI("Для кого")) + '<b>' + tx(w.client || "[для кого]") + '</b></div><div>' + esc(UI("Направление")) + '<b>' + esc(kl(w.kind)) + '</b></div></div>');
    g.push('<div class="pbody"><div class="theses"><div><div class="n">01</div><h3>' + esc(UI("о работе")) + '</h3><p>' + tx(w.text || w.line || "[текст]") + '</p>' +
      (w.url && safe(w.url) ? '<p><a href="' + esc(w.url) + '">' + esc(UI("смотреть")) + ' ↗</a></p>' : '') + '</div>');
    g.push('<div class="next">' + esc(UI("следующая работа")) + ': <a href="' + wurl(nx) + '">' + tx(nx.title) + ' →</a></div></div>');
    var imgs = w.images && w.images.length ? w.images : [{ ratio: w.ph || "3:2", label: "главный кадр " + (w.ph || "") }, { ratio: "3:4", label: "раскадровка или скетч" }, { ratio: "1:1", label: "деталь" }];
    var place = ["grid-column:1/7", "grid-column:1/4;margin-top:80px", "grid-column:4/7"];
    g.push('<div class="pgal">' + imgs.map(function (m, n) {
      return '<figure style="' + place[n % 3] + '">' + V.img(m.src, m.ratio, m.cap, m.label) + '<figcaption>' + tx(m.cap || "[подпись]") + '</figcaption></figure>';
    }).join("") + '</div></div>');
    g.push('<div class="bottom"><a href="' + BASE + '">← ' + esc(UI("все работы")) + '</a><span>viaspinosa.art / strangejell</span><a href="' + wurl(nx) + '">' + esc(UI("дальше")) + ' →</a></div>');
    root.innerHTML = g.join("");
  }

  /* ---------- CV: заголовок и разделы списками в той же сетке ---------- */
  if (page === "cv") {
    var C = L.cv || {}, c = [draft, top("cv")];
    c.push('<div class="ptitle"><a class="back" href="' + BASE + '">← ' + esc(UI("раздел")) + '</a><h1>cv</h1></div>');
    c.push('<div class="pmeta"><div>' + esc(UI("Имя")) + '<b>' + tx(me.name || "Лиза Конышева") + '</b></div><div>' + esc(UI("Город")) + '<b>' + tx(me.city || "") + '</b></div>' +
      '<div>' + esc(UI("Направление")) + '<b>' + esc(K.map(function (x) { return ktag(x); }).join(" ")) + '</b></div><div>' + esc(UI("Контакты")) + '<b>' + contactLinks() + '</b></div></div>');
    c.push('<div class="cvgrid">');
    [["образование", C.education], ["опыт", C.experience], ["выставки и фестивали", C.exhibitions], ["программы и техники", (C.software || []).concat(C.techniques || [])]].forEach(function (b, n) {
      c.push('<div class="cvblock"><div class="n">0' + (n + 1) + '</div><h3>' + esc(UI(b[0])) + '</h3><ul>' + (b[1] || []).map(function (y) { return '<li>' + tx(y) + '</li>'; }).join("") + '</ul></div>');
    });
    c.push('</div>');
    c.push(bottom('<a href="' + BASE + '">' + esc(UI("все работы")) + ' →</a>'));
    root.innerHTML = c.join("");
  }
})();
