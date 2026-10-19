# mycareersfuture-cli

CLI for searching [MyCareersFuture](https://www.mycareersfuture.gov.sg), Singapore's national job portal, via its public JSON API.

**Data source**: `GET https://api.mycareersfuture.gov.sg/v2/jobs` and `GET /v2/jobs/{uuid}`.
**Authentication**: None.
**Dependencies**: None (plain `bun` + `fetch`). `bun install` is optional and only pulls dev type defs.

> **Personal use only.** Employer terms forbid republishing Website Content without written permission. Keep volume low. See `../SKILL.md` and `../url-reference.md`.

## Installation

```bash
cd .agents/skills/mycareersfuture-search/cli
bun install   # optional — only installs TypeScript dev types
```

The CLI runs without any install because it has zero runtime dependencies.

## Base URL

```bash
MCF_API_URL=http://127.0.0.1:9 bun run src/cli.ts search -q "data engineer"
```

Default host is `https://api.mycareersfuture.gov.sg`.

## Commands

| Command | Description |
|---------|-------------|
| `search` | Search jobs by keyword and single-value filters |
| `detail` | Fetch one job by uuid or public URL |

`search` accepts `--format json|table|plain` (default `json`); `detail` accepts `--format json|plain`.
All errors are written to **stderr** as `{ "error": "...", "code": "..." }` with exit code `1`.

The API is slow (about 5–15 seconds per call). The client times out at 45 seconds.

## Quick examples

```bash
bun run src/cli.ts search -q "data engineer" --limit 10 --format table
bun run src/cli.ts search -q "AI engineer" --salary-min 8000 --jobage 14 --format table
bun run src/cli.ts search --category "Information Technology" --employment-type Permanent
bun run src/cli.ts detail 0123456789abcdef0123456789abcdef --format plain
```

See `../SKILL.md` for the full flag reference.

## Search flags

| Flag | Alias | Description |
|------|-------|-------------|
| `--query` | `-q` | Keywords. Optional. |
| `--jobage` | | Posted within N days. Client-side on `newPostingDate`; implies `--sort new`. |
| `--page` | | 1-indexed page. Default 1. Wire `page` is 0-based. |
| `--limit` | `-n` | Results per page, 1–100. Default 20. |
| `--salary-min` | | Minimum monthly salary in SGD. |
| `--employment-type` | | One employment-type value. |
| `--position-level` | | One position-level value. |
| `--category` | | One category value. |
| `--sort` | | `relevance` (default) or `new`. |
| `--no-description` | | Drop description bodies. |
| `--format` | | `json` \| `table` \| `plain`. |

One value per filter. The API rejected multi-value filters.
