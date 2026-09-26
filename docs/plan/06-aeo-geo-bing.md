# 06 — AEO, GEO and Bing: being the source that gets cited

## What the evidence says

- **~48% of commercial searches now show an AI Overview**, and position-one CTR is ~58% lower when one appears. We cannot avoid them. We have to be cited inside them; cited pages see a ~35% CTR lift over uncited neighbours.
- **~97% of AI Overview citations are pages already in the organic top 20.** AEO does not replace SEO; it sits on top of it.
- **Content under three months old is ~3× more likely to be cited; pages untouched 6+ months lose eligibility.** Freshness is the lever, and a weekly-verified pricing site is structurally fresh.
- **~55% of cited passages sit in the first 30% of the page.** The Quick answer is the citable passage.
- **The sister site earned 8,159 Bing Copilot citations in ~8 weeks** with: answer-first Quick answers, self-contained FAQs, a CC-BY dataset with `Dataset` schema, named AI crawler groups in robots.txt, and `llms.txt`. Those were live when the citations happened; `llms-full.txt` and `agents.json` arrived after and cannot have caused them.

So the plan copies exactly the things that were live when the citations were earned, adds the pricing dataset as the strongest possible citation magnet, and measures.

## The citable passage: the Quick answer

Rules are in `04-content-system.md`. The AEO-specific additions:

- **Definitional first sentence** that could stand alone in an answer box: "GoHighLevel's Unlimited plan is $297 a month as of 3 October 2026, but a typical agency's real bill is $380–$520 once phone, email and AI usage are counted."
- **A number, a date, a named source** in the first two sentences.
- **The verdict names the business type**: "For a 5-person agency it beats HubSpot on cost; for a SaaS startup it doesn't."
- No pronoun without its noun in the first 30% of the page — a quoted fragment must make sense alone.

## Self-contained FAQs

90–160 words, each answer complete on its own, at least one number where the question is about cost. Rendered word-for-word into `FAQPage`. Questions are the literal queries people type — sourced from Search Console once live, from "People also ask" and vendor community forums before that.

## Chunkable structure

- Every H2 has a stable `id` — every section is its own citable URL.
- H2s are questions where natural ("Does HubSpot charge for onboarding?"), and 5–8 per page.
- Every table has a lead sentence stating what it shows, with the size scenario and date — a table quoted without its lead is meaningless; the lead makes it quotable.
- One "Where most advice gets this wrong" section per comparison and stack — the contrarian block the sister site ran on 93 pages; it is where original opinion lives.

## The pricing dataset — the citation magnet

`/data/` publishes the entire pricing corpus as JSON and CSV under **CC BY 4.0**, with `Dataset` + `DataDownload` schema, a "How to cite this data" block, and a `lastUpdated` that moves every week.

Why this is the strongest GEO asset available to a site with no budget:

1. It is **original data nobody else maintains** — verified current prices across tools, with size-scenario totals.
2. It is **what LLM-based answers need to cite** when asked "what does X cost" — a dated, structured source beats a stale training memory.
3. It **earns links** from writers, analysts and other tools who would rather cite than re-verify (the sister site's dataset went to Kaggle and got real downloads with zero promotion).
4. It **updates itself**: every weekly verification that changes a number changes the dataset, so it is never stale.

Distribution: Kaggle, Hugging Face Datasets, data.world, a public GitHub repo mirror — kept in sync by the same job, so none goes stale (the sister site's Kaggle copy fell behind by 80 rows).

## The changelog — freshness made visible

`/changes/` lists every price and plan change the weekly job catches: date, tool, what changed, old → new, source. Each entry is a dated, factual, quotable sentence: "On 7 October 2026 Webflow raised the CMS site plan from $23 to $29/month (annual billing)."

- It is the most-frequently-updated page on the site, so it is the freshest thing a crawler finds.
- It is **exactly what the newsletter sends** — one job, three outputs (page, email, dataset).
- Each entry links the affected pricing page, pushing freshness signals inward.

## Machine-readable discovery files

Generated at build from the same data as everything else:

| File | Contents | Note |
|---|---|---|
| `robots.txt` | allow all; 24 named AI crawler groups (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-User, Claude-SearchBot, PerplexityBot, Google-Extended, Bingbot, CCBot, Applebot-Extended, …) each with the disallow list repeated | RFC 9309: a crawler that finds its own group follows only that group |
| `llms.txt` | curated: the six stacks, the eight pricing pages, the eight tool hubs, `/data/`, `/changes/`, `/methodology/`, one funding sentence | deduped; every sitemap URL appears once |
| `llms-full.txt` | full readable text of pricing, comparison and stack pages, stripped of CTAs and nav; **capped at 1 MB**, split by section if larger | the sister site's 3.5 MB version was likely truncated by fetchers |
| `agents.json` | policy, allowed agents (parsed from robots.txt), citation request, funding disclosure, "first-hand experience: only where a dated trial record exists" | |

Honest note: Google has stated `llms.txt` does nothing for AI Overviews or AI Mode. It costs nothing, other engines may read it, and it did no harm on the sister site. We ship it and do not lean on it.

## Entity consistency

One `Organization` (`CinchStack`, `@id` `https://cinchstack.com/#org`) and one `Person` (the author, `@id` `…#rohail-nisar`) inlined identically on every page. Person `sameAs` to LinkedIn and GitHub. Organization `sameAs` deliberately empty until brand social accounts exist — the sister site's decision, and correct.

A dedicated author page at `/about/` with `ProfilePage` schema (the sister site lacked one; its Person URL was `/about/` without the type).

## Bing specifically

Bing drove real clicks (88 in five weeks) and all the Copilot citations on the sister site. Then it went to **zero impressions from 28 August** — the day after IndexNow started firing ~155 URLs on every push. Cause unproven; correlation strong. Our policy:

- **Verify in Bing Webmaster Tools on day one**, import from GSC, submit the sitemap.
- **IndexNow only for URLs whose content actually changed**, computed by the same content-diff that sets `lastmod`. Cap 10 URLs per run. **Off by default; enabled only after week 2 once indexing is confirmed.** Never on a full rebuild.
- Watch Bing impressions weekly; if they drop to zero for seven days, switch IndexNow off and open an issue.

## Measuring AI citations with no paid tools

- **Bing Webmaster Tools → Search Performance → AI queries export**: the source of the sister site's 8,159 figure. Export weekly to `growth/data/`.
- **GA4 "AI Assistants" channel**: a custom channel group matching referrers `chatgpt.com`, `chat.openai.com`, `perplexity.ai`, `claude.ai`, `gemini.google.com`, `copilot.microsoft.com`, `you.com`. The sister site saw 99 sessions in 28 days without building this deliberately.
- **Server-side referrer capture**: a tiny Netlify edge function logs referrer host + path to a daily counter (no cookies, no PII) — catches AI visits that block JavaScript.
- **Manual spot checks, monthly**: ask ChatGPT, Claude, Gemini, Perplexity and Copilot "what does [tool] cost" and "[A] vs [B] pricing" for each of the eight; record which cite us. Ten minutes, logged in `growth/`.

## What we do not do

- No `llms.txt` promises in marketing copy.
- No claims about AI citation on the site itself until measured.
- No scraping of AI answers at scale — that is the paid-inference loop that killed the GEO-tracker idea; we measure with free exports and ten minutes a month.
