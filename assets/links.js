/* Внешние ссылки (другой сайт, Telegram) открываются в новой вкладке, чтобы человек не уходил с сайта.
   Работает и для ссылок, которые страница дорисовывает скриптом: проверка идёт в момент клика и наведения. */
(function () {
  function external(a) {
    var h = a.getAttribute("href") || "";
    if (/^tg:/i.test(h)) return true;
    if (!/^https?:/i.test(a.href)) return false;          /* mailto:, якоря и относительные адреса не трогаем */
    return a.host !== location.host;
  }
  function mark(a) {
    if (!a || a.tagName !== "A" || a.hasAttribute("data-same-tab") || !external(a)) return;
    a.target = "_blank";
    var r = (a.getAttribute("rel") || "").split(/\s+/);
    ["noopener", "noreferrer"].forEach(function (x) { if (r.indexOf(x) < 0) r.push(x); });
    a.setAttribute("rel", r.join(" ").trim());
  }
  function all() { Array.prototype.forEach.call(document.querySelectorAll("a[href]"), mark); }
  function near(e) { var t = e.target; return t && t.closest ? t.closest("a[href]") : null; }
  document.addEventListener("pointerover", function (e) { mark(near(e)); }, true);
  document.addEventListener("focusin", function (e) { mark(near(e)); }, true);
  document.addEventListener("click", function (e) { mark(near(e)); }, true);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", all); else all();
  window.addEventListener("load", all);
})();
