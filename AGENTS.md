---
framework_version: 1.2.0
---

# Agent Guidelines: AI Job Search

Any agent that can run a shell, fetch and search the web, read and write files, and spawn subagents can execute this repo. The files under `.claude/commands/` and `.claude/skills/` are **runbooks**. Claude Code still loads the same files; nothing here removes that path.

Read this file first, then the runbook the user asked for. Do not copy the runbooks into another file.

## Executing a runbook

- `$ARGUMENTS` means the user's input for this request (the text after the command name, or the whole request when there is no slash command).
- Follow the runbook's steps in order.
- **Default region is Singapore.** Do not ask which region to use. Apply [docs/singapore/region-defaults.md](docs/singapore/region-defaults.md) unless the user explicitly names Europe, the EU, or the United States — or a place in them — for this request. That switch lasts for the request only. Upstream EU and US behaviour stays in the runbooks and is used when the user names that region.
- **Personal data** is not committed. Before reading or writing a profile, tracker, generated CV, cover letter, or archive, resolve the directory: if `$JOB_SEARCH_HOME` is an absolute path outside this repo, use it; otherwise use `personal/`. Write only there, at the same relative path the runbook names. Never modify a tracked template. Read the personal copy first and fall back to the tracked template when no personal copy exists. See [docs/PRIVACY.md](docs/PRIVACY.md).
- This fork's `origin` is `chenhbc/ai-job-search`. `upstream` is `MadsLorentzen/ai-job-search`. Sync instructions: [docs/SYNCING.md](docs/SYNCING.md). Do not push to upstream and do not open a pull request there.

## Tool names in the runbooks

Runbooks were written with Claude Code tool names. Use whatever your runtime calls the same capability.

| Name in the runbook | Capability |
|---------------------|------------|
| `WebFetch` | Fetch a URL and return the page or response body |
| `WebSearch` | Search the web |
| `Agent`, `Task` | Spawn a subagent with its own context |
| `AskUserQuestion` | Ask the user a question and wait for the answer |
| `Read` | Read a file |
| `Write` | Create or overwrite a file |
| `Edit` | Apply a surgical edit to an existing file |
| `Bash` | Run a shell command |
| `Glob` | Find files by a name or path pattern |
| `Grep` | Search file contents |

Gmail steps say `search_threads`, `get_thread`, and `list_labels`. Call those on **any Gmail connector that exposes them**. Do not require a `mcp__claude_ai_Gmail__` tool name. See `.claude/commands/gmail-sync.md`.

Notion sync is **optional**. If no Notion connector is connected, leave it and use either a Google Docs connector (create or update a document) or the local HTML dashboard from `.claude/commands/html-report.md`. See `.claude/commands/notion-sync.md`.

## Singapore notes

| Topic | File |
|-------|------|
| Which region's rules apply | [docs/singapore/region-defaults.md](docs/singapore/region-defaults.md) |
| Work-pass gate (skippable when the profile says `SC` or `SPR`; `[UNKNOWN]` is not a guess) | [docs/singapore/sg-work-eligibility.md](docs/singapore/sg-work-eligibility.md) |
| Salary sources | [docs/singapore/sg-market-and-salary.md](docs/singapore/sg-market-and-salary.md) |
| CV and form conventions | [docs/singapore/sg-cv-conventions.md](docs/singapore/sg-cv-conventions.md) |
| Search queries | [docs/singapore/sg-search-queries.md](docs/singapore/sg-search-queries.md) |
| Boards that must not be scraped | [docs/singapore/portals-not-built.md](docs/singapore/portals-not-built.md) |

Index: [docs/singapore/README.md](docs/singapore/README.md).

## Thin-pointer design (single source of truth)

To prevent duplication and configuration drift across different AI agent frameworks (Claude Code, Google Antigravity, Codex, Cursor, Gemini CLI, etc.), this workspace uses a unified thin-pointer design. All agent runtimes should load the canonical specifications and candidate profiles from the files and directories below:

1. **Personal Candidate Profile:**
   - The candidate profile, contact details, education, and target preferences are defined in [CLAUDE.md](CLAUDE.md) and the individual profile methodology files under [.claude/skills/job-application-assistant/](.claude/skills/job-application-assistant/) (specifically `01-*.md` etc.). On this public fork those tracked files stay templates. A filled copy, when one exists, is read from `$JOB_SEARCH_HOME` or `personal/` first ([docs/PRIVACY.md](docs/PRIVACY.md)).
2. **Canonical Workflow Specifications:**
   - The step-by-step instructions and triggers for tasks (setup, scrape, rank, apply, upskill, interview) are defined in the [.claude/](.claude/) directory (specifically under `.claude/skills/` and `.claude/commands/`).
   - Do not duplicate these rules or specifications. Treat `.claude/` files as the single source of truth.
3. **Portal Search Skills:**
   - Job-portal search CLIs live under [.agents/skills/](.agents/skills/) in the portable Agent Skills format (with a `SKILL.md` per portal). Codex and Antigravity discover these automatically; the `/scrape` workflow in [.claude/skills/job-scraper/](.claude/skills/job-scraper/) orchestrates them.
   - This fork adds `mycareersfuture-search` for Singapore. JobStreet SG and Careers@Gov are documented in [docs/singapore/portals-not-built.md](docs/singapore/portals-not-built.md) and have no CLI.
