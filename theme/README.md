# Prime - a theme for NumberFields@home

A modern, quiet light and dark theme for the NumberFields@home web site: system sans type, soft cards, hairline
tables and one indigo accent. The BOINC pages, tables and forums keep their structure, and the site's own banner stays.
It follows the light/dark setting of your system and works on phones.

Coded By Alperen Yavuz · <https://github.com/alplix/passiflora>

![Home page, dark](screenshots/home-dark.jpg)
![Home page, light](screenshots/home-light.jpg)
![Top participants, light](screenshots/top-users-light.jpg)

## What changes

- colours, type, panels, tables, forms and buttons, in light and dark;
- a menu bar that groups the links the site already has (Project, Account, Statistics, Community); on the home page it
  reads the link texts of the site itself, so they follow the visitor's language;
- the home page's system requirements, which described hardware from 2010 (128 MB of RAM, 32 MB of disk,
  "Intel/Amd processor", "Windows, Linux or Mac (x86)"): the same list in the same place, now with current values.

No new content is added to the pages.

## For visitors (no change on the server)

**Userscript** (Tampermonkey, Violentmonkey, Greasemonkey): the style, the grouped menu and the corrected requirements list. Install a
userscript manager, then open:

<https://raw.githubusercontent.com/alplix/passiflora/main/theme/numberfields-passiflora.user.js>

**Stylus** (style only). Install the Stylus browser extension, then open:

<https://raw.githubusercontent.com/alplix/passiflora/main/theme/numberfields-passiflora.user.css>

## For the project administrators

`white.css` is a drop-in replacement for the project's colour file (`html/user/white.css`, served as
`/NumberFields/white.css`). The site's pages already load it, so nothing else changes:

1. Keep a copy of the current `white.css`.
2. Copy `theme/white.css` from this folder over it.

To go back, restore the copy. The theme only uses the classes the BOINC web pages and Bootstrap 3 already produce.
The requirements list is page content: the five lines are in `enhance.js` if you want to put them into the home page.

## Files

| File | Purpose |
|---|---|
| `theme.css` | the stylesheet (source) |
| `enhance.js` | the grouped menu and the corrected requirements list (source) |
| `build.py` | builds the three files below from the sources |
| `numberfields-passiflora.user.js` | userscript |
| `numberfields-passiflora.user.css` | Stylus user style |
| `white.css` | drop-in for the web folder |

Licence: GPL-2.0-or-later.
