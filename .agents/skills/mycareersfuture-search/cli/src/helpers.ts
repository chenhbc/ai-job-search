// Data source: the MyCareersFuture (MCF) public REST API at
// api.mycareersfuture.gov.sg - the JSON API the mycareersfuture.gov.sg job
// search itself is built on. MCF is Singapore's national job portal, run by the
// Skills and Workforce Development Agency (SWDA). Reads are unauthenticated (job
// browsing needs no Singpass login), so there is no markup to parse: we fetch
// JSON and reshape it into the portal-skill contract's result fields. The base
// URL is overridable via MCF_API_URL (tests, or a future API host move).

export const DEFAULT_BASE_URL = "https://api.mycareersfuture.gov.sg"
export const WEB_BASE_URL = "https://www.mycareersfuture.gov.sg"

/** API base URL: MCF_API_URL or the default. */
export function baseUrl(): string {
  const raw = (process.env.MCF_API_URL ?? "").trim()
  return (raw || DEFAULT_BASE_URL).replace(/\/+$/, "")
}

export function writeError(error: string, code: string): void {
  process.stderr.write(JSON.stringify({ error, code }) + "\n")
}

// An honest User-Agent naming the tool (the portal-skill contract), never a
// browser impersonation. No contact URL: the /apply host check treats every
// http(s) host literal in cli/src as a board this skill fetches from.
export const USER_AGENT = "Mozilla/5.0 (compatible; mycareersfuture-cli/1.0)"

// The MCF API is slow (5-15 s per search is normal), so the timeout is wider
// than the other portal CLIs' 15 s.
export const TIMEOUT_MS = 45000

/**
 * GET JSON from the MCF API. Retries 429/5xx with exponential backoff + jitter;
 * returns `null` on a 404. A connection failure or timeout fails fast with a
 * clear message - no retry - so an outage degrades this source quickly rather
 * than hanging the caller. A 4xx (e.g. a filter value outside the API's enum)
 * surfaces the API's own validation message.
 */
export async function apiGet<T>(path: string): Promise<T | null> {
  const url = `${baseUrl()}${path}`
  const maxRetries = 6
  let delay = 500

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    let response: Response
    try {
      response = await fetch(url, {
        headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
        redirect: "follow",
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
    } catch (e) {
      throw new Error(
        `could not reach the MyCareersFuture API at ${baseUrl()} (${e instanceof Error ? e.message : String(e)})`,
      )
    }

    if (response.status === 429 || response.status >= 500) {
      if (attempt === maxRetries) {
        throw new Error(`MyCareersFuture API request failed: ${response.status} ${response.statusText}`)
      }
      await sleep(delay + Math.floor(Math.random() * 500))
      delay = Math.min(delay * 2, 8000)
      continue
    }
    if (response.status === 404) return null

    const body = (await response.json().catch(() => null)) as (T & { message?: string; errors?: Array<{ path?: string; message?: string }> }) | null
    if (!response.ok) {
      const detail = body?.errors?.map((e) => `${e.path ?? "?"}: ${e.message ?? ""}`).join("; ")
      throw new Error(
        `MyCareersFuture API rejected the request (${response.status}): ${detail || body?.message || response.statusText}`,
      )
    }
    if (!body) throw new Error("MyCareersFuture API returned an unparseable response body")
    return body
  }
  throw new Error("MyCareersFuture API request failed after retries")
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

/** The fields of an MCF job this skill reads (the wire shape carries much more). */
export interface McfJob {
  uuid: string
  title: string
  description?: string | null
  minimumYearsExperience?: number | null
  numberOfVacancies?: number | null
  skills?: Array<{ skill: string }>
  categories?: Array<{ category: string }>
  employmentTypes?: Array<{ employmentType: string }>
  positionLevels?: Array<{ position: string }>
  flexibleWorkArrangements?: Array<{ flexibleWorkArrangement?: string } | string>
  status?: { jobStatus?: string }
  postedCompany?: { name?: string | null; uen?: string | null } | null
  hiringCompany?: { name?: string | null; uen?: string | null } | null
  address?: {
    isOverseas?: boolean
    overseasCountry?: string | null
    street?: string | null
    postalCode?: string | null
    districts?: Array<{ location?: string; region?: string }>
  } | null
  metadata?: {
    jobPostId?: string
    newPostingDate?: string | null
    originalPostingDate?: string | null
    expiryDate?: string | null
    jobDetailsUrl?: string | null
    isHideSalary?: boolean
    isHideHiringEmployerName?: boolean
  }
  salary?: { minimum?: number | null; maximum?: number | null; type?: { salaryType?: string } } | null
}

/** The search response: `{ results, total, ... }`. */
export interface McfSearchResponse {
  results: McfJob[]
  total?: number
  countWithoutFilters?: number
}

/**
 * A search result in the portal-skill contract shape. `id` is the MCF job uuid
 * (what `detail <id>` consumes) and `date` is the (re)posting date as
 * YYYY-MM-DD; missing values are `null`, never omitted. The extra fields are a
 * permitted superset.
 */
export interface JobResult {
  id: string
  title: string
  company: string | null
  location: string | null
  date: string | null
  url: string
  salary: string | null
  employment_types: string[]
  position_levels: string[]
  categories: string[]
  min_years_experience: number | null
  expiry_date: string | null
  job_post_id: string | null
  description: string | null
}

/** A job detail: the search result plus skills, vacancies, status. */
export interface JobDetailResult extends JobResult {
  skills: string[]
  vacancies: number | null
  status: string | null
  original_posting_date: string | null
  posted_by: string | null
}

/** YYYY-MM-DD from a date or ISO timestamp, or null. */
export function contractDate(value: string | null | undefined): string | null {
  const m = /^(\d{4}-\d{2}-\d{2})/.exec(value ?? "")
  return m ? m[1] : null
}

/**
 * The company to show: the hiring employer when MCF discloses it, else the
 * posting company (often a recruitment agency posting on the employer's behalf).
 */
export function companyName(j: McfJob): string | null {
  const hiring = j.metadata?.isHideHiringEmployerName ? null : j.hiringCompany?.name
  return (hiring || j.postedCompany?.name || "").trim() || null
}

/** A readable location: district names, "Overseas: <country>", or null. */
export function locationText(j: McfJob): string | null {
  const a = j.address
  if (!a) return null
  if (a.isOverseas) return a.overseasCountry ? `Overseas: ${a.overseasCountry}` : "Overseas"
  const districts = (a.districts ?? []).map((d) => d.location).filter((s): s is string => !!s)
  if (districts.length) return `Singapore (${districts.join("; ")})`
  return "Singapore"
}

/** "SGD 7500-11500/Monthly", null when hidden or absent. Keeps the period. */
export function formatSalary(j: McfJob): string | null {
  const s = j.salary
  if (!s || j.metadata?.isHideSalary) return null
  const min = s.minimum ?? null
  const max = s.maximum ?? null
  if (min == null && max == null) return null
  const per = s.type?.salaryType ? `/${s.type.salaryType}` : ""
  if (min != null && max != null) return `SGD ${min}-${max}${per}`
  return `SGD ${min ?? max}${per}`
}

/** The public job page: the API's jobDetailsUrl, else a /job/<uuid> fallback. */
export function jobUrl(j: McfJob): string {
  return j.metadata?.jobDetailsUrl || `${WEB_BASE_URL}/job/${j.uuid}`
}

export function toResult(j: McfJob, includeDescription = true): JobResult {
  return {
    id: j.uuid,
    title: decodeHtmlEntities(j.title || "").trim() || "(untitled)",
    company: companyName(j),
    location: locationText(j),
    date: contractDate(j.metadata?.newPostingDate),
    url: jobUrl(j),
    salary: formatSalary(j),
    employment_types: (j.employmentTypes ?? []).map((e) => e.employmentType),
    position_levels: (j.positionLevels ?? []).map((p) => p.position),
    categories: (j.categories ?? []).map((c) => c.category),
    min_years_experience: j.minimumYearsExperience ?? null,
    expiry_date: contractDate(j.metadata?.expiryDate),
    job_post_id: j.metadata?.jobPostId ?? null,
    description: includeDescription ? cleanHtml(j.description) : null,
  }
}

export function toDetail(j: McfJob): JobDetailResult {
  return {
    ...toResult(j, true),
    skills: (j.skills ?? []).map((s) => s.skill),
    vacancies: j.numberOfVacancies ?? null,
    status: j.status?.jobStatus ?? null,
    original_posting_date: contractDate(j.metadata?.originalPostingDate),
    posted_by: j.postedCompany?.name ?? null,
  }
}

function numericEntity(cp: number): string {
  return cp >= 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : ""
}

export function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, dec) => numericEntity(parseInt(dec, 10)))
    .replace(/&#[xX]([0-9a-fA-F]+);/g, (_, hex) => numericEntity(parseInt(hex, 16)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
}

/** Strip MCF's HTML description into readable text with paragraph breaks. */
export function cleanHtml(html: string | null | undefined): string | null {
  if (!html) return null
  const withBreaks = html
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\s*li[^>]*>/gi, "- ")
    .replace(/<\/(p|li|ul|ol|div|h\d)>/gi, "\n")
  const text = decodeHtmlEntities(withBreaks.replace(/<[^>]+>/g, " "))
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
  return text || null
}

/**
 * Extract an MCF job uuid (32 hex chars) from a bare uuid, an API URL, or a
 * public job URL (which ends in "-<uuid>").
 */
export function normalizeJobId(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null
  if (/^[0-9a-f]{32}$/i.test(trimmed)) return trimmed.toLowerCase()
  if (!/^https?:\/\/([a-z0-9-]+\.)*mycareersfuture\.gov\.sg\//i.test(trimmed)) return null
  const path = trimmed.split(/[?#]/)[0].replace(/\/+$/, "")
  const m = /([0-9a-f]{32})$/i.exec(path)
  return m ? m[1].toLowerCase() : null
}
