// ==UserScript==
// @name         Passiflora theme for NumberFields@home
// @namespace    https://github.com/alplix/passiflora
// @version      1.0.0
// @description  A modern light/dark theme for NumberFields@home, a theme switch and a card for the Passiflora app.
// @author       Alperen Yavuz
// @license      GPL-2.0-or-later
// @match        https://numberfields.asu.edu/NumberFields/*
// @match        http://numberfields.asu.edu/NumberFields/*
// @run-at       document-start
// @grant        none
// @updateURL    https://raw.githubusercontent.com/alplix/passiflora/main/theme/numberfields-passiflora.user.js
// @downloadURL  https://raw.githubusercontent.com/alplix/passiflora/main/theme/numberfields-passiflora.user.js
// ==/UserScript==

(function () {
  'use strict';
  var css = "/*\n * Passiflora theme for NumberFields@home (BOINC web, Bootstrap 3).\n * Coded By Alperen Yavuz - https://github.com/alplix/passiflora\n * SPDX-License-Identifier: GPL-2.0-or-later\n *\n * Light and dark; follows the system setting unless <html data-theme=\"light|dark\"> is set.\n * Works as a Stylus user style, inside the userscript, or as a drop-in replacement for the project's white.css.\n */\n\n:root {\n  --bg: #f6f4fb;\n  --bg-glow: rgba(124, 77, 255, .13);\n  --card: #ffffff;\n  --card-2: #f1edfa;\n  --text: #1d1a2b;\n  --muted: #6a6483;\n  --border: #e4dff2;\n  --p1: #6d3fc0;\n  --p2: #c026a3;\n  --accent: #0d9f8f;\n  --accent-2: #14b8a6;\n  --link: #5b34b0;\n  --link-hover: #c026a3;\n  --zebra: #f8f6fd;\n  --hover: #efe9fb;\n  --th-bg: #ece6fa;\n  --th-text: #3b2a73;\n  --input-bg: #ffffff;\n  --shadow: 0 1px 2px rgba(40, 20, 90, .06), 0 8px 24px rgba(40, 20, 90, .08);\n  --nav-bg: rgba(255, 255, 255, .82);\n  --code-bg: #f1edfa;\n  --radius: 16px;\n}\n\n@media (prefers-color-scheme: dark) {\n  :root:not([data-theme=\"light\"]) {\n    --bg: #0e0b19;\n    --bg-glow: rgba(139, 92, 246, .20);\n    --card: #171326;\n    --card-2: #1f1a33;\n    --text: #ece8f8;\n    --muted: #9d96b8;\n    --border: #2d2646;\n    --p1: #7c4dff;\n    --p2: #d946ef;\n    --accent: #2dd4bf;\n    --accent-2: #5eead4;\n    --link: #b9a3ff;\n    --link-hover: #f0abfc;\n    --zebra: #1a1530;\n    --hover: #261f42;\n    --th-bg: #241d3f;\n    --th-text: #cbbcff;\n    --input-bg: #120f20;\n    --shadow: 0 1px 2px rgba(0, 0, 0, .4), 0 10px 30px rgba(0, 0, 0, .35);\n    --nav-bg: rgba(20, 16, 36, .82);\n    --code-bg: #1f1a33;\n  }\n}\n\n:root[data-theme=\"dark\"] {\n  --bg: #0e0b19;\n  --bg-glow: rgba(139, 92, 246, .20);\n  --card: #171326;\n  --card-2: #1f1a33;\n  --text: #ece8f8;\n  --muted: #9d96b8;\n  --border: #2d2646;\n  --p1: #7c4dff;\n  --p2: #d946ef;\n  --accent: #2dd4bf;\n  --accent-2: #5eead4;\n  --link: #b9a3ff;\n  --link-hover: #f0abfc;\n  --zebra: #1a1530;\n  --hover: #261f42;\n  --th-bg: #241d3f;\n  --th-text: #cbbcff;\n  --input-bg: #120f20;\n  --shadow: 0 1px 2px rgba(0, 0, 0, .4), 0 10px 30px rgba(0, 0, 0, .35);\n  --nav-bg: rgba(20, 16, 36, .82);\n  --code-bg: #1f1a33;\n}\n\n/* ---- base ---- */\nhtml { color-scheme: light dark; }\n:root[data-theme=\"light\"] { color-scheme: light; }\n:root[data-theme=\"dark\"] { color-scheme: dark; }\n\nbody {\n  font-family: Inter, system-ui, -apple-system, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif;\n  font-size: 15px;\n  line-height: 1.6;\n  color: var(--text);\n  background: var(--bg) radial-gradient(1100px 520px at 12% -8%, var(--bg-glow), transparent 70%) no-repeat fixed;\n  margin: 0;\n  padding: 0 6px 40px;\n  -webkit-font-smoothing: antialiased;\n}\n\n::selection { background: var(--p2); color: #fff; }\n\na, a:link, a:visited, a:active { color: var(--link); text-decoration: none; transition: color .15s; }\na:hover, a:focus { color: var(--link-hover); text-decoration: underline; text-underline-offset: 3px; }\n\nh1, h2, h3, h4, h5 { color: var(--text); font-weight: 650; letter-spacing: -.01em; line-height: 1.25; }\nh1 { font-size: 26px; }\nh2 { font-size: 20px; margin-top: 22px; }\nh3 { font-size: 17px; }\n.lead { color: var(--text); font-weight: 650; font-size: 19px; }\nsmall, .small, .text-muted { color: var(--muted); }\nhr { border: 0; border-top: 1px solid var(--border); margin: 18px 2px; }\nhr.news_line { border: 0; border-top: 1px dashed var(--border); }\n.container-fluid { max-width: 1280px; margin-left: auto; margin-right: auto; }\n\ncode, pre, kbd, samp {\n  font-family: \"JetBrains Mono\", \"Cascadia Code\", Consolas, \"SFMono-Regular\", monospace;\n  background: var(--code-bg);\n  color: var(--text);\n  border: 1px solid var(--border);\n  border-radius: 8px;\n}\ncode { padding: 1px 6px; font-size: 90%; }\npre { padding: 12px 14px; overflow-x: auto; }\nblockquote {\n  border: 0;\n  border-left: 4px solid var(--p1);\n  background: var(--card-2);\n  color: var(--text);\n  border-radius: 0 12px 12px 0;\n  padding: 10px 16px;\n  margin: 12px 0;\n  font-size: 14px;\n}\n\n/* ---- navigation ---- */\n.navbar-default {\n  background: var(--nav-bg);\n  -webkit-backdrop-filter: saturate(160%) blur(12px);\n  backdrop-filter: saturate(160%) blur(12px);\n  border: 1px solid var(--border);\n  border-top: 0;\n  border-radius: 0 0 var(--radius) var(--radius);\n  box-shadow: var(--shadow);\n  margin-bottom: 14px;\n  position: sticky;\n  top: 0;\n  z-index: 1000;\n}\n.navbar-default .navbar-brand {\n  font-weight: 800;\n  letter-spacing: -.02em;\n  background: linear-gradient(90deg, var(--p1), var(--p2));\n  -webkit-background-clip: text;\n  background-clip: text;\n  -webkit-text-fill-color: transparent;\n  color: transparent;\n  padding-left: 46px;\n  position: relative;\n}\n.navbar-default .navbar-brand::before {\n  content: \"\";\n  position: absolute;\n  left: 12px;\n  top: 50%;\n  width: 26px;\n  height: 26px;\n  margin-top: -13px;\n  background: url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><g fill='none' stroke-linecap='round'><g stroke='%23c026a3' stroke-width='2.2' opacity='.9'><path d='M20 20 L20 3'/><path d='M20 20 L35 11'/><path d='M20 20 L35 29'/><path d='M20 20 L20 37'/><path d='M20 20 L5 29'/><path d='M20 20 L5 11'/></g><circle cx='20' cy='20' r='9' stroke='%236d3fc0' stroke-width='2.4' fill='%23ffffff' fill-opacity='.0'/><circle cx='20' cy='20' r='3.4' fill='%230d9f8f' stroke='none'/></g></svg>\") no-repeat center / contain;\n}\n.navbar-default .navbar-nav > li > a { color: var(--text); font-weight: 600; border-radius: 10px; margin: 6px 3px; padding: 8px 14px; transition: background .15s, color .15s; }\n.navbar-default .navbar-nav > li > a:hover,\n.navbar-default .navbar-nav > li > a:focus { background: var(--hover); color: var(--p1); text-decoration: none; }\n.navbar-default .navbar-nav > .active > a,\n.navbar-default .navbar-nav > .active > a:hover { background: var(--hover); color: var(--p1); }\n.navbar-default .navbar-toggle { border-color: var(--border); }\n.navbar-default .navbar-toggle .icon-bar { background: var(--p1); }\n.navbar-default .navbar-collapse { border-color: var(--border); }\n.dropdown-menu { background: var(--card); border: 1px solid var(--border); border-radius: 12px; box-shadow: var(--shadow); }\n.dropdown-menu > li > a { color: var(--text); }\n.dropdown-menu > li > a:hover { background: var(--hover); color: var(--p1); }\n\n/* banner */\ncenter > img.img-responsive,\n.container-fluid > center > img {\n  border-radius: var(--radius);\n  box-shadow: var(--shadow);\n  border: 1px solid var(--border);\n  margin: 4px auto 18px;\n}\n\n/* ---- cards (panels) ---- */\n.panel {\n  background: var(--card);\n  border: 1px solid var(--border);\n  border-radius: var(--radius);\n  box-shadow: var(--shadow);\n  overflow: hidden;\n  margin-bottom: 20px;\n}\n.panel-heading { padding: 12px 20px; border: 0; }\n.panel-title, .panel-heading h1, .panel-heading h2, .panel-heading h3 { font-size: 16px; font-weight: 700; margin: 0; letter-spacing: 0; }\n.panel-primary > .panel-heading {\n  background: linear-gradient(120deg, var(--p1), var(--p2));\n  color: #fff;\n  border: 0;\n}\n.panel-primary > .panel-heading h1, .panel-primary > .panel-heading .panel-title { color: #fff; }\n.panel-default > .panel-heading { background: var(--card-2); color: var(--text); border-bottom: 1px solid var(--border); }\n.panel-body { padding: 18px 22px; color: var(--text); }\n.panel-footer { background: var(--card-2); border-top: 1px solid var(--border); }\n.panel-primary, .panel-default { border-color: var(--border); }\n\n/* the home page link lists */\n.mainnav h2 {\n  font-size: 15px;\n  text-transform: uppercase;\n  letter-spacing: .08em;\n  color: var(--muted);\n  border-bottom: 1px solid var(--border);\n  padding-bottom: 6px;\n  margin-top: 26px;\n}\n.mainnav ul { padding-left: 4px; list-style: none; }\n.mainnav li { padding: 4px 0 4px 20px; position: relative; }\n.mainnav li::before {\n  content: \"\";\n  position: absolute;\n  left: 2px;\n  top: 14px;\n  width: 8px;\n  height: 8px;\n  border-radius: 50%;\n  background: linear-gradient(135deg, var(--p1), var(--p2));\n}\n.well { background: var(--card-2); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: none; color: var(--text); }\n\n/* ---- tables ---- */\n.table, table { color: var(--text); }\n.table { border-collapse: separate; border-spacing: 0; }\ntable.table { background: var(--card) !important; border: 1px solid var(--border); border-radius: 12px; }\n.table > thead > tr > th,\n.table > tbody > tr > th,\nth, td.heading {\n  background: var(--th-bg);\n  color: var(--th-text);\n  border-bottom: 2px solid var(--border);\n  font-size: 12.5px;\n  font-weight: 700;\n  text-transform: uppercase;\n  letter-spacing: .04em;\n  padding: 10px 12px;\n  vertical-align: middle;\n}\nth.subheading { background: var(--card-2); color: var(--muted); }\nth.bg-primary, td.bg-primary, tr.bg-primary > th, tr.bg-primary > td { background: var(--p1) !important; color: #fff !important; border-bottom: 0; }\n.panel-heading.bg-primary, div.bg-primary, span.bg-primary, p.bg-primary { background: linear-gradient(120deg, var(--p1), var(--p2)) !important; color: #fff !important; }\n.bg-primary a, .bg-primary a:link, .bg-primary a:visited { color: #fff; text-decoration: underline; text-underline-offset: 3px; }\ntr.bg-primary > th:first-child, th.bg-primary:first-child { border-top-left-radius: 11px; }\ntr.bg-primary > th:last-child, th.bg-primary:last-child { border-top-right-radius: 11px; }\n.bg-default { background: var(--card-2) !important; color: var(--text) !important; }\n.table > tbody > tr > td, .table > tbody > tr > th, td { border-top: 1px solid var(--border); padding: 8px 12px; vertical-align: middle; }\n.table-condensed > tbody > tr > td { padding: 6px 10px; }\n.table-striped > tbody > tr:nth-of-type(odd), .row1 { background: var(--zebra); }\n.table-striped > tbody > tr:nth-of-type(even), .row0 { background: transparent; }\n.table-hover > tbody > tr:hover, .table-striped > tbody > tr:hover { background: var(--hover); }\n.highlighted_row0, .highlighted_row1 { background: var(--hover); }\n.table-bordered, .bordered { border: 1px solid var(--border); border-radius: 12px; }\n.table-bordered > thead > tr > th, .table-bordered > tbody > tr > td { border-color: var(--border); }\ntd.fieldname { background: var(--card-2); color: var(--muted); font-weight: 600; }\ntd.fieldname_error, td.fieldvalue_error { background: rgba(220, 38, 38, .18); }\ntd.friend { background: var(--card-2); }\ntr.message { background: var(--card-2); }\n.running { background: rgba(45, 212, 191, .18); }\ntd.indent { border-color: transparent; }\n\n/* ---- forms ---- */\n.form-control, input[type=\"text\"], input[type=\"password\"], input[type=\"email\"], input[type=\"number\"], input[type=\"search\"], textarea, select {\n  background: var(--input-bg);\n  color: var(--text);\n  border: 1px solid var(--border);\n  border-radius: 10px;\n  box-shadow: none;\n  transition: border-color .15s, box-shadow .15s;\n}\n.form-control:focus, input:focus, textarea:focus, select:focus {\n  border-color: var(--p1);\n  box-shadow: 0 0 0 3px color-mix(in srgb, var(--p1) 28%, transparent);\n  outline: 0;\n}\n.control-label, label { color: var(--text); font-weight: 600; }\n.help-block { color: var(--muted); }\n.input-group-addon { background: var(--card-2); border: 1px solid var(--border); color: var(--muted); }\n::placeholder { color: var(--muted); opacity: .8; }\n\n/* ---- buttons ---- */\ninput[type=\"button\"], input[type=\"submit\"], .btn, a.btn {\n  border-radius: 10px;\n  font-weight: 650;\n  border: 1px solid transparent;\n  background-image: none !important;\n  box-shadow: none;\n  text-shadow: none;\n  transition: transform .12s, box-shadow .15s, filter .15s;\n  padding: 6px 14px;\n}\n.btn-xs { padding: 2px 8px; }\n.btn-sm { padding: 4px 11px; }\n.btn:hover, input[type=\"button\"]:hover, input[type=\"submit\"]:hover {\n  transform: translateY(-1px);\n  box-shadow: 0 6px 16px rgba(80, 40, 160, .22);\n  filter: brightness(1.06);\n  text-decoration: none;\n}\n.btn-primary, .btn-info, input[type=\"submit\"] { background: linear-gradient(120deg, var(--p1), var(--p2)) !important; color: #fff !important; }\n.btn-success, a.btn-green { background: linear-gradient(120deg, #0d9f8f, #16a34a) !important; color: #fff !important; border: 0; }\n.btn-warning { background: linear-gradient(120deg, #f59e0b, #f97316) !important; color: #fff !important; }\n.btn-danger { background: linear-gradient(120deg, #dc2626, #be185d) !important; color: #fff !important; }\n.btn-default, input[type=\"button\"] { background: var(--card-2) !important; color: var(--text) !important; border: 1px solid var(--border); }\n.btn-link { background: transparent !important; color: var(--link) !important; }\n.btn:focus { outline: 0; box-shadow: 0 0 0 3px color-mix(in srgb, var(--p1) 30%, transparent); }\n.btn font[size], .btn-success font { font-size: 17px !important; }\n\n/* ---- small parts ---- */\n.label, .badge { border-radius: 999px; font-weight: 600; }\n.label-primary, .badge { background: var(--p1); }\n.alert { border-radius: 12px; border: 1px solid var(--border); }\n.alert-danger { background: rgba(220, 38, 38, .13); color: var(--text); }\n.alert-success { background: rgba(22, 163, 74, .14); color: var(--text); }\n.alert-info { background: rgba(14, 165, 233, .13); color: var(--text); }\n.alert-warning { background: rgba(245, 158, 11, .15); color: var(--text); }\n.pagination > li > a, .pagination > li > span { background: var(--card); border-color: var(--border); color: var(--link); }\n.pagination > .active > a { background: var(--p1); border-color: var(--p1); color: #fff; }\n.progress { background: var(--card-2); border-radius: 999px; box-shadow: none; }\n.progress-bar { background: linear-gradient(90deg, var(--p1), var(--p2)); }\n.forum_toplinks a { border-radius: 8px; }\nimg.icon { vertical-align: middle; }\n.img-responsive { max-width: 100%; height: auto; }\n\n/* user avatars and profile images */\nimg[src*=\"user_profile/images\"] { border-radius: 12px; border: 1px solid var(--border); }\n\n/* scroll bars */\n* { scrollbar-width: thin; scrollbar-color: var(--p1) transparent; }\n*::-webkit-scrollbar { width: 10px; height: 10px; }\n*::-webkit-scrollbar-thumb { background: var(--p1); border-radius: 8px; border: 2px solid var(--bg); }\n*::-webkit-scrollbar-track { background: transparent; }\n\n/* ---- the Passiflora card (added by the userscript) ---- */\n.pf-card {\n  position: relative;\n  border-radius: var(--radius);\n  padding: 22px 26px;\n  margin: 0 0 20px;\n  color: #fff;\n  background: linear-gradient(125deg, #4c1d95 0%, #7c3aed 45%, #c026a3 100%);\n  box-shadow: var(--shadow);\n  overflow: hidden;\n}\n.pf-card::after {\n  content: \"\";\n  position: absolute;\n  right: -40px;\n  top: -40px;\n  width: 220px;\n  height: 220px;\n  border-radius: 50%;\n  background: radial-gradient(circle, rgba(255, 255, 255, .22), transparent 68%);\n  pointer-events: none;\n}\n.pf-card h3 { color: #fff; margin: 0 0 6px; font-size: 20px; }\n.pf-card p { margin: 4px 0 12px; opacity: .95; }\n.pf-card a { color: #fff; text-decoration: underline; }\n.pf-card .pf-actions { display: flex; flex-wrap: wrap; gap: 8px; }\n.pf-card .pf-actions a.btn { text-decoration: none; background: #fff !important; color: #4c1d95 !important; }\n.pf-card .pf-actions a.btn.pf-ghost { background: rgba(255, 255, 255, .16) !important; color: #fff !important; border: 1px solid rgba(255, 255, 255, .5); }\n.pf-card .pf-note { font-size: 12.5px; opacity: .85; margin-top: 10px; }\n.pf-toggle { cursor: pointer; }\n\n/* ---- small screens ---- */\n@media (max-width: 767px) {\n  body { font-size: 14.5px; }\n  .panel-body { padding: 14px; }\n  table.table { display: block; overflow-x: auto; -webkit-overflow-scrolling: touch; }\n  .navbar-default { border-radius: 0 0 12px 12px; }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  * { transition: none !important; }\n  .btn:hover { transform: none; }\n}\n";
  var st = document.createElement('style');
  st.id = 'passiflora-theme';
  st.textContent = css;
  (document.head || document.documentElement).appendChild(st);
})();

// Passiflora theme for NumberFields@home - small page enhancements.
// Coded By Alperen Yavuz - https://github.com/alplix/passiflora
// SPDX-License-Identifier: GPL-2.0-or-later
(function () {
  'use strict';
  var REPO = 'https://github.com/alplix/passiflora';
  var KEY_THEME = 'pf-theme';
  var KEY_CARD = 'pf-card-closed';

  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage may be blocked */ } }

  // ---- theme: auto (follow the system), light, dark -------------------------------------------
  function applyTheme(mode) {
    var root = document.documentElement;
    if (mode === 'light' || mode === 'dark') root.setAttribute('data-theme', mode);
    else root.removeAttribute('data-theme');
  }
  var mode = get(KEY_THEME) || 'auto';
  applyTheme(mode);                       // runs at document start, so there is no flash

  var LABEL = { auto: 'Auto', light: 'Light', dark: 'Dark' };
  var ICON = { auto: '◐', light: '☀', dark: '☾' };
  var NEXT = { auto: 'light', light: 'dark', dark: 'auto' };

  function addToggle() {
    var bar = document.querySelector('ul.navbar-nav.navbar-right') || document.querySelector('ul.navbar-nav');
    if (!bar || document.getElementById('pf-theme-toggle')) return;
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.id = 'pf-theme-toggle';
    a.className = 'pf-toggle';
    a.href = '#';
    function paint() {
      a.textContent = ICON[mode] + ' ' + LABEL[mode];
      a.title = 'Theme: ' + LABEL[mode] + ' (click to change)';
    }
    a.addEventListener('click', function (ev) {
      ev.preventDefault();
      mode = NEXT[mode];
      set(KEY_THEME, mode);
      applyTheme(mode);
      paint();
    });
    paint();
    li.appendChild(a);
    bar.appendChild(li);
  }

  // ---- the Passiflora card on the home page ---------------------------------------------------
  function detectSystem() {
    var ua = (navigator.userAgent || '') + ' ' + (navigator.platform || '');
    if (/Android/i.test(ua)) return { key: 'android', name: 'Android' };
    if (/FreeBSD/i.test(ua)) return { key: 'freebsd', name: 'FreeBSD' };
    if (/Win/i.test(ua)) return { key: 'windows', name: 'Windows' };
    if (/Mac/i.test(ua)) return { key: 'macos', name: 'macOS' };
    if (/aarch64|arm64|armv8/i.test(ua)) return { key: 'linux-arm', name: 'Linux ARM64' };
    if (/Linux|X11/i.test(ua)) return { key: 'linux', name: 'Linux' };
    return { key: 'other', name: 'your system' };
  }

  var HINT = {
    windows: 'CPU, OpenCL (NVIDIA / AMD / Intel) and CUDA (NVIDIA) packages',
    linux: 'CPU, OpenCL and CUDA packages',
    'linux-arm': 'CPU and OpenCL packages (Raspberry Pi 4/5, Ampere, Graviton)',
    macos: 'CPU package for Apple silicon',
    android: 'CPU package for rooted devices or Termux',
    freebsd: 'CPU package for FreeBSD 14 and newer',
    other: 'packages for Windows, Linux, macOS, FreeBSD, Android, ARM, RISC-V, PowerPC and IBM Z'
  };

  function addCard() {
    if (get(KEY_CARD) === '1') return;
    var path = location.pathname.replace(/\/+$/, '');
    if (!/\/NumberFields(\/index\.php)?$/i.test(path)) return;     // home page only
    var row = document.querySelector('.container-fluid .row .col-sm-6');
    if (!row) return;
    var rowEl = row.parentElement;
    if (!rowEl || document.getElementById('pf-card')) return;
    var sys = detectSystem();

    var card = document.createElement('div');
    card.id = 'pf-card';
    card.className = 'pf-card';
    card.innerHTML =
      '<h3>Passiflora – the faster GetDecics</h3>' +
      '<p>Same results as the stock app, in a fraction of the time. Optimized CPU and GPU versions for ' + sys.name +
      ' (' + HINT[sys.key] + ').</p>' +
      '<div class="pf-actions">' +
      '<a class="btn btn-sm" href="' + REPO + '/releases/latest">Download for ' + sys.name + '</a>' +
      '<a class="btn btn-sm pf-ghost" href="' + REPO + '/releases/latest/download/INSTALL.txt">Install guide</a>' +
      '<a class="btn btn-sm pf-ghost" href="' + REPO + '">Source code</a>' +
      '<a class="btn btn-sm pf-ghost" href="#" id="pf-card-close">Hide</a>' +
      '</div>' +
      '<div class="pf-note">Coded By Alperen Yavuz · ' + REPO.replace('https://', '') + '</div>';
    rowEl.parentNode.insertBefore(card, rowEl);
    document.getElementById('pf-card-close').addEventListener('click', function (ev) {
      ev.preventDefault();
      set(KEY_CARD, '1');
      card.parentNode.removeChild(card);
    });
  }

  // ---- small footer credit --------------------------------------------------------------------
  function addCredit() {
    if (document.getElementById('pf-credit')) return;
    var p = document.createElement('p');
    p.id = 'pf-credit';
    p.style.cssText = 'text-align:center;font-size:12px;opacity:.65;margin:28px 0 8px';
    p.innerHTML = 'Theme by Alperen Yavuz · <a href="' + REPO + '/tree/main/theme">Passiflora theme</a>';
    document.body.appendChild(p);
  }

  function ready() { addToggle(); addCard(); addCredit(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();
})();

