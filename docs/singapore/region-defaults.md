---
framework_version: sg-0.1.0
---

# Region Defaults

**Singapore is the default region for every search, ranking, CV and application.** Do not ask Larry which region to use before a search.

Switch to EU or US rules **only when Larry explicitly names another region** in the request (e.g. "search Berlin", "EU roles", "US remote", "London", "New York"). The switch applies to that request only. The next request goes back to SG unless he says otherwise. A posting that merely happens to be outside SG (e.g. a stray result from a global CLI) does not trigger a switch; drop it under the SG filtering rules.

If Larry names several regions in one request, run each region's rule set separately and label the results by region.

## Rule files per region

| Step | SG (default) | EU (only when named) | US (only when named) |
|---|---|---|---|
| Search queries / sources | `sg-search-queries.md` | upstream `job-scraper/search-queries.md` (EU version) | upstream `job-scraper/search-queries.md` (US version) |
| Eligibility gate | `04-job-evaluation.md` Eligibility Gate **+** `sg-work-eligibility.md` | `04-job-evaluation.md` Eligibility Gate (country-specific permit rules: to be added) | `04-job-evaluation.md` Eligibility Gate (visa/sponsorship rules: to be added) |
| Language gate & scoring | `04-job-evaluation.md` | `04-job-evaluation.md` | `04-job-evaluation.md` |
| Salary benchmark | `sg-market-and-salary.md` | `04-job-evaluation.md` §6 + `salary_lookup.py` (EU sources to be added) | `04-job-evaluation.md` §6 (US sources to be added) |
| CV & forms | `05-cv-templates.md` + `08-application-forms.md` + `sg-cv-conventions.md` | `05-cv-templates.md` + `08-application-forms.md` | `05-cv-templates.md` + `08-application-forms.md` |
| Writing style, interview prep | `03-writing-style.md`, `07-interview-prep.md` | same | same |

The EU and US cells marked "to be added" have no region-specific file yet. Use the upstream generic rules and tell Larry that region-specific rules are missing.

## Recording
Tag every ranked job and tracker row with `region: SG | EU | US`, so `/rank`, `/apply` and `/outcome` keep using the rule set the job was found under.
