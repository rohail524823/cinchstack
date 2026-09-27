import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

// A comparison lives at one URL (/compare/a-vs-b/). Readers and other sites type either order,
// so the reversed URL gets a permanent redirect instead of a 404. Netlify reads dist/_redirects.
const reversedComparisons = {
  name: 'reversed-comparisons',
  hooks: {
    'astro:build:done': ({ dir, pages }) => {
      const have = new Set(pages.map((p) => p.pathname));
      const rules = [];
      for (const p of have) {
        const m = p.match(/^compare\/(.+)-vs-(.+)\/$/);
        if (m && !have.has(`compare/${m[2]}-vs-${m[1]}/`)) rules.push(`/compare/${m[2]}-vs-${m[1]}/ /compare/${m[1]}-vs-${m[2]}/ 301`);
      }
      fs.writeFileSync(new URL('_redirects', dir), rules.sort().join('\n') + '\n');
    },
  },
};

// dist/version.txt holds the commit this build came from, so the live-deploy check
// (.github/workflows/deploy-check.yml) can tell whether a push actually went live.
const buildStamp = {
  name: 'build-stamp',
  hooks: {
    'astro:build:done': ({ dir }) => {
      let sha = process.env.COMMIT_REF || process.env.GITHUB_SHA || '';
      if (!sha) try { sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(); } catch {}
      fs.writeFileSync(new URL('version.txt', dir), `${sha || 'unknown'}\n`);
    },
  },
};

export default defineConfig({
  site: 'https://cinchstack.com',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'always' },
  compressHTML: true,
  integrations: [mdx(), reversedComparisons, buildStamp],
  prefetch: false,
  devToolbar: { enabled: false },
});
