import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import fs from 'node:fs';

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

export default defineConfig({
  site: 'https://cinchstack.com',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'always' },
  compressHTML: true,
  integrations: [mdx(), reversedComparisons],
  prefetch: false,
  devToolbar: { enabled: false },
});
