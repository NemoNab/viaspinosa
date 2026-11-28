/* Раздел Лизы: главная, страница работы и CV. Данные — window.LIZA (data.js) и window.SITE (config.js). */
(function () {
  var L = window.LIZA || {}, S = window.SITE || {}, V = window.V;
  var me = window.V.person(S, "l");
  var tx = V.tx, esc = V.esc, UI = V.UI, safe = V.safe;
  var page = document.body.getAttribute("data-page"), root = document.getElementById("app");
  var BASE = "/strangejell/";

  /* палитра Лизы из пульта: первая включённая с её меткой */
  var pal = (S.palettes || []).filter(function (p) { return p.by === "l" && p.on !== false; })[0];
  if (pal) {
    var r = document.documentElement.style;
    r.setProperty("--bg", pal.bg); r.setProperty("--ink", pal.fg);
    r.setProperty("--t", "color-mix(in srgb, " + pal.fg + " 85%, " + pal.bg + ")");
    r.setProperty("--m", "color-mix(in srgb, " + pal.fg + " 55%, " + pal.bg + ")");
    r.setProperty("--ln", "color-mix(in srgb, " + pal.fg + " 18%, transparent)");
    r.setProperty("--ph", "color-mix(in srgb, " + pal.fg + " 9%, transparent)");
    if (pal.grain != null) r.setProperty("--g-a", pal.grain);
  }

  function ph(r, label) { return '<div class="ph" style="aspect-ratio:' + String(r || "4:3").replace(":", "/") + '">' + esc(label || r) + '</div>'; }
  function wurl(w) { return BASE + w.id + "/"; }
  /* метка направления: «[А] анимация», в английской версии «[А] animation» */
  function kl(k) {
    var x = (L.kinds || []).filter(function (y) { return y.k === V.pick(k); })[0];
    var en = V.lang === "en";
    return x ? (en && x.tagEn ? x.tagEn : x.tag) + " " + (en && x.en ? x.en : x.k) : V.pick(k) || "";
  }
  var stText = V.status(S, "l");
  var draft = L.draft ? '<div class="draft">' + esc(UI("черновик раздела · тексты и картинки в работе")) + '</div>' : "";

  function head(active) {
    var nav = [["#works", "работы"], ["#reel", "шоурил"], ["#about", "обо мне"], [BASE + "cv/", "cv"]];
    return '<div class="wrap"><header class="head"><a href="' + BASE + '">' + esc(String(me.name || "Лиза Конышева").toLowerCase()) + '</a><nav>' +
      nav.map(function (n) { var h = n[0].charAt(0) === "#" ? BASE + n[0] : n[0]; return '<a href="' + h + '"' + (active === n[1] ? ' class="on"' : '') + '>' + esc(UI(n[1])) + '</a>'; }).join("") +
      '</nav>' + V.langSwitch() + '</header></div>';
  }
  function contacts() {
    var c = [];
    if (safe(me.write)) c.push('<a class="pill main" href="' + esc(me.write) + '">' + esc(UI("написать")) + ' ↗</a>');
    if (L.links && L.links.email) c.push('<a class="pill" href="mailto:' + esc(L.links.email) + '">' + esc(L.links.email) + '</a>');
    [["instagram", "Instagram"], ["behance", "Behance"], ["youtube", "YouTube"]].forEach(function (k) {
      if (L.links && safe(L.links[k[0]])) c.push('<a class="pill" href="' + esc(L.links[k[0]]) + '">' + k[1] + ' ↗</a>');
    });
    if (safe(me.channel)) c.push('<a class="pill" href="' + esc(me.channel) + '">' + esc(UI("канал")) + ' ↗</a>');
    return '<div class="pills">' + c.join("") + '</div>';
  }
  function foot() {
    return '<div class="wrap"><div class="foot"><a class="big" href="' + esc(safe(me.write) ? me.write : BASE) + '">' + esc(UI("написать")) + ' ↗</a>' +
      '<span class="mono"><a href="/">← viaspinosa.art</a></span></div></div>';
  }

  /* ---------- главная ---------- */
  if (page === "home") {
    var h = [draft, head("")];
    h.push('<div class="wrap"><div class="hero"><h1>' + tx(me.name || "Лиза Конышева") + '</h1><div class="side">' +
      (stText ? '<div class="status">' + tx(stText) + '</div>' : '') +
      '<p>' + tx(me.desc) + '</p><div class="mono">' + tx(me.city) + '</div>' + contacts() + '</div></div>');

    /* шоурил */
    var REELS = (L.showreels || (L.showreel ? [L.showreel] : [])).slice();
    /* самый свежий — по последнему году в «годах» */
    function lastYear(r) { var m = String(r.years || "").match(/\d{4}/g); return m ? +m[m.length - 1] : 0; }
    REELS.sort(function (a, b) { return lastYear(b) - lastYear(a); });
    h.push('<section id="reel"><span class="k">' + esc(UI("шоурил")) + '</span>' +
      (REELS.length > 1 ? '<div class="filters reel-years">' + REELS.map(function (r, n) { return '<button data-reel="' + n + '"' + (n ? '' : ' class="on"') + '>' + esc(r.years || "—") + '</button>'; }).join("") + '</div>' : '') +
      '<div class="reel" id="reel-box"></div></section>');

    /* работы */
    var K = L.kinds || [], kinds = K.map(function (x) { return x.k; });
    (L.works || []).forEach(function (w) { if (w.kind && kinds.indexOf(w.kind) < 0) kinds.push(w.kind); });
    h.push('<section id="works"><span class="k">' + esc(UI("работы")) + '</span>');
    if (kinds.length > 1) h.push('<div class="filters"><button class="on" data-kind="">' + esc(UI("все")) + '</button>' + kinds.map(function (k) { return '<button data-kind="' + esc(k) + '">' + esc(kl(k)) + '</button>'; }).join("") + '</div>');
    h.push('<div class="grid">');
    (L.works || []).forEach(function (w) {
      h.push('<a class="work" data-kind="' + esc(w.kind) + '" href="' + wurl(w) + '">' + V.img(w.cover, w.ph, w.title, w.kind) +
        '<div class="mono">' + esc(kl(w.kind)) + (w.year ? ' · ' + esc(w.year) : '') + (V.pick(w.role) && !/^\[/.test(V.pick(w.role)) ? ' · ' + tx(w.role) : '') + '</div><h3>' + tx(w.title) + '</h3><p>' + tx(w.line) + '</p></a>');
    });
    h.push('</div></section>');

    /* серии */
    h.push('<section id="series"><span class="k">' + esc(UI("личные серии")) + '</span><div class="two">');
    (L.series || []).forEach(function (s) { h.push('<div class="work">' + V.img(s.cover, s.ph, s.title, s.kind) + '<h3>' + tx(s.title) + '</h3><p>' + tx(s.text) + '</p></div>'); });
    h.push('</div></section>');

    /* обо мне */
    h.push('<section id="about"><span class="k">' + esc(UI("обо мне")) + '</span><div class="about"><div><p class="mono">хочу работать с</p><p>' + tx(L.clients) + '</p></div><div>' +
      String(V.pick(L.about) || "").split(/\n\s*\n/).map(function (p) { return '<p>' + tx(p) + '</p>'; }).join("") +
      '<p class="mono" style="margin-top:24px">' + esc(UI("купить работу")) + '</p><p>' + tx(L.buy) + '</p>' +
      '<div class="pills" style="margin-top:16px"><a class="pill" href="' + BASE + 'cv/">CV →</a></div></div></div></section></div>');
    h.push(foot());
    root.innerHTML = h.join("");

    /* шоурил: показываем выбранный, видео грузится только по клику на год или play */
    function reel(n) {
      var R = REELS[n] || {}, box = document.getElementById("reel-box"); if (!box) return;
      var u = R.url && safe(R.url) ? R.url : "", vid;
      if (!u) vid = ph("16:9", UI("шоурил") + " " + (R.years || ""));
      else if (/youtube|youtu\.be|vimeo/.test(u)) vid = '<iframe src="' + esc(u) + '" allowfullscreen loading="lazy" title="showreel"></iframe>';
      else vid = '<video src="' + esc(u) + '" controls playsinline preload="metadata"' + (R.poster && safe(R.poster) ? ' poster="' + esc(R.poster) + '"' : '') + '></video>';
      box.innerHTML = vid + '<p>' + tx(R.caption) + '</p>';
    }
    reel(0);
    Array.prototype.forEach.call(root.querySelectorAll(".reel-years button"), function (b, n, all) {
      b.addEventListener("click", function () {
        Array.prototype.forEach.call(all, function (x) { x.classList.toggle("on", x === b); });
        reel(+b.getAttribute("data-reel"));
      });
    });

    var fb = root.querySelectorAll("#works .filters button");
    Array.prototype.forEach.call(fb, function (b) {
      b.addEventListener("click", function () {
        Array.prototype.forEach.call(fb, function (x) { x.classList.toggle("on", x === b); });
        var k = b.getAttribute("data-kind");
        Array.prototype.forEach.call(root.querySelectorAll(".grid .work"), function (w) { w.hidden = !!k && w.getAttribute("data-kind") !== k; });
      });
    });
    if (location.hash) { var t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
  }

  /* ---------- страница работы ---------- */
  if (page === "work") {
    var id = document.body.getAttribute("data-id") || decodeURIComponent(location.search.replace(/^\?/, "").split("&")[0]);
    var W = L.works || [], i = -1; W.forEach(function (w, n) { if (w.id === id) i = n; });
    if (i < 0) { root.innerHTML = draft + head("работы") + '<div class="wrap wtitle"><a class="mono" href="' + BASE + '#works">← ' + esc(UI("все работы")) + '</a><h1>' + esc(UI("такого проекта нет")) + '</h1></div>'; return; }
    var w = W[i], nx = W[(i + 1) % W.length];
    document.title = V.pick(w.title).replace(/[\[\]]/g, "") + " · Лиза Конышева · viaspinosa.art";
    var g = [draft, head("работы"), '<div class="wrap">'];
    g.push('<div class="wtitle"><a class="mono" href="' + BASE + '#works">← ' + esc(UI("все работы")) + '</a><h1>' + tx(w.title) + '</h1></div>');
    g.push('<div class="wmeta"><div>' + esc(UI("Год")) + '<b>' + tx(w.year || "[год]") + '</b></div><div>' + esc(UI("Роль")) + '<b>' + tx(w.role) + '</b></div><div>для кого<b>' + tx(w.client) + '</b></div><div>' + esc(UI("Направление")) + '<b>' + esc(kl(w.kind)) + '</b></div></div>');
    g.push('<div class="wbody"><div><p>' + tx(w.text || w.line) + '</p><p class="mono" style="margin-top:32px">' + esc(UI("дальше")) + ': <a href="' + wurl(nx) + '">' + tx(nx.title) + ' →</a></p></div>' +
      '<div class="wgal">' + (w.images && w.images.length ? w.images : [{ ratio: w.ph, label: "главный кадр " + (w.ph || "") }, { ratio: "16:9", label: "раскадровка или скетч" }]).map(function (m) {
        return '<figure>' + V.img(m.src, m.ratio, m.cap, m.label) + '<figcaption>' + tx(m.cap || "[подпись]") + '</figcaption></figure>';
      }).join("") + '</div></div></div>');
    g.push(foot());
    root.innerHTML = g.join("");
  }

  /* ---------- CV ---------- */
  if (page === "cv") {
    var C = L.cv || {}, c = [draft, head("cv"), '<div class="wrap">'];
    c.push('<div class="wtitle"><span class="mono">cv</span><h1>' + tx(me.name || "Лиза Конышева") + '</h1></div>');
    [["образование", C.education], ["опыт", C.experience], ["выставки и фестивали", C.exhibitions], ["программы и техники", (C.software || []).concat(C.techniques || [])]].forEach(function (b) {
      c.push('<section><span class="k">' + esc(UI(b[0])) + '</span><ul class="list">' + (b[1] || []).map(function (x) { return '<li>' + tx(x) + '</li>'; }).join("") + '</ul></section>');
    });
    c.push('<section>' + contacts() + '</section></div>');
    c.push(foot());
    root.innerHTML = c.join("");
  }
})();
