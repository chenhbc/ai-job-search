import { apiGet, toResult, writeError, type JobResult, type McfSearchResponse } from "../helpers.js"

// GET /v2/jobs - the public search endpoint. page is 0-indexed on the wire,
// limit is capped at 100 by the API's own request validation.
const SEARCH_PATH = "/v2/jobs"

export const SORTS = ["relevance", "new"] as const
export type Sort = (typeof SORTS)[number]

export interface SearchOpts {
  query?: string
  jobage?: number // posted within N days; applied client-side (no API parameter)
  page: number // 1-indexed
  limit: number
  format: "json" | "table" | "plain"
  includeDescription?: boolean
  salaryMin?: number // monthly SGD floor (API `salary`)
  employmentType?: string // API `employmentTypes`, e.g. "Full Time", "Contract"
  positionLevel?: string // API `positionLevels`, e.g. "Manager", "Senior Executive"
  category?: string // API `categories`, e.g. "Information Technology"
  sort?: Sort
  now?: Date // test hook for the jobage cut-off
}

export function buildQuery(opts: SearchOpts): URLSearchParams {
  const p = new URLSearchParams()
  if (opts.query) p.set("search", opts.query)
  p.set("limit", String(opts.limit))
  p.set("page", String(opts.page - 1))
  if (opts.salaryMin) p.set("salary", String(opts.salaryMin))
  if (opts.employmentType) p.set("employmentTypes", opts.employmentType)
  if (opts.positionLevel) p.set("positionLevels", opts.positionLevel)
  if (opts.category) p.set("categories", opts.category)
  // --jobage has no server-side equivalent, so a recency filter is only
  // meaningful over newest-first results: it implies --sort new.
  if (opts.sort === "new" || opts.jobage) p.set("sortBy", "new_posting_date")
  return p
}

/** YYYY-MM-DD cut-off for "posted within N days" (inclusive). */
export function jobageCutoff(days: number, now: Date = new Date()): string {
  const d = new Date(now.getTime() - days * 86400000)
  return d.toISOString().slice(0, 10)
}

interface Column {
  header: string
  width: number
  cell: (r: JobResult) => string
}

function renderTable(rows: JobResult[]): string {
  if (rows.length === 0) return "No results."
  const columns: Column[] = [
    { header: "ID", width: 32, cell: (r) => r.id },
    { header: "TITLE", width: 38, cell: (r) => r.title },
    { header: "COMPANY", width: 26, cell: (r) => r.company ?? "—" },
    { header: "SALARY", width: 24, cell: (r) => r.salary ?? "—" },
    { header: "DATE", width: 10, cell: (r) => r.date ?? "—" },
  ]
  const row = (cells: string[]) => cells.map((c, i) => c.slice(0, columns[i].width).padEnd(columns[i].width)).join("  ")
  const header = row(columns.map((c) => c.header))
  const body = rows.map((r) => row(columns.map((c) => c.cell(r))))
  return [header, "-".repeat(header.length), ...body].join("\n")
}

function renderPlain(rows: JobResult[]): string {
  if (rows.length === 0) return "No results."
  return rows
    .map((r) =>
      [
        r.title,
        `  ${r.company ?? "—"} · ${r.location ?? "—"} · ${r.date ?? "—"}`,
        `  ${r.salary ?? "salary not shown"} · ${r.employment_types.join(", ") || "—"}`,
        `  id: ${r.id}`,
        `  ${r.url}`,
      ].join("\n"),
    )
    .join("\n\n")
}

export async function runSearch(opts: SearchOpts): Promise<number> {
  try {
    const env = await apiGet<McfSearchResponse>(`${SEARCH_PATH}?${buildQuery(opts).toString()}`)
    if (!env) {
      writeError(`${SEARCH_PATH} not found - the MyCareersFuture API may have moved; check MCF_API_URL`, "SEARCH_FAILED")
      return 1
    }
    let rows = (env.results ?? []).map((j) => toResult(j, opts.includeDescription !== false))
    const fetched = rows.length
    if (opts.jobage) {
      const cutoff = jobageCutoff(opts.jobage, opts.now)
      rows = rows.filter((r) => r.date !== null && r.date >= cutoff)
    }
    const total = env.total ?? rows.length

    if (opts.format === "table") {
      process.stdout.write(renderTable(rows) + "\n")
    } else if (opts.format === "plain") {
      process.stdout.write(renderPlain(rows) + "\n")
    } else {
      const meta: Record<string, unknown> = { count: rows.length, page: opts.page, total }
      // Be explicit that `total` is the server's count before the client-side
      // recency filter, so a consumer never reads it as "matches in N days".
      if (opts.jobage) Object.assign(meta, { fetched, jobage: opts.jobage, jobage_applied: "client-side" })
      process.stdout.write(JSON.stringify({ meta, results: rows }, null, 2) + "\n")
    }
    return 0
  } catch (e) {
    writeError(e instanceof Error ? e.message : String(e), "SEARCH_FAILED")
    return 1
  }
}
