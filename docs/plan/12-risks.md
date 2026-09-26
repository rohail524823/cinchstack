# 12 — Risk register

| # | Risk | Likelihood | Impact | Mitigation | Owner |
|---|---|---|---|---|---|
| 1 | **New domain cannot rank for pricing queries** against established SaaS affiliates | Medium | Fatal | Day-30 kill criterion; Quick-answer + FAQ + dataset for AI citation as a second channel; Bing where the sister site found real traffic | Claude |
| 2 | **Selective programs decline** even at 1,000 visitors | Medium | High | Apply with live URLs and numbers; appeal once with the Coursera-style packet; tools stay on site with plain links; GHL carries revenue meanwhile | Claude / Rohail |
| 3 | **GHL 120-day forfeiture** eats early commissions | Medium | Medium | GHL pages ship in week 1; extended-trial link used; first conversion targeted by day 90 | Claude |
| 4 | **GHL payout rail fails for Pakistan** (Tipalti ACH → Payoneer) | Low–Medium | High | Confirm Payoneer USD receiving account active now; confirm W-8 filed; ask Devesh Khatri in writing which rails Pakistan affiliates use | Rohail |
| 5 | **Program terms change without notice** (Amazon −50% May 2026; Udemy halving Oct 2026) | High | Medium | Eight tools across five layers; recurring programs preferred; `rateHistory` tracked; no page depends on one program | Claude |
| 6 | **Vendor pricing pages block automated fetch** | High for 2–3 vendors | Medium | Playwright fallback in Actions; monthly browser pass for the rest; provenance box says "checked by hand on <date>" honestly | Claude |
| 7 | **A wrong price is published** | Medium | High (trust) | Every figure has source + snapshot; weekly re-check; corrections same week and logged in `/changes/`; contact form on every page | Claude |
| 8 | **GHL contract breach** (earnings claim, unauthorized offer, trademark misuse) | Low | High (program loss) | Gates in CI for lexicon, offers, URL paths, mandatory disclosure | Claude |
| 9 | **Netlify free tier hard-stops** at traffic | Medium | Medium | Budget $9–20/month from month 1; deploy only on merge to `main`; alerts on credit usage | Rohail |
| 10 | **Bing goes to zero** as the sister site did | Medium | Medium | IndexNow off by default; content-change-only when on; weekly Bing check with a 7-day-zero trigger | Claude |
| 11 | **Site "feels affiliate"** to readers or to Google's reviewers | Medium | High | Six stacks as the identity; non-paying tools recommended where honest; one disclosure per page; no advisor widget; no earnings content; duplicate-sentence gate | Claude |
| 12 | **Thin/duplicate content across 52 pages** | Medium | High | Data-rendered tables + prose that only adds what data can't; duplicate gate; length is not a target | Claude |
| 13 | **Schema errors** (SoftwareApplication/Offer required fields) | Medium | Low–Medium | Validate every page type in Rich Results Test before launch; gate on parse and on price = data | Claude |
| 14 | **Klaviyo has no open affiliate track** | Medium | Low | Klaviyo stays as content with plain links; Kit becomes the paying email tool | Claude |
| 15 | **Solo-builder bandwidth** — 52 pages in 6 weeks plus verification | Medium | Medium | Data-first means pages are mostly generated; prose budget ~1,500 words × 42; week-by-week plan with slack in weeks 5–6 | Claude |
| 16 | **Owner's other site absorbs attention** | Medium | Medium | This plan is self-contained; Claude Code runs the weekly loop; Rohail's tasks are listed and few | Rohail |
| 17 | **AI Overviews absorb the pricing answer entirely** and cite the vendor, not us | Medium | High | Our number is *different* from the vendor's (real bill at three sizes, hidden costs) — the vendor page can't be cited for it; dataset + changelog give us facts vendors don't publish | Claude |
| 18 | **Legal: comparative claims about vendors** | Low | Medium | Every claim sourced and dated; "as of <date>"; corrections process; no defamatory language; nominative use of names only | Claude |

## The three risks that would actually kill it

1. **Can't rank (1).** Checked at day 30. Nothing else matters if this fails.
2. **Feels affiliate (11).** Slow, invisible, fatal — the reason the category has no trusted sites. Guarded by design, not by intent.
3. **Money can't reach Pakistan (4).** Boring, checkable this week, catastrophic if discovered in month four.

## Rohail's short list — the only things Claude cannot do

- Confirm Payoneer USD receiving account is active; confirm W-8 filed with GHL/Tipalti.
- Email Devesh Khatri: "Which payout rails do Pakistan-based affiliates use successfully?"
- Fund Netlify ($9–20/month) when the usage alert fires.
- Approve merges to `main` if you want a review step; otherwise Claude merges.
- In phase 2: click "apply" on seven programs (Claude drafts every application).
- Optional: create a GoHighLevel trial account so pricing pages can carry dated, first-hand screenshots — the one edge the saturated GHL category cannot copy.
