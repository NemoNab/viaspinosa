/* Собирает страницу CV из window.CV. Версия задаётся атрибутом data-version на <body>. */
(function () {
  var C = window.CV, root = document.getElementById("cv");
  if (!C || !root) return;
  var key = document.body.getAttribute("data-version") || "auto";
  var V = C.versions[key];
  var H = window.V, esc = H.esc, UI = H.UI;
  var tx = H.tx;
  function isPh(s) { return /^\s*\[.*\]\s*$/.test(s || ""); }

  /* статус общий для всего сайта: берётся из пульта (config.js), как на развилке */
  var S = window.SITE || {}, stText = H.status(S, "n"), me = H.person(S, "n");
  var ORDER = ["auto", "pr"];   /* порядок в переключателе постоянный, активная версия подсвечена */
  var href = { auto: "/spotted/cv/auto/", pr: "/spotted/cv/pr/" };
  var h = [];

  if (C.draft) h.push('<div class="draft">' + esc(UI("черновик · тексты в работе")) + '</div>');
  h.push('<div class="wrap">');
  h.push('<div class="bar"><a href="/spotted/">← ' + esc(UI("раздел")) + '</a>' +
    '<span class="hide-m vswitch">cv: ' + ORDER.map(function (k) { return '<a' + (k === key ? ' class="on" aria-current="page"' : '') + ' href="' + href[k] + '">' + esc(UI(H.pick(C.versions[k].label))) + '</a>'; }).join(" · ") + '</span>' +
    '<span class="st">' + (stText ? '● ' + tx(stText) + ' · ' : '') + H.langSwitch() + '</span></div>');

  /* шапка */
  h.push('<header class="hero row"><h1 class="name">' + esc(String(me.name || C.name).toLowerCase()) + '</h1>');
  h.push('<p class="pitch">' + tx(V.pitch) + '</p><div class="facts">');
  V.facts.forEach(function (f) { h.push('<div class="fact"><b>' + tx(f.n) + '</b><span>' + tx(f.t) + '</span></div>'); });
  h.push('</div><div class="contacts">' +
    '<a class="pill main keep" href="' + esc(C.contacts.telegram) + '">telegram ↗</a>' +
    '<a class="pill keep" href="mailto:' + esc(C.contacts.email) + '">' + esc(C.contacts.email) + '</a>' +
    '<button class="pill" type="button" id="pdf">' + esc(UI("скачать pdf ↓")) + '</button>' +
    '<span class="pill dim keep">' + tx(me.city || C.contacts.city) + '</span></div></header>');

  /* кейсы */
  h.push('<section class="row"><div class="lbl">' + esc(UI("кейсы")) + '</div><div class="body">');
  V.cases.forEach(function (c, i) {
    h.push('<article class="case"><div class="no">' + String(i + 1).padStart(2, "0") + '</div><div>');
    h.push('<h3>' + tx(c.title) + '</h3><div class="tri">');
    [[UI("задача"), c.task], [UI("что сделал"), c.did], [UI("результат"), c.result]].forEach(function (p) {
      h.push('<div><div class="k">' + p[0] + '</div><p>' + tx(p[1]) + '</p></div>');
    });
    h.push('</div>');
    if (c.mine || c.others) h.push('<div class="who">' + (c.mine ? esc(UI("моё")) + ': <i>' + tx(c.mine) + '</i>' : '') + (c.mine && c.others ? ' · ' : '') + (c.others ? esc(UI("не моё")) + ': <i>' + tx(c.others) + '</i>' : '') + '</div>');
    h.push('</div></article>');
  });
  h.push('</div></section>');

  /* опыт */
  h.push('<section class="row"><div class="lbl">' + esc(UI("опыт")) + '</div><div class="body">');
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
  h.push('<section class="row"><div class="lbl">' + esc(UI("навыки")) + '</div><div class="body cols3">');
  V.skills.forEach(function (g) {
    h.push('<div><h3>' + tx(g.h) + '</h3><ul>' + g.items.map(function (s) {
      var p = s.split("|"); return '<li>' + tx(p[0]) + (p[1] ? '<em>' + esc(p[1]) + '</em>' : '') + '</li>';
    }).join("") + '</ul></div>');
  });
  h.push('</div></section>');

  h.push('<div class="end"><a class="big" href="' + esc(C.contacts.telegram) + '">' + esc(UI("написать")) + ' ↗</a>' +
    '<span class="mono" style="color:var(--m)">' + esc(UI("обновлено")) + ' ' + esc(C.updated) + '</span></div></div>');

  root.innerHTML = h.join("");
  var b = document.getElementById("pdf");
  if (b) b.addEventListener("click", function () { window.print(); });
})();
