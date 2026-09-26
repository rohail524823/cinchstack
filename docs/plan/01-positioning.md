# 01 — Positioning

## The one-sentence identity

**CinchStack tells you which software stack is best for your business, and what it will really cost.**

Not "reviews." Not "best-of lists." A recommendation service backed by verified pricing data. The motto — *the stack that's best for you* — is a promise about the reader, not about the tools.

## The promise, in the reader's words

- "I'll find out what this tool actually costs at my size before I talk to sales."
- "I'll see two tools compared on the same numbers, not on marketing copy."
- "I'll get told the whole stack for a business like mine, with the monthly bill added up."
- "If a price changes, this site will know before I do."

## What it is not

- **Not an affiliate site.** Affiliate income funds it. It does not shape what is recommended. The `stacks/` pages recommend non-paying tools (WooCommerce, Mailchimp, Ahrefs) wherever they are the honest answer, with plain links.
- **Not a news site.** No "10 AI tools you need this week." Every page is evergreen and re-verified.
- **Not a directory.** Eight tools at launch, chosen and scored, not eight hundred listed.
- **Not generated filler.** The sister site's audit found 17% of words on a typical page repeated across 10+ pages. Our gate rejects any sentence that appears on more than three pages outside generated blocks.

## Why a reader should trust it — the trust model

Copied from what worked on the sister site, tightened where the audit found gaps:

| Mechanism | What the reader sees |
|---|---|
| **Every price has a source and a date.** | "Verified against shopify.com/pricing on 24 Sep 2026." Under every table. |
| **Weekly re-verification, public log.** | `/changes/` lists every price change we caught, dated. `/data/` publishes the dataset. |
| **Scores come with reasons.** | "Why we score it 3.8" panel beside every score. Two blind passes. Lower-of-two for tools that pay us. |
| **We say what pays.** | One disclosure line at the top of every page with a paid link. The `stacks/` pages show the top-scored option next to any paid pick. |
| **We say what we haven't done.** | No first-hand claims unless recorded. When we run a real trial, we say the dates and show the screenshots. |
| **Independence stated once, not seven times.** | The sister site learned that repeating it reads as an affiliate site. |

### The rule the sister site broke, which we won't

Its `/terms/` said *"commission never determines what we recommend"* while a paid-only recommendation slot sat on 205 pages. Ours says the true thing: **"Our pick among tools that pay us is marked. The highest-scored tool is shown beside it, whether or not it pays us."** Absolutes are banned from trust copy.

## Voice

- Plain English. Short sentences. A number before an adjective.
- Write like an experienced operator explaining to a friend, not like a review site.
- State the cost first, then the caveat, then the recommendation.
- Never "unlock", "supercharge", "game-changer", "seamless". Never an exclamation mark.
- Attribute claims: "Shopify's pricing page says…", "HubSpot calls this…".
- Dated checks in prose: "when we checked on 24 September 2026, the Starter plan was…".

## The audience, concretely

Six business types, each becoming a `stacks/` page and a lens for every comparison:

| Business | Size band | What they're really asking |
|---|---|---|
| Marketing agency | 3–20 people | "Can one tool replace five, and what does it cost per client?" |
| Coach / course creator | solo–5 | "Cheapest way to sell a course and run email without duct tape?" |
| Shopify / DTC store | solo–15 | "Which email, which apps, what's my real monthly bill?" |
| Local service business | solo–10 | "Booking, reminders, reviews, a website — one bill, no agency." |
| Freelancer / consultant | solo | "Professional stack under $100 a month." |
| Early-stage SaaS | 2–10 | "CRM, docs, site, SEO — what scales without lock-in?" |

Every comparison page ends with "which is right for a [business type]" for each type it applies to. That sentence is what turns a comparison into a recommendation.

## Naming

- Brand: **CinchStack**. Domain: cinchstack.com.
- Tagline under the logo: *The stack that's best for you.*
- Never use a vendor trademark in a URL path as a brand (e.g. no `/gohighlevel-pricing-guide/` as a section name). Tool names appear only as the identifier inside `/tools/`, `/compare/`, `/alternatives/` — which is nominative use. GHL's agreement bans trademarks in domains and subdomains; we go further and keep them out of section names.

## The visual identity

Kept from the current `index.html`, which is good and already live:

- Paper palette: `#F4F1EA` paper, `#131410` ink, `#0E7A57` accent green, `#4ECBA5` lift.
- Type: Bricolage Grotesque (display), IBM Plex Sans (body), IBM Plex Mono (labels, numbers).
- The "cinch" mark: three horizontal bars, middle one pinched.
- Amber (`#C77A0E` family) is reserved for **paid links only**, exactly as the sister site does. A plain button is never amber. A gate enforces it.

Rebuilt lean: one stylesheet under 30 KB, self-hosted fonts, no third-party JS at launch.
