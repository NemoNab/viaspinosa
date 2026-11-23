/**
 * Пульт viaspinosa.art — серверная часть (Google Apps Script).
 *
 * Принимает правки со страницы viaspinosa.art/panel, проверяет пароль,
 * записывает историю в лист «история» этой таблицы и обновляет файлы сайта
 * в репозитории на GitHub: config.js (развилка, статусы, палитры), а также
 * spotted/projects.js, spotted/cv/data.js и strangejell/data.js (проекты, CV, раздел Лизы).
 * Через минуту GitHub Pages показывает новую версию сайта.
 *
 * Свойства скрипта (Настройки проекта → Свойства скрипта):
 *   PANEL_PASSWORD — пароль пульта
 *   GITHUB_TOKEN   — токен GitHub с доступом только к репозиторию сайта (Contents: Read and write)
 *   REPO           — NemoNab/viaspinosa
 *   BRANCH         — main
 */

var FILES = {
  config: { path: 'config.js', head: '/* Настройки сайта. Этот файл переписывает пульт viaspinosa.art/panel — руками его править не нужно. */\nwindow.SITE = ' },
  projects: { path: 'spotted/projects.js', head: '/* Проекты раздела /spotted/. Файл переписывает пульт; руками тоже можно, но потом пульт перезапишет. */\nwindow.PROJECTS = ',
              tail: '\nwindow.CATS = { d: "Дизайн", pr: "PR и проекты", a: "Штуки" };\n' },
  cv: { path: 'spotted/cv/data.js', head: '/* CV Сергея. Файл переписывает пульт. */\nwindow.CV = ' },
  liza: { path: 'strangejell/data.js', head: '/* Раздел Лизы /strangejell/. Файл переписывает пульт. */\nwindow.LIZA = ' }
};
var RESERVED = ['cv', 'p', 'w', 'demo', 'assets'];

function doGet() {
  return json_({ ok: true, service: 'viaspinosa panel' });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) return json_({ ok: false, error: 'пульт занят, попробуй ещё раз через пару секунд' });
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var props = PropertiesService.getScriptProperties();

    if (!same_(String(body.password || ''), String(props.getProperty('PANEL_PASSWORD') || ''))) {
      Utilities.sleep(1500);   // притормаживаем подбор пароля
      return json_({ ok: false, error: 'неверный пароль' });
    }

    var out = [], done = [], cfg = null, data = body.data || {};
    if (body.config) { cfg = clean_(body.config); out.push(['config', cfg]); }
    if (data.projects) out.push(['projects', ids_(tree_(data.projects, 'проекты'), 'проекты')]);
    if (data.cv) out.push(['cv', tree_(data.cv, 'CV')]);
    if (data.liza) { var lz = tree_(data.liza, 'раздел Лизы'); ids_(lz.works || [], 'работы Лизы'); out.push(['liza', lz]); }
    if (!out.length) throw new Error('нечего сохранять');

    var commits = out.map(function (o) {   // сначала всё проверено, потом пишем
      var F = FILES[o[0]], text = F.head + JSON.stringify(o[1], null, 2) + ';\n' + (F.tail || '');
      done.push(F.path);
      return put_(props, F.path, text);
    });
    log_(cfg, done, commits, body);
    return json_({ ok: true, files: done, commits: commits });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  } finally {
    lock.releaseLock();
  }
}

/* ---------- проверка и чистка настроек: на сайт попадает только ожидаемое ---------- */
function clean_(c) {
  if (!c || typeof c !== 'object') throw new Error('пустые настройки');
  var hex = /^#[0-9a-f]{6}$/i, link = /^(https?:|mailto:|tg:)/i;
  function str(v, max) { v = String(v == null ? '' : v).trim(); if (v.length > max) throw new Error('слишком длинный текст: ' + v.slice(0, 30) + '…'); return v; }
  function url(v) { v = str(v, 300); if (v && !link.test(v)) throw new Error('ссылка должна начинаться с https://: ' + v); return v; }

  var pals = (c.palettes || []).map(function (p) {
    if (!hex.test(p.bg) || !hex.test(p.fg)) throw new Error('цвет палитры должен быть вида #a1b2c3');
    var g = Number(p.grain); if (!(g >= 0 && g <= 1)) throw new Error('зерно должно быть от 0 до 1');
    return { name: str(p.name, 40) || 'без названия', by: p.by === 'l' ? 'l' : 'n', bg: p.bg.toLowerCase(), fg: p.fg.toLowerCase(), grain: Math.round(g * 100) / 100, on: p.on !== false };
  });
  if (!pals.length || pals.length > 20) throw new Error('палитр должно быть от 1 до 20');
  if (!pals.some(function (p) { return p.on; })) throw new Error('включи хотя бы одну палитру');

  var st = c.status || {}; if ('on' in st) st = { n: st };   // старый формат: один общий статус
  function stat(x) { x = x || {}; var o = { on: !!x.on, text: str(x.text, 60) }; var en = str(x.en, 60); if (en) o.en = en; return o; }
  function person(p) {
    p = p || {};
    var e = p.en || {}, en = { name: str(e.name, 60), city: str(e.city, 80), desc: str(e.desc, 400), tags: str(e.tags, 200) };
    var o = { name: str(p.name, 60), city: str(p.city, 80), desc: str(p.desc, 400), tags: str(p.tags, 200), write: url(p.write), channel: url(p.channel) };
    if (en.name || en.city || en.desc || en.tags) o.en = en;
    return o;
  }
  return {
    version: 1,
    updated: new Date().toISOString(),
    status: { n: stat(st.n), l: stat(st.l) },
    palettes: pals,
    people: { n: person(c.people && c.people.n), l: person(c.people && c.people.l) },
    panel: { endpoint: url(c.panel && c.panel.endpoint) }
  };
}

/* ---------- данные разделов: проверка дерева ----------
   Пропускаем только строки, числа, да/нет, списки и объекты с простыми ключами. Ограничения на размер.
   Ссылки проверяются: только https:, mailto:, tg: или адрес внутри сайта (/…). */
function tree_(v, where) {
  var count = 0;
  function walk(x, depth, key) {
    if (++count > 6000) throw new Error(where + ': слишком много данных');
    if (depth > 8) throw new Error(where + ': слишком глубокая вложенность');
    if (x === null || x === undefined) return '';
    if (typeof x === 'boolean') return x;
    if (typeof x === 'number') { if (!isFinite(x)) throw new Error(where + ': странное число'); return x; }
    if (typeof x === 'string') {
      var s = x.replace(/\r/g, '');
      if (s.length > 5000) throw new Error(where + ': слишком длинный текст: ' + s.slice(0, 30) + '…');
      if (/^\s*(javascript|data|vbscript):/i.test(s)) throw new Error(where + ': недопустимая ссылка');
      if (/^(url|write|channel|telegram|instagram|behance|youtube|demo)$/.test(key || '') && s && !/^(https?:|mailto:|tg:|\/)/i.test(s)) throw new Error(where + ': ссылка должна начинаться с https://: ' + s);
      return s;
    }
    if (Array.isArray(x)) { if (x.length > 200) throw new Error(where + ': слишком длинный список'); return x.map(function (y) { return walk(y, depth + 1, key); }); }
    if (typeof x === 'object') {
      var o = {};
      Object.keys(x).forEach(function (k) {
        if (!/^[a-zA-Z_][a-zA-Z0-9_]{0,30}$/.test(k)) throw new Error(where + ': странное поле «' + k + '»');
        o[k] = walk(x[k], depth + 1, k);
      });
      return o;
    }
    throw new Error(where + ': непонятные данные');
  }
  return walk(v, 0, '');
}
function ids_(list, where) {
  if (!Array.isArray(list)) throw new Error(where + ': нужен список');
  var seen = {};
  list.forEach(function (x) {
    var id = String(x && x.id || '');
    if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) throw new Error(where + ': адрес «' + id + '» — только латиница, цифры и дефис');
    if (RESERVED.indexOf(id) >= 0) throw new Error(where + ': адрес «' + id + '» занят');
    if (seen[id]) throw new Error(where + ': адрес «' + id + '» повторяется');
    seen[id] = 1;
  });
  return list;
}

/* ---------- GitHub: обновить один файл одним коммитом ---------- */
function put_(props, file, text) {
  var repo = props.getProperty('REPO') || 'NemoNab/viaspinosa';
  var branch = props.getProperty('BRANCH') || 'main';
  var token = props.getProperty('GITHUB_TOKEN');
  if (!token) throw new Error('не задан GITHUB_TOKEN в свойствах скрипта');
  var api = 'https://api.github.com/repos/' + repo + '/contents/' + file;
  var headers = { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };

  var cur = UrlFetchApp.fetch(api + '?ref=' + encodeURIComponent(branch), { headers: headers, muteHttpExceptions: true });
  var sha = cur.getResponseCode() === 200 ? JSON.parse(cur.getContentText()).sha : undefined;

  var res = UrlFetchApp.fetch(api, {
    method: 'put', headers: headers, contentType: 'application/json', muteHttpExceptions: true,
    payload: JSON.stringify({
      message: 'Пульт: обновить ' + file,
      content: Utilities.base64Encode(text, Utilities.Charset.UTF_8),
      sha: sha, branch: branch
    })
  });
  var code = res.getResponseCode();
  if (code !== 200 && code !== 201) throw new Error('GitHub ответил ' + code + ': ' + res.getContentText().slice(0, 200));
  return JSON.parse(res.getContentText()).commit.html_url;
}

/* ---------- история в листе «история» (если скрипт привязан к таблице) ---------- */
function log_(cfg, files, commits, body) {
  var ss = SpreadsheetApp.getActiveSpreadsheet(); if (!ss) return;
  var sh = ss.getSheetByName('история') || ss.insertSheet('история');
  if (sh.getLastRow() === 0) sh.appendRow(['когда', 'файлы', 'статус', 'включённые палитры', 'коммиты', 'что прислали']);
  var copy = JSON.parse(JSON.stringify(body)); delete copy.password;
  var dump = JSON.stringify(copy); if (dump.length > 45000) dump = dump.slice(0, 45000) + '…';
  sh.appendRow([new Date(), files.join(', '),
    cfg ? ['n', 'l'].map(function (k) { var x = cfg.status[k]; return (x.on ? '● ' : '○ ') + x.text; }).join(' / ') : '',
    cfg ? cfg.palettes.filter(function (p) { return p.on; }).map(function (p) { return p.name; }).join(', ') : '',
    commits.join('\n'), dump]);
}

function same_(a, b) {
  if (!b) return false;
  var d = a.length ^ b.length;
  for (var i = 0; i < Math.max(a.length, b.length); i++) d |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return d === 0;
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
