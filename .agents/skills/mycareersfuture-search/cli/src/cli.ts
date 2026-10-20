#!/usr/bin/env bun
// Self-contained CLI for searching MyCareersFuture (Singapore's national job
// portal, run by SWDA) through its public JSON API. No CLI framework and zero
// runtime dependencies, so it runs anywhere `bun` is available.

import { runSearch, SORTS, type SearchOpts, type Sort } from "./commands/search.js"
import { runDetail, type DetailOpts } from "./commands/detail.js"
import { baseUrl } from "./helpers.js"

interface Flags {
  _: string[]
  [k: string]: string | boolean | string[]
}

const ALIAS: Record<string, string> = { q: "query", n: "limit" }

function parseFlags(argv: string[]): Flags {
  const flags: Flags = { _: [] }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (!a.startsWith("-")) {
      ;(flags._ as string[]).push(a)
      continue
    }
    const name = a.replace(/^-+/, "")
    const key = ALIAS[name] ?? name
    const next = argv[i + 1]
    let value: string | boolean = true
    if (next !== undefined && !next.startsWith("-")) {
      value = next
      i++
    }
    flags[key] = value
  }
  return flags
}

const HELP = `mycareersfuture-cli — search MyCareersFuture (Singapore) job listings

USAGE
  bun run src/cli.ts search [-q "<keywords>"] [filters] [--format json|table|plain]
  bun run src/cli.ts detail <id|url> [--format json|plain]

SEARCH FLAGS
  --query, -q <text>        Keywords (title, skill, company). Optional.
  --jobage <days>           Posted (or reposted) within N days. Applied client-side
                            to the fetched page; implies --sort new.
  --page <n>                1-indexed page. Default 1.
  --limit, -n <n>           Results per page, 1-100 (API cap). Default 20.
  --format <fmt>            json (default) | table | plain.
  --no-description          Drop description bodies (cheap discovery pass).
  --sort <order>            relevance (default) | new (newest posting first).

FILTERS (exact MCF vocabulary; one value each - the API rejects unknown values)
  --salary-min <sgd>        Minimum monthly salary in SGD, e.g. 8000.
  --employment-type <type>  Permanent | Full Time | Part Time | Contract |
                            Temporary | Freelance | Flexi-work | Internship/Attachment
  --position-level <level>  e.g. Fresh/entry level | Junior Executive | Executive |
                            Senior Executive | Professional | Manager |
                            Middle Management | Senior Management | Non-executive
  --category <name>         e.g. "Information Technology", "Banking and Finance",
                            "Engineering", "Sciences / Laboratory / R&D"

DETAIL
  <id|url>                  The 32-character job uuid (a search result's id) or a
                            https://www.mycareersfuture.gov.sg/job/... URL.

EXAMPLES
  bun run src/cli.ts search -q "data engineer" --limit 10 --format table
  bun run src/cli.ts search -q "product manager" --salary-min 9000 --jobage 14 --format table
  bun run src/cli.ts search -q "analyst" --category "Banking and Finance" --employment-type Permanent
  bun run src/cli.ts detail 0123456789abcdef0123456789abcdef --format plain

Public, unauthenticated API: ${baseUrl()} (override with MCF_API_URL).
Personal job-search use only; keep volume low and do not republish listings.
`

function writeBadArg(error: string): number {
  process.stderr.write(JSON.stringify({ error, code: "BAD_ARG" }) + "\n")
  return 1
}

function parseIntFlag(name: string, raw: string | boolean | string[], max?: number): number | null {
  const val = typeof raw === "string" ? Number(raw.trim()) : NaN
  if (!Number.isInteger(val) || val < 1 || (max !== undefined && val > max)) {
    writeBadArg(
      `--${name} must be a whole number of at least 1${max !== undefined ? ` and at most ${max}` : ""}, got "${raw}"`,
    )
    return null
  }
  return val
}

const KNOWN_FLAGS: Record<string, Set<string>> = {
  search: new Set([
    "query", "jobage", "page", "limit", "format", "no-description", "sort",
    "salary-min", "employment-type", "position-level", "category", "help", "h",
  ]),
  detail: new Set(["format", "help", "h"]),
}

async function main(): Promise<number> {
  const flags = parseFlags(process.argv.slice(2))
  const cmd = (flags._ as string[])[0]

  if (!cmd || flags.help || flags.h) {
    process.stdout.write(HELP)
    return cmd ? 0 : 1
  }

  // Unknown flags are rejected, never silently dropped: a discarded filter
  // changes what the search returns with no error (portal-skill contract).
  const known = KNOWN_FLAGS[cmd]
  if (known) {
    for (const key of Object.keys(flags)) {
      if (key === "_" || known.has(key)) continue
      process.stderr.write(
        JSON.stringify({
          error: `unknown flag --${key} for '${cmd}' - flags are never silently ignored; see --help for the supported flags`,
          code: "UNKNOWN_FLAG",
        }) + "\n",
      )
      return 1
    }
  }

  if (cmd === "search") {
    for (const name of ["query", "employment-type", "position-level", "category", "sort"]) {
      const v = flags[name]
      if (v !== undefined && (typeof v !== "string" || !v.trim())) return writeBadArg(`--${name} requires a non-empty value`)
    }
    const fmt = flags.format !== undefined ? String(flags.format) : "json"
    if (!["json", "table", "plain"].includes(fmt)) return writeBadArg(`--format must be one of json|table|plain, got "${fmt}"`)
    const sort = flags.sort !== undefined ? String(flags.sort) : "relevance"
    if (!SORTS.includes(sort as Sort)) return writeBadArg(`--sort must be one of ${SORTS.join("|")}, got "${sort}"`)

    const ints: Record<string, number | undefined> = {}
    for (const [name, max] of [["jobage", undefined], ["page", undefined], ["limit", 100], ["salary-min", undefined]] as const) {
      if (flags[name] !== undefined) {
        const v = parseIntFlag(name, flags[name], max)
        if (v === null) return 1
        ints[name] = v
      }
    }

    const str = (k: string) => (typeof flags[k] === "string" ? (flags[k] as string).trim() : undefined)
    const opts: SearchOpts = {
      query: str("query"),
      jobage: ints.jobage,
      page: ints.page ?? 1,
      limit: ints.limit ?? 20,
      format: fmt as SearchOpts["format"],
      includeDescription: flags["no-description"] === undefined,
      salaryMin: ints["salary-min"],
      employmentType: str("employment-type"),
      positionLevel: str("position-level"),
      category: str("category"),
      sort: sort as Sort,
    }
    return runSearch(opts)
  }

  if (cmd === "detail") {
    const id = (flags._ as string[])[1]
    if (!id) {
      process.stderr.write(JSON.stringify({ error: "detail requires an <id|url>", code: "NO_ID" }) + "\n")
      return 1
    }
    const fmt = flags.format !== undefined ? String(flags.format) : "json"
    if (!["json", "plain"].includes(fmt)) return writeBadArg(`--format must be one of json|plain, got "${fmt}"`)
    const opts: DetailOpts = { id, format: fmt as DetailOpts["format"] }
    return runDetail(opts)
  }

  process.stderr.write(JSON.stringify({ error: `Unknown command "${cmd}"`, code: "BAD_CMD" }) + "\n")
  return 1
}

main()
  .then((code) => process.exit(code))
  .catch((e) => {
    process.stderr.write(JSON.stringify({ error: e instanceof Error ? e.message : String(e), code: "INTERNAL_ERROR" }) + "\n")
    process.exit(1)
  })
