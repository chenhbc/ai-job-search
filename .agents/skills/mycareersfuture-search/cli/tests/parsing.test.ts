import { describe, expect, test } from "bun:test";
import {
  cleanHtml,
  companyName,
  contractDate,
  formatSalary,
  locationText,
  normalizeJobId,
  toDetail,
  toResult,
  type McfJob,
} from "../src/helpers";
import { buildQuery, jobageCutoff, type SearchOpts } from "../src/commands/search";

function job(overrides: Partial<McfJob> = {}): McfJob {
  return {
    uuid: "0123456789abcdef0123456789abcdef",
    title: "Data Engineer",
    description: "<p>Build pipelines</p><ul><li>Ship &amp; iterate</li></ul>",
    minimumYearsExperience: 3,
    numberOfVacancies: 2,
    skills: [{ skill: "SQL" }, { skill: "Python" }],
    categories: [{ category: "Information Technology" }],
    employmentTypes: [{ employmentType: "Full Time" }],
    positionLevels: [{ position: "Professional" }],
    postedCompany: { name: "Posted Co" },
    hiringCompany: { name: "Hiring Co" },
    address: { districts: [{ location: "D01 Boat Quay, Raffles Place" }] },
    metadata: {
      jobPostId: "MCF-0000-0000001",
      newPostingDate: "2026-10-09T00:00:00.000Z",
      originalPostingDate: "2026-09-01",
      expiryDate: "2026-11-08",
      jobDetailsUrl: "https://www.mycareersfuture.gov.sg/job/example",
      isHideSalary: false,
      isHideHiringEmployerName: false,
    },
    salary: { minimum: 7500, maximum: 11500, type: { salaryType: "Monthly" } },
    status: { jobStatus: "Open" },
    ...overrides,
  };
}

const searchOpts = (overrides: Partial<SearchOpts> = {}): SearchOpts => ({
  page: 1,
  limit: 20,
  format: "json",
  ...overrides,
});

describe("toResult — portal-skill contract", () => {
  test("maps uuid to id and newPostingDate to YYYY-MM-DD", () => {
    const r = toResult(job());
    expect(r.id).toBe("0123456789abcdef0123456789abcdef");
    expect(r.date).toBe("2026-10-09");
    expect(r.url).toBe("https://www.mycareersfuture.gov.sg/job/example");
  });

  test("carries the required contract fields and keeps missing values as null", () => {
    const r = toResult(job());
    expect(r).toMatchObject({
      title: "Data Engineer",
      company: "Hiring Co",
      location: "Singapore (D01 Boat Quay, Raffles Place)",
      salary: "SGD 7500-11500/Monthly",
    });
    const empty = toResult(
      job({
        title: "   ",
        hiringCompany: { name: "" },
        postedCompany: { name: "" },
        address: null,
        metadata: { isHideSalary: true, newPostingDate: null, jobDetailsUrl: null },
        salary: null,
      }),
    );
    expect(empty.title).toBe("(untitled)");
    expect(empty.company).toBeNull();
    expect(empty.location).toBeNull();
    expect(empty.date).toBeNull();
    expect(empty.salary).toBeNull();
    expect(empty.url).toBe("https://www.mycareersfuture.gov.sg/job/0123456789abcdef0123456789abcdef");
    for (const key of ["id", "title", "company", "location", "date", "url"] as const) {
      expect(key in empty).toBe(true);
    }
  });

  test("decodes entities in the title and strips HTML in the description", () => {
    const r = toResult(job({ title: "R&amp;D Engineer " }));
    expect(r.title).toBe("R&D Engineer");
    expect(r.description).toBe("Build pipelines\n- Ship & iterate");
  });

  test("--no-description drops the body but keeps the other fields", () => {
    const r = toResult(job(), false);
    expect(r.description).toBeNull();
    expect(r.title).toBe("Data Engineer");
  });
});

describe("company, location, salary", () => {
  test("prefers the hiring employer unless MCF hides the name", () => {
    expect(companyName(job())).toBe("Hiring Co");
    expect(companyName(job({ metadata: { isHideHiringEmployerName: true } }))).toBe("Posted Co");
  });

  test("overseas roles name the country", () => {
    expect(locationText(job({ address: { isOverseas: true, overseasCountry: "Malaysia" } }))).toBe(
      "Overseas: Malaysia",
    );
    expect(locationText(job({ address: { isOverseas: true } }))).toBe("Overseas");
  });

  test("a hidden salary is null, and a one-sided range still names the period", () => {
    expect(formatSalary(job({ metadata: { isHideSalary: true } }))).toBeNull();
    expect(formatSalary(job({ salary: { minimum: 5000, maximum: null, type: { salaryType: "Monthly" } } }))).toBe(
      "SGD 5000/Monthly",
    );
  });
});

describe("toDetail", () => {
  test("adds skills, vacancies, status, and the original posting date", () => {
    const d = toDetail(job());
    expect(d.skills).toEqual(["SQL", "Python"]);
    expect(d.vacancies).toBe(2);
    expect(d.status).toBe("Open");
    expect(d.original_posting_date).toBe("2026-09-01");
    expect(d.posted_by).toBe("Posted Co");
    expect(d.description).toContain("Ship & iterate");
  });
});

describe("normalizeJobId", () => {
  test("accepts a bare uuid and a public job URL, and rejects anything else", () => {
    expect(normalizeJobId("0123456789ABCDEF0123456789ABCDEF")).toBe("0123456789abcdef0123456789abcdef");
    expect(
      normalizeJobId(
        "https://www.mycareersfuture.gov.sg/job/information-technology/data-engineer-0123456789abcdef0123456789abcdef",
      ),
    ).toBe("0123456789abcdef0123456789abcdef");
    expect(normalizeJobId("https://www.mycareersfuture.gov.sg/search?search=data")).toBeNull();
    expect(normalizeJobId("https://example.com/job/0123456789abcdef0123456789abcdef")).toBeNull();
    expect(normalizeJobId("not-a-uuid")).toBeNull();
  });
});

describe("search query", () => {
  test("page is 0-based on the wire and one filter value is sent per facet", () => {
    const q = buildQuery(
      searchOpts({
        query: "data engineer",
        page: 2,
        limit: 20,
        salaryMin: 8000,
        employmentType: "Full Time",
        positionLevel: "Professional",
        category: "Information Technology",
      }),
    );
    expect(q.get("search")).toBe("data engineer");
    expect(q.get("page")).toBe("1");
    expect(q.get("limit")).toBe("20");
    expect(q.get("salary")).toBe("8000");
    expect(q.getAll("employmentTypes")).toEqual(["Full Time"]);
    expect(q.get("positionLevels")).toBe("Professional");
    expect(q.get("categories")).toBe("Information Technology");
    expect(q.get("sortBy")).toBeNull();
  });

  test("--jobage has no server parameter and implies newest-first", () => {
    const q = buildQuery(searchOpts({ jobage: 14 }));
    expect(q.get("sortBy")).toBe("new_posting_date");
    expect(q.get("posted_within_days")).toBeNull();
    expect(jobageCutoff(14, new Date("2026-10-19T12:00:00Z"))).toBe("2026-10-05");
  });
});

describe("cleanHtml / contractDate", () => {
  test("empty HTML is null and a non-date is null", () => {
    expect(cleanHtml("")).toBeNull();
    expect(cleanHtml("<p>  </p>")).toBeNull();
    expect(contractDate("not-a-date")).toBeNull();
    expect(contractDate(null)).toBeNull();
  });
});
