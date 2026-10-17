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
  var css = "/*\n * Passiflora theme for NumberFields@home (BOINC web, Bootstrap 3).\n * Coded By Alperen Yavuz - https://github.com/alplix/passiflora\n * SPDX-License-Identifier: GPL-2.0-or-later\n *\n * Light and dark; follows the system setting unless <html data-theme=\"light|dark\"> is set.\n * Works as a Stylus user style, inside the userscript, or as a drop-in replacement for the project's white.css.\n */\n\n:root {\n  --bg: #f6f4fb;\n  --bg-glow: rgba(124, 77, 255, .13);\n  --card: #ffffff;\n  --card-2: #f1edfa;\n  --text: #1d1a2b;\n  --muted: #6a6483;\n  --border: #e4dff2;\n  --p1: #6d3fc0;\n  --p2: #c026a3;\n  --accent: #0d9f8f;\n  --accent-2: #14b8a6;\n  --link: #5b34b0;\n  --link-hover: #c026a3;\n  --zebra: #f8f6fd;\n  --hover: #efe9fb;\n  --th-bg: #ece6fa;\n  --th-text: #3b2a73;\n  --input-bg: #ffffff;\n  --shadow: 0 1px 2px rgba(40, 20, 90, .06), 0 8px 24px rgba(40, 20, 90, .08);\n  --nav-bg: rgba(255, 255, 255, .82);\n  --code-bg: #f1edfa;\n  --radius: 16px;\n}\n\n@media (prefers-color-scheme: dark) {\n  :root:not([data-theme=\"light\"]) {\n    --bg: #0e0b19;\n    --bg-glow: rgba(139, 92, 246, .20);\n    --card: #171326;\n    --card-2: #1f1a33;\n    --text: #ece8f8;\n    --muted: #9d96b8;\n    --border: #2d2646;\n    --p1: #7c4dff;\n    --p2: #d946ef;\n    --accent: #2dd4bf;\n    --accent-2: #5eead4;\n    --link: #b9a3ff;\n    --link-hover: #f0abfc;\n    --zebra: #1a1530;\n    --hover: #261f42;\n    --th-bg: #241d3f;\n    --th-text: #cbbcff;\n    --input-bg: #120f20;\n    --shadow: 0 1px 2px rgba(0, 0, 0, .4), 0 10px 30px rgba(0, 0, 0, .35);\n    --nav-bg: rgba(20, 16, 36, .82);\n    --code-bg: #1f1a33;\n  }\n}\n\n:root[data-theme=\"dark\"] {\n  --bg: #0e0b19;\n  --bg-glow: rgba(139, 92, 246, .20);\n  --card: #171326;\n  --card-2: #1f1a33;\n  --text: #ece8f8;\n  --muted: #9d96b8;\n  --border: #2d2646;\n  --p1: #7c4dff;\n  --p2: #d946ef;\n  --accent: #2dd4bf;\n  --accent-2: #5eead4;\n  --link: #b9a3ff;\n  --link-hover: #f0abfc;\n  --zebra: #1a1530;\n  --hover: #261f42;\n  --th-bg: #241d3f;\n  --th-text: #cbbcff;\n  --input-bg: #120f20;\n  --shadow: 0 1px 2px rgba(0, 0, 0, .4), 0 10px 30px rgba(0, 0, 0, .35);\n  --nav-bg: rgba(20, 16, 36, .82);\n  --code-bg: #1f1a33;\n}\n\n/* ---- base ---- */\nhtml { color-scheme: light dark; }\n:root[data-theme=\"light\"] { color-scheme: light; }\n:root[data-theme=\"dark\"] { color-scheme: dark; }\n\nbody {\n  font-family: Inter, system-ui, -apple-system, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif;\n  font-size: 15px;\n  line-height: 1.6;\n  color: var(--text);\n  background: var(--bg) radial-gradient(1100px 520px at 12% -8%, var(--bg-glow), transparent 70%) no-repeat fixed;\n  margin: 0;\n  padding: 0 6px 40px;\n  -webkit-font-smoothing: antialiased;\n}\n\n::selection { background: var(--p2); color: #fff; }\n\na, a:link, a:visited, a:active { color: var(--link); text-decoration: none; transition: color .15s; }\na:hover, a:focus { color: var(--link-hover); text-decoration: underline; text-underline-offset: 3px; }\n\nh1, h2, h3, h4, h5 { color: var(--text); font-weight: 650; letter-spacing: -.01em; line-height: 1.25; }\nh1 { font-size: 26px; }\nh2 { font-size: 20px; margin-top: 22px; }\nh3 { font-size: 17px; }\n.lead { color: var(--text); font-weight: 650; font-size: 19px; }\nsmall, .small, .text-muted { color: var(--muted); }\nhr { border: 0; border-top: 1px solid var(--border); margin: 18px 2px; }\nhr.news_line { border: 0; border-top: 1px dashed var(--border); }\n.container-fluid { max-width: 1280px; margin-left: auto; margin-right: auto; }\n\ncode, pre, kbd, samp {\n  font-family: \"JetBrains Mono\", \"Cascadia Code\", Consolas, \"SFMono-Regular\", monospace;\n  background: var(--code-bg);\n  color: var(--text);\n  border: 1px solid var(--border);\n  border-radius: 8px;\n}\ncode { padding: 1px 6px; font-size: 90%; }\npre { padding: 12px 14px; overflow-x: auto; }\nblockquote {\n  border: 0;\n  border-left: 4px solid var(--p1);\n  background: var(--card-2);\n  color: var(--text);\n  border-radius: 0 12px 12px 0;\n  padding: 10px 16px;\n  margin: 12px 0;\n  font-size: 14px;\n}\n\n/* ---- navigation ---- */\n.navbar-default {\n  background: var(--nav-bg);\n  -webkit-backdrop-filter: saturate(160%) blur(12px);\n  backdrop-filter: saturate(160%) blur(12px);\n  border: 1px solid var(--border);\n  border-top: 0;\n  border-radius: 0 0 var(--radius) var(--radius);\n  box-shadow: var(--shadow);\n  margin-bottom: 14px;\n  position: sticky;\n  top: 0;\n  z-index: 1000;\n}\n.navbar-default .navbar-brand {\n  font-weight: 800;\n  letter-spacing: -.02em;\n  background: linear-gradient(90deg, var(--p1), var(--p2));\n  -webkit-background-clip: text;\n  background-clip: text;\n  -webkit-text-fill-color: transparent;\n  color: transparent;\n  padding-left: 46px;\n  position: relative;\n}\n.navbar-default .navbar-brand::before {\n  content: \"\";\n  position: absolute;\n  left: 12px;\n  top: 50%;\n  width: 26px;\n  height: 26px;\n  margin-top: -13px;\n  background: url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><g fill='none' stroke-linecap='round'><g stroke='%23c026a3' stroke-width='2.2' opacity='.9'><path d='M20 20 L20 3'/><path d='M20 20 L35 11'/><path d='M20 20 L35 29'/><path d='M20 20 L20 37'/><path d='M20 20 L5 29'/><path d='M20 20 L5 11'/></g><circle cx='20' cy='20' r='9' stroke='%236d3fc0' stroke-width='2.4' fill='%23ffffff' fill-opacity='.0'/><circle cx='20' cy='20' r='3.4' fill='%230d9f8f' stroke='none'/></g></svg>\") no-repeat center / contain;\n}\n.navbar-default .navbar-nav > li > a { color: var(--text); font-weight: 600; border-radius: 10px; margin: 6px 3px; padding: 8px 14px; transition: background .15s, color .15s; }\n.navbar-default .navbar-nav > li > a:hover,\n.navbar-default .navbar-nav > li > a:focus { background: var(--hover); color: var(--p1); text-decoration: none; }\n.navbar-default .navbar-nav > .active > a,\n.navbar-default .navbar-nav > .active > a:hover { background: var(--hover); color: var(--p1); }\n.navbar-default .navbar-toggle { border-color: var(--border); }\n.navbar-default .navbar-toggle .icon-bar { background: var(--p1); }\n.navbar-default .navbar-collapse { border-color: var(--border); }\n.dropdown-menu { background: var(--card); border: 1px solid var(--border); border-radius: 12px; box-shadow: var(--shadow); }\n.dropdown-menu > li > a { color: var(--text); }\n.dropdown-menu > li > a:hover { background: var(--hover); color: var(--p1); }\n\n/* banner */\ncenter > img.img-responsive,\n.container-fluid > center > img {\n  border-radius: var(--radius);\n  box-shadow: var(--shadow);\n  border: 1px solid var(--border);\n  margin: 4px auto 18px;\n}\n\n/* ---- cards (panels) ---- */\n.panel {\n  background: var(--card);\n  border: 1px solid var(--border);\n  border-radius: var(--radius);\n  box-shadow: var(--shadow);\n  overflow: hidden;\n  margin-bottom: 20px;\n}\n.panel-heading { padding: 12px 20px; border: 0; }\n.panel-title, .panel-heading h1, .panel-heading h2, .panel-heading h3 { font-size: 16px; font-weight: 700; margin: 0; letter-spacing: 0; }\n.panel-primary > .panel-heading {\n  background: linear-gradient(120deg, var(--p1), var(--p2));\n  color: #fff;\n  border: 0;\n}\n.panel-primary > .panel-heading h1, .panel-primary > .panel-heading .panel-title { color: #fff; }\n.panel-default > .panel-heading { background: var(--card-2); color: var(--text); border-bottom: 1px solid var(--border); }\n.panel-body { padding: 18px 22px; color: var(--text); }\n.panel-footer { background: var(--card-2); border-top: 1px solid var(--border); }\n.panel-primary, .panel-default { border-color: var(--border); }\n\n/* the home page link lists */\n.mainnav h2 {\n  font-size: 15px;\n  text-transform: uppercase;\n  letter-spacing: .08em;\n  color: var(--muted);\n  border-bottom: 1px solid var(--border);\n  padding-bottom: 6px;\n  margin-top: 26px;\n}\n.mainnav ul { padding-left: 4px; list-style: none; }\n.mainnav li { padding: 4px 0 4px 20px; position: relative; }\n.mainnav li::before {\n  content: \"\";\n  position: absolute;\n  left: 2px;\n  top: 14px;\n  width: 8px;\n  height: 8px;\n  border-radius: 50%;\n  background: linear-gradient(135deg, var(--p1), var(--p2));\n}\n.well { background: var(--card-2); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: none; color: var(--text); }\n\n/* ---- tables ---- */\n.table, table { color: var(--text); }\n.table { border-collapse: separate; border-spacing: 0; }\ntable.table { background: var(--card) !important; border: 1px solid var(--border); border-radius: 12px; }\n.table > thead > tr > th,\n.table > tbody > tr > th,\nth, td.heading {\n  background: var(--th-bg);\n  color: var(--th-text);\n  border-bottom: 2px solid var(--border);\n  font-size: 12.5px;\n  font-weight: 700;\n  text-transform: uppercase;\n  letter-spacing: .04em;\n  padding: 10px 12px;\n  vertical-align: middle;\n}\nth.subheading { background: var(--card-2); color: var(--muted); }\nth.bg-primary, td.bg-primary, tr.bg-primary > th, tr.bg-primary > td { background: var(--p1) !important; color: #fff !important; border-bottom: 0; }\n.panel-heading.bg-primary, div.bg-primary, span.bg-primary, p.bg-primary { background: linear-gradient(120deg, var(--p1), var(--p2)) !important; color: #fff !important; }\n.bg-primary a, .bg-primary a:link, .bg-primary a:visited { color: #fff; text-decoration: underline; text-underline-offset: 3px; }\ntr.bg-primary > th:first-child, th.bg-primary:first-child { border-top-left-radius: 11px; }\ntr.bg-primary > th:last-child, th.bg-primary:last-child { border-top-right-radius: 11px; }\n.bg-default { background: var(--card-2) !important; color: var(--text) !important; }\n.table > tbody > tr > td, .table > tbody > tr > th, td { border-top: 1px solid var(--border); padding: 8px 12px; vertical-align: middle; }\n.table-condensed > tbody > tr > td { padding: 6px 10px; }\n.table-striped > tbody > tr:nth-of-type(odd), .row1 { background: var(--zebra); }\n.table-striped > tbody > tr:nth-of-type(even), .row0 { background: transparent; }\n.table-hover > tbody > tr:hover, .table-striped > tbody > tr:hover { background: var(--hover); }\n.highlighted_row0, .highlighted_row1 { background: var(--hover); }\n.table-bordered, .bordered { border: 1px solid var(--border); border-radius: 12px; }\n.table-bordered > thead > tr > th, .table-bordered > tbody > tr > td { border-color: var(--border); }\ntd.fieldname { background: var(--card-2); color: var(--muted); font-weight: 600; }\ntd.fieldname_error, td.fieldvalue_error { background: rgba(220, 38, 38, .18); }\ntd.friend { background: var(--card-2); }\ntr.message { background: var(--card-2); }\n.running { background: rgba(45, 212, 191, .18); }\ntd.indent { border-color: transparent; }\n\n/* ---- forms ---- */\n.form-control, input[type=\"text\"], input[type=\"password\"], input[type=\"email\"], input[type=\"number\"], input[type=\"search\"], textarea, select {\n  background: var(--input-bg);\n  color: var(--text);\n  border: 1px solid var(--border);\n  border-radius: 10px;\n  box-shadow: none;\n  transition: border-color .15s, box-shadow .15s;\n}\n.form-control:focus, input:focus, textarea:focus, select:focus {\n  border-color: var(--p1);\n  box-shadow: 0 0 0 3px color-mix(in srgb, var(--p1) 28%, transparent);\n  outline: 0;\n}\n.control-label, label { color: var(--text); font-weight: 600; }\n.help-block { color: var(--muted); }\n.input-group-addon { background: var(--card-2); border: 1px solid var(--border); color: var(--muted); }\n::placeholder { color: var(--muted); opacity: .8; }\n\n/* ---- buttons ---- */\ninput[type=\"button\"], input[type=\"submit\"], .btn, a.btn {\n  border-radius: 10px;\n  font-weight: 650;\n  border: 1px solid transparent;\n  box-shadow: none;\n  text-shadow: none;\n  transition: transform .12s, box-shadow .15s, filter .15s;\n  padding: 6px 14px;\n}\n.btn-xs { padding: 2px 8px; }\n.btn-sm { padding: 4px 11px; }\n.btn:hover, input[type=\"button\"]:hover, input[type=\"submit\"]:hover {\n  transform: translateY(-1px);\n  box-shadow: 0 6px 16px rgba(80, 40, 160, .22);\n  filter: brightness(1.06);\n  text-decoration: none;\n}\n.btn-primary, .btn-info, input[type=\"submit\"] { background: linear-gradient(120deg, var(--p1), var(--p2)) !important; color: #fff !important; }\n.btn-success, a.btn-green { background: linear-gradient(120deg, #0d9f8f, #16a34a) !important; color: #fff !important; border: 0; }\n.btn-warning { background: linear-gradient(120deg, #f59e0b, #f97316) !important; color: #fff !important; }\n.btn-danger { background: linear-gradient(120deg, #dc2626, #be185d) !important; color: #fff !important; }\n.btn-default, input[type=\"button\"] { background: var(--card-2) !important; color: var(--text) !important; border: 1px solid var(--border); }\n.btn-link { background: transparent !important; color: var(--link) !important; }\n.btn:focus { outline: 0; box-shadow: 0 0 0 3px color-mix(in srgb, var(--p1) 30%, transparent); }\n.btn font[size], .btn-success font { font-size: 17px !important; }\n\n/* ---- small parts ---- */\n.label, .badge { border-radius: 999px; font-weight: 600; }\n.label-primary, .badge { background: var(--p1); }\n.alert { border-radius: 12px; border: 1px solid var(--border); }\n.alert-danger { background: rgba(220, 38, 38, .13); color: var(--text); }\n.alert-success { background: rgba(22, 163, 74, .14); color: var(--text); }\n.alert-info { background: rgba(14, 165, 233, .13); color: var(--text); }\n.alert-warning { background: rgba(245, 158, 11, .15); color: var(--text); }\n.pagination > li > a, .pagination > li > span { background: var(--card); border-color: var(--border); color: var(--link); }\n.pagination > .active > a { background: var(--p1); border-color: var(--p1); color: #fff; }\n.progress { background: var(--card-2); border-radius: 999px; box-shadow: none; }\n.progress-bar { background: linear-gradient(90deg, var(--p1), var(--p2)); }\n.forum_toplinks a { border-radius: 8px; }\nimg.icon { vertical-align: middle; }\n.img-responsive { max-width: 100%; height: auto; }\n\n/* user avatars and profile images */\nimg[src*=\"user_profile/images\"] { border-radius: 12px; border: 1px solid var(--border); }\n\n/* scroll bars */\n* { scrollbar-width: thin; scrollbar-color: var(--p1) transparent; }\n*::-webkit-scrollbar { width: 10px; height: 10px; }\n*::-webkit-scrollbar-thumb { background: var(--p1); border-radius: 8px; border: 2px solid var(--bg); }\n*::-webkit-scrollbar-track { background: transparent; }\n\n/* ---- the Passiflora card (added by the userscript) ---- */\n.pf-card {\n  position: relative;\n  border-radius: var(--radius);\n  padding: 22px 26px;\n  margin: 0 0 20px;\n  color: #fff;\n  background: linear-gradient(125deg, #4c1d95 0%, #7c3aed 45%, #c026a3 100%);\n  box-shadow: var(--shadow);\n  overflow: hidden;\n}\n.pf-card::after {\n  content: \"\";\n  position: absolute;\n  right: -40px;\n  top: -40px;\n  width: 220px;\n  height: 220px;\n  border-radius: 50%;\n  background: radial-gradient(circle, rgba(255, 255, 255, .22), transparent 68%);\n  pointer-events: none;\n}\n.pf-card h3 { color: #fff; margin: 0 0 6px; font-size: 20px; }\n.pf-card p { margin: 4px 0 12px; opacity: .95; }\n.pf-card a { color: #fff; text-decoration: underline; }\n.pf-card .pf-actions { display: flex; flex-wrap: wrap; gap: 8px; }\n.pf-card .pf-actions a.btn { text-decoration: none; background: #fff !important; color: #4c1d95 !important; }\n.pf-card .pf-actions a.btn.pf-ghost { background: rgba(255, 255, 255, .16) !important; color: #fff !important; border: 1px solid rgba(255, 255, 255, .5); }\n.pf-card .pf-note { font-size: 12.5px; opacity: .85; margin-top: 10px; }\n.pf-toggle { cursor: pointer; }\n\n/* ---- small screens ---- */\n@media (max-width: 767px) {\n  body { font-size: 14.5px; }\n  .panel-body { padding: 14px; }\n  table.table { display: block; overflow-x: auto; -webkit-overflow-scrolling: touch; }\n  .navbar-default { border-radius: 0 0 12px 12px; }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  * { transition: none !important; }\n  .btn:hover { transform: none; }\n}\n\n/* =====================================================================================================\n   Legend layer: aurora background, glass cards with glowing borders, hero, tiles\n   Coded By Alperen Yavuz - https://github.com/alplix/passiflora\n   ===================================================================================================== */\n:root {\n  --grid: rgba(109, 63, 192, .07);\n  --glow: rgba(124, 77, 255, .35);\n  --glass: rgba(255, 255, 255, .72);\n}\n@media (prefers-color-scheme: dark) {\n  :root:not([data-theme=\"light\"]) { --grid: rgba(167, 139, 250, .07); --glow: rgba(139, 92, 246, .45); --glass: rgba(23, 19, 38, .72); }\n}\n:root[data-theme=\"dark\"] { --grid: rgba(167, 139, 250, .07); --glow: rgba(139, 92, 246, .45); --glass: rgba(23, 19, 38, .72); }\n\nbody::before {\n  content: \"\";\n  position: fixed;\n  inset: -10vmax;\n  z-index: -2;\n  pointer-events: none;\n  background:\n    radial-gradient(55vmax 38vmax at 8% -4%, color-mix(in srgb, var(--p1) 34%, transparent), transparent 62%),\n    radial-gradient(48vmax 36vmax at 102% 8%, color-mix(in srgb, var(--p2) 26%, transparent), transparent 62%),\n    radial-gradient(44vmax 34vmax at 55% 112%, color-mix(in srgb, var(--accent) 20%, transparent), transparent 62%);\n  animation: pf-aurora 30s ease-in-out infinite alternate;\n}\nbody::after {\n  content: \"\";\n  position: fixed;\n  inset: 0;\n  z-index: -1;\n  pointer-events: none;\n  background-image: linear-gradient(var(--grid) 1px, transparent 1px), linear-gradient(90deg, var(--grid) 1px, transparent 1px);\n  background-size: 46px 46px;\n  -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, #000 0%, transparent 75%);\n  mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, #000 0%, transparent 75%);\n}\n@keyframes pf-aurora {\n  0%   { transform: translate3d(0, 0, 0) scale(1); }\n  50%  { transform: translate3d(2vmax, 1.5vmax, 0) scale(1.06); }\n  100% { transform: translate3d(-2vmax, 2vmax, 0) scale(1.02); }\n}\n@keyframes pf-shine { to { background-position: 300% 0; } }\n@keyframes pf-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }\n\n/* glass cards with a glowing gradient edge */\n.panel {\n  position: relative;\n  background: var(--glass);\n  -webkit-backdrop-filter: blur(14px) saturate(140%);\n  backdrop-filter: blur(14px) saturate(140%);\n  border: 0;\n  box-shadow: var(--shadow), 0 0 0 1px var(--border);\n  animation: pf-rise .5s ease both;\n  transition: transform .2s, box-shadow .25s;\n}\n.panel:hover { transform: translateY(-2px); box-shadow: var(--shadow), 0 0 0 1px var(--border), 0 12px 50px -14px var(--glow); }\n.panel::after {\n  content: \"\";\n  position: absolute;\n  inset: 0;\n  border-radius: inherit;\n  padding: 1px;\n  background: linear-gradient(135deg, color-mix(in srgb, var(--p1) 70%, transparent), transparent 38%, transparent 62%, color-mix(in srgb, var(--p2) 60%, transparent));\n  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);\n  -webkit-mask-composite: xor;\n  mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0);\n  pointer-events: none;\n}\n.panel-primary > .panel-heading { padding: 14px 22px; position: relative; }\n.panel-primary > .panel-heading::after {\n  content: \"\";\n  position: absolute;\n  inset: 0;\n  background: linear-gradient(105deg, transparent 30%, rgba(255, 255, 255, .22) 50%, transparent 70%);\n  background-size: 250% 100%;\n  background-position: 120% 0;\n  transition: background-position .8s;\n  pointer-events: none;\n}\n.panel:hover > .panel-heading::after { background-position: -40% 0; }\n\n.mainnav h3 {\n  font-size: 30px;\n  font-weight: 850;\n  letter-spacing: -.03em;\n  background: linear-gradient(100deg, var(--p1), var(--p2) 55%, var(--accent));\n  -webkit-background-clip: text;\n  background-clip: text;\n  color: transparent;\n  -webkit-text-fill-color: transparent;\n}\n\n/* link lists on the home page become tiles */\n.mainnav ul:nth-of-type(n+3) {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(165px, 1fr));\n  gap: 10px;\n  padding: 0;\n  margin: 12px 0 18px;\n}\n.mainnav ul:nth-of-type(n+3) > li {\n  position: relative;\n  padding: 12px 14px;\n  border: 1px solid var(--border);\n  border-radius: 14px;\n  background: var(--card-2);\n  font-size: 12.5px;\n  color: var(--muted);\n  line-height: 1.4;\n  transition: transform .18s, border-color .18s, box-shadow .18s, background .18s;\n}\n.mainnav ul:nth-of-type(n+3) > li::before { display: none; }\n.mainnav ul:nth-of-type(n+3) > li > a:first-child {\n  display: block;\n  font-size: 14.5px;\n  font-weight: 700;\n  color: var(--text);\n}\n.mainnav ul:nth-of-type(n+3) > li > a:first-child::after { content: \"\"; position: absolute; inset: 0; }\n.mainnav ul:nth-of-type(n+3) > li:hover {\n  transform: translateY(-3px);\n  border-color: var(--p1);\n  background: var(--hover);\n  box-shadow: 0 10px 28px -10px var(--glow);\n}\n\n/* hero (added by the userscript) */\n.pf-hero {\n  position: relative;\n  overflow: hidden;\n  border-radius: 26px;\n  margin: 4px 0 24px;\n  padding: 58px 28px 26px;\n  border: 1px solid var(--border);\n  background:\n    linear-gradient(160deg, color-mix(in srgb, var(--p1) 26%, var(--card)), var(--card) 52%, color-mix(in srgb, var(--p2) 16%, var(--card)));\n  box-shadow: var(--shadow), 0 0 90px -24px var(--glow);\n  animation: pf-rise .6s ease both;\n}\n.pf-hero canvas { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }\n.pf-hero-inner { position: relative; text-align: center; }\n.pf-kicker { display: inline-block; font-size: 12px; letter-spacing: .22em; text-transform: uppercase; color: var(--accent); font-weight: 700; margin-bottom: 8px; }\n.pf-title {\n  margin: 0;\n  font-size: clamp(34px, 6.4vw, 70px);\n  font-weight: 900;\n  letter-spacing: -.035em;\n  line-height: 1.05;\n  background: linear-gradient(100deg, var(--p1), var(--p2), var(--accent), var(--p1));\n  background-size: 300% 100%;\n  -webkit-background-clip: text;\n  background-clip: text;\n  color: transparent;\n  -webkit-text-fill-color: transparent;\n  animation: pf-shine 9s linear infinite;\n}\n.pf-sub { font-size: clamp(15px, 2.1vw, 20px); color: var(--text); opacity: .86; max-width: 780px; margin: 14px auto 24px; }\n.pf-cta { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }\n.pf-cta .btn { padding: 10px 22px; font-size: 15px; }\n.pf-cta .btn.pf-outline { background: transparent !important; color: var(--text) !important; border: 1px solid var(--p1); }\n.pf-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-top: 32px; }\n.pf-stat {\n  background: color-mix(in srgb, var(--card) 66%, transparent);\n  -webkit-backdrop-filter: blur(10px);\n  backdrop-filter: blur(10px);\n  border: 1px solid var(--border);\n  border-radius: 18px;\n  padding: 14px 10px 12px;\n  transition: transform .2s, box-shadow .2s;\n}\n.pf-stat:hover { transform: translateY(-3px); box-shadow: 0 12px 34px -12px var(--glow); }\n.pf-stat b {\n  display: block;\n  font-size: 28px;\n  font-weight: 850;\n  font-variant-numeric: tabular-nums;\n  letter-spacing: -.02em;\n  background: linear-gradient(100deg, var(--p1), var(--p2));\n  -webkit-background-clip: text;\n  background-clip: text;\n  color: transparent;\n  -webkit-text-fill-color: transparent;\n}\n.pf-stat span { font-size: 11px; text-transform: uppercase; letter-spacing: .1em; color: var(--muted); font-weight: 600; }\n.pf-live { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 10px var(--accent); margin-right: 6px; animation: pf-pulse 1.8s ease-in-out infinite; vertical-align: middle; }\n@keyframes pf-pulse { 50% { opacity: .35; transform: scale(.7); } }\n.pf-hide-banner { display: none !important; }\n\n/* requirements as spec tiles */\n.pf-specs { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; margin: 12px 0 8px; }\n.pf-spec { border: 1px solid var(--border); border-radius: 14px; background: var(--card-2); padding: 12px 14px; transition: transform .18s, box-shadow .18s, border-color .18s; }\n.pf-spec:hover { transform: translateY(-2px); border-color: var(--p1); box-shadow: 0 10px 26px -12px var(--glow); }\n.pf-spec .pf-ico { font-size: 22px; line-height: 1; display: block; margin-bottom: 6px; }\n.pf-spec strong { display: block; font-size: 13px; text-transform: uppercase; letter-spacing: .06em; color: var(--p1); }\n.pf-spec p { margin: 3px 0 0; font-size: 13.5px; color: var(--text); line-height: 1.45; }\n\n/* tables: numbers, podium, hover */\ntd { font-variant-numeric: tabular-nums; }\n.table-striped > tbody > tr, .table-hover > tbody > tr { transition: background .15s; }\n.pf-ranked > tbody > tr:nth-of-type(1) > td:first-child,\n.pf-ranked > tbody > tr:nth-of-type(2) > td:first-child,\n.pf-ranked > tbody > tr:nth-of-type(3) > td:first-child { font-weight: 850; font-size: 17px; }\n.pf-ranked > tbody > tr:nth-of-type(1) > td:first-child { color: #f59e0b; box-shadow: inset 4px 0 0 #f59e0b; }\n.pf-ranked > tbody > tr:nth-of-type(2) > td:first-child { color: #94a3b8; box-shadow: inset 4px 0 0 #94a3b8; }\n.pf-ranked > tbody > tr:nth-of-type(3) > td:first-child { color: #d97706; box-shadow: inset 4px 0 0 #b45309; }\n\n/* the Passiflora card, glowing */\n.pf-card { box-shadow: var(--shadow), 0 0 60px -18px var(--glow); }\n.pf-card::before {\n  content: \"\";\n  position: absolute;\n  left: -60px;\n  bottom: -70px;\n  width: 240px;\n  height: 240px;\n  border-radius: 50%;\n  background: radial-gradient(circle, rgba(45, 212, 191, .35), transparent 68%);\n  pointer-events: none;\n}\n\n@media (max-width: 767px) {\n  .pf-hero { padding: 40px 16px 20px; border-radius: 20px; }\n  .pf-stat b { font-size: 22px; }\n}\n@media (prefers-reduced-motion: reduce) {\n  body::before, .pf-title, .pf-live, .panel { animation: none !important; }\n  .panel:hover, .pf-stat:hover, .pf-spec:hover { transform: none; }\n}\n";
  var st = document.createElement('style');
  st.id = 'passiflora-theme';
  st.textContent = css;
  (document.head || document.documentElement).appendChild(st);
})();

// Passiflora theme for NumberFields@home - page additions: hero with live numbers, requirements, theme switch.
// Coded By Alperen Yavuz - https://github.com/alplix/passiflora
// SPDX-License-Identifier: GPL-2.0-or-later
(function () {
  'use strict';
  var REPO = 'https://github.com/alplix/passiflora';
  var KEY_THEME = 'pf-theme';
  var KEY_CARD = 'pf-card-closed';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage may be blocked */ } }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

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
    var li = el('li');
    var a = el('a', 'pf-toggle');
    a.id = 'pf-theme-toggle';
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

  // ---- hero: animated number-theory background and live project numbers ------------------------
  function startCanvas(canvas, host) {
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, nodes = [], colors = null, frame = 0, visible = true, last = 0;
    var GLY = ['x¹⁰', '√−10', 'disc', 'p = 2', 'Gal', 'ζ(s)', 'ℤ[x]', 'π', '1729', 'Q(α)',
               '(√5+1)/2', 'a₀x¹⁰+…', 'K/ℚ', 'θ', '7919', '127', 'Fₚ', 'N(α)', 'ℂ'];

    function readColors() {
      var cs = getComputedStyle(document.documentElement);
      colors = {
        p1: cs.getPropertyValue('--p1').trim() || '#7c4dff',
        p2: cs.getPropertyValue('--p2').trim() || '#d946ef',
        ac: cs.getPropertyValue('--accent').trim() || '#2dd4bf',
        tx: cs.getPropertyValue('--text').trim() || '#ffffff'
      };
    }
    function resize() {
      W = host.clientWidth;
      H = host.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.max(16, Math.min(56, Math.round(W * H / 21000)));
      nodes = [];
      for (var i = 0; i < n; i++) {
        nodes.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .28, vy: (Math.random() - .5) * .28,
                     g: GLY[i % GLY.length], s: 11 + Math.random() * 11, a: .12 + Math.random() * .24, dot: Math.random() < .5 });
      }
    }
    function draw() {
      if (!colors || frame % 90 === 0) readColors();
      frame++;
      ctx.clearRect(0, 0, W, H);
      var i, j, a, b, dx, dy, d;
      ctx.lineWidth = 1;
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        if (!reduceMotion) {
          a.x += a.vx; a.y += a.vy;
          if (a.x < -40) a.x = W + 40; else if (a.x > W + 40) a.x = -40;
          if (a.y < -20) a.y = H + 20; else if (a.y > H + 20) a.y = -20;
        }
        for (j = i + 1; j < nodes.length; j++) {
          b = nodes[j];
          dx = a.x - b.x; dy = a.y - b.y;
          d = dx * dx + dy * dy;
          if (d < 16900) {                                 // 130 px
            ctx.globalAlpha = (1 - Math.sqrt(d) / 130) * .32;
            ctx.strokeStyle = colors.p1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        if (a.dot) {
          ctx.globalAlpha = .75;
          ctx.fillStyle = colors.ac;
          ctx.shadowColor = colors.ac; ctx.shadowBlur = 10;
          ctx.beginPath(); ctx.arc(a.x, a.y, 2.2, 0, 6.2832); ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          ctx.globalAlpha = a.a;
          ctx.fillStyle = (i % 3 === 0) ? colors.p2 : colors.tx;
          ctx.font = a.s + 'px ui-monospace, Consolas, monospace';
          ctx.fillText(a.g, a.x, a.y);
        }
      }
      ctx.globalAlpha = 1;
    }
    function loop(t) {
      if (visible && !document.hidden && t - last > 33) { last = t; draw(); }
      if (!reduceMotion) requestAnimationFrame(loop);
    }
    resize();
    draw();
    if (!reduceMotion) requestAnimationFrame(loop);
    window.addEventListener('resize', function () { resize(); draw(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(host);
    }
  }

  function fmt(n, dec) {
    return n.toLocaleString('en-US', { minimumFractionDigits: dec || 0, maximumFractionDigits: dec || 0 });
  }
  function countUp(node, target, dec) {
    if (reduceMotion || !window.requestAnimationFrame) { node.textContent = fmt(target, dec); return; }
    var t0 = null;
    setTimeout(function () { node.textContent = fmt(target, dec); }, 1800);   // in case animation frames are throttled
    function step(t) {
      if (t0 == null) t0 = t;
      var p = Math.min(1, (t - t0) / 1300);
      var e = 1 - Math.pow(1 - p, 3);
      node.textContent = fmt(target * e, dec);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function loadStats(box) {
    fetch('server_status.html', { credentials: 'same-origin' }).then(function (r) { return r.text(); }).then(function (t) {
      var doc = new DOMParser().parseFromString(t, 'text/html');
      var pairs = [];
      doc.querySelectorAll('tr').forEach(function (tr) {
        if (tr.querySelector('table')) return;               // outer layout rows
        var c = tr.querySelectorAll('td');
        if (c.length === 2) pairs.push([c[0].textContent.trim(), c[1].textContent.trim()]);
      });
      function num(s) { return parseFloat(String(s).replace(/[^0-9.]/g, '')) || 0; }
      var recent = pairs.filter(function (p) { return /with recent credit/i.test(p[0]); });
      var gf = pairs.filter(function (p) { return /current gigaflops/i.test(p[0]); })[0];
      var ready = pairs.filter(function (p) { return /tasks ready to send/i.test(p[0]); })[0];
      var prog = pairs.filter(function (p) { return /tasks in progress/i.test(p[0]); })[0];
      var items = [];
      if (recent[0]) items.push(['Active users', num(recent[0][1]), 0, '']);
      if (recent[1]) items.push(['Active computers', num(recent[1][1]), 0, '']);
      if (gf) {
        var g = num(gf[1]);
        if (g >= 1e6) items.push(['PetaFLOPS', g / 1e6, 2, '']);
        else items.push(['TeraFLOPS', g / 1e3, 1, '']);
      }
      if (ready) items.push(['Tasks ready', num(ready[1]), 0, '']);
      if (prog) items.push(['Tasks running', num(prog[1]), 0, '']);
      items.forEach(function (it) {
        var s = el('div', 'pf-stat', '<b>0</b><span>' + it[0] + '</span>');
        box.appendChild(s);
        countUp(s.firstChild, it[1], it[2]);
      });
      if (items.length) {
        var live = el('div', 'pf-sub', '');
        live.style.cssText = 'font-size:12px;margin:12px auto 0;opacity:.7';
        live.innerHTML = '<span class="pf-live"></span>live from the server status page';
        box.parentNode.appendChild(live);
      }
    }).catch(function () { /* the numbers are optional */ });
  }

  function addHero() {
    var path = location.pathname.replace(/\/+$/, '');
    if (!/\/NumberFields(\/index\.php)?$/i.test(path)) return;
    var firstCol = document.querySelector('.container-fluid .row .col-sm-6');
    if (!firstCol || document.getElementById('pf-hero')) return;
    var rowEl = firstCol.parentElement;
    var banner = document.querySelector('.container-fluid > center > img.img-responsive, center > img.img-responsive');
    if (banner && banner.parentNode) banner.parentNode.classList.add('pf-hide-banner');

    var hero = el('div', 'pf-hero');
    hero.id = 'pf-hero';
    var canvas = el('canvas');
    hero.appendChild(canvas);
    var inner = el('div', 'pf-hero-inner',
      '<span class="pf-kicker">Distributed computing · Number theory</span>' +
      '<h1 class="pf-title">NumberFields@home</h1>' +
      '<p class="pf-sub">Hunting for decic number fields with the computers of volunteers around the world – ' +
      'now with optimized apps that finish a work unit in a fraction of the time.</p>' +
      '<div class="pf-cta">' +
      '<a class="btn btn-primary" href="join.php">Join the project</a>' +
      '<a class="btn btn-success" href="' + REPO + '/releases/latest">Get the faster app</a>' +
      '<a class="btn pf-outline" href="ProjectDescription.html">How it works</a>' +
      '</div>');
    var stats = el('div', 'pf-stats');
    inner.appendChild(stats);
    hero.appendChild(inner);
    rowEl.parentNode.insertBefore(hero, rowEl);
    startCanvas(canvas, hero);
    loadStats(stats);
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
    if (!/\/NumberFields(\/index\.php)?$/i.test(path)) return;
    var firstCol = document.querySelector('.container-fluid .row .col-sm-6');
    if (!firstCol || document.getElementById('pf-card')) return;
    var rowEl = firstCol.parentElement;
    var sys = detectSystem();
    var card = el('div', 'pf-card',
      '<h3>Passiflora – the faster GetDecics</h3>' +
      '<p>Same results as the stock app, in a fraction of the time. Optimized CPU and GPU versions for ' + sys.name +
      ' (' + HINT[sys.key] + ').</p>' +
      '<div class="pf-actions">' +
      '<a class="btn btn-sm" href="' + REPO + '/releases/latest">Download for ' + sys.name + '</a>' +
      '<a class="btn btn-sm pf-ghost" href="' + REPO + '/releases/latest/download/INSTALL.txt">Install guide</a>' +
      '<a class="btn btn-sm pf-ghost" href="' + REPO + '">Source code</a>' +
      '<a class="btn btn-sm pf-ghost" href="#" id="pf-card-close">Hide</a>' +
      '</div>' +
      '<div class="pf-note">Coded By Alperen Yavuz · ' + REPO.replace('https://', '') + '</div>');
    card.id = 'pf-card';
    rowEl.parentNode.insertBefore(card, rowEl);
    document.getElementById('pf-card-close').addEventListener('click', function (ev) {
      ev.preventDefault();
      set(KEY_CARD, '1');
      card.parentNode.removeChild(card);
    });
  }

  // ---- system requirements that match today's hardware ---------------------------------------
  function updateRequirements() {
    var nav = document.querySelector('.mainnav');
    if (!nav || nav.getAttribute('data-pf-req')) return;
    var uls = nav.querySelectorAll('ul');
    var old = null, i;
    for (i = 0; i < uls.length; i++) {
      if (/ram|processor|MB/i.test(uls[i].textContent) && /Windows|Linux/i.test(uls[i].textContent)) { old = uls[i]; break; }
    }
    if (!old) return;
    var specs = [
      ['🧠', 'Processor', 'A 64-bit CPU. x86-64 is fastest (AVX2/FMA); ARM64, RISC-V, PowerPC and IBM Z run the Passiflora app.'],
      ['💾', 'Memory', '128 MB free is plenty: the CPU app peaks near 11 MB per task.'],
      ['🗄️', 'Disk', 'About 250 MB free per task. The server reserves that much; real use is a few MB.'],
      ['🖥️', 'Systems', 'Windows, Linux, macOS and FreeBSD; Android (rooted or Termux) and more with the Passiflora app.'],
      ['⚡', 'GPU (optional)', 'NVIDIA (CUDA or OpenCL), AMD or Intel graphics with double-precision OpenCL; about 150 MB of video memory per task.']
    ];
    var box = el('div', 'pf-specs');
    specs.forEach(function (s) {
      box.appendChild(el('div', 'pf-spec', '<span class="pf-ico">' + s[0] + '</span><strong>' + s[1] + '</strong><p>' + s[2] + '</p>'));
    });
    old.parentNode.replaceChild(box, old);
    nav.setAttribute('data-pf-req', '1');
    // an outdated remark about very old BOINC versions
    nav.querySelectorAll('li').forEach(function (li) {
      if (/pre-5\.0/.test(li.innerHTML)) li.innerHTML = li.innerHTML.replace('command-line or pre-5.0 version of BOINC', 'command-line version of BOINC');
    });
  }

  // ---- league tables: podium colours ---------------------------------------------------------
  function markRankings() {
    if (/\/top_(users|teams|hosts)\.php/i.test(location.pathname)) {
      var t = document.querySelector('table.table');
      if (t) t.classList.add('pf-ranked');
    }
  }

  function addCredit() {
    if (document.getElementById('pf-credit')) return;
    var p = el('p', null, 'Theme by Alperen Yavuz · <a href="' + REPO + '/tree/main/theme">Passiflora theme</a>');
    p.id = 'pf-credit';
    p.style.cssText = 'text-align:center;font-size:12px;opacity:.65;margin:28px 0 8px';
    document.body.appendChild(p);
  }

  function ready() {
    addToggle();
    addHero();
    addCard();
    updateRequirements();
    markRankings();
    addCredit();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();
})();

