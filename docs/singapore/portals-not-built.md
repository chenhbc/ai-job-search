# JobStreet SG and Careers@Gov — no CLI

Checked 2026-10-19 with a plain HTTP client and the tool User-Agent `Mozilla/5.0 (compatible; research/1.0)` (and, for a few Careers@Gov URLs, curl's default agent). No browser impersonation, no proxy, no retry past a block. Both boards stay **out** of `.agents/skills/`.

MyCareersFuture is the Singapore CLI. It has a public JSON API and a robots file that allows a normal agent. See `.agents/skills/mycareersfuture-search/url-reference.md`.

## JobStreet Singapore (`sg.jobstreet.com`)

Do not build a skill.

**robots.txt** (`https://sg.jobstreet.com/robots.txt`, HTTP 200) for `User-agent: *`:

- `Disallow: *?` — query-string URLs, which is how search works
- `Disallow: /graphql`
- `Disallow: /api/jobsearch/`
- `Disallow: */job/*?*type=`

A few `Allow` exceptions exist (`*?keywords`, `*?advertiserid`). They do not open the search API.

**Fetch:** `https://sg.jobstreet.com/` and `https://sg.jobstreet.com/jobs?keywords=data+engineer` both returned **HTTP 403** to the plain client. That 403 was not worked around.

**Terms:** SEEK's website terms at <https://www.seek.com.au/terms> (HTTP 200, JobStreet is a SEEK site) say, in the clauses read on that page:

- materials may be used for personal, non-commercial purposes, and may not otherwise be reproduced, copied, or distributed without prior written permission
- users must not aggregate, copy, or duplicate content, including expired job postings
- users must not use data mining, robots, screen scraping, or similar automated data gathering, extraction, or publication tools without prior written consent
- the sites are for individual human use; automated processes, scripts, bots, and scrapers must not be used to access or copy information, except through a technical interface SEEK provides and whose terms the caller follows
- circumventing rate limits and similar measures is prohibited

This repo has no SEEK API agreement. A CLI would be automated access to paths robots disallows. It was not written.

## Careers@Gov

Do not build a skill.

Two hosts:

| URL | What a plain client got |
|-----|-------------------------|
| `https://www.careers.gov.sg/robots.txt` | **403** from CloudFront (`Request blocked`). The file was not readable, so a Disallow line was not confirmed from this client. |
| `https://www.careers.gov.sg/search` and `/terms-of-use` | **403**, same block. Not retried with a browser identity. |
| `https://www.careers.gov.sg/` | **200** for the homepage only. |
| `https://jobs.careers.gov.sg/robots.txt` | **200**. `User-agent: *` / `Allow: /` / `Disallow: /api/`. |
| `https://jobs.careers.gov.sg/` | **200**, about 2.5 MB of HTML. Not parsed for listings. |
| `https://jobs.careers.gov.sg/terms-of-use` | **200** (updated 6 March 2025, GovTech). |

The jobs host allows HTML pages and disallows `/api/`. Scraping the homepage, or an undocumented blob inside it, would still be reproducing the service. Clause 3.2 grants access "for personal, non-commercial or internal purposes only, and only for such use permitted by the functions of the Service". Clause 3.2A.3 says you must not reproduce, publish, or distribute the Service. Clause 3.4 says you must not impose an unreasonable load. There is no documented public search API on the allowed side of `robots.txt`.

Public-service postings also need the eligibility reading in [sg-work-eligibility.md](sg-work-eligibility.md) (citizenship lines are common). That is a reason to read a posting the user already has, not a reason to crawl the board.

`site:` WebSearch fallbacks for these hosts may stay in [sg-search-queries.md](sg-search-queries.md). A fallback query is not a CLI, and a 403 or a robots disallow still means stop.
