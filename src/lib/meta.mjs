// Page dates: from src/data/_dates.json (written by scripts/lastmod.mjs from git), falling back to frontmatter.
import { pageDates } from './data.mjs';
export function datesFor(entry) {
  const d = pageDates[entry.id];
  const published = d?.published ?? entry.data.published;
  const modified = d?.modified ?? entry.data.published;
  return { published, modified: modified < published ? published : modified };
}
