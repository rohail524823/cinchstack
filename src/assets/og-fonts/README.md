# Share-image fonts

The fonts that draw the share images at `/og/<page>.png` (`src/pages/og/`). They are the site's own
web fonts from `public/fonts/`, saved as static TTF because satori cannot read WOFF2. They are used
only at build time and are not served to readers.

| File | Source | Changes |
| --- | --- | --- |
| `bricolage-800.ttf` | Bricolage Grotesque, `public/fonts/bricolage.woff2` | Variable font instanced at weight 800; U+2011 (non-breaking hyphen) maps to the hyphen glyph, so a heading never breaks inside a word like "ready-made". |
| `plex-sans-400.ttf`, `plex-sans-600.ttf` | IBM Plex Sans, `public/fonts/plex-sans-*.woff2` | Format only (same glyphs), renamed "CinchStack OG Sans". |
| `plex-mono-500.ttf` | IBM Plex Mono, `public/fonts/plex-mono-500.woff2` | Format only (same glyphs), renamed "CinchStack OG Mono". |

The web files are already subset to Latin, so these are too. The Plex files are renamed because
"Plex" is a Reserved Font Name, which a changed format may not carry.

## License

All four fonts are licensed under the SIL Open Font License 1.1 (`OFL.txt` in this folder):
Bricolage Grotesque is copyright 2022 The Bricolage Grotesque Project Authors, and IBM Plex is
copyright 2017 IBM Corp.

## Rebuilding

After a change to `public/fonts/`, from the project root:

```
python3 -m pip install fonttools brotli
python3 src/assets/og-fonts/make.py
```
