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
    if (uls.length >= 4) { uls[2].classList.add('pf-tiles'); uls[3].classList.add('pf-tiles'); }   // returning participants, community
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
      if (!t) return;
      t.classList.add('pf-ranked');
      var n = 0;
      t.querySelectorAll('tr').forEach(function (tr) {
        if (n < 3 && tr.querySelector('td') && !tr.querySelector('table')) { n++; tr.classList.add('pf-r' + n); }
      });
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
