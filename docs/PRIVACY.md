# Personal data stays out of git

This repository is **public**. A fork of a public GitHub repo cannot be made private. Anything committed here is world-readable.

Tracked files are **templates**. They keep tokens such as `[YOUR_NAME]`, `[YOUR_EMAIL]`, `[UNKNOWN]`, and `[YOUR_*]`. Do not replace those tokens in a commit. Do not commit a real CV, a filled profile, salary expectations, an application archive, or a tracker export.

## Where filled data goes

Prefer a directory **outside** the repo. Set `JOB_SEARCH_HOME` to an absolute path that is not inside the clone, for example `~/job-search-data`.

If `JOB_SEARCH_HOME` is unset, use `personal/` at the repo root. That directory is gitignored. Create it when you need it. Do not add a negation that re-includes it.

Read a filled file from the personal directory when it exists, and fall back to the tracked template when it does not. Write filled output only under the personal directory, using the same relative path the runbook names:

| Runbook path (tracked template or generated output) | Personal path |
|-----------------------------------------------------|----------------|
| `CLAUDE.md` | `$DATA/CLAUDE.md` |
| `.claude/skills/job-application-assistant/0*.md` once tokens are replaced | `$DATA/.claude/skills/job-application-assistant/0*.md` |
| `cv/main_<company>_<role>.*` | `$DATA/cv/main_<company>_<role>.*` |
| `cover_letters/cover_<company>_<role>.*` and `Cover_*` | `$DATA/cover_letters/…` |
| `documents/**` other than `README.md` and `.gitkeep` | `$DATA/documents/…` |
| `job_search_tracker.csv` | `$DATA/job_search_tracker.csv` |
| `salary_data.json` | `$DATA/salary_data.json` |
| `gmail_sync/` | `$DATA/gmail_sync/` |
| `reports/` | `$DATA/reports/` |
| `company_research/` | `$DATA/company_research/` |
| `job_scraper/seen_jobs.json`, `notion_sync.json`, scraper notes | `$DATA/job_scraper/…` |
| `upskill/report-*.md` | `$DATA/upskill/…` |

`$DATA` is `$JOB_SEARCH_HOME` when that variable is an absolute path outside the repo, and `personal/` otherwise.

Leave these tracked:

- `CLAUDE.md` and the `0*.md` methodology files, still full of placeholders
- `cv/main_example.tex`, `cover_letters/cover_example.tex`, `cover_letters/cover.cls`
- `documents/README.md` and the `documents/**/.gitkeep` placeholders
- `docs/singapore/*.md` — market rules and `[UNKNOWN]` profile fields, not a person's record

`.gitignore` already ignores the generated outputs above when they are written inside the repo by mistake (`cv/main_*.*` except the example, `job_search_tracker.csv`, `documents/applications/**`, `gmail_sync/`, `reports/`, and the rest of the list in `tools/security_guards.py`). `personal/` is ignored as a whole. Ignoring a path does not help after `git add -f`. The guard below catches that.

## Check

`python3 tools/security_guards.py` fails when:

- a tracked path is a personal output (tracker, generated CV, archive, `personal/`, salary file, sync state, and the same set the gitignore rules name)
- a tracked template has lost its sentinel: `CLAUDE.md` must still contain `[YOUR_NAME]`, `01-candidate-profile.md` must still contain `[YOUR_EMAIL]`, and `cv/main_example.tex` must still contain the example email line

Run it before every push.

## What an agent must not do

- Do not invent or record a person's name, email, phone, address, salary expectation, or work-pass status in a tracked file.
- Do not infer work-pass status from a name, a language list, or a CV. The Singapore gate reads the profile field and treats `[UNKNOWN]` as unknown. See `docs/singapore/sg-work-eligibility.md`.
- Do not send mail, open a pull request on `MadsLorentzen/ai-job-search`, or upload documents to an external service unless the user asked for that exact action in the current request.
