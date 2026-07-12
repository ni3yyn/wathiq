# Full Audit Report

- URL: `https://wathiq.web.app`
- Generated: `2026-06-06T12:58:12.009044`
- Overall score: `80/100`
- Score confidence: `Medium`
- Scoring version: `1`

## Score Card

| Category | Weight | Score |
| --- | ---: | ---: |
| Security Headers | 8 | 100 |
| Social Meta | 5 | 77 |
| Robots and Crawlers | 8 | 100 |
| Broken Links | 10 | 100 |
| Internal Links | 8 | 60 |
| Redirects | 3 | 100 |
| AI Search | 5 | 90 |
| Performance and Core Web Vitals | 13 | 0 |
| On-Page SEO | 10 | 100 |
| Readability | 8 | 59 |
| Entity SEO | 5 | 5 |
| Link Profile | 7 | 55 |
| Hreflang | 5 | 0 |
| Content Uniqueness | 5 | 100 |

## Findings

| Severity | Area | Finding | Evidence | Fix |
| --- | --- | --- | --- | --- |
| Critical | link_profile | Average internal links per page is only 2.5 (target: 5-10). |  | Increase internal linking by adding contextual links within content. |
| Warning | environment | Content readability is difficult | Long, complex text can reduce engagement and comprehension. | Rewrite key sections with shorter sentences (15-20 words), shorter paragraphs (2-4 sentences), and clearer subheadings. |
| Warning | internal_links | ⚠️ 2 potential orphan page(s) (≤1 internal link pointing to them) |  |  |
| Warning | internal_links | ⚠️ 3 page(s) have fewer than 3 internal links |  |  |
| Warning | readability | ⚠️ Content is difficult to read (Flesch: 35.6) — may reduce engagement |  |  |
| Warning | readability | ⚠️ 50.0% complex words (3+ syllables) — consider simplifying |  |  |
| Warning | readability | ⚠️ Thin content (2 words) — may rank poorly |  |  |
| Warning | sameAs | Missing sameAs link to Wikipedia (Primary KG signal). |  | Add the existing official 'wikipedia.org' URL to sameAs; do not create this profile solely for SEO. |
| Warning | sameAs | Missing sameAs link to Wikidata (Primary KG signal). |  | Add the existing official 'wikidata.org' URL to sameAs; do not create this profile solely for SEO. |
| Info | Wikipedia | No Wikipedia article found for 'وثيق'. |  | Only pursue Wikipedia if the entity meets independent notability standards. Otherwise, strengthen official schema, sameAs profiles, citations, and About/Contact signals. |
| info | article | article measurement incomplete | [article_seo.py] Traceback (most recent call last): File "C:\Users\HP\.claude\skills\seo\scripts\article_seo.py", line 637, in <module> main() ~~~~^^ File "C:\Users\HP\.claude\skills\seo\scripts\article_seo.py", line 537, in main structured_data = extract_structured_data(soup) File "C:\Users\HP\.claude\skills\seo\scripts\article_seo.py", line 268, in extract_structured_data schema_type = data.get("@type", "Unknown") ^^^^^^^^ AttributeError: 'list' object has no attribute 'get' | Rerun this check after resolving the environment/API/network limitation. |
| Info | environment | Performance measurement incomplete | PageSpeed API returned an error, so CWV recommendations are less reliable. | Set `PAGESPEED_API_KEY` in your environment or `.env` file (see `.env.example`), then rerun. The CLI also accepts `--api-key`. Prioritize LCP/INP/CLS fixes from that output. |
| info | pagespeed | pagespeed measurement incomplete | Rate limited by Google API. Wait a few minutes or add an API key. | Rerun this check after resolving the environment/API/network limitation. |
| Info | sameAs | Missing sameAs link to LinkedIn (Strong KG signal). |  | Add 'linkedin.com' profile URL to sameAs array in your entity schema. |
| Info | sameAs | Missing sameAs link to Twitter/X (Strong KG signal). |  | Add 'x.com' profile URL to sameAs array in your entity schema. |

## Measurement Notes

2 checks returned errors or incomplete measurements; treat affected scores as directional.
