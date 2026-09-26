#!/usr/bin/env node
// Save the visible text of a vendor page (rendered in headless Chromium) as a dated snapshot.
// Usage: node scripts/snapshot.mjs <tool> <url> [--label pricing] [--click "Annual"] [--click "Monthly"]
// Writes snapshots/<tool>/<YYYY-MM-DD>-<label>.txt (and -<label>-after-click-N.txt per click).
// Prints the path(s). Prices must be read from these files, never from memory.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const tool = args[0];
const url = args[1];
if (!tool || !url) {
  console.error('usage: node scripts/snapshot.mjs <tool> <url> [--label name] [--click text]...');
  process.exit(2);
}
let label = 'pricing';
const clicks = [];
for (let i = 2; i < args.length; i++) {
  if (args[i] === '--label') label = args[++i];
  else if (args[i] === '--click') clicks.push(args[++i]);
}

const exe = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', process.env.CHROME_PATH].find((p) => p && fs.existsSync(p));
const today = new Date().toISOString().slice(0, 10);
const dir = path.join('snapshots', tool);
fs.mkdirSync(dir, { recursive: true });

const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
const browser = await chromium.launch({
  executablePath: exe,
  args: ['--no-sandbox'],
  ...(proxy ? { proxy: { server: proxy, bypass: 'localhost,127.0.0.1' } } : {}),
});
const ctx = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36',
  locale: 'en-US',
  timezoneId: 'America/New_York',
  viewport: { width: 1366, height: 900 },
});
const page = await ctx.newPage();

async function settle() {
  try { await page.waitForLoadState('networkidle', { timeout: 20000 }); } catch {}
  // scroll to trigger lazy sections
  for (let y = 0; y < 12; y++) {
    await page.mouse.wheel(0, 1400);
    await page.waitForTimeout(250);
  }
  await page.waitForTimeout(800);
}
async function dump(suffix) {
  const text = await page.evaluate(() => document.body.innerText);
  const clean = text.replace(/\n{3,}/g, '\n\n').trim();
  const file = path.join(dir, `${today}-${label}${suffix}.txt`);
  const header = `SOURCE: ${page.url()}\nFETCHED: ${new Date().toISOString()}\nRENDERER: headless Chromium, en-US, US timezone\n----\n`;
  fs.writeFileSync(file, header + clean + '\n');
  console.log(file, `(${clean.length} chars)`);
}

try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  // dismiss common cookie banners
  for (const t of ['Accept all', 'Accept All', 'Accept', 'I agree', 'Got it', 'Allow all']) {
    const b = page.getByRole('button', { name: t, exact: true });
    if (await b.count()) { try { await b.first().click({ timeout: 1500 }); break; } catch {} }
  }
  await settle();
  await dump('');
  let n = 0;
  for (const c of clicks) {
    n++;
    const target = page.getByText(c, { exact: true }).first();
    try {
      await target.click({ timeout: 5000 });
      await page.waitForTimeout(1200);
      await dump(`-after-click-${n}`);
    } catch (e) {
      console.error(`click "${c}" failed: ${e.message.split('\n')[0]}`);
    }
  }
} catch (e) {
  console.error(`FAILED ${url}: ${e.message.split('\n')[0]}`);
  process.exitCode = 1;
} finally {
  await browser.close();
}
