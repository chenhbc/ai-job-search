# Syncing this fork with upstream

This checkout is a **public fork**. Pull updates from the template. Do not push to it, and do not open pull requests against it.

| Remote | Repository | Role |
|--------|------------|------|
| `origin` | <https://github.com/chenhbc/ai-job-search> | This fork. Pull requests for fork work target `master` here. |
| `upstream` | <https://github.com/MadsLorentzen/ai-job-search> | The template. Fetch and merge only. |

When the Singapore runtime work in this fork was added, `master` was the upstream commit `0f6480d` (`freehire-search: lean search uses the web endpoint; drop unread params (#631)`). If `git rev-parse master` differs from `0f6480d`, upstream has moved or this fork has extra commits — read `git log --oneline upstream/master..master` before merging.

## GitHub: Sync fork

On <https://github.com/chenhbc/ai-job-search>, use **Sync fork**. That fetches `MadsLorentzen/ai-job-search` and updates **this** fork's `master` (or offers a pull request into this fork). It does not open a pull request on the upstream repository.

If GitHub reports conflicts, resolve them on a branch of this fork. The files that usually conflict are listed below.

## CLI: fetch and merge

Add the upstream remote once:

```bash
git remote add upstream https://github.com/MadsLorentzen/ai-job-search.git
```

Update `master` on this fork:

```bash
git fetch upstream
git checkout master
git merge upstream/master
```

Resolve conflicts, run the checks in [README.md](../README.md) (`python3 tools/security_guards.py`, `python3 -m unittest discover -s tests`, and `bun test` in any portal CLI you touched), then:

```bash
git push origin master
```

`git push upstream` is the wrong direction. Do not run it.

A merge commit on this fork's `master` is easier to sync again later than a rebase of commits that already exist on `origin`.

## Conflict hot-spots

This fork edits a few upstream files so a generic agent can run the runbooks and so Singapore is the default region. Expect conflicts there, and keep the edits small when you resolve them:

| File | Why it diverges |
|------|-----------------|
| `AGENTS.md` | Runtime-agnostic entry point, tool map, Singapore default |
| `README.md` | Links to this doc, Singapore docs, and the privacy note |
| `.gitignore` | `personal/` and the personal-output rules |
| `.claude/settings.json` | Allowlist entry for `mycareersfuture-search` |
| `tools/security_guards.py` | The same allowlist, plus the tracked-personal-data check |
| `.claude/commands/gmail-sync.md` | Gmail connector described by capability, not a Claude tool prefix |
| `.claude/commands/notion-sync.md` | Notion optional; Google Docs and local HTML alternatives |
| `.claude/skills/job-application-assistant/04-job-evaluation.md` | Pointer to the Singapore eligibility and salary notes |
| `.claude/skills/job-application-assistant/05-cv-templates.md` | Pointer to Singapore CV conventions |
| `.claude/skills/job-scraper/search-queries.md` | Pointer to the Singapore query file |

These paths were **added** in the fork, so an upstream merge leaves them alone unless upstream grows the same path:

- `docs/SYNCING.md`, `docs/PRIVACY.md`, `docs/singapore/`
- `.agents/skills/mycareersfuture-search/`

`CHANGELOG.md` and the profile templates (`CLAUDE.md`, `.claude/skills/job-application-assistant/0*.md`) conflict often on upstream itself. Do not commit filled-in profile data while resolving them. See [PRIVACY.md](PRIVACY.md).

## After every sync

1. Re-read the allowlists. `.claude/settings.json` and `ALLOWED_PERMISSIONS` in `tools/security_guards.py` must list the same `mycareersfuture-search` entry, and any new upstream portal CLI.
2. Confirm `docs/singapore/region-defaults.md` still matches the runbooks it points at.
3. Run `python3 tools/security_guards.py`. It fails if a personal-output path is tracked.
