/* Описание полей для вкладок пульта: какие поля у проекта, CV и раздела Лизы. */
window.SCHEMAS = (function () {
  var IMG = { key: "images", label: "галерея", type: "list", addLabel: "картинка", blank: { src: "", ratio: "3:2", cap: "" },
    title: function (m, i) { return (m.src ? m.src.split("/").pop() : "картинка " + (i + 1)); },
    fields: [
      { key: "src", label: "адрес", type: "text", ph: "/assets/img/spotted/veranda/01", hint: "из tools/images.py, без размера и расширения" },
      { key: "ratio", label: "пропорция", type: "text", ph: "3:2" },
      { key: "cap", label: "подпись", type: "t2", wide: true }
    ] };
  var CASE = [
    { key: "title", label: "название", type: "t2" }, { key: "years", label: "годы", type: "text" },
    { key: "task", label: "задача", type: "t2a" }, { key: "did", label: "что сделал", type: "t2a" }, { key: "result", label: "результат", type: "t2a" },
    { key: "mine", label: "моё", type: "t2" }, { key: "others", label: "не моё", type: "t2" }
  ];
  var VERSION = [
    { key: "label", label: "название версии", type: "t2" },
    { key: "pitch", label: "фраза в шапке", type: "t2a", hint: "до 140 знаков" },
    { key: "facts", label: "три факта", type: "list", addLabel: "факт", blank: { n: "", t: "" }, title: function (f) { return (f.n || "?") + " — " + window.ED.plain(f.t).slice(0, 50); },
      fields: [{ key: "n", label: "цифра", type: "text" }, { key: "t", label: "подпись", type: "t2" }] },
    { key: "cases", label: "кейсы", type: "list", addLabel: "кейс", blank: { title: "", years: "", task: "", did: "", result: "" }, title: function (c) { return window.ED.plain(c.title) || "без названия"; }, fields: CASE },
    { key: "skills", label: "навыки, три колонки", type: "list", addLabel: "колонка", blank: { h: "", items: [] }, title: function (g) { return window.ED.plain(g.h) || "колонка"; },
      fields: [{ key: "h", label: "заголовок колонки", type: "t2" }, { key: "items", label: "пункты", type: "lines", hint: "в конце пункта можно добавить |учу" }] }
  ];
  return {
    projects: { key: "list", type: "list", label: "проекты", addLabel: "проект", blank: { id: "", cat: "pr", title: "", year: "", tags: "", line: "" },
      title: function (p) { return (window.ED.plain(p.title) || "без названия") + "  ·  " + ({ d: "дизайн", pr: "PR", a: "штуки" }[p.cat] || "") + (p.id ? "  ·  /" + p.id : ""); },
      fields: [
        { key: "id", label: "адрес (латиница, цифры, дефис)", type: "text", ph: "veranda" },
        { key: "cat", label: "колонка", type: "sel", opts: [["d", "Дизайн"], ["pr", "PR и проекты"], ["a", "Штуки"]] },
        { key: "title", label: "название", type: "t2" }, { key: "year", label: "год", type: "text" },
        { key: "tags", label: "метки", type: "text", ph: "[PR] [А]" }, { key: "concept", label: "концепт, не внедрён", type: "bool" },
        { key: "line", label: "подпись в карточке", type: "t2", wide: true, hint: "до 100 знаков" },
        { key: "where", label: "где", type: "t2" }, { key: "role", label: "роль", type: "t2" },
        { key: "task", label: "задача", type: "t2a" }, { key: "did", label: "что я сделал", type: "t2a" }, { key: "result", label: "результат", type: "t2a" },
        { key: "ph", label: "пропорция обложки", type: "text", ph: "3:2", hint: "пусто — без картинки в карточке" },
        { key: "cover", label: "обложка", type: "text", ph: "/assets/img/spotted/veranda/01" },
        { key: "demo", label: "демо", type: "text", ph: "/spotted/demo/schedule/" },
        IMG
      ] },
    cv: [
      { key: "draft", label: "черновик: плашка наверху и закрыто от поиска", type: "bool" },
      { key: "updated", label: "обновлено", type: "text", ph: "2026-11" },
      { key: "contacts", label: "контакты", type: "obj", fields: [{ key: "telegram", label: "telegram", type: "url" }, { key: "email", label: "почта", type: "text" }, { key: "city", label: "город", type: "t2" }] },
      { key: "versions", label: "версии", type: "obj", fields: [
        { key: "auto", label: "операционка и автоматизация (/cv/auto)", type: "obj", fields: VERSION },
        { key: "pr", label: "пиар и проекты (/cv/pr)", type: "obj", fields: VERSION }
      ] },
      { key: "jobs", label: "опыт (общий для обеих версий)", type: "list", addLabel: "место работы", blank: { when: "", title: "", co: "", note: "", scope: [] },
        title: function (j) { return (j.when || "") + "  " + window.ED.plain(j.title); },
        fields: [{ key: "when", label: "когда", type: "text", ph: "2021.01 — 2025.08" }, { key: "title", label: "должность", type: "t2" }, { key: "co", label: "компания", type: "t2" },
          { key: "note", label: "пометка", type: "t2", wide: true, hint: "например, «официальная должность; фактически…»" }, { key: "scope", label: "фактически", type: "lines" }] },
      { key: "education", label: "образование", type: "t2", wide: true }
    ],
    liza: [
      { key: "draft", label: "черновик: плашка наверху", type: "bool" },
      { key: "links", label: "ссылки", type: "obj", fields: [{ key: "email", label: "почта", type: "text" }, { key: "instagram", label: "Instagram", type: "url" }, { key: "behance", label: "Behance", type: "url" }, { key: "youtube", label: "YouTube", type: "url" }] },
      { key: "showreel", label: "шоурил", type: "obj", fields: [{ key: "url", label: "ссылка на видео (YouTube, Vimeo или файл)", type: "url" }, { key: "years", label: "годы", type: "text" }, { key: "caption", label: "подпись", type: "t2", wide: true }] },
      { key: "works", label: "работы", type: "list", addLabel: "работа", blank: { id: "", kind: "анимация", title: "", year: "", role: "", client: "", ph: "4:3", line: "" },
        title: function (w) { return (window.ED.plain(w.title) || "без названия") + "  ·  " + window.ED.plain(w.kind) + (w.id ? "  ·  /" + w.id : ""); },
        fields: [{ key: "id", label: "адрес (латиница, цифры, дефис)", type: "text" }, { key: "kind", label: "вид", type: "t2", hint: "анимация, иллюстрация…" },
          { key: "title", label: "название", type: "t2" }, { key: "year", label: "год", type: "text" }, { key: "role", label: "роль", type: "t2" }, { key: "client", label: "для кого", type: "t2" },
          { key: "line", label: "одна строка о сути", type: "t2", wide: true }, { key: "text", label: "текст на странице работы", type: "t2a" },
          { key: "ph", label: "пропорция", type: "text", ph: "4:5" }, { key: "cover", label: "обложка", type: "text", ph: "/assets/img/strangejell/work-1/01" }, IMG] },
      { key: "series", label: "личные серии", type: "list", addLabel: "серия", blank: { id: "", title: "", kind: "", ph: "1:1", text: "" }, title: function (s) { return window.ED.plain(s.title) || "серия"; },
        fields: [{ key: "id", label: "id", type: "text" }, { key: "title", label: "название", type: "t2" }, { key: "kind", label: "вид", type: "t2" }, { key: "ph", label: "пропорция", type: "text" },
          { key: "cover", label: "обложка", type: "text" }, { key: "text", label: "текст", type: "t2a" }] },
      { key: "about", label: "обо мне", type: "t2a", hint: "абзацы разделяйте пустой строкой" },
      { key: "clients", label: "с кем хочу работать", type: "t2a" },
      { key: "buy", label: "про покупку работ", type: "t2" },
      { key: "cv", label: "CV", type: "obj", fields: [
        { key: "education", label: "образование", type: "lines" }, { key: "experience", label: "опыт", type: "lines" },
        { key: "exhibitions", label: "выставки и фестивали", type: "lines" }, { key: "software", label: "программы", type: "lines" }, { key: "techniques", label: "техники", type: "lines" }] }
    ]
  };
})();
