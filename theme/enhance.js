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
