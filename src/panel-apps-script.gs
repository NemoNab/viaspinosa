/**
 * Пульт viaspinosa.art — серверная часть (Google Apps Script).
 *
 * Принимает настройки со страницы viaspinosa.art/panel, проверяет пароль,
 * записывает историю в лист «история» этой таблицы и обновляет файл config.js
 * в репозитории на GitHub. Через минуту GitHub Pages показывает новую версию сайта.
 *
 * Свойства скрипта (Настройки проекта → Свойства скрипта):
 *   PANEL_PASSWORD — пароль пульта
 *   GITHUB_TOKEN   — токен GitHub с доступом только к репозиторию сайта (Contents: Read and write)
 *   REPO           — NemoNab/viaspinosa
 *   BRANCH         — main
 */

var FILE = 'config.js';

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

    var cfg = clean_(body.config);
    var text = '/* Настройки сайта. Этот файл переписывает пульт viaspinosa.art/panel — руками его править не нужно. */\n' +
               'window.SITE = ' + JSON.stringify(cfg, null, 2) + ';\n';

    var commit = put_(props, text);
    log_(cfg, commit);
    return json_({ ok: true, commit: commit });
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

  function person(p) {
    p = p || {};
    return { name: str(p.name, 60), city: str(p.city, 80), desc: str(p.desc, 400), tags: str(p.tags, 200), write: url(p.write), channel: url(p.channel) };
  }
  return {
    version: 1,
    updated: new Date().toISOString(),
    status: { on: !!(c.status && c.status.on), text: str(c.status && c.status.text, 60) },
    palettes: pals,
    people: { n: person(c.people && c.people.n), l: person(c.people && c.people.l) },
    panel: { endpoint: url(c.panel && c.panel.endpoint) }
  };
}

/* ---------- GitHub: обновить config.js одним коммитом ---------- */
function put_(props, text) {
  var repo = props.getProperty('REPO') || 'NemoNab/viaspinosa';
  var branch = props.getProperty('BRANCH') || 'main';
  var token = props.getProperty('GITHUB_TOKEN');
  if (!token) throw new Error('не задан GITHUB_TOKEN в свойствах скрипта');
  var api = 'https://api.github.com/repos/' + repo + '/contents/' + FILE;
  var headers = { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };

  var cur = UrlFetchApp.fetch(api + '?ref=' + encodeURIComponent(branch), { headers: headers, muteHttpExceptions: true });
  var sha = cur.getResponseCode() === 200 ? JSON.parse(cur.getContentText()).sha : undefined;

  var res = UrlFetchApp.fetch(api, {
    method: 'put', headers: headers, contentType: 'application/json', muteHttpExceptions: true,
    payload: JSON.stringify({
      message: 'Пульт: обновить настройки сайта',
      content: Utilities.base64Encode(text, Utilities.Charset.UTF_8),
      sha: sha, branch: branch
    })
  });
  var code = res.getResponseCode();
  if (code !== 200 && code !== 201) throw new Error('GitHub ответил ' + code + ': ' + res.getContentText().slice(0, 200));
  return JSON.parse(res.getContentText()).commit.html_url;
}

/* ---------- история в листе «история» (если скрипт привязан к таблице) ---------- */
function log_(cfg, commit) {
  var ss = SpreadsheetApp.getActiveSpreadsheet(); if (!ss) return;
  var sh = ss.getSheetByName('история') || ss.insertSheet('история');
  if (sh.getLastRow() === 0) sh.appendRow(['когда', 'статус', 'включённые палитры', 'коммит', 'настройки целиком']);
  sh.appendRow([new Date(), (cfg.status.on ? '● ' : '○ ') + cfg.status.text,
    cfg.palettes.filter(function (p) { return p.on; }).map(function (p) { return p.name; }).join(', '),
    commit, JSON.stringify(cfg)]);
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
