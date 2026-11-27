/* Проекты раздела /spotted/. Главная и страницы проектов собираются из этого списка.
   cat: d — дизайн и картинки, pr — пиар и проекты, a — штуки (автоматизация).
   Тексты в [скобках] — заглушки, их пишет Сергей. Картинки пока серые плашки: ph = пропорция. */
window.PROJECTS = [
  /* дизайн и картинки */
  { id: "sun", cat: "d", title: "Солнце", year: "2026", ph: "4:3", tags: "[Д] [А]",
    line: "[подпись до 100 знаков]", where: "viaspinosa.art", role: "[роль]" },
  { id: "covers", cat: "d", title: "Обложки и афиши для музыкантов", year: "", ph: "1:1", tags: "[Д]",
    line: "[подпись]", role: "[роль]" },
  { id: "design-system", cat: "d", title: "Дизайн-система книжного", year: "2026", ph: "3:2", tags: "[Д] [А]",
    line: "[подпись]", where: "«Пиотровский»", role: "[роль]" },
  { id: "torzhishche", cat: "d", title: "«Торжище»", year: "", ph: "3:4", tags: "[Д] [PR]",
    line: "[подпись]", where: "«Пиотровский»", role: "[роль]" },

  /* пиар и проекты */
  { id: "veranda", cat: "pr", title: "Фестиваль «Веранда»", year: "2025, 2026", ph: "3:2", tags: "[PR]",
    line: "[подпись]", where: "Ельцин Центр, Екатеринбург", role: "[роль]" },
  { id: "po-krayam", cat: "pr", title: "Фестиваль «По краям»", year: "2024, 2025", ph: "3:2", tags: "[PR]",
    line: "[подпись]", where: "Екатеринбург, с Ad Marginem: бар «Самоцвет» (2024), усадьба вдовы Филитц (2025)",
    role: "программа вместе с издательством, локальный PR, операционка, техобеспечение; оформление в 2024" },
  { id: "preorders", cat: "pr", title: "Предзаказы", year: "2024 — сейчас", tags: "[PR] [А]",
    line: "[подпись]", where: "«Пиотровский»", role: "запуск без разработчиков, кросс-промо с издателями" },
  { id: "t-business", cat: "pr", title: "Т-Бизнес в Москве", year: "2026", ph: "3:2", tags: "[PR]",
    line: "[подпись]", where: "Москва", role: "коммерческие переговоры, согласование договора, партнёрство за магазином" },
  { id: "events", cat: "pr", title: "Ивенты магазина", year: "2023 — сейчас", tags: "[PR]",
    line: "[подпись]", where: "«Пиотровский»", role: "[роль]" },
  { id: "public-talk", demo: "/spotted/demo/talk/", cat: "pr", title: "ИИ на сцене", year: "", ph: "3:2", tags: "[PR] [А]",
    line: "[подпись]", role: "[роль]" },

  /* штуки */
  { id: "shop", cat: "a", title: "Интернет-магазин целиком", year: "2023 — сейчас", ph: "16:9", tags: "[А]",
    line: "[подпись]", where: "«Пиотровский»", role: "[роль]" },
  { id: "inventory", cat: "a", title: "Инвентаризация срезами", year: "", tags: "[А] процессы",
    line: "[подпись]", where: "«Пиотровский»", role: "архитектура пересчёта" },
  { id: "bypass", cat: "a", title: "Обходная схема 1С ↔ Битрикс", year: "2025 — сейчас", tags: "[А] процессы",
    line: "[подпись]", where: "«Пиотровский»", role: "[роль]" },
  { id: "reports", demo: "/spotted/demo/report/", cat: "a", title: "Отчёты по продажам", year: "2023 — сейчас", ph: "16:9", tags: "[А] Google Таблицы",
    line: "[подпись]", where: "«Пиотровский»", role: "[роль]" },
  { id: "torg12-bot", cat: "a", title: "Бот для накладных", year: "", tags: "[А] Python · aiogram",
    line: "[подпись]", role: "[роль]" },
  { id: "isbn", cat: "a", title: "Книги по ISBN", year: "", tags: "[А] Apps Script",
    line: "[подпись]", role: "[роль]" },
  { id: "schedule", demo: "/spotted/demo/schedule/", cat: "a", title: "График смен", year: "", ph: "16:9", tags: "[А] концепт",
    line: "[подпись]", role: "[роль]", concept: true },
  { id: "reading-card", cat: "a", title: "Читательская карта", year: "", tags: "[А] концепт",
    line: "[подпись]", role: "[роль]", concept: true }
];
window.CATS = { d: "Дизайн", pr: "PR и проекты", a: "Штуки" };
