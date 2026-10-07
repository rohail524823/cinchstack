// Draws one share image (src/lib/og.mjs builds the card it shows) as a 1200x630 PNG: satori lays it
// out as SVG, resvg-wasm rasterizes it. Both are pure JavaScript and WebAssembly, so Netlify and CI
// need no native binaries. The fonts are the site's own, as static TTF (src/assets/og-fonts/).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import satori from 'satori';
import { initWasm, Resvg } from '@resvg/resvg-wasm';

const WIDTH = 1200;
const HEIGHT = 630;
const PAD_X = 72;
const PAD_BOTTOM = 44;
const HEAD_GAP = 16; // the least space between the header row and the heading
const INNER = WIDTH - PAD_X * 2;
const C = { paper: '#F4F1EA', card: '#FBF9F4', ink: '#131410', soft: '#4B4C43', mute: '#626459', rule: '#D9D3C5', accent: '#0E7A57' };

// Run from the project root (npm run build), like the other build scripts.
const FONT_DIR = path.resolve('src/assets/og-fonts');
const font = (file) => fs.readFileSync(path.join(FONT_DIR, file));
let setup = null;
function ready() {
  setup ??= (async () => {
    const wasm = createRequire(import.meta.url).resolve('@resvg/resvg-wasm/index_bg.wasm');
    await initWasm(fs.readFileSync(wasm));
    return [
      { name: 'Bricolage', data: font('bricolage-800.ttf'), weight: 800, style: 'normal' },
      { name: 'OG Sans', data: font('plex-sans-400.ttf'), weight: 400, style: 'normal' },
      { name: 'OG Sans', data: font('plex-sans-600.ttf'), weight: 600, style: 'normal' },
      { name: 'OG Mono', data: font('plex-mono-500.ttf'), weight: 500, style: 'normal' },
    ];
  })();
  return setup;
}

// A satori element without JSX.
const h = (style, ...children) => ({ type: 'div', props: { style: { display: 'flex', ...style }, children: children.flat().filter((x) => x !== null && x !== false && x !== undefined && x !== '') } });
const lbl = (size) => ({ fontFamily: 'OG Mono', fontWeight: 500, fontSize: size, letterSpacing: size * 0.12, textTransform: 'uppercase' });

// The mark from the site header: three rounded bars, the middle one green (32-unit grid, as public/favicon.svg).
function mark(px) {
  const u = px / 32;
  const bar = (x, y, w, color) => h({ position: 'absolute', left: x * u, top: y * u, width: w * u, height: 5.5 * u, borderRadius: 2.75 * u, backgroundColor: color });
  return h({ position: 'relative', width: px, height: px }, bar(4, 6, 24, C.ink), bar(9.5, 13.5, 13, C.accent), bar(4, 21, 24, C.ink));
}

const LINE = 1.06;
// A hyphen inside a word becomes U+2011, which the title font draws as a hyphen but never breaks
// after, so "ready-made" stays whole on one line.
const keepWhole = (s) => s.replace(/(?<=\w)-(?=\w)/g, '\u2011');
const headingStyle = (size) => ({ fontFamily: 'Bricolage', fontWeight: 800, fontSize: size, lineHeight: LINE, letterSpacing: -0.03 * size, color: C.ink, width: INNER, textWrap: 'balance' });

/**
 * The card as SVG at the largest heading size that keeps the heading to three lines and the whole card
 * inside its margins: the heading clear of the header row, the footer above the bottom padding. Both
 * are measured with satori's own layout. Words are never split and nothing is cut: a card that fits
 * at no size fails the build.
 */
async function fitted(card, fonts) {
  const text = keepWhole(card.heading);
  const sizes = card.figures.length ? [64, 60, 56] : [80, 72, 64, 56];
  for (const size of sizes) {
    let height = 0;
    await satori(h(headingStyle(size), text), { width: INNER, fonts, onNodeDetected: (n) => { height = Math.max(height, n.top + n.height); } });
    if (Math.round(height / (size * LINE)) > 3) continue;
    const at = {};
    const svg = await satori(layout(card, size), { width: WIDTH, height: HEIGHT, fonts, onNodeDetected: (n) => { if (n.key) at[n.key] = n; } });
    if (at.heading.top >= at.head.top + at.head.height + HEAD_GAP && at.foot.top + at.foot.height <= HEIGHT - PAD_BOTTOM) return svg;
  }
  throw new Error(`Share image for ${card.path}: "${card.heading}" with its figures does not fit the card at ${sizes.at(-1)}px. Shorten the heading or a figure's note.`);
}

// One cell of the key-figure block. Two or more cells share the width equally; one hugs its content.
function figure(f, i, n) {
  return h({ flexDirection: 'column', flexGrow: n > 1 ? 1 : 0, flexBasis: n > 1 ? 0 : 'auto', padding: '18px 26px 20px', borderLeft: i ? `2px solid ${C.rule}` : 'none' },
    h({ ...lbl(20), color: C.mute }, f.label),
    h({ alignItems: 'baseline', marginTop: 8 },
      f.prefix ? h({ fontFamily: 'OG Sans', fontWeight: 600, fontSize: 28, color: C.soft, marginRight: 10 }, f.prefix) : null,
      h({ fontFamily: 'Bricolage', fontWeight: 800, fontSize: 58, lineHeight: 1, letterSpacing: -1.6, color: C.ink }, f.value),
      f.unit ? h({ fontFamily: 'Bricolage', fontWeight: 800, fontSize: 32, lineHeight: 1, letterSpacing: -0.6, color: C.soft, marginLeft: 10 }, f.unit) : null),
    f.sub ? h({ fontFamily: 'OG Sans', fontWeight: 400, fontSize: 22, color: C.soft, marginTop: 8 }, f.sub) : null);
}

// The keys name the nodes fitted() measures.
const keyed = (key, el) => ({ ...el, key });
function layout(card, size) {
  const figs = card.figures;
  return h({ width: WIDTH, height: HEIGHT, flexDirection: 'column', backgroundColor: C.paper, padding: `52px ${PAD_X}px ${PAD_BOTTOM}px`, fontFamily: 'OG Sans', color: C.ink },
    keyed('head', h({ alignItems: 'center', justifyContent: 'space-between', height: 48 },
      h({ alignItems: 'center' }, mark(44), h({ fontFamily: 'Bricolage', fontWeight: 800, fontSize: 34, letterSpacing: -0.7, marginLeft: 14 }, 'CinchStack')),
      card.label ? h({ ...lbl(22), color: C.accent, border: `2px solid ${C.accent}`, borderRadius: 999, padding: '7px 18px 6px' }, card.label) : null)),
    h({ flexDirection: 'column', flexGrow: 1, justifyContent: 'center', paddingBottom: figs.length ? 26 : 8 },
      keyed('heading', h(headingStyle(size), keepWhole(card.heading))),
      card.tagline ? h({ fontFamily: 'OG Sans', fontWeight: 600, fontSize: 32, color: C.accent, marginTop: 22 }, card.tagline) : null),
    figs.length ? h({ backgroundColor: C.card, border: `2px solid ${C.rule}`, borderRadius: 12, alignSelf: figs.length > 1 ? 'stretch' : 'flex-start', marginBottom: 30 },
      figs.map((f, i) => figure(f, i, figs.length))) : null,
    keyed('foot', h({ justifyContent: 'space-between', alignItems: 'center', borderTop: `3px solid ${C.ink}`, paddingTop: 16, ...lbl(22), letterSpacing: 1.3, color: C.soft },
      h({}, 'cinchstack.com'),
      card.checked ? h({}, `${card.dateLabel} ${card.checked}`) : null)));
}

// A "cinchstack" tEXt chunk (PNG spec 11.3.4.3) carrying what the image says, as JSON, so
// scripts/check.mjs can test the figures and the date in the file that ships. tEXt is Latin-1, so
// any other character travels as a JSON \u escape.
const CRC = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc32 = (buf) => { let c = 0xffffffff; for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function withText(png, text) {
  const ascii = text.replace(/[^\x20-\x7e]/g, (ch) => `\\u${ch.charCodeAt(0).toString(16).padStart(4, '0')}`);
  const body = Buffer.concat([Buffer.from('tEXt', 'latin1'), Buffer.from(`cinchstack\0${ascii}`, 'latin1')]);
  const chunk = Buffer.alloc(body.length + 8);
  chunk.writeUInt32BE(body.length - 4, 0);
  body.copy(chunk, 4);
  chunk.writeUInt32BE(crc32(body), body.length + 4);
  const iend = png.length - 12; // IEND is always the last 12 bytes
  return Buffer.concat([png.subarray(0, iend), chunk, png.subarray(iend)]);
}

export async function renderCard(card) {
  const svg = await fitted(card, await ready());
  const r = new Resvg(svg, { fitTo: { mode: 'original' } });
  const img = r.render();
  const png = Buffer.from(img.asPng());
  img.free();
  r.free();
  const said = { path: card.path, heading: card.heading, label: card.label, money: card.money, checked: card.date, version: card.version };
  return withText(png, JSON.stringify(said));
}
