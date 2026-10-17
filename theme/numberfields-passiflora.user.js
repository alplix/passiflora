// ==UserScript==
// @name         Passiflora theme for NumberFields@home
// @namespace    https://github.com/alplix/passiflora
// @version      1.0.0
// @description  Prime: a modern, quiet light/dark theme for NumberFields@home; the BOINC layout stays as it is.
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
  var css = "/*\n * NumberFields@home theme \"Prime\" (BOINC web, Bootstrap 3).\n * Modern and quiet: system sans type, soft cards, hairline tables, one indigo accent, light and dark by system setting.\n * The BOINC pages keep their structure.\n * Coded By Alperen Yavuz - https://github.com/alplix/passiflora\n * SPDX-License-Identifier: GPL-2.0-or-later\n */\n\n:root {\n  --bg: #f5f6fb;\n  --bg-glow: rgba(91, 91, 214, .10);\n  --card: #ffffff;\n  --card-2: #f1f2f9;\n  --text: #151826;\n  --muted: #667085;\n  --border: #e3e6f0;\n  --accent: #5b5bd6;\n  --accent-strong: #4646c0;\n  --accent-soft: rgba(91, 91, 214, .10);\n  --amber: #f0a020;\n  --link: #4a4ac2;\n  --link-hover: #2e2e9e;\n  --hover: #f3f4fb;\n  --th-text: #667085;\n  --input-bg: #ffffff;\n  --code-bg: #f1f2f9;\n  --nav-bg: rgba(255, 255, 255, .82);\n  --shadow: 0 1px 2px rgba(20, 24, 60, .05), 0 6px 20px rgba(20, 24, 60, .05);\n  --radius: 14px;\n}\n@media (prefers-color-scheme: dark) {\n  :root {\n    --bg: #0c0e16;\n    --bg-glow: rgba(110, 110, 240, .14);\n    --card: #131622;\n    --card-2: #1a1e2e;\n    --text: #e7e9f3;\n    --muted: #8d94ab;\n    --border: #232840;\n    --accent: #8b8bf5;\n    --accent-strong: #a5a5ff;\n    --accent-soft: rgba(139, 139, 245, .14);\n    --amber: #f5b13d;\n    --link: #a3a8ff;\n    --link-hover: #cfd2ff;\n    --hover: #1a1e2f;\n    --th-text: #8d94ab;\n    --input-bg: #0f1220;\n    --code-bg: #1a1e2e;\n    --nav-bg: rgba(14, 16, 26, .82);\n    --shadow: 0 1px 2px rgba(0, 0, 0, .4), 0 8px 24px rgba(0, 0, 0, .3);\n  }\n}\nhtml { color-scheme: light dark; }\n\n/* ---- base ---- */\nbody {\n  font-family: Inter, system-ui, -apple-system, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif;\n  font-size: 15px;\n  line-height: 1.65;\n  color: var(--text);\n  background: var(--bg) radial-gradient(900px 380px at 50% -120px, var(--bg-glow), transparent 70%) no-repeat;\n  margin: 0;\n  padding: 0 8px 40px;\n  -webkit-font-smoothing: antialiased;\n}\n::selection { background: var(--accent); color: #fff; }\na, a:link, a:visited, a:active { color: var(--link); text-decoration: none; }\na:hover, a:focus { color: var(--link-hover); text-decoration: underline; text-underline-offset: 3px; }\nh1, h2, h3, h4, h5 { color: var(--text); font-weight: 650; letter-spacing: -.012em; line-height: 1.3; }\nh1 { font-size: 26px; }\nh2 { font-size: 20px; }\nh3 { font-size: 17px; }\n.lead { color: var(--text); font-weight: 650; font-size: 19px; }\nsmall, .small, .text-muted { color: var(--muted); }\nhr { border: 0; border-top: 1px solid var(--border); margin: 20px 2px; }\nhr.news_line { border-top: 1px solid var(--border); }\ncode, pre, kbd, samp { background: var(--code-bg); color: var(--text); border: 1px solid var(--border); border-radius: 8px; font-family: \"JetBrains Mono\", \"Cascadia Code\", Consolas, monospace; }\npre { padding: 12px 14px; }\nblockquote { border: 0; border-left: 3px solid var(--accent); background: var(--card-2); color: var(--text); border-radius: 0 10px 10px 0; padding: 10px 16px; margin: 12px 0; font-size: 14.5px; }\n.container-fluid { max-width: 1240px; margin-left: auto; margin-right: auto; }\n\n/* ---- menu bar ---- */\n.navbar-default {\n  background: var(--nav-bg);\n  -webkit-backdrop-filter: saturate(160%) blur(14px);\n  backdrop-filter: saturate(160%) blur(14px);\n  border: 1px solid var(--border);\n  border-top: 0;\n  border-radius: 0 0 var(--radius) var(--radius);\n  box-shadow: var(--shadow);\n  margin-bottom: 18px;\n  min-height: 56px;\n  position: sticky;\n  top: 0;\n  z-index: 1000;\n}\n.navbar-default .navbar-brand {\n  color: var(--text);\n  font-weight: 750;\n  letter-spacing: -.02em;\n  height: 56px;\n  padding: 16px 15px 16px 52px;\n  position: relative;\n}\n.navbar-default .navbar-brand::before {\n  content: \"\\221A\";\n  position: absolute;\n  left: 14px;\n  top: 12px;\n  width: 30px;\n  height: 30px;\n  border-radius: 9px;\n  background: linear-gradient(135deg, var(--accent), #8a63e0);\n  color: #fff;\n  font-size: 18px;\n  font-weight: 700;\n  line-height: 30px;\n  text-align: center;\n  box-shadow: 0 2px 8px color-mix(in srgb, var(--accent) 45%, transparent);\n}\n.navbar-default .navbar-brand:hover { color: var(--text); }\n.navbar-default .navbar-nav > li > a { color: var(--muted); font-weight: 550; margin: 9px 2px; padding: 8px 13px; border-radius: 9px; }\n.navbar-default .navbar-nav > li > a:hover,\n.navbar-default .navbar-nav > li > a:focus,\n.navbar-default .navbar-nav > .open > a,\n.navbar-default .navbar-nav > .open > a:hover { background: var(--accent-soft); color: var(--accent-strong); text-decoration: none; }\n.navbar-default .navbar-toggle { border-color: var(--border); margin-top: 11px; }\n.navbar-default .navbar-toggle .icon-bar { background: var(--text); }\n.navbar-default .navbar-collapse { border-color: var(--border); }\n.dropdown-menu { background: var(--card); border: 1px solid var(--border); border-radius: 12px; box-shadow: var(--shadow); padding: 6px; margin-top: 4px; min-width: 220px; }\n.dropdown-menu > li > a { color: var(--text); padding: 7px 12px; border-radius: 8px; }\n.dropdown-menu > li > a:hover { background: var(--accent-soft); color: var(--accent-strong); text-decoration: none; }\n.pf-caret { display: inline-block; margin-left: 6px; border-left: 4px solid transparent; border-right: 4px solid transparent; border-top: 5px solid currentColor; vertical-align: middle; opacity: .6; }\n\n/* the banner keeps its picture; it just sits in a rounded frame */\ncenter > img.img-responsive { border-radius: var(--radius); box-shadow: var(--shadow); margin-bottom: 4px; }\n\n/* ---- cards ---- */\n.panel { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow); overflow: hidden; margin-bottom: 22px; }\n.panel-heading { background: transparent; border: 0; border-bottom: 1px solid var(--border); padding: 14px 22px; }\n.panel-title, .panel-heading h1, .panel-heading h2, .panel-heading h3 { font-size: 16px; font-weight: 650; margin: 0; letter-spacing: -.01em; color: var(--text); position: relative; padding-left: 14px; }\n.panel-title::before, .panel-heading h1::before, .panel-heading h2::before, .panel-heading h3::before {\n  content: \"\";\n  position: absolute;\n  left: 0;\n  top: 3px;\n  bottom: 3px;\n  width: 4px;\n  border-radius: 4px;\n  background: linear-gradient(180deg, var(--accent), var(--amber));\n}\n.panel-primary > .panel-heading, .panel-default > .panel-heading { background: transparent; color: var(--text); }\n.panel-primary > .panel-heading h1, .panel-primary > .panel-heading .panel-title { color: var(--text); }\n.panel-body { color: var(--text); padding: 18px 24px 22px; }\n.panel-footer { background: var(--card-2); border-top: 1px solid var(--border); }\n.panel-primary, .panel-default { border-color: var(--border); }\n.well { background: var(--card-2); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: none; color: var(--text); }\n.mainnav h3 { font-size: 22px; }\n.mainnav h2 { font-size: 15px; text-transform: uppercase; letter-spacing: .07em; color: var(--muted); margin-top: 26px; font-weight: 650; }\n.mainnav ul { padding-left: 20px; }\n.mainnav li { padding: 2px 0; }\n.mainnav li::marker { color: var(--accent); }\n\n/* ---- tables ---- */\ntable { color: var(--text); }\ntable.table { background: var(--card) !important; border: 1px solid var(--border); border-radius: 12px; border-collapse: separate; border-spacing: 0; overflow: hidden; }\n.table > thead > tr > th, .table > tbody > tr > th, th, td.heading {\n  background: var(--card-2);\n  color: var(--th-text);\n  border-bottom: 1px solid var(--border);\n  font-size: 12px;\n  font-weight: 650;\n  text-transform: uppercase;\n  letter-spacing: .06em;\n  padding: 10px 12px;\n  vertical-align: middle;\n}\nth.subheading { background: var(--card-2); color: var(--muted); }\nth.bg-primary, td.bg-primary, tr.bg-primary > th, tr.bg-primary > td { background: var(--card-2) !important; color: var(--th-text) !important; border-bottom: 1px solid var(--border); }\n.bg-primary a, .bg-primary a:link, .bg-primary a:visited { color: var(--accent-strong); text-decoration: underline; text-underline-offset: 3px; }\n.bg-default { background: var(--card-2) !important; color: var(--text) !important; }\n.table > tbody > tr > td, td { border-top: 1px solid var(--border); padding: 9px 12px; vertical-align: middle; font-variant-numeric: tabular-nums; }\n.table-striped > tbody > tr:nth-of-type(odd), .table-striped > tbody > tr:nth-of-type(even), .row0, .row1 { background: transparent; }\n.table-hover > tbody > tr:hover, .table-striped > tbody > tr:hover { background: var(--hover); }\n.highlighted_row0, .highlighted_row1 { background: var(--accent-soft); }\n.table-bordered, .bordered { border: 1px solid var(--border); border-radius: 12px; }\n.table-bordered > thead > tr > th, .table-bordered > tbody > tr > td { border-color: var(--border); }\ntd.fieldname { background: var(--card-2); color: var(--muted); font-weight: 600; }\ntd.fieldname_error, td.fieldvalue_error { background: rgba(220, 38, 38, .16); }\ntd.friend { background: var(--card-2); }\ntr.message { background: var(--card-2); }\n.running { background: rgba(34, 170, 120, .22); }\ntd.indent { border-color: transparent; }\n\n/* ---- forms and buttons ---- */\n.form-control, input[type=\"text\"], input[type=\"password\"], input[type=\"email\"], input[type=\"number\"], input[type=\"search\"], textarea, select {\n  background: var(--input-bg);\n  color: var(--text);\n  border: 1px solid var(--border);\n  border-radius: 10px;\n  box-shadow: none;\n  transition: border-color .15s, box-shadow .15s;\n}\n.form-control:focus, input:focus, textarea:focus, select:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); outline: 0; }\n.control-label, label { color: var(--text); font-weight: 600; }\n.help-block { color: var(--muted); }\n.input-group-addon { background: var(--card-2); border: 1px solid var(--border); color: var(--muted); border-radius: 10px; }\n::placeholder { color: var(--muted); opacity: .8; }\n\ninput[type=\"button\"], input[type=\"submit\"], .btn, a.btn {\n  border-radius: 10px;\n  font-weight: 600;\n  border: 1px solid transparent;\n  box-shadow: none;\n  text-shadow: none;\n  padding: 6px 15px;\n  transition: filter .15s, box-shadow .15s, transform .12s;\n}\n.btn-xs { padding: 2px 9px; }\n.btn-sm { padding: 4px 12px; }\n.btn-primary, .btn-info, input[type=\"submit\"] { background: var(--accent) !important; color: #fff !important; box-shadow: 0 1px 2px rgba(40, 40, 120, .25); }\n@media (prefers-color-scheme: dark) { .btn-primary, .btn-info, input[type=\"submit\"] { background: #6f6fe0 !important; } }\n.btn-success, a.btn-green { background: #1f9d6e !important; color: #fff !important; border: 0; }\n.btn-warning { background: #d98a12 !important; color: #fff !important; }\n.btn-danger { background: #cf3a4a !important; color: #fff !important; }\n.btn-default, input[type=\"button\"] { background: var(--card) !important; color: var(--text) !important; border: 1px solid var(--border); }\n.btn-link { background: transparent !important; color: var(--link) !important; }\n.btn:hover, input[type=\"button\"]:hover, input[type=\"submit\"]:hover { filter: brightness(1.07); text-decoration: none; transform: translateY(-1px); }\n.btn:focus { outline: 0; box-shadow: 0 0 0 3px var(--accent-soft); }\n\n/* ---- small parts ---- */\n.label, .badge { border-radius: 999px; font-weight: 600; }\n.label-primary, .badge { background: var(--accent); }\n.alert { border-radius: 12px; border: 1px solid var(--border); }\n.alert-danger { background: rgba(220, 38, 38, .12); color: var(--text); }\n.alert-success { background: rgba(22, 163, 74, .13); color: var(--text); }\n.alert-info { background: rgba(14, 165, 233, .12); color: var(--text); }\n.alert-warning { background: rgba(245, 158, 11, .14); color: var(--text); }\n.pagination > li > a, .pagination > li > span { background: var(--card); border-color: var(--border); color: var(--link); }\n.pagination > .active > a { background: var(--accent); border-color: var(--accent); color: #fff; }\n.progress { background: var(--card-2); box-shadow: none; border-radius: 999px; }\n.progress-bar { background: linear-gradient(90deg, var(--accent), #8a63e0); }\nimg.icon { vertical-align: middle; }\n* { scrollbar-width: thin; scrollbar-color: color-mix(in srgb, var(--muted) 55%, transparent) transparent; }\n\n@media (max-width: 767px) {\n  body { font-size: 14.5px; }\n  .panel-body { padding: 14px 16px 18px; }\n  table.table { display: block; overflow-x: auto; }\n  .navbar-default .navbar-nav .open .dropdown-menu { background: transparent; border: 0; box-shadow: none; }\n}\n@media (prefers-reduced-motion: reduce) { * { transition: none !important; } .btn:hover { transform: none; } }\n";
  var st = document.createElement('style');
  st.id = 'passiflora-theme';
  st.textContent = css;
  (document.head || document.documentElement).appendChild(st);
})();

// Passiflora theme for NumberFields@home - the menu bar and the system requirements.
// The menu only regroups links the site already has (they are scattered over the home page).
// Coded By Alperen Yavuz - https://github.com/alplix/passiflora
// SPDX-License-Identifier: GPL-2.0-or-later
(function () {
  'use strict';

  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage may be blocked */ } }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // ---- menu bar -------------------------------------------------------------------------------------
  // [group, [[page, English fallback label], ...]]. Labels are taken from the site's own link texts when the
  // home page has been seen (so they follow the visitor's language).
  var MENU = [
    ['Project', [['ProjectDescription.html', 'Project description'], ['info.php', 'Rules and policies'], ['apps.php', 'Applications'],
                 ['FieldTables/FieldTables.html', 'Field tables'], ['server_status.html', 'Server status'], ['batch_status.html', 'Batch status']]],
    ['Account', [['home.php', 'Your account'], ['team.php', 'Teams'], ['cert1.php', 'Certificate']]],
    ['Statistics', [['stats.php', 'Statistics'], ['top_users.php', 'Top users'], ['top_hosts.php', 'Top computers'], ['top_teams.php', 'Top teams']]],
    ['Community', [['forum_index.php', 'Message boards'], ['forum_help_desk.php', 'Questions and answers'], ['profile_menu.php', 'Profiles'],
                   ['user_search.php', 'User search'], ['language_select.php', 'Languages']]]
  ];

  function baseUrl() {
    var m = location.pathname.match(/^(.*\/NumberFields\/)/i);
    return m ? m[1] : '/NumberFields/';
  }

  function learnLabels() {
    var path = location.pathname.replace(/\/+$/, '');
    if (!/\/NumberFields(\/index\.php)?$/i.test(path)) return;
    var map = {};
    document.querySelectorAll('.mainnav a[href]').forEach(function (a) {
      var h = a.getAttribute('href');
      var t = a.textContent.trim();
      if (h && t && !/^https?:/i.test(h)) map[h.replace(/^.*\/NumberFields\//, '')] = t;
    });
    var have = 0;
    for (var k in map) { if (map.hasOwnProperty(k)) have++; }
    if (have) set('pf-labels', JSON.stringify(map));
  }

  function buildMenu() {
    var nav = document.querySelector('#myNavbar ul.navbar-nav:not(.navbar-right)') || document.querySelector('ul.navbar-nav');
    if (!nav || nav.getAttribute('data-pf-menu')) return;
    var labels = {};
    try { labels = JSON.parse(get('pf-labels') || '{}'); } catch (e) { labels = {}; }
    var base = baseUrl();
    var html = '';
    MENU.forEach(function (g) {
      html += '<li class="dropdown pf-dd"><a href="#" class="pf-dd-toggle" aria-haspopup="true" aria-expanded="false">' + esc(g[0]) +
              '<span class="pf-caret"></span></a><ul class="dropdown-menu">';
      g[1].forEach(function (it) {
        html += '<li><a href="' + esc(base + it[0]) + '">' + esc(labels[it[0]] || it[1]) + '</a></li>';
      });
      html += '</ul></li>';
    });
    nav.insertAdjacentHTML('beforeend', html);
    nav.setAttribute('data-pf-menu', '1');
    nav.querySelectorAll('.pf-dd-toggle').forEach(function (a) {
      a.addEventListener('click', function (ev) {
        ev.preventDefault();
        var li = a.parentNode;
        var was = li.classList.contains('open');
        nav.querySelectorAll('.pf-dd.open').forEach(function (o) { o.classList.remove('open'); o.firstChild.setAttribute('aria-expanded', 'false'); });
        if (!was) { li.classList.add('open'); a.setAttribute('aria-expanded', 'true'); }
      });
    });
    document.addEventListener('click', function (ev) {
      if (!nav.contains(ev.target)) nav.querySelectorAll('.pf-dd.open').forEach(function (o) { o.classList.remove('open'); });
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') nav.querySelectorAll('.pf-dd.open').forEach(function (o) { o.classList.remove('open'); });
    });
  }

  // ---- system requirements ---------------------------------------------------------------------------
  // The old list (128 MB of RAM, 32 MB of disk, "Intel/Amd processor", "Windows, Linux or Mac (x86)") describes
  // hardware from 2010. Same list, same place, current values.
  var ITEMS = [
    'A 64-bit processor (Intel or AMD x86-64).',
    'At least 1 GB of RAM (a task itself needs far less).',
    'About 250 MB of free disk space per task.',
    'Windows, Linux or macOS (64-bit).',
    'Optional: a graphics card with double-precision OpenCL (NVIDIA, AMD or Intel) or CUDA (NVIDIA) for the GPU apps.'
  ];
  function fixRequirements() {
    var nav = document.querySelector('.mainnav');
    if (!nav || nav.getAttribute('data-pf-req')) return;
    var uls = nav.querySelectorAll('ul');
    for (var i = 0; i < uls.length; i++) {
      var t = uls[i].textContent;
      if (/ram/i.test(t) && /Windows|Linux/i.test(t) && /MB/.test(t)) {
        uls[i].innerHTML = '<li>' + ITEMS.join('</li><li>') + '</li>';
        nav.setAttribute('data-pf-req', '1');
        break;
      }
    }
    nav.querySelectorAll('li').forEach(function (li) {
      if (/pre-5\.0/.test(li.innerHTML)) {
        li.innerHTML = li.innerHTML.replace('command-line or pre-5.0 version of BOINC', 'command-line version of BOINC');
      }
    });
  }

  function ready() { learnLabels(); buildMenu(); fixRequirements(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();
})();

