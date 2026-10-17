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
