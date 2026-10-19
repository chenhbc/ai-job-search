# Singapore content

Singapore is the default region for this fork. The rules live here so upstream files stay small. An agent reads these files when it runs a runbook; it does not ask which region to use unless the user names Europe or the US for that request. See [region-defaults.md](region-defaults.md).

Profile fields in these notes are `[UNKNOWN]` templates. Fill them only under the personal-data directory in [../PRIVACY.md](../PRIVACY.md). Do not commit filled values, and do not guess a work-pass status.

| File | What it is | Read it from |
|------|------------|--------------|
| [region-defaults.md](region-defaults.md) | Singapore is the default. EU and US rules apply only when the user names that region for the request. | `AGENTS.md`, every runbook |
| [sg-work-eligibility.md](sg-work-eligibility.md) | Work-pass thresholds, COMPASS, the Fair Consideration Framework, and how to read Singapore posting wording. Extends the eligibility gate. A profile value of `SC` or `SPR` skips the work-pass sections; `[UNKNOWN]` does not. | `04-job-evaluation.md`, after the generic Eligibility Gate and before scoring |
| [sg-market-and-salary.md](sg-market-and-salary.md) | Where to look up Singapore pay, and which official parameters are statutory rather than market rates. It stores no market salary figures. | `04-job-evaluation.md` §6 |
| [sg-cv-conventions.md](sg-cv-conventions.md) | Photo, age, nationality, and fair-hiring form fields for Singapore applications. | `05-cv-templates.md` and `08-application-forms.md` |
| [sg-search-queries.md](sg-search-queries.md) | Search sites and query categories, in the same layout as `job-scraper/search-queries.md`. | `job-scraper/search-queries.md`, `/scrape` |
| [portals-not-built.md](portals-not-built.md) | Why there is no JobStreet SG CLI and no Careers@Gov CLI. | Before anyone adds those boards |

The MyCareersFuture CLI is `.agents/skills/mycareersfuture-search/`. It is a search tool, not a copy of these policy notes.

Figures in the eligibility note are copied from MOM and EDB pages and go stale. The file's own re-verification rule says when to open those pages again.
