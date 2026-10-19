# MyCareersFuture API reference

Endpoints, parameters, and response fields this skill depends on. Update this file if the API changes. Base URL defaults to `https://api.mycareersfuture.gov.sg` and is overridable via `MCF_API_URL`.

Verified live on 2026-10-19 with `User-Agent: Mozilla/5.0 (compatible; mycareersfuture-cli/1.0)`.

## Authentication

None. Job browsing does not need a Singpass login. This skill is search + detail only.

| Request | Status |
|---------|--------|
| `GET /v2/jobs?search=data%20engineer&limit=2&page=0` | 200, JSON `{results, total, countWithoutFilters, _links}` |
| `GET /v2/jobs?search=engineer&limit=101&page=0` | 400 |
| `GET /v2/jobs/{uuid}` for a uuid returned by search | 200, the job object |
| `GET /v2/jobs/00000000000000000000000000000000` | 404 |
| `GET https://www.mycareersfuture.gov.sg/robots.txt` | 200. `User-agent: *` has an empty `Disallow`. `User-agent: meta-externalagent` is `Disallow: /`. |
| `GET https://api.mycareersfuture.gov.sg/robots.txt` | 404 (`Cannot GET /robots.txt`) |

Repeated or comma-joined filter values (`employmentTypes` and the same shape for the other facets) returned HTTP 400 or hung when checked. Send **one value** per filter.

## Terms

The employer terms at <https://employer.mycareersfuture.gov.sg/terms-of-use> say, in the Website Content clauses, that Website Content shall not be reproduced, republished, uploaded, posted, transmitted, adapted, modified, or distributed without prior written permission of WSG. "Website Content" includes information that is publicly available. The jobseeker page <https://www.mycareersfuture.gov.sg/terms-of-use> is a JavaScript shell; a plain HTTP fetch received no clause text.

The public site's metadata names the Skills and Workforce Development Agency and GovTech. The employer terms page still names Workforce Singapore Agency (WSG).

Personal, low-volume use for one's own search. Do not republish listings.

## `GET /v2/jobs`

Query parameters the CLI sends:

| Param | Maps to CLI flag | Notes |
|-------|------------------|-------|
| `search` | `--query` / `-q` | Keyword search. |
| `limit` | `--limit` / `-n` | Page size. API maximum 100 (400 above that). CLI default 20. |
| `page` | `--page` | **0-based** on the wire. CLI pages are 1-based (`page = n - 1`). |
| `salary` | `--salary-min` | Minimum monthly salary in SGD. Single value. |
| `employmentTypes` | `--employment-type` | Single vocabulary value. |
| `positionLevels` | `--position-level` | Single vocabulary value. |
| `categories` | `--category` | Single vocabulary value. |
| `sortBy` | `--sort new`, or any `--jobage` | `new_posting_date`. Omitted for the default relevance sort. |

There is **no** posted-within-N-days parameter. `--jobage` filters `metadata.newPostingDate` on the client after the page returns, and forces `sortBy=new_posting_date` so the page is newest-first. `meta.total` remains the server total before that filter.

Calls are slow: about 5–15 seconds is normal. The client uses a 45 second timeout.

### Job object (fields the skill reads)

```jsonc
{
  "uuid": "0123456789abcdef0123456789abcdef", // -> result.id
  "title": "Data Engineer",
  "description": "<p>…</p>",                  // HTML; stripped client-side
  "hiringCompany": { "name": "…" },
  "postedCompany": { "name": "…" },           // often the agency, when hiring name is hidden
  "salary": { "minimum": 7500, "maximum": 11500, "type": { "salaryType": "Monthly" } },
  "metadata": {
    "isHideSalary": false,
    "isHideHiringEmployerName": false,
    "newPostingDate": "2026-10-09T00:00:00.000Z", // -> result.date
    "originalPostingDate": "2026-09-01",
    "expiryDate": "2026-11-08",
    "jobDetailsUrl": "https://www.mycareersfuture.gov.sg/job/…",
    "jobPostId": "MCF-…"
  },
  "employmentTypes": [{ "employmentType": "Full Time" }],
  "positionLevels": [{ "position": "Professional" }],
  "categories": [{ "category": "Information Technology" }],
  "skills": [{ "skill": "SQL" }],             // detail
  "minimumYearsExperience": 3,
  "numberOfVacancies": 1,                     // detail
  "status": { "jobStatus": "Open" },          // detail
  "address": {
    "isOverseas": false,
    "overseasCountry": null,
    "districts": [{ "location": "D01 Boat Quay, Raffles Place", "region": "Central" }]
  }
}
```

Search puts jobs in `results` and the match count in `total`. Detail `GET /v2/jobs/{uuid}` returns the job object itself (no `results` wrapper). A missing uuid is 404, mapped to `NOT_FOUND`.

## Parsing notes

- JSON, not HTML cards. The only markup handling is `cleanHtml` on `description`.
- `company` is `hiringCompany.name` unless `metadata.isHideHiringEmployerName` is set, then `postedCompany.name`.
- `location` joins `address.districts[].location`. Overseas postings become `Overseas: <country>`.
- Salary is omitted when `isHideSalary` is true. Otherwise `SGD {min}-{max}/{salaryType}`.
- Fetch sends the User-Agent above and `Accept: application/json`, and uses exponential backoff with jitter on 429/5xx (max 6 retries). Connection errors fail fast.
