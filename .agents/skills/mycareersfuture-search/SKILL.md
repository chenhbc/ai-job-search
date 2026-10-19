---
name: mycareersfuture-search
version: 1.0.0
description: >
  Use this skill to search live job listings on MyCareersFuture, Singapore's
  national job portal (mycareersfuture.gov.sg), or to look up one posting by
  its id. Trigger phrases: Singapore jobs, job search Singapore, find a job in
  Singapore, MyCareersFuture, MCF, lowongan, "are there any <role> jobs in
  Singapore", look up this MyCareersFuture posting.
context: fork
enabled: true  # set to false to keep this portal installed but have /scrape skip it
allowed-tools: Bash(bun run .agents/skills/mycareersfuture-search/cli/src/cli.ts *)
---

# MyCareersFuture Search Skill

Search live job listings on **[MyCareersFuture](https://www.mycareersfuture.gov.sg)** (MCF), Singapore's national job portal. No authentication, no API key, and **zero runtime dependencies** — it runs with just `bun`. It queries the public JSON API at `api.mycareersfuture.gov.sg` (the same API the website uses), so results are structured rather than parsed from markup.

> Country-specific portal skill for this fork, built on the same contract as `freehire-search` and `linkedin-search`.

## ⚠️ Personal use only

MCF's employer terms (https://employer.mycareersfuture.gov.sg/terms-of-use, Website Content section) say Website Content — including publicly available material — must not be reproduced, republished, uploaded, posted, transmitted, or distributed without prior written permission. The jobseeker terms page is a client-rendered shell and did not return clause text to a plain fetch.

Use this skill for your own low-volume job search. Do not republish listings, do not bulk-crawl, and do not build a competing board on top of the responses. `www.mycareersfuture.gov.sg/robots.txt` allows `User-agent: *` (empty `Disallow`) and disallows only `meta-externalagent`. The API host has no `robots.txt`.

## When to use this skill

- Search Singapore openings by keyword, minimum monthly salary, employment type, position level, or category
- Restrict a fetched page to postings from the last N days (client-side; the API has no freshness parameter)
- Look up one posting by its 32-character uuid or its public job URL

## Commands

### Search job listings

```bash
bun run .agents/skills/mycareersfuture-search/cli/src/cli.ts search [-q "<keywords>"] [filters]
```

Key flags:
- `--query <text>` / `-q <text>` — keyword search. Optional.
- `--jobage <days>` — posted or reposted within N days. Applied **client-side** to the fetched page (`metadata.newPostingDate`). Implies `--sort new`. There is no server-side "posted within N days" parameter, so a later page can still hold older roles; raise `--limit` (max 100) or page through if you need a wider window.
- `--page <n>` — 1-indexed page. The API's `page` is 0-based; the CLI converts. Default 1.
- `--limit <n>` / `-n <n>` — results per page. Default 20. The API rejects `limit` above 100 with HTTP 400.
- `--format json|table|plain` — default `json`.
- `--no-description` — drop HTML-stripped description bodies. Every other field stays.
- `--sort relevance|new` — default `relevance`. `new` sends `sortBy=new_posting_date`.

Filters take **one value each**. Repeated or comma-joined values returned HTTP 400 or hung in live checks, so the CLI sends a single value and does not offer a repeatable flag:
- `--salary-min <sgd>` — minimum monthly salary in SGD (API `salary`).
- `--employment-type <type>` — `Permanent`, `Full Time`, `Part Time`, `Contract`, `Temporary`, `Freelance`, `Flexi-work`, `Internship/Attachment`.
- `--position-level <level>` — `Fresh/entry level`, `Junior Executive`, `Executive`, `Senior Executive`, `Professional`, `Manager`, `Middle Management`, `Senior Management`, `Non-executive`.
- `--category <name>` — for example `Information Technology`, `Banking and Finance`, `Engineering`.

Search JSON already includes the description (HTML stripped). Do not loop `detail` over every hit. The API is slow (about 5–15 seconds per call); the client times out at 45 seconds.

### Fetch one posting

```bash
bun run .agents/skills/mycareersfuture-search/cli/src/cli.ts detail <uuid|url> [--format json|plain]
```

`uuid` is the `id` from a search result (32 hex characters). A public URL such as `https://www.mycareersfuture.gov.sg/job/...-<uuid>` is accepted. Unknown ids return exit code 1 with `NOT_FOUND`.

## Usage examples

```bash
# Data engineering roles, table view
bun run .agents/skills/mycareersfuture-search/cli/src/cli.ts search -q "data engineer" --limit 10 --format table

# AI engineering roles posted in the last 14 days, at least SGD 8000 / month
bun run .agents/skills/mycareersfuture-search/cli/src/cli.ts search -q "AI engineer" --salary-min 8000 --jobage 14 --format table

# Permanent information-technology roles
bun run .agents/skills/mycareersfuture-search/cli/src/cli.ts search --category "Information Technology" --employment-type Permanent --limit 20

# Full text of one posting
bun run .agents/skills/mycareersfuture-search/cli/src/cli.ts detail 0123456789abcdef0123456789abcdef --format plain
```

## Output formats

| Format | Best for |
|--------|----------|
| `json` | Default — programmatic use; the only format carrying each hit's description |
| `table` | Quick human-readable scanning |
| `plain` | Reading a single job's full detail (`detail` command) |

Search JSON is `{ "meta": { "count", "page", "total" }, "results": [...] }`. When `--jobage` is set, `meta` also carries `fetched`, `jobage`, and `jobage_applied: "client-side"`. `total` stays the server's count **before** that filter. Each result has at least `id`, `title`, `company`, `location`, `date`, `url` (missing values are `null`). All errors go to **stderr** as `{ "error": "...", "code": "..." }` and the process exits `1`.

## Notes

- `id` is the MCF `uuid`. `date` is `metadata.newPostingDate` as `YYYY-MM-DD` (a repost updates this date). `expiry_date` is separate.
- `company` is the hiring employer when MCF discloses it, otherwise the posting company (often a recruitment agency).
- `salary` keeps the period (`SGD 7500-11500/Monthly`). A hidden salary (`metadata.isHideSalary`) is `null`.
- `location` is built from `address.districts[].location`, or `Overseas: <country>` when `address.isOverseas` is set.
- Override the host with `MCF_API_URL` (tests, or an API host move). Default `https://api.mycareersfuture.gov.sg`.
- Retries 429/5xx with exponential backoff (max 6 retries). A connection error fails fast. A 400 includes the API's validation message.
