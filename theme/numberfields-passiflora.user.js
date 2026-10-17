// ==UserScript==
// @name         Passiflora theme for NumberFields@home
// @namespace    https://github.com/alplix/passiflora
// @version      1.0.0
// @description  A calm light/dark restyle of the NumberFields@home pages; the BOINC layout stays as it is.
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
  var css = "/*\n * Passiflora theme for NumberFields@home (BOINC web, Bootstrap 3).\n * A calm restyle: the pages, menus and tables stay exactly as BOINC builds them; only colours,\n * type and spacing change. Light and dark follow the system setting.\n * Coded By Alperen Yavuz - https://github.com/alplix/passiflora\n * SPDX-License-Identifier: GPL-2.0-or-later\n */\n\n:root {\n  --bg: #f4f5fa;\n  --card: #ffffff;\n  --card-2: #eef0f8;\n  --text: #1e2230;\n  --muted: #666e85;\n  --border: #dde1ee;\n  --head: #4b45a8;\n  --accent: #4b45a8;\n  --link: #3a45b0;\n  --link-hover: #231f7a;\n  --zebra: #f8f9fd;\n  --hover: #eceefa;\n  --th-bg: #e8eaf6;\n  --th-text: #33307a;\n  --input-bg: #ffffff;\n  --code-bg: #eef0f8;\n  --shadow: 0 1px 2px rgba(20, 24, 50, .06);\n  --radius: 10px;\n}\n@media (prefers-color-scheme: dark) {\n  :root {\n    --bg: #12141c;\n    --card: #1a1d29;\n    --card-2: #222638;\n    --text: #e4e7f1;\n    --muted: #9aa3ba;\n    --border: #2b3044;\n    --head: #3f3b96;\n    --accent: #9a96f0;\n    --link: #a7b1ff;\n    --link-hover: #d3d8ff;\n    --zebra: #1d2130;\n    --hover: #262b40;\n    --th-bg: #232840;\n    --th-text: #c9cdf6;\n    --input-bg: #141722;\n    --code-bg: #222638;\n    --shadow: 0 1px 2px rgba(0, 0, 0, .4);\n  }\n}\nhtml { color-scheme: light dark; }\n\n/* ---- base ---- */\nbody {\n  font-family: system-ui, -apple-system, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif;\n  font-size: 14.5px;\n  line-height: 1.55;\n  color: var(--text);\n  background: var(--bg);\n  margin: 0;\n  padding: 0 6px 30px;\n}\na, a:link, a:visited, a:active { color: var(--link); text-decoration: none; }\na:hover, a:focus { color: var(--link-hover); text-decoration: underline; }\nh1, h2, h3, h4, h5 { color: var(--text); font-weight: 600; line-height: 1.3; }\nh1 { font-size: 24px; }\nh2 { font-size: 19px; }\nh3 { font-size: 16px; }\n.lead { color: var(--text); font-weight: 600; font-size: 18px; }\nsmall, .small, .text-muted { color: var(--muted); }\nhr { border: 0; border-top: 1px solid var(--border); margin: 16px 2px; }\nhr.news_line { border-top: 1px solid var(--border); }\ncode, pre, kbd, samp { background: var(--code-bg); color: var(--text); border: 1px solid var(--border); border-radius: 6px; }\npre { padding: 10px 12px; }\nblockquote { border-left: 3px solid var(--accent); background: var(--card-2); color: var(--text); padding: 8px 14px; margin: 10px 0; font-size: 14px; }\n\n/* ---- menu ---- */\n.navbar-default { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow); }\n.navbar-default .navbar-brand { color: var(--accent); font-weight: 700; }\n.navbar-default .navbar-brand:hover { color: var(--link-hover); }\n.navbar-default .navbar-nav > li > a { color: var(--text); font-weight: 500; }\n.navbar-default .navbar-nav > li > a:hover,\n.navbar-default .navbar-nav > li > a:focus { background: var(--hover); color: var(--accent); text-decoration: none; }\n.navbar-default .navbar-nav > .active > a,\n.navbar-default .navbar-nav > .active > a:hover { background: var(--hover); color: var(--accent); }\n.navbar-default .navbar-toggle { border-color: var(--border); }\n.navbar-default .navbar-toggle .icon-bar { background: var(--accent); }\n.navbar-default .navbar-collapse { border-color: var(--border); }\n.dropdown-menu { background: var(--card); border: 1px solid var(--border); border-radius: 8px; }\n.dropdown-menu > li > a { color: var(--text); }\n.dropdown-menu > li > a:hover { background: var(--hover); color: var(--accent); }\n\ncenter > img.img-responsive { border-radius: var(--radius); border: 1px solid var(--border); }\n\n/* ---- panels ---- */\n.panel { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow); overflow: hidden; }\n.panel-heading { border: 0; padding: 10px 18px; }\n.panel-title, .panel-heading h1, .panel-heading h2, .panel-heading h3 { font-size: 15.5px; font-weight: 600; margin: 0; }\n.panel-primary > .panel-heading { background: var(--head); color: #fff; border: 0; }\n.panel-primary > .panel-heading h1, .panel-primary > .panel-heading .panel-title { color: #fff; }\n.panel-default > .panel-heading { background: var(--card-2); color: var(--text); border-bottom: 1px solid var(--border); }\n.panel-body { color: var(--text); padding: 16px 20px; }\n.panel-footer { background: var(--card-2); border-top: 1px solid var(--border); }\n.panel-primary, .panel-default { border-color: var(--border); }\n.well { background: var(--card-2); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: none; color: var(--text); }\n.mainnav h2 { font-size: 16px; margin-top: 20px; }\n\n/* ---- tables ---- */\ntable { color: var(--text); }\ntable.table { background: var(--card) !important; border: 1px solid var(--border); border-radius: 8px; border-collapse: separate; border-spacing: 0; }\n.table > thead > tr > th, .table > tbody > tr > th, th, td.heading {\n  background: var(--th-bg);\n  color: var(--th-text);\n  border-bottom: 1px solid var(--border);\n  font-weight: 600;\n  padding: 8px 10px;\n  vertical-align: middle;\n}\nth.subheading { background: var(--card-2); color: var(--muted); }\nth.bg-primary, td.bg-primary, tr.bg-primary > th, tr.bg-primary > td { background: var(--head) !important; color: #fff !important; border-bottom: 0; }\n.bg-primary a, .bg-primary a:link, .bg-primary a:visited { color: #fff; text-decoration: underline; }\n.bg-default { background: var(--card-2) !important; color: var(--text) !important; }\n.table > tbody > tr > td, td { border-top: 1px solid var(--border); padding: 6px 10px; vertical-align: middle; font-variant-numeric: tabular-nums; }\n.table-striped > tbody > tr:nth-of-type(odd), .row1 { background: var(--zebra); }\n.table-striped > tbody > tr:nth-of-type(even), .row0 { background: transparent; }\n.table-hover > tbody > tr:hover, .table-striped > tbody > tr:hover { background: var(--hover); }\n.highlighted_row0, .highlighted_row1 { background: var(--hover); }\n.table-bordered, .bordered { border: 1px solid var(--border); border-radius: 8px; }\n.table-bordered > thead > tr > th, .table-bordered > tbody > tr > td { border-color: var(--border); }\ntd.fieldname { background: var(--card-2); color: var(--muted); font-weight: 600; }\ntd.fieldname_error, td.fieldvalue_error { background: rgba(220, 38, 38, .18); }\ntd.friend { background: var(--card-2); }\ntr.message { background: var(--card-2); }\n.running { background: rgba(34, 160, 120, .22); }\ntd.indent { border-color: transparent; }\n\n/* ---- forms and buttons ---- */\n.form-control, input[type=\"text\"], input[type=\"password\"], input[type=\"email\"], input[type=\"number\"], input[type=\"search\"], textarea, select {\n  background: var(--input-bg);\n  color: var(--text);\n  border: 1px solid var(--border);\n  border-radius: 6px;\n  box-shadow: none;\n}\n.form-control:focus, input:focus, textarea:focus, select:focus { border-color: var(--accent); box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 25%, transparent); outline: 0; }\n.control-label, label { color: var(--text); font-weight: 600; }\n.help-block { color: var(--muted); }\n.input-group-addon { background: var(--card-2); border: 1px solid var(--border); color: var(--muted); }\n::placeholder { color: var(--muted); }\n\ninput[type=\"button\"], input[type=\"submit\"], .btn, a.btn {\n  border-radius: 6px;\n  font-weight: 600;\n  border: 1px solid transparent;\n  box-shadow: none;\n  text-shadow: none;\n}\n.btn-primary, .btn-info, input[type=\"submit\"] { background: var(--head) !important; color: #fff !important; }\n.btn-success, a.btn-green { background: #1f8a62 !important; color: #fff !important; border: 0; }\n.btn-warning { background: #c77d12 !important; color: #fff !important; }\n.btn-danger { background: #b83243 !important; color: #fff !important; }\n.btn-default, input[type=\"button\"] { background: var(--card-2) !important; color: var(--text) !important; border: 1px solid var(--border); }\n.btn-link { background: transparent !important; color: var(--link) !important; }\n.btn:hover, input[type=\"button\"]:hover, input[type=\"submit\"]:hover { filter: brightness(1.1); text-decoration: none; }\n\n/* ---- small parts ---- */\n.label, .badge { border-radius: 999px; }\n.label-primary, .badge { background: var(--head); }\n.alert { border-radius: 8px; border: 1px solid var(--border); }\n.alert-danger { background: rgba(220, 38, 38, .13); color: var(--text); }\n.alert-success { background: rgba(22, 163, 74, .14); color: var(--text); }\n.alert-info { background: rgba(14, 165, 233, .13); color: var(--text); }\n.alert-warning { background: rgba(245, 158, 11, .15); color: var(--text); }\n.pagination > li > a, .pagination > li > span { background: var(--card); border-color: var(--border); color: var(--link); }\n.pagination > .active > a { background: var(--head); border-color: var(--head); color: #fff; }\n.progress { background: var(--card-2); box-shadow: none; }\n.progress-bar { background: var(--head); }\nimg.icon { vertical-align: middle; }\n\n@media (max-width: 767px) {\n  body { font-size: 14px; }\n  .panel-body { padding: 12px; }\n  table.table { display: block; overflow-x: auto; }\n}\n";
  var st = document.createElement('style');
  st.id = 'passiflora-theme';
  st.textContent = css;
  (document.head || document.documentElement).appendChild(st);
})();

// Passiflora theme for NumberFields@home - one small content fix: the system requirements on the home page.
// Coded By Alperen Yavuz - https://github.com/alplix/passiflora
// SPDX-License-Identifier: GPL-2.0-or-later
(function () {
  'use strict';

  // The old list (128 MB of RAM, 32 MB of disk, "Intel/Amd processor", "Windows, Linux or Mac (x86)") describes
  // hardware from 2010. Same list, same place, current values.
  var ITEMS = [
    'A 64-bit processor (Intel or AMD x86-64).',
    'At least 1 GB of RAM (a task itself needs far less).',
    'About 250 MB of free disk space per task.',
    'Windows, Linux or macOS (64-bit).',
    'Optional: a graphics card with double-precision OpenCL (NVIDIA, AMD or Intel) or CUDA (NVIDIA) for the GPU apps.'
  ];

  function fix() {
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

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fix);
  else fix();
})();

