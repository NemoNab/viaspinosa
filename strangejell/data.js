/* Раздел Лизы /strangejell/. Все тексты и работы раздела — здесь.
   Тексты в [скобках] — заглушки, их пишет Лиза (вкладка «Тексты Лиза» в анкете).
   Текст может быть строкой (русский) или { ru: "...", en: "..." }. Картинки пока плашки: ph = пропорция. */
window.LIZA = {
  draft: true,
  /* ссылки: пустые не показываются */
  links: { email: "", instagram: "", behance: "", youtube: "" },
  /* шоурилы: переключатель по годам, по умолчанию открыт самый свежий.
     url — ссылка на файл .mp4 в Cloudflare R2 (или YouTube/Vimeo), poster — картинка до запуска */
  showreels: [
    { years: "2025–2026", url: "", poster: "", caption: "[подпись: что в шоуриле]" },
    { years: "2021–2024", url: "https://media.viaspinosa.art/showreel-2021-2024.mp4", poster: "https://media.viaspinosa.art/showreel-2021-2024.jpg", caption: "[подпись: что в шоуриле]" }
  ],

  /* направления: порядок фильтров и метки на карточках. kind у работы — одно из k */
  kinds: [{ k: "анимация", tag: "[А]", en: "animation", tagEn: "[A]" }, { k: "иллюстрация", tag: "[И]", en: "illustration", tagEn: "[I]" }, { k: "объекты", tag: "[О]", en: "objects", tagEn: "[O]" }],

  /* 8–15 лучших работ. kind: анимация, иллюстрация, объекты (скульптура, текстиль, гравюра) */
  works: [
    { id: "poka-tikayut", kind: "анимация", title: "«Пока ещё тикают»", year: "2026", role: "анимационные вставки", client: "[для кого]", ph: "16:9", line: "[одна строка о сути]" },
    { id: "galilei", kind: "анимация", title: "«Галилей»", year: "2026", role: "две анимации в технике перекладки", client: "Московский планетарий", ph: "16:9", line: "[одна строка о сути]", url: "https://planetarium-moscow.ru/afisha/galilei-i-tayny-nebesnykh-sfer-205" },
    { id: "lunnyi-sad", kind: "анимация", title: "«Лунный сад»", year: "2026", role: "анимация", client: "фильм Евгении Хазихановой", ph: "16:9", line: "[одна строка о сути]" },
    { id: "yeltsin-masterclass", kind: "анимация", title: "Мастер-класс в арт-галерее", year: "2026", role: "анимация", client: "Ельцин Центр", ph: "16:9", line: "[одна строка о сути]", url: "https://www.instagram.com/reel/Ddoeu2wIUgX/" },
    { id: "piotrovsky-10", kind: "анимация", title: "10 лет «Пиотровскому»", year: "2025", role: "анимационный ролик", client: "книжный «Пиотровский»", ph: "16:9", line: "[одна строка о сути]", url: "https://www.instagram.com/reel/DReJx1_jGmx/" },
    { id: "mify-o-gefeste", kind: "анимация", title: "«Мифы о Гефесте, боге и стройотряде»", year: "2025", role: "анимационные вставки", client: "[для кого]", ph: "16:9", line: "[одна строка о сути]", url: "https://endofsummer.fun/?project=myths-about-god" },
    { id: "ket", kind: "анимация", title: "ketfromwyoming", year: "2025", role: "анимация", client: "криптовалюта $KET", ph: "16:9", line: "[одна строка о сути]", url: "https://youtube.com/@ketfromwyoming" },
    { id: "emmi-wuffi", kind: "анимация", title: "Маскоты Emmi и Wuffi", year: "2024", role: "короткие анимации", client: "Magic Eden и Wuffi", ph: "16:9", line: "[одна строка о сути]" },
    { id: "planeta-yandeksoidov", kind: "анимация", title: "«Планета Яндексоидов»", year: "2023", role: "анимация ролика", client: "фестиваль Бадди", ph: "16:9", line: "[одна строка о сути]", url: "https://silvermercury.ru/winners/yandeks-kinobaddifest-2024-5052" },
    { id: "take-my-muffin", kind: "анимация", title: "Take my muffin", year: "2023", role: "анимация для одной серии", client: "[для кого]", ph: "16:9", line: "[одна строка о сути]" },
    { id: "bum-zemli", kind: "анимация", title: "«Бум земли! Краб и Кальмар спасают океан»", year: "2022–2024", role: "ведущий аниматор, заставка", client: "[для кого]", ph: "16:9", line: "[одна строка о сути]", url: "https://www.animator.ru/db/?p=show_film&fid=9542" },
    { id: "moya-malenkaya-zhizn", kind: "анимация", title: "«Моя маленькая жизнь на острове»", year: "2022", role: "анимация", client: "фильм Нины Бисяриной", ph: "16:9", line: "[одна строка о сути]" },
    { id: "vyhod-borodacha", kind: "анимация", title: "«Выход Бородача»", year: "2022", role: "аниматор", client: "[для кого]", ph: "16:9", line: "[одна строка о сути]", url: "https://rutube.ru/channel/76895556/videos/" },
    { id: "supermario", kind: "анимация", title: "«Супермарио»", year: "2021", role: "[роль]", client: "клип", ph: "16:9", line: "[одна строка о сути]", url: "https://youtu.be/bVSJLMkDxbE" }
  ],


  about: "[2–4 абзаца о себе: как пришла к анимации, что интересно, с кем хочешь работать]",
  clients: "киностудии, театры, книжные издательства, культурные центры, проекты для животных и про психологию и подростков",
  buy: "[одно предложение: как купить работу]",

  cv: {
    education: ["[где и когда училась]", "[арт-дирекшн: где и когда]"],
    experience: ["[годы · студия или заказчик · роль]"],
    exhibitions: ["[год · название · город]"],
    software: ["After Effects", "Toon Boom Harmony", "Moho Pro 14", "TVPaint", "Photoshop", "Premiere Pro", "Procreate"],
    techniques: ["[техники руками: гравюра, лепка и так далее]"]
  }
};
