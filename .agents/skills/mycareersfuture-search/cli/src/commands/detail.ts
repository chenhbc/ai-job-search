import { apiGet, normalizeJobId, toDetail, writeError, type McfJob } from "../helpers.js"

export interface DetailOpts {
  id: string // an MCF job uuid or a mycareersfuture.gov.sg job URL
  format: "json" | "plain"
}

export async function runDetail(opts: DetailOpts): Promise<number> {
  const id = normalizeJobId(opts.id)
  if (!id) {
    writeError(`could not parse a MyCareersFuture job id from "${opts.id}" - pass the 32-character uuid or a mycareersfuture.gov.sg job URL`, "BAD_ID")
    return 1
  }
  try {
    const raw = await apiGet<McfJob>(`/v2/jobs/${encodeURIComponent(id)}`)
    if (!raw) {
      writeError("job not found", "NOT_FOUND")
      return 1
    }
    const job = toDetail(raw)
    if (opts.format === "plain") {
      const lines = [
        job.title,
        `${job.company || "—"} · ${job.location || "—"}`,
        job.date ? `Posted: ${job.date}` : "",
        job.expiry_date ? `Closes: ${job.expiry_date}` : "",
        job.status ? `Status: ${job.status}` : "",
        job.salary ? `Salary: ${job.salary}` : "",
        job.employment_types.length ? `Employment: ${job.employment_types.join(", ")}` : "",
        job.position_levels.length ? `Level: ${job.position_levels.join(", ")}` : "",
        job.min_years_experience != null ? `Min. experience: ${job.min_years_experience} years` : "",
        job.skills.length ? `Skills: ${job.skills.join(", ")}` : "",
        "",
        job.description || "(no description)",
        "",
        `URL: ${job.url}`,
        `id: ${job.id}`,
      ].filter((l, i, arr) => l !== "" || (i > 0 && arr[i - 1] !== ""))
      process.stdout.write(lines.join("\n") + "\n")
    } else {
      process.stdout.write(JSON.stringify(job, null, 2) + "\n")
    }
    return 0
  } catch (e) {
    writeError(e instanceof Error ? e.message : String(e), "DETAIL_FAILED")
    return 1
  }
}
