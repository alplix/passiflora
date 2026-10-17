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
