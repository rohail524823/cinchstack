#!/usr/bin/env node
// Screenshot a page for visual QA. Usage: node scripts/shot.mjs <url> <out.png> [width] [fullPage 1|0] [clipY] [clipH]
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const [,, url, out, width = '1280', full = '1', clipY, clipH = '1400'] = process.argv;
const exe = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', process.env.CHROME_PATH].find((p) => p && fs.existsSync(p));
const b = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: Number(width), height: 900 } });
await p.goto(url, { waitUntil: 'networkidle' });
await p.screenshot(clipY !== undefined ? { path: out, fullPage: true, clip: { x: 0, y: Number(clipY), width: Number(width), height: Number(clipH) } } : { path: out, fullPage: full === '1' });
await b.close();
