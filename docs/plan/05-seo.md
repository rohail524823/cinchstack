# 05 — SEO

The sister site's SEO layer worked (average position 34.6 → 14.8 in five weeks; 219 clicks in a four-week export at week nine). This copies what worked, drops what didn't, and closes the gaps its audit found.

## Technical foundation

| Item | Decision | Why |
|---|---|---|
| Rendering | Static HTML from Astro, zero client JS on content pages | Fastest possible; nothing for a crawler to execute |
| Canonicals | Self-referencing, absolute, trailing slash, on every page | Gate fails a wrong one |
| Sitemap | Every indexable page and nothing else; `<lastmod>` from real content change (see below) | Meaningful dates are a ranking signal; meaningless ones train Google to ignore the field |
| robots.txt | Allow all; named groups for 24 AI crawlers each repeating the disallow list (RFC 9309 quirk); disallow `/.netlify/`, `/api/` | Copied from the sister site |
| Robots meta | `index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1` on indexable pages | |
| Noindex | `/thanks/`, `/alternatives/` hub; any hub that outranks its own children with 0 clicks | Sister-site rule |
| Headers | HSTS, nosniff, `X-Frame-Options SAMEORIGIN`, Referrer-Policy, Permissions-Policy, CSP with `form-action 'self'` | From `netlify.toml`; copied |
| Redirects | `/* → /404.html 404`; every renamed URL gets a 301 in `redirects.json`, gated | |
| Fonts | Self-hosted woff2, two preloaded, `font-display: swap` | |
| Assets | Content-hashed filenames (Astro default), cached immutable | |
| Images | WebP, explicit `width`/`height`, `loading="lazy"`, `decoding="async"`, `srcset` for screenshots | Sister site lacked `srcset` |
| Performance budget | **Lighthouse performance ≥ 90 on mobile, enforced in CI**; total JS on a content page 0 KB; CSS < 30 KB | Sister site sat at 71 with 380 KB of third-party JS for ads that were off |
| Analytics | GA4 loaded **after consent** in EEA/UK/CH; no consent, no cookies. Consider Plausible-style cookieless later | Sister site set cookies for everyone; 17% of clicks were EEA |
| Third-party scripts | None at launch. No AdSense. | Ads are not the model |

## Dates — the best idea from the sister site, kept exactly

`sitemap_lastmod` on the sister site walks each page's git history and takes the newest commit where the page's **content** changed — article body, title, description — after stripping generated blocks and the date stamp itself. Otherwise a site-wide rebuild stamps every page "today" and Google learns the field is noise.

CinchStack does the same with one refinement the audit asked for: **data changes and editorial changes are dated separately.**

- `dateModified` (JSON-LD, visible "Updated") = last editorial change to that page's template/prose, from git.
- "Prices last verified" (visible, in provenance box) = `checkedOn` from `pricing/*.json`.
- A price change updates the verified date and adds a `/changes/` entry; it does **not** bump `dateModified` on 50 pages.

Both dates are visible. Neither is ever hand-typed. One job writes them; a gate confirms sitemap, JSON-LD and visible text agree.

## Titles and descriptions

Patterns, by convention and checked for length (title ≤ 60, description 120–160):

| Page type | Title pattern | Example |
|---|---|---|
| Pricing | `<Tool> Pricing (2026): What It Really Costs at 3 Sizes` | `HubSpot Pricing (2026): What It Really Costs at 3 Sizes` |
| Tool hub | `<Tool> Review (2026): Who It's For and What It Costs` | |
| Comparison | `<A> vs <B> (2026): Real Cost, Fit, and Which to Pick` | |
| Alternatives | `<Tool> Alternatives (2026): 6 Options Priced Honestly` | |
| Stack | `The Best Software Stack for a <Business> (2026) — Total Cost` | |

The year is in the title, H1 and JSON-LD headline; a gate fails when they disagree, and **a scheduled job rolls the year on 1 January** — the sister site had no rollover and 104 titles say 2026 forever.

`og:` and `twitter:` tags are generated from title and description; editing one by hand is impossible by design.

## Structured data — one `@graph` per page

Design rule kept from the sister site: **markup only repeats what a reader can see.** Every page has exactly one `<script type="application/ld+json">`.

| Node | On | Source |
|---|---|---|
| `Organization` + `Person` (author), shared `@id`s | every page | `entity.json` |
| `WebSite` + `SearchAction` | homepage | |
| `BreadcrumbList` | every page | route data — same source as the visible trail |
| `Article` (`headline`, `datePublished`, `dateModified`, `author`, `publisher`) | every content page | frontmatter + git dates |
| **`SoftwareApplication`** with `offers` (`Offer` per plan: `price`, `priceCurrency`, `billingIncrement`, `url`) | tool hubs and pricing pages | `tools/*.json` + `pricing/*.json` |
| **`Review`** with `reviewRating`, `positiveNotes`, `negativeNotes`, `itemReviewed` → the `SoftwareApplication` `@id` | tool hubs | score data — rating must be visible |
| `FAQPage` | every page with a FAQ | `faq/*.json`, word-for-word with the visible text |
| `ItemList` | comparisons (2 items), stacks (the tools), any ranked list | same data as the table; `numberOfItems` gated |
| `Dataset` with `DataDownload` (JSON + CSV), `license` CC BY 4.0 | `/data/` | generated |
| `WebPage` with `lastReviewed`, `reviewedBy` | pricing pages | the weekly job |
| `AboutPage`, `ContactPage` | those pages | |

**Absent on purpose:** `AggregateRating` (our scores are self-published editorial, not aggregated); `speakable` (unproven); `HowTo`.

`SoftwareApplication` + `Offer` is the schema Google documents for software pricing; the sister site had no equivalent for its category and its audit listed it as a gap. **Before launch: verify the current required fields in Google's documentation and validate every page type in the Rich Results Test.**

## Internal linking

See `03-architecture.md`. Two additions the audit asked for:

- **Indexable category hubs** exist from day one (`/tools/`, `/compare/`, `/stacks/`) — the sister site had none and its role pages hung off a homepage list.
- **Orphan gate** fails after week four; before that it reports.

## Images

- One real screenshot per pricing table, captured on the verification date, filename includes the date, caption states the date, alt text describes only what is visible in the pixels (sister-site method).
- Per-page social image generated at build (title on the paper background). The sister site served one generic image to 233 pages.

## Gates — all run in CI on every push, all must pass before deploy

Adapted from `site_audit.py` and friends, collapsed into one `check` script:

**Head:** title and description present and within length; canonical correct; no stray text in `<head>`; year agreement across title/H1/headline.
**Content:** exactly one H1; Quick answer present and passes its per-type rule; ≥ 300 words; no duplicate titles; no sentence repeated on > 3 pages outside generated blocks.
**JSON-LD:** parses; no dangling `@id`; `ItemList.numberOfItems` equals rendered items; every `FAQPage` question visible; every rating visible; every `Offer.price` equals the data.
**Tables/images:** every table has a lead; every image has alt, width, height.
**Links:** every internal link, fragment, canonical and sitemap `<loc>` resolves; crawl depth ≤ 3; no orphan (after week 4).
**Policy:** every paid link `rel="sponsored nofollow noopener"`; disclosure line present and first on any page with a paid link; ≥ 150 words per paid button; amber class only on approved-program hosts; no earnings-claim or coupon lexicon near paid links; GHL mandatory disclosure on every GHL page.
**Sync:** visible FAQ = schema FAQ; visible breadcrumb = schema breadcrumb; visible dates = JSON-LD dates = sitemap; `og:` = title/description.
**Performance:** Lighthouse mobile ≥ 90 on a sample of five pages; CSS < 30 KB; JS on content pages = 0.

If a gate cannot be satisfied by the build that produced the page, the design is wrong — not the page. (Sister-site lesson: six publisher deadlocks, one lasting a week.)

## Search Console and Bing setup — day one

- Verify cinchstack.com in Google Search Console (DNS) and Bing Webmaster Tools (import from GSC).
- Submit the sitemap to both.
- Request indexing for the eight pricing pages and the homepage by hand on launch day.
- Weekly: export GSC pages + queries to `growth/data/` (gitignored) for the review in `11-measurement-kill.md`.
