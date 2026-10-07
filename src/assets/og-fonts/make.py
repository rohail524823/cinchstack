"""Builds the share-image fonts in this folder from the site's own web fonts in public/fonts.

satori (src/pages/og/_render.mjs) cannot read WOFF2, so each font is saved as a static TTF:
  bricolage-800.ttf  Bricolage Grotesque, the variable font instanced at weight 800, with U+2011
                     (non-breaking hyphen) drawn by the hyphen glyph, so a heading never breaks
                     inside a word like "ready-made".
  plex-*.ttf         IBM Plex Sans 400 and 600 and IBM Plex Mono 500, same glyphs, renamed
                     "CinchStack OG Sans/Mono": "Plex" is a Reserved Font Name under the OFL.

Run from the project root after a change to public/fonts:
  python3 -m pip install fonttools brotli
  python3 src/assets/og-fonts/make.py
"""
import os
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

SRC = 'public/fonts'
OUT = 'src/assets/og-fonts'


def rename(font, old, new):
    for rec in font['name'].names:
        text = rec.toUnicode()
        if old in text or old.replace(' ', '') in text:
            rec.string = text.replace(old, new).replace(old.replace(' ', ''), new.replace(' ', ''))


bricolage = instancer.instantiateVariableFont(TTFont(os.path.join(SRC, 'bricolage.woff2')), {'wght': 800})
for table in bricolage['cmap'].tables:
    if table.isUnicode():
        table.cmap[0x2011] = table.cmap[0x2D]
bricolage.flavor = None
bricolage.save(os.path.join(OUT, 'bricolage-800.ttf'))

for name, family in [('plex-sans-400', 'Sans'), ('plex-sans-600', 'Sans'), ('plex-mono-500', 'Mono')]:
    font = TTFont(os.path.join(SRC, name + '.woff2'))
    rename(font, 'IBM Plex ' + family, 'CinchStack OG ' + family)
    font.flavor = None
    font.save(os.path.join(OUT, name + '.ttf'))
