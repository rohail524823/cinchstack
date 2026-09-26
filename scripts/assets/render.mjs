// Renders the share image and touch icon into public/. Run once after a brand change:
//   node scripts/assets/render.mjs
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
const exe = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', process.env.CHROME_PATH].find((p) => p && fs.existsSync(p));
const b = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--allow-file-access-from-files'] });
for (const [src, out, w, h] of [['og.html', 'public/og.png', 1200, 630], ['icon.html', 'public/apple-touch-icon.png', 180, 180]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto('file://' + path.resolve('scripts/assets', src));
  await p.waitForTimeout(400);
  await p.screenshot({ path: out });
  await p.close();
  console.log(out);
}
await b.close();
