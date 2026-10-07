#!/usr/bin/env node
// Writes src/data/_dates.json: for every prose page, the date it was first published and the date
// its content last changed, read from git history. A rebuild never moves these dates; only a real
// edit to the page's prose or its own data files does (an edit to just its Keep reading links, the
// frontmatter `related:` list, does not). Run before committing content changes:
//   node scripts/lastmod.mjs
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const git = (...args) => { try { return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return ''; } };
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

// The frontmatter `related:` list only picks the page's Keep reading links. A change to that list
// alone is navigation, not content, so it does not move the page's date.
const withoutRelated = (src) => src.replace(/^---\n[\s\S]*?\n---/, (fm) => fm.replace(/^related:.*\n(?:[ \t]+-.*\n)*/m, ''));
const linksOnly = (before, after) => before !== '' && before !== after && withoutRelated(before) === withoutRelated(after);
// Date of the last commit that changed the page's files, skipping commits that touched only the
// .mdx file's `related:` list.
function lastEdit(file, files) {
  for (const entry of git('log', '--format=%H %cs', '--', ...files).split('\n').filter(Boolean)) {
    const [sha, date] = entry.split(' ');
    const touched = git('show', '--format=', '--name-only', sha, '--', ...files).split('\n').filter(Boolean);
    if (touched.join('\n') !== file || !linksOnly(git('show', `${sha}^:${file}`), git('show', `${sha}:${file}`))) return date;
  }
  return '';
}

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
  let modified = lastEdit(file, files) || published;
  const changed = files.filter(isDirty);
  if (changed.length && !(changed.join('\n') === file && linksOnly(git('show', `HEAD:${file}`), fs.readFileSync(file, 'utf8').trim()))) modified = today;
  dates[id] = { published, modified: modified < published ? published : modified };
}

const next = JSON.stringify(dates, null, 2) + '\n';
const prev = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
if (next !== prev) { fs.writeFileSync(OUT, next); console.log(`${OUT}: ${Object.keys(dates).length} pages updated`); }
else console.log(`${OUT}: unchanged`);
