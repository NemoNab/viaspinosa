/* Общие функции для всех страниц: типографика, экранирование, проверка ссылок, языки.
   Подключается до скриптов страниц: <script src="/assets/site.js"></script> */
(function () {
  var SHORT = /(^|[\s(«])([А-Яа-яЁёA-Za-z]{1,2}|без|для|над|под|при|про|что|как|или|это|все|так) (?=\S)/g;

  /* ---------- язык ----------
     ?lang=en в адресе или выбор в переключателе (запоминается в браузере).
     Текст в данных может быть строкой (русский) или объектом { ru: "...", en: "..." }.
     Если английского нет, показывается русский. */
  var lang = "ru";
  try {
    var q = (location.search.match(/[?&]lang=(ru|en)\b/) || [])[1];
    if (q) { lang = q; localStorage.setItem("lang", q); }
    else lang = localStorage.getItem("lang") || "ru";
  } catch (e) {}
  if (lang !== "en") lang = "ru";
  document.documentElement.lang = lang;

  function pick(v) {
    if (v && typeof v === "object" && !Array.isArray(v)) return v[lang] != null && v[lang] !== "" ? v[lang] : (v.ru != null ? v.ru : "");
    return v == null ? "" : v;
  }
  function nb(t) {
    t = String(t == null ? "" : t);
    if (lang === "ru") { t = t.replace(/ (—|–)/g, " $1"); var p; do { p = t; t = t.replace(SHORT, "$1$2 "); } while (p !== t); }
    return t;
  }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  /* текст для вывода: язык + типографика + заглушки [в скобках] подчёркнуты пунктиром.
     Метки направлений вроде [PR] [Д] [А] [И] [О] остаются как есть. */
  function tx(v) {
    return esc(nb(pick(v))).replace(/\[([^\]]*)\]/g, function (m, x) {
      return /^(PR|Д|А|Т|Ш|И|О|A|I|T|D)$/.test(x) ? m : '<span class="ph-t">' + x + '</span>';
    });
  }
  function safe(u) { return typeof u === "string" && /^(https?:|mailto:|tg:)/i.test(u); }
  function setLang(l) {
    try { localStorage.setItem("lang", l); sessionStorage.setItem("skipIntro", "1"); } catch (e) {}
    var u = location.pathname + location.search.replace(/([?&])lang=(ru|en)&?/, "$1").replace(/[?&]$/, "") + location.hash;
    location.href = u;
  }
  /* кнопка RU / EN: <span data-lang-switch></span> */
  function langSwitch() {
    return '<span class="lang">' + ["ru", "en"].map(function (l) {
      return l === lang ? '<b>' + l.toUpperCase() + '</b>' : '<a href="#" data-set-lang="' + l + '">' + l.toUpperCase() + '</a>';
    }).join(" / ") + '</span>';
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("[data-set-lang]");
    if (a) { e.preventDefault(); setLang(a.getAttribute("data-set-lang")); }
  });
  /* подписи интерфейса: UI("написать") */
  var D = {
    "написать": "write", "канал": "channel", "раздел": "section", "скоро": "soon", "все проекты": "all projects",
    "все работы": "all works", "следующий проект": "next project", "дальше": "next", "Задача": "Task", "Что я сделал": "What I did",
    "Результат": "Result", "Год": "Year", "Где": "Where", "Роль": "Role", "Направление": "Field", "Профиль": "Profile",
    "Канал и контакты": "Channel and contacts", "Контакты": "Contacts", "проектов": "projects", "концепт, не внедрён": "concept, not implemented",
    "черновик раздела · тексты и картинки в работе": "draft · texts and images in progress", "черновик · тексты в работе": "draft · texts in progress",
    "работы": "works", "работ": "works", "хочу работать с": "want to work with", "образование, опыт, выставки": "education, experience, exhibitions", "о работе": "about the work", "следующая работа": "next work", "Для кого": "Client", "Имя": "Name", "Город": "City", "все": "all", "шоурил": "showreel", "обо мне": "about", "личные серии": "personal series", "купить работу": "buy a work",
    "образование": "education", "опыт": "experience", "выставки и фестивали": "exhibitions and festivals", "программы и техники": "software and techniques",
    "кейсы": "cases", "навыки": "skills", "задача": "task", "что сделал": "what I did", "результат": "result", "моё": "mine", "не моё": "not mine",
    "обновлено": "updated", "скачать pdf ↓": "download pdf ↓", "такого проекта нет": "no such project", "демо": "demo",
    "Дизайн": "Design", "PR и проекты": "PR and projects", "Автоматизация": "Automation", "операционка и автоматизация": "operations and automation",
    "пиар и проекты": "PR and projects", "раздел →": "section →", "раздел — скоро": "section — soon", "назад": "back"
  };
  /* имена и город по-английски, пока нет своих текстов */
  var EN_PEOPLE = { n: { name: "Sergey Potapov", city: "Yekaterinburg → Almaty", tags: "[PR] PR and partnerships · [D] design · [A] automation" }, l: { name: "Liza Konysheva", city: "Yekaterinburg → Almaty", tags: "[A] animation · [I] illustration · [O] objects" } };
  function person(S, k) {
    var p = (S && S.people && S.people[k]) || {}, o = {};
    for (var f in p) o[f] = p[f];
    if (lang === "en") { var e = p.en || {}, d = EN_PEOPLE[k] || {}; ["name", "city", "desc", "tags"].forEach(function (f) { if (e[f]) o[f] = e[f]; else if (d[f]) o[f] = d[f]; }); }
    return o;
  }
  function status(S, k) {
    var st = (S && S.status) || {}; if ("on" in st) st = { n: st };
    st = st[k] || {};
    var t = lang === "en" && st.en ? st.en : st.text;
    return st.on && t ? t : "";
  }
  function UI(s) { return lang === "en" && D[s] ? D[s] : s; }

  /* картинка из tools/images.py: src без размера и расширения, например "/assets/img/spotted/veranda/01".
     Пока картинки нет, рисуется серая плашка нужной пропорции с подписью. */
  function img(src, ratio, alt, label) {
    var ar = String(ratio || "4:3").replace(":", "/");
    if (!src || typeof src !== "string" || !/^\/assets\/img\/[\w\/.-]+$/.test(src))
      return '<div class="ph" style="aspect-ratio:' + esc(ar) + '">' + esc(label || ratio || "") + '</div>';
    return '<img class="pic" src="' + src + '-800.webp" srcset="' + src + '-800.webp 800w, ' + src + '-1600.webp 1600w" sizes="(max-width: 900px) 100vw, 50vw"' +
      ' alt="' + esc(nb(pick(alt)).replace(/[\[\]]/g, "")) + '" loading="lazy" decoding="async" style="aspect-ratio:' + esc(ar) + '">';
  }

  /* типографика для готового текста на странице: пройти по всем текстовым узлам */
  function typo(root) {
    if (lang !== "ru") return;
    var w = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT, { acceptNode: function (n) {
      var p = n.parentNode && n.parentNode.nodeName; return p === "SCRIPT" || p === "STYLE" || p === "TEXTAREA" ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; } }), n;
    while ((n = w.nextNode())) { var t = nb(n.nodeValue); if (t !== n.nodeValue) n.nodeValue = t; }
  }

  window.V = { lang: lang, pick: pick, nb: nb, esc: esc, tx: tx, safe: safe, setLang: setLang, langSwitch: langSwitch, UI: UI, person: person, status: status, img: img, typo: typo };
})();
