---
license: cc-by-4.0
pretty_name: CinchStack software pricing
language:
- en
tags:
- pricing
- saas
- software
- small-business
- crm
- tabular
size_categories:
- n<1K
configs:
- config_name: plans
  data_files: pricing.csv
  default: true
- config_name: team_costs
  data_files: scenarios.csv
---

# CinchStack software pricing

What small-business software really costs: {{tools}} tools, {{plans}} plans and {{scenarios}} team-size cost estimates. Each figure carries the date we read the vendor's own pricing page and the page it came from. Last checked: {{lastChecked}}.

This is a copy of the dataset published at [cinchstack.com/data](https://cinchstack.com/data/). It is refreshed automatically after every update to the site, so it always matches what the site shows.

## Files

| File | What it holds |
|---|---|
| `pricing.csv` (config `plans`) | One row per plan: the price billed month to month (`monthly_usd`), the effective monthly price billed yearly (`annual_monthly_usd`), the unit, the seats included, the date checked and the source URL. |
| `scenarios.csv` (config `team_costs`) | One row per tool and team size: our estimate of the real monthly bill (`monthly_usd`), its confidence and the date checked. |
| `pricing.json` | Everything above, plus add-ons, usage fees, extra costs, the assumptions behind each estimate and every source. |

## Field notes

- All money is US dollars, as shown to a US buyer.
- `monthly_usd` is empty when a plan is sold only on a yearly contract; `annual_monthly_usd` is empty when there is no yearly option.
- Team-size costs are estimates for the assumptions written into each scenario, for comparison, not quotes.
- Card processing fees on e-commerce tools are listed as extra costs and are not added into the monthly totals.
- Each Monday a script re-reads the vendor pricing pages it can open. Every change is logged at [cinchstack.com/changes](https://cinchstack.com/changes/).

## License and citation

CC BY 4.0: copy, share and adapt it for any purpose, including commercial use. Please credit and link back:

> CinchStack, "Software pricing dataset", https://cinchstack.com/data/, licensed CC BY 4.0.

If you quote a single price, link to that tool's pricing page on [cinchstack.com](https://cinchstack.com/) so readers can see the date it was checked. Prices change; a figure is only as good as the date beside it.
