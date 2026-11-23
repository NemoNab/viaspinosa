/* Редактор данных для пульта: строит форму по описанию полей.
   Типы: text, url, area, t2 (строка RU/EN), t2a (абзац RU/EN), sel, bool, lines (по строке на пункт), obj, list. */
window.ED = (function () {
  function h(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function t2In(v) { return v && typeof v === "object" ? { ru: v.ru || "", en: v.en || "" } : { ru: v == null ? "" : String(v), en: "" }; }
  function t2Out(o) { return o.en ? { ru: o.ru, en: o.en } : o.ru; }
  function plain(v) { v = t2In(v).ru; return v.replace(/[\[\]]/g, ""); }

  function input(type, val, ph) {
    var i = h(type === "area" ? "textarea" : "input");
    if (type !== "area") i.type = type === "url" ? "url" : "text";
    i.value = val == null ? "" : val; if (ph) i.placeholder = ph;
    return i;
  }

  function field(obj, f, changed) {
    var wrap = h("label", "fld" + (f.wide ? " wide" : ""));
    wrap.appendChild(h("span", null, f.label));
    var v = obj[f.key];

    if (f.type === "t2" || f.type === "t2a") {
      var o = t2In(v), area = f.type === "t2a" ? "area" : "text";
      var ru = input(area, o.ru, f.ph), en = input(area, o.en, "по-английски");
      en.className = "en";
      function upd() { o.ru = ru.value; o.en = en.value.trim(); obj[f.key] = t2Out(o); changed(); }
      ru.oninput = en.oninput = upd;
      wrap.appendChild(ru); wrap.appendChild(en);
    } else if (f.type === "sel") {
      var s = h("select");
      f.opts.forEach(function (op) { var x = h("option", null, op[1]); x.value = op[0]; s.appendChild(x); });
      s.value = v == null ? f.opts[0][0] : v;
      s.onchange = function () { obj[f.key] = s.value; changed(); };
      wrap.appendChild(s);
    } else if (f.type === "bool") {
      wrap.className = "fld check";
      var c = h("input"); c.type = "checkbox"; c.checked = !!v;
      c.onchange = function () { obj[f.key] = c.checked; changed(); };
      wrap.insertBefore(c, wrap.firstChild);
    } else if (f.type === "lines") {
      var t = input("area", (v || []).map(function (x) { return t2In(x).ru; }).join("\n"));
      t.oninput = function () { obj[f.key] = t.value.split("\n").map(function (x) { return x.trim(); }).filter(Boolean); changed(); };
      wrap.appendChild(t); wrap.appendChild(h("small", "hint", "по строке на пункт"));
    } else if (f.type === "obj") {
      wrap = h("fieldset", "grp"); wrap.appendChild(h("legend", null, f.label));
      if (!obj[f.key] || typeof obj[f.key] !== "object") obj[f.key] = {};
      form(wrap, obj[f.key], f.fields, changed);
    } else if (f.type === "list") {
      wrap = h("fieldset", "grp"); wrap.appendChild(h("legend", null, f.label));
      if (!Array.isArray(obj[f.key])) obj[f.key] = [];
      list(wrap, obj[f.key], f, changed);
    } else {
      var i = input(f.type, v, f.ph);
      i.oninput = function () { obj[f.key] = i.value.trim(); changed(); };
      wrap.appendChild(i);
    }
    if (f.hint && f.type !== "lines") wrap.appendChild(h("small", "hint", f.hint));
    return wrap;
  }

  function form(box, obj, fields, changed) {
    var g = h("div", "form");
    fields.forEach(function (f) { g.appendChild(field(obj, f, changed)); });
    box.appendChild(g);
  }

  function list(box, arr, f, changed) {
    var holder = h("div", "items"); box.appendChild(holder);
    function title(it, i) { return f.title ? f.title(it, i) : "#" + (i + 1); }
    function draw(openIdx) {
      holder.textContent = "";
      arr.forEach(function (it, i) {
        var d = h("details", "item"); if (i === openIdx) d.open = true;
        var sm = h("summary"); var st = h("span", "ttl", title(it, i)); sm.appendChild(st);
        var tools = h("span", "tools");
        [["↑", "выше", function () { if (i > 0) { arr.splice(i - 1, 0, arr.splice(i, 1)[0]); changed(); draw(i - 1); } }],
         ["↓", "ниже", function () { if (i < arr.length - 1) { arr.splice(i + 1, 0, arr.splice(i, 1)[0]); changed(); draw(i + 1); } }],
         ["✕", "удалить", function () { if (confirm("Удалить «" + title(it, i) + "»?")) { arr.splice(i, 1); changed(); draw(-1); } }]
        ].forEach(function (b) { var x = h("button", "del", b[0]); x.type = "button"; x.title = b[1]; x.onclick = function (e) { e.preventDefault(); b[2](); }; tools.appendChild(x); });
        sm.appendChild(tools); d.appendChild(sm);
        form(d, it, f.fields, function () { st.textContent = title(it, i); changed(); });
        holder.appendChild(d);
      });
    }
    draw(-1);
    var add = h("button", null, "+ " + (f.addLabel || "добавить")); add.type = "button";
    add.onclick = function () { arr.push(f.blank ? JSON.parse(JSON.stringify(f.blank)) : {}); changed(); draw(arr.length - 1); };
    box.appendChild(add);
  }

  /* загрузка файла данных сайта: выполняем его с подставным window */
  function loadData(url, name) {
    return fetch(url + "?t=" + Date.now(), { cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error("не загрузился " + url);
      return r.text();
    }).then(function (txt) { var w = {}; new Function("window", txt)(w); return JSON.parse(JSON.stringify(w[name])); });
  }

  return { form: form, list: list, loadData: loadData, plain: plain };
})();
