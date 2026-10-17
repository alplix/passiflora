# SPDX-License-Identifier: GPL-2.0-or-later
# Coded By Alperen Yavuz - https://github.com/alplix/passiflora
#
# Builds the three ways of using the theme from theme.css and enhance.js:
#   numberfields-passiflora.user.js   userscript (Tampermonkey, Violentmonkey, Greasemonkey): style + page additions
#   numberfields-passiflora.user.css  Stylus user style (style only)
#   white.css                         drop-in for the project's web folder (style only, for the project's administrators)
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
VERSION = "1.0.0"
RAW = "https://raw.githubusercontent.com/alplix/passiflora/main/theme/"

css = open(os.path.join(HERE, "theme.css"), encoding="utf-8").read()
js = open(os.path.join(HERE, "enhance.js"), encoding="utf-8").read()
out = HERE
os.makedirs(out, exist_ok=True)


def write(name, text):
    with open(os.path.join(out, name), "w", encoding="utf-8", newline="\n") as f:
        f.write(text)


user_js = """// ==UserScript==
// @name         Passiflora theme for NumberFields@home
// @namespace    https://github.com/alplix/passiflora
// @version      %(v)s
// @description  A modern light/dark theme for NumberFields@home, a theme switch and a card for the Passiflora app.
// @author       Alperen Yavuz
// @license      GPL-2.0-or-later
// @match        https://numberfields.asu.edu/NumberFields/*
// @match        http://numberfields.asu.edu/NumberFields/*
// @run-at       document-start
// @grant        none
// @updateURL    %(raw)snumberfields-passiflora.user.js
// @downloadURL  %(raw)snumberfields-passiflora.user.js
// ==/UserScript==

(function () {
  'use strict';
  var css = %(css)s;
  var st = document.createElement('style');
  st.id = 'passiflora-theme';
  st.textContent = css;
  (document.head || document.documentElement).appendChild(st);
})();

%(js)s
""" % {"v": VERSION, "raw": RAW, "css": json.dumps(css), "js": js}

user_css = """/* ==UserStyle==
@name         Passiflora theme for NumberFields@home
@namespace    https://github.com/alplix/passiflora
@version      %(v)s
@description  A modern light/dark theme for NumberFields@home (style only; the userscript adds a theme switch and the Passiflora card).
@author       Alperen Yavuz
@license      GPL-2.0-or-later
@homepageURL  https://github.com/alplix/passiflora/tree/main/theme
@updateURL    %(raw)snumberfields-passiflora.user.css
==/UserStyle== */
@-moz-document domain("numberfields.asu.edu") {
%(css)s
}
""" % {"v": VERSION, "raw": RAW, "css": css}

write("numberfields-passiflora.user.js", user_js)
write("numberfields-passiflora.user.css", user_css)
write("white.css", css)
print("built", os.listdir(out))
