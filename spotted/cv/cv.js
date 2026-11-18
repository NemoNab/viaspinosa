/* Собирает страницу CV из window.CV. Версия задаётся атрибутом data-version на <body>. */
(function () {
  var C = window.CV, root = document.getElementById("cv");
  if (!C || !root) return;
  var key = document.body.getAttribute("data-version") || "auto";
  var V = C.versions[key];
  var SHORT = /(^|[\s(«])([А-Яа-яЁёA-Za-z]{1,2}|без|для|над|под|при|про|что|как|или|это|все|так) (?=\S)/g;

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function nb(t) { t = String(t || "").replace(/ (—|–)/g, " $1"); var p; do { p = t; t = t.replace(SHORT, "$1$2 "); } while (p !== t); return t; }
  /* текст: типографика + заглушки [в скобках] выделены */
  function tx(s) {
    s = nb(s);
    return esc(s).replace(/\[([^\]]*)\]/g, '<span class="ph">$1</span>');
  }
  function isPh(s) { return /^\s*\[.*\]\s*$/.test(s || ""); }

  var ORDER = ["auto", "pr"];   /* порядок в переключателе постоянный, активная версия подсвечена */
  var href = { auto: "/spotted/cv/auto/", pr: "/spotted/cv/pr/" };
  var h = [];

  if (C.draft) h.push('<div class="draft">черновик · тексты в работе</div>');
  h.push('<div class="wrap">');
  h.push('<div class="bar"><a href="/spotted/">← раздел</a>' +
    '<span class="hide-m vswitch">cv: ' + ORDER.map(function (k) { return '<a' + (k === key ? ' class="on" aria-current="page"' : '') + ' href="' + href[k] + '">' + esc(C.versions[k].label) + '</a>'; }).join(" · ") + '</span>' +
    '<span class="st">● ' + tx(V.status) + '</span></div>');

  /* шапка */
  h.push('<header class="hero row"><h1 class="name">' + esc(C.name.toLowerCase()) + '</h1>');
  h.push('<p class="pitch">' + tx(V.pitch) + '</p><div class="facts">');
  V.facts.forEach(function (f) { h.push('<div class="fact"><b>' + tx(f.n) + '</b><span>' + tx(f.t) + '</span></div>'); });
  h.push('</div><div class="contacts">' +
    '<a class="pill main keep" href="' + esc(C.contacts.telegram) + '">telegram ↗</a>' +
    '<a class="pill keep" href="mailto:' + esc(C.contacts.email) + '">' + esc(C.contacts.email) + '</a>' +
    '<button class="pill" type="button" id="pdf">скачать pdf ↓</button>' +
    '<span class="pill dim keep">' + tx(C.contacts.city) + '</span></div></header>');

  /* кейсы */
  h.push('<section class="row"><div class="lbl">кейсы</div><div class="body">');
  V.cases.forEach(function (c, i) {
    h.push('<article class="case"><div class="no">' + String(i + 1).padStart(2, "0") + '</div><div>');
    h.push('<h3>' + tx(c.title) + '</h3><div class="tri">');
    [["задача", c.task], ["что сделал", c.did], ["результат", c.result]].forEach(function (p) {
      h.push('<div><div class="k">' + p[0] + '</div><p>' + tx(p[1]) + '</p></div>');
    });
    h.push('</div>');
    if (c.mine || c.others) h.push('<div class="who">' + (c.mine ? 'моё: <i>' + tx(c.mine) + '</i>' : '') + (c.mine && c.others ? ' · ' : '') + (c.others ? 'не моё: <i>' + tx(c.others) + '</i>' : '') + '</div>');
    h.push('</div></article>');
  });
  h.push('</div></section>');

  /* опыт */
  h.push('<section class="row"><div class="lbl">опыт</div><div class="body">');
  C.jobs.forEach(function (j) {
    h.push('<div class="job"><div class="when">' + esc(j.when) + '</div><div>');
    h.push('<h3>' + tx(j.title) + ' <span class="co">· ' + tx(j.co) + '</span></h3>');
    if (j.note) h.push('<p class="note">' + tx(j.note) + '</p>');
    if (j.scope && j.scope.length) h.push('<ul class="fact-scope">' + j.scope.map(function (s) { return '<li>' + tx(s) + '</li>'; }).join("") + '</ul>');
    h.push('</div></div>');
  });
  if (C.education) h.push('<p class="edu">' + tx(C.education) + '</p>');
  h.push('</div></section>');

  /* навыки */
  h.push('<section class="row"><div class="lbl">навыки</div><div class="body cols3">');
  V.skills.forEach(function (g) {
    h.push('<div><h3>' + tx(g.h) + '</h3><ul>' + g.items.map(function (s) {
      var p = s.split("|"); return '<li>' + tx(p[0]) + (p[1] ? '<em>' + esc(p[1]) + '</em>' : '') + '</li>';
    }).join("") + '</ul></div>');
  });
  h.push('</div></section>');

  h.push('<div class="end"><a class="big" href="' + esc(C.contacts.telegram) + '">написать ↗</a>' +
    '<span class="mono" style="color:var(--m)">обновлено ' + esc(C.updated) + '</span></div></div>');

  root.innerHTML = h.join("");
  var b = document.getElementById("pdf");
  if (b) b.addEventListener("click", function () { window.print(); });
})();
