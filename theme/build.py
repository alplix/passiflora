# SPDX-License-Identifier: GPL-2.0-or-later
# Coded By Alperen Yavuz - https://github.com/alplix/passiflora
#
# Builds the three ways of using the theme from theme.css and enhance.js:
#   numberfields-passiflora.user.js   userscript (Tampermonkey, Violentmonkey, Greasemonkey): the style, the grouped menu and the corrected system requirements
#   numberfields-passiflora.user.css  Stylus user style (style only)
#   white.css                         drop-in for the project's web folder (style only, for the project's administrators)
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
VERSION = "1.0.0"
RAW = "https://raw.githubusercontent.com/alplix/passiflora/main/theme/"

def read(name):
    with open(os.path.join(HERE, name), encoding="utf-8") as f:
        return f.read()


import base64
raw_css = read("theme.css")
with open(os.path.join(HERE, "nf-passiflora-banner.jpg"), "rb") as f:
    banner_uri = "data:image/jpeg;base64," + base64.b64encode(f.read()).decode("ascii")
css = raw_css.replace("__BANNER__", banner_uri)                       # userscript and Stylus: self-contained
css_file = raw_css.replace("__BANNER__", "nf-passiflora-banner.jpg")  # white.css: the image sits next to it
js = read("enhance.js")
out = HERE
os.makedirs(out, exist_ok=True)


def write(name, text):
    with open(os.path.join(out, name), "w", encoding="utf-8", newline="\n") as f:
        f.write(text)


user_js = """// ==UserScript==
// @name         Passiflora theme for NumberFields@home
// @namespace    https://github.com/alplix/passiflora
// @version      %(v)s
// @description  Chalk and Paper: a scholarly light/dark theme for NumberFields@home; the BOINC layout stays as it is.
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
@description  Chalk and Paper: a scholarly light/dark theme for NumberFields@home; the BOINC layout stays as it is.
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
write("white.css", css_file)
print("built", os.listdir(out))
