#!/usr/bin/env node
// Writes src/data/_dates.json: for every prose page, the date it was first published and the date
// its content last changed, read from git history. A rebuild never moves these dates; only a real
// edit to the page's prose or its own data files does. Run before committing content changes:
//   node scripts/lastmod.mjs
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const git = (...args) => { try { return execFileSync('git', args, { encoding: 'utf8' }).trim(); } catch { return ''; } };
const today = new Date().toISOString().slice(0, 10);
const OUT = 'src/data/_dates.json';

function walk(dir, out = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p, out); else if (p.endsWith('.mdx')) out.push(p);
  }
  return out;
}

const dirty = new Set(git('status', '--porcelain', '--untracked-files=all').split('\n').filter(Boolean).map((l) => l.slice(3).trim()));
const isDirty = (f) => dirty.has(f) || [...dirty].some((d) => d.endsWith('/') && f.startsWith(d));

const dates = {};
for (const file of walk('src/content').sort()) {
  const id = path.relative('src/content', file).replace(/\.mdx$/, '').split(path.sep).join('/');
  const [kind, slug] = id.split('/');
  const own = [file, `src/data/faq/${kind}--${slug}.json`];
  if (kind === 'compare') own.push(`src/data/comparisons/${slug}.json`);
  if (kind === 'stacks') own.push(`src/data/stacks/${slug}.json`);
  if (kind === 'alternatives') own.push(`src/data/alternatives/${slug}.json`);
  const files = own.filter((f) => fs.existsSync(f));
  const fm = fs.readFileSync(file, 'utf8').match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
  const fmPublished = fm.match(/^published:\s*["']?(\d{4}-\d{2}-\d{2})/m)?.[1] ?? today;
  const added = git('log', '--diff-filter=A', '--format=%cs', '--', file).split('\n').filter(Boolean).at(-1);
  const published = added ?? fmPublished;
  let modified = git('log', '-1', '--format=%cs', '--', ...files) || published;
  if (files.some(isDirty)) modified = today;
  dates[id] = { published, modified: modified < published ? published : modified };
}

const next = JSON.stringify(dates, null, 2) + '\n';
const prev = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
if (next !== prev) { fs.writeFileSync(OUT, next); console.log(`${OUT}: ${Object.keys(dates).length} pages updated`); }
else console.log(`${OUT}: unchanged`);
