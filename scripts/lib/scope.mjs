// Which tools a page covers, and the dollar figures and check dates that belong to them.
// The most-quoted passages (Quick answers, FAQ answers, titles and descriptions) may only use
// figures and "as of" dates of the tools the page is about, so a price that moves in the data
// cannot hide behind the same number on another tool. Shared by scripts/lint-content.mjs (drafts)
// and scripts/check.mjs (built pages).
import { knownFigures, figuresIn } from './figures.mjs';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
/** 2026-09-26 -> "26 September 2026", the way pages print dates. */
export const longDate = (iso) => { const [y, m, d] = String(iso).split('-').map(Number); return `${d} ${MONTHS[m - 1]} ${y}`; };

/** "as of <date>" in any of the forms a writer might type; the date must be printed the site's way. */
export const AS_OF = /\bas of (\d{1,2} [A-Z][a-z]+ \d{4}|[A-Z][a-z]+ \d{1,2},? \d{4}|\d{4}-\d{2}-\d{2})/gi;

const uniq = (xs) => [...new Set(xs)];
const strings = (x) => (typeof x === 'string' ? [x] : x && typeof x === 'object' ? Object.values(x).flatMap(strings) : []);
// Case-sensitive: the site writes tool names with their brand casing, and some (Notion, Kit, Wix) are
// also common words that must not pull another tool's figures into a passage's scope.
const nameRe = (n) => new RegExp(`\\b${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);

/**
 * Every figure of some tools: plan, add-on, usage and scenario values (knownFigures), plus the
 * figures their own pricing record states in its notes (a $108 yearly price in an add-on's note),
 * plus, for a stack page, that stack's totals.
 */
export function toolFigures(data, ids, stacks = {}) {
  const pricing = Object.fromEntries(ids.filter((t) => data.pricing[t]).map((t) => [t, data.pricing[t]]));
  const out = knownFigures({ pricing, stacks });
  for (const p of Object.values(pricing)) for (const s of strings(p)) for (const f of figuresIn(s)) if (f.v) out.add(f.v);
  return out;
}

/**
 * Tool ids a page covers, by kind and slug (content collection ids), or null for pages that cover
 * the whole site (hubs, trust pages), which keep the site-wide figure set.
 * pricing / tools / guide: that tool; compare: both tools; stack: its layer picks and their
 * alternatives; alternatives: the tool and its picks.
 */
export function pageTools(data, kind, slug) {
  if (kind === 'pricing' || kind === 'tools') return data.tools[slug] ? [slug] : [];
  if (kind === 'guides') { const t = slug.split('--')[0]; return data.tools[t] ? [t] : []; }
  if (kind === 'compare') { const c = data.comparisons[slug]; return c ? [c.a, c.b] : []; }
  if (kind === 'stacks') { const s = data.stacks[slug]; return s ? uniq(s.layers.flatMap((l) => [l.pick, ...(l.alternatives ?? []).map((a) => a.tool)])) : []; }
  if (kind === 'alternatives') { const a = data.alternatives[slug]; return uniq([slug, ...(a?.reasons ?? []).flatMap((r) => r.picks.map((p) => p.tool))]); }
  return null;
}

/** A built page's path as [kind, slug] in content collection terms, or null for other pages. */
export function pageRef(p) {
  let m;
  if ((m = p.match(/^\/tools\/([a-z0-9-]+)\/pricing\/$/))) return ['pricing', m[1]];
  if ((m = p.match(/^\/tools\/([a-z0-9-]+)\/([a-z0-9-]+)\/$/))) return ['guides', `${m[1]}--${m[2]}`];
  if ((m = p.match(/^\/tools\/([a-z0-9-]+)\/$/))) return ['tools', m[1]];
  if ((m = p.match(/^\/(compare|alternatives|stacks)\/([a-z0-9-]+)\/$/))) return [m[1], m[2]];
  return null;
}

/**
 * { tools, figures, dates } for a page: figures are every known figure of the page's tools (plus
 * the page's own stack totals); dates are those tools' checkedOn dates, printed the site's way.
 * For a site-wide page, figures is `siteFigures` and dates is null (any date is allowed).
 */
export function pageScope(data, kind, slug, siteFigures, tools = pageTools(data, kind, slug)) {
  if (!tools) return { tools: null, figures: siteFigures, dates: null };
  const stacks = kind === 'stacks' && data.stacks[slug] ? { [slug]: data.stacks[slug] } : {};
  return {
    tools,
    figures: toolFigures(data, tools, stacks),
    dates: new Set(tools.map((t) => data.pricing[t]?.checkedOn).filter(Boolean).map(longDate)),
  };
}

/**
 * Figures allowed in one passage: the page's own figures, plus those of any other tracked tool the
 * passage itself names (an FAQ answer comparing ClickFunnels with Kajabi may quote Kajabi's price;
 * a GoHighLevel answer that names no other tool may not borrow Systeme.io's $97).
 */
export function passageFigures(data, scope, text) {
  if (!scope.tools) return scope.figures;
  const named = namedTools(data, scope, text);
  return named.length ? new Set([...scope.figures, ...toolFigures(data, named)]) : scope.figures;
}

/** Tracked tools a passage names that are not already the page's own tools. */
export function namedTools(data, scope, text) {
  return Object.values(data.tools).filter((t) => !scope.tools.includes(t.id) && nameRe(t.name).test(text)).map((t) => t.id);
}

/** Check dates allowed in one passage: the page's tools' dates plus those of tools it names. */
export function passageDates(data, scope, text) {
  if (!scope.dates) return null;
  const named = namedTools(data, scope, text).map((t) => data.pricing[t]?.checkedOn).filter(Boolean).map(longDate);
  return named.length ? new Set([...scope.dates, ...named]) : scope.dates;
}

/**
 * "As of" dates in a text that are not allowed. A leading "As of <date>," dates the whole passage,
 * so it must be the check date of one of the page's own tools (`dates`); an "as of" later in the
 * passage may also be the check date of another tool the passage names (`looseDates`).
 */
export function badAsOf(text, dates, looseDates = dates) {
  if (!dates) return [];
  return [...text.matchAll(AS_OF)].filter((m) => !(text.slice(0, m.index).trim() === '' ? dates : looseDates).has(m[1])).map((m) => m[1]);
}

/**
 * The dates a leading "As of" may carry: the check dates of the page's tools that the first
 * sentence names (it is that sentence's prices the date vouches for), or of all the page's tools
 * when the first sentence names none of them.
 */
export function leadDates(data, scope, text) {
  if (!scope.dates) return null;
  const first = String(text).split(/(?<=[.!?])\s+/)[0];
  const named = scope.tools.filter((t) => data.tools[t] && nameRe(data.tools[t].name).test(first)).map((t) => data.pricing[t]?.checkedOn).filter(Boolean).map(longDate);
  return named.length ? new Set(named) : scope.dates;
}

/** Words a reader in the US would mark as misspelled (US English is the house style). */
export const UK_SPELLING = /\b(centres?|licences?|organis(?:e|es|ed|ing|ation|ations)|colour(?:s|ed|ing|ful)?|labell(?:ed|ing)|judgements?|cancell(?:ed|ing)|enquir(?:y|ies|e|es|ed|ing)|catalogues?|behaviours?|behavioural|favourites?|optimis(?:e|es|ed|ing|ation|ations))\b/gi;

/** UK spellings in a text, ignoring short quoted titles ("Help Centre") and URLs. */
export function ukSpellings(text) {
  const t = String(text).replace(/https?:\/\/\S+/g, ' ').replace(/“[^”]{1,80}”|"[^"\n]{1,80}"/g, ' ');
  return [...t.matchAll(UK_SPELLING)].map((m) => m[0]);
}

/** FAQ answers must stand alone when quoted without the page around them. */
export const FAQ_CONTEXT = /\b(?:on )?this page\b|\bthe table above\b|\bsee above\b|\babove\.\s*$/i;
/** "Which one…?" / "Which is better…?" questions must name what they compare. */
export function vagueQuestion(q, toolNames) {
  if (!/^\s*which (one|is better)\b/i.test(q)) return false;
  return !toolNames.some((n) => nameRe(n).test(q));
}
