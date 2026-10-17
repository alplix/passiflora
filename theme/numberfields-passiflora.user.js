// ==UserScript==
// @name         Passiflora theme for NumberFields@home
// @namespace    https://github.com/alplix/passiflora
// @version      1.0.0
// @description  Chalk and Paper: a scholarly light/dark theme for NumberFields@home; the BOINC layout stays as it is.
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
  var css = "/*\n * NumberFields@home theme \"Meadow\" (BOINC web, Bootstrap 3).\n * Colours taken from the site's own banner: grass green, soil brown, sky gold and the blue-grey of its letters; serif headings.\n * The BOINC pages keep their structure; colours, type, panels, tables and the menu change.\n * Coded By Alperen Yavuz - https://github.com/alplix/passiflora\n * SPDX-License-Identifier: GPL-2.0-or-later\n */\n\n:root {\n  --bg: #f3f0e4;\n  --card: #fffef9;\n  --card-2: #ece7d3;\n  --text: #26261f;\n  --muted: #6c6b5c;\n  --border: #d9d2b8;\n  --bar: #3a2c1c;\n  --bar-text: #f6f0de;\n  --accent: #2e6b3a;\n  --copper: #c28a1c;\n  --link: #25688a;\n  --link-hover: #a8721a;\n  --zebra: #f9f6ea;\n  --hover: #efe9d2;\n  --th-text: #2e6b3a;\n  --input-bg: #ffffff;\n  --code-bg: #ece7d3;\n  --shadow: 0 1px 2px rgba(60, 50, 20, .08);\n  --serif: Georgia, \"Iowan Old Style\", \"Palatino Linotype\", Palatino, \"Book Antiqua\", serif;\n}\n@media (prefers-color-scheme: dark) {\n  :root {\n    --bg: #10150e;\n    --card: #171e14;\n    --card-2: #212a1c;\n    --text: #e6eadb;\n    --muted: #98a38b;\n    --border: #2c3827;\n    --bar: #22190f;\n    --bar-text: #f1e9d2;\n    --accent: #82c77c;\n    --copper: #e3b341;\n    --link: #8fcbe8;\n    --link-hover: #e3b341;\n    --zebra: #1b2318;\n    --hover: #263222;\n    --th-text: #a6dc9f;\n    --input-bg: #11170f;\n    --code-bg: #212a1c;\n    --shadow: 0 1px 2px rgba(0, 0, 0, .5);\n  }\n}\nhtml { color-scheme: light dark; }\n\n/* ---- base ---- */\nbody {\n  font-family: system-ui, -apple-system, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif;\n  font-size: 14.5px;\n  line-height: 1.6;\n  color: var(--text);\n  background: var(--bg);\n  margin: 0;\n  padding: 0 0 30px;\n}\na, a:link, a:visited, a:active { color: var(--link); text-decoration: none; }\na:hover, a:focus { color: var(--link-hover); text-decoration: underline; text-underline-offset: 3px; }\nh1, h2, h3, h4, h5 { font-family: var(--serif); color: var(--text); font-weight: 700; line-height: 1.25; }\nh1 { font-size: 26px; }\nh2 { font-size: 20px; }\nh3 { font-size: 17px; }\n.lead { font-family: var(--serif); color: var(--text); font-weight: 700; font-size: 19px; }\nsmall, .small, .text-muted { color: var(--muted); }\nhr { border: 0; border-top: 1px solid var(--border); margin: 16px 2px; }\nhr.news_line { border-top: 1px dotted var(--border); }\ncode, pre, kbd, samp { background: var(--code-bg); color: var(--text); border: 1px solid var(--border); border-radius: 4px; }\npre { padding: 10px 12px; }\nblockquote { border-left: 3px solid var(--copper); background: var(--card-2); color: var(--text); padding: 8px 14px; margin: 10px 0; font-size: 14px; }\n.container-fluid { max-width: 1240px; margin-left: auto; margin-right: auto; }\n\n/* ---- menu bar ---- */\n.navbar-default {\n  background: var(--bar);\n  border: 0;\n  border-bottom: 3px solid var(--copper);\n  border-radius: 0 0 6px 6px;\n  box-shadow: var(--shadow);\n  margin-bottom: 16px;\n  min-height: 52px;\n}\n.navbar-default .navbar-brand {\n  font-family: var(--serif);\n  font-size: 20px;\n  font-weight: 700;\n  font-style: italic;\n  color: var(--bar-text);\n  height: 52px;\n  padding-top: 14px;\n}\n.navbar-default .navbar-brand:hover { color: #fff; }\n.navbar-default .navbar-nav > li > a { color: var(--bar-text); font-weight: 500; padding-top: 16px; padding-bottom: 16px; }\n.navbar-default .navbar-nav > li > a:hover,\n.navbar-default .navbar-nav > li > a:focus,\n.navbar-default .navbar-nav > .open > a,\n.navbar-default .navbar-nav > .open > a:hover { background: rgba(255, 255, 255, .1); color: #fff; text-decoration: none; }\n.navbar-default .navbar-toggle { border-color: rgba(255, 255, 255, .4); margin-top: 10px; }\n.navbar-default .navbar-toggle .icon-bar { background: var(--bar-text); }\n.navbar-default .navbar-collapse { border-color: rgba(255, 255, 255, .15); }\n.dropdown-menu {\n  background: var(--card);\n  border: 1px solid var(--border);\n  border-top: 2px solid var(--copper);\n  border-radius: 0 0 6px 6px;\n  box-shadow: 0 8px 22px rgba(0, 0, 0, .22);\n  padding: 6px 0;\n  min-width: 210px;\n}\n.dropdown-menu > li > a { color: var(--text); padding: 6px 18px; }\n.dropdown-menu > li > a:hover { background: var(--hover); color: var(--accent); text-decoration: none; }\n.pf-caret { display: inline-block; margin-left: 6px; border-left: 4px solid transparent; border-right: 4px solid transparent; border-top: 5px solid currentColor; vertical-align: middle; opacity: .75; }\n\ncenter > img.img-responsive { border: 1px solid var(--border); border-radius: 6px; box-shadow: var(--shadow); }\n\n/* ---- panels: ruled headings instead of filled bars ---- */\n.panel { background: var(--card); border: 1px solid var(--border); border-radius: 6px; box-shadow: var(--shadow); position: relative; overflow: hidden; }\n.panel-heading { background: transparent; border: 0; padding: 14px 22px 0; }\n.panel-title, .panel-heading h1, .panel-heading h2, .panel-heading h3 {\n  font-family: var(--serif);\n  font-size: 19px;\n  font-weight: 700;\n  margin: 0;\n  padding-bottom: 8px;\n  border-bottom: 2px solid var(--accent);\n  color: var(--accent);\n}\n.panel-primary > .panel-heading, .panel-default > .panel-heading { background: transparent; color: var(--accent); border: 0; }\n.panel-primary > .panel-heading h1, .panel-primary > .panel-heading .panel-title { color: var(--accent); }\n.panel-body { color: var(--text); padding: 14px 22px 18px; }\n.panel-footer { background: var(--card-2); border-top: 1px solid var(--border); }\n.panel-primary, .panel-default { border-color: var(--border); }\n.well { background: var(--card-2); border: 1px solid var(--border); border-radius: 6px; box-shadow: none; color: var(--text); }\n.mainnav h3 { font-style: italic; }\n.mainnav h2 { font-size: 17px; margin-top: 20px; color: var(--copper); }\n\n/* ---- tables ---- */\ntable { color: var(--text); }\ntable.table { background: var(--card) !important; border: 1px solid var(--border); border-radius: 6px; border-collapse: separate; border-spacing: 0; }\n.table > thead > tr > th, .table > tbody > tr > th, th, td.heading {\n  background: var(--card-2);\n  color: var(--th-text);\n  border-bottom: 2px solid var(--accent);\n  font-weight: 700;\n  font-size: 13px;\n  padding: 8px 10px;\n  vertical-align: middle;\n}\nth.subheading { background: var(--card-2); color: var(--muted); }\nth.bg-primary, td.bg-primary, tr.bg-primary > th, tr.bg-primary > td { background: var(--bar) !important; color: var(--bar-text) !important; border-bottom: 2px solid var(--copper); }\n.bg-primary a, .bg-primary a:link, .bg-primary a:visited { color: var(--bar-text); text-decoration: underline; text-underline-offset: 3px; }\n.bg-default { background: var(--card-2) !important; color: var(--text) !important; }\n.table > tbody > tr > td, td { border-top: 1px solid var(--border); padding: 6px 10px; vertical-align: middle; font-variant-numeric: tabular-nums; }\n.table-striped > tbody > tr:nth-of-type(odd), .row1 { background: var(--zebra); }\n.table-striped > tbody > tr:nth-of-type(even), .row0 { background: transparent; }\n.table-hover > tbody > tr:hover, .table-striped > tbody > tr:hover { background: var(--hover); }\n.highlighted_row0, .highlighted_row1 { background: var(--hover); }\n.table-bordered, .bordered { border: 1px solid var(--border); border-radius: 6px; }\n.table-bordered > thead > tr > th, .table-bordered > tbody > tr > td { border-color: var(--border); }\ntd.fieldname { background: var(--card-2); color: var(--muted); font-weight: 600; }\ntd.fieldname_error, td.fieldvalue_error { background: rgba(200, 50, 40, .2); }\ntd.friend { background: var(--card-2); }\ntr.message { background: var(--card-2); }\n.running { background: rgba(40, 170, 120, .25); }\ntd.indent { border-color: transparent; }\n\n/* ---- forms and buttons ---- */\n.form-control, input[type=\"text\"], input[type=\"password\"], input[type=\"email\"], input[type=\"number\"], input[type=\"search\"], textarea, select {\n  background: var(--input-bg);\n  color: var(--text);\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  box-shadow: none;\n}\n.form-control:focus, input:focus, textarea:focus, select:focus { border-color: var(--accent); box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 28%, transparent); outline: 0; }\n.control-label, label { color: var(--text); font-weight: 600; }\n.help-block { color: var(--muted); }\n.input-group-addon { background: var(--card-2); border: 1px solid var(--border); color: var(--muted); }\n::placeholder { color: var(--muted); }\n\ninput[type=\"button\"], input[type=\"submit\"], .btn, a.btn { border-radius: 4px; font-weight: 600; border: 1px solid transparent; box-shadow: none; text-shadow: none; }\n.btn-primary, .btn-info, input[type=\"submit\"] { background: var(--accent) !important; color: #fff !important; }\n:root .btn-primary, :root .btn-info, :root input[type=\"submit\"] { color: #fff !important; }\n@media (prefers-color-scheme: dark) {\n  .btn-primary, .btn-info, input[type=\"submit\"] { background: #1e8f84 !important; }\n}\n.btn-success, a.btn-green { background: #2a7f4f !important; color: #fff !important; border: 0; }\n.btn-warning { background: var(--copper) !important; color: #fff !important; }\n.btn-danger { background: #b03a32 !important; color: #fff !important; }\n.btn-default, input[type=\"button\"] { background: var(--card-2) !important; color: var(--text) !important; border: 1px solid var(--border); }\n.btn-link { background: transparent !important; color: var(--link) !important; }\n.btn:hover, input[type=\"button\"]:hover, input[type=\"submit\"]:hover { filter: brightness(1.08); text-decoration: none; }\n\n/* ---- small parts ---- */\n.label, .badge { border-radius: 3px; }\n.label-primary, .badge { background: var(--accent); }\n.alert { border-radius: 4px; border: 1px solid var(--border); }\n.alert-danger { background: rgba(200, 50, 40, .14); color: var(--text); }\n.alert-success { background: rgba(40, 150, 90, .15); color: var(--text); }\n.alert-info { background: rgba(20, 130, 170, .14); color: var(--text); }\n.alert-warning { background: rgba(200, 130, 30, .16); color: var(--text); }\n.pagination > li > a, .pagination > li > span { background: var(--card); border-color: var(--border); color: var(--link); }\n.pagination > .active > a { background: var(--accent); border-color: var(--accent); color: #fff; }\n.progress { background: var(--card-2); box-shadow: none; }\n.progress-bar { background: var(--accent); }\nimg.icon { vertical-align: middle; }\n\n@media (max-width: 767px) {\n  body { font-size: 14px; }\n  .panel-body { padding: 12px 14px 16px; }\n  table.table { display: block; overflow-x: auto; }\n  .navbar-default .navbar-nav .open .dropdown-menu { background: transparent; border: 0; box-shadow: none; }\n  .navbar-default .navbar-nav .open .dropdown-menu > li > a { color: var(--bar-text); }\n}\n";
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

