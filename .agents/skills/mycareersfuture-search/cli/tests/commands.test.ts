import { describe, expect, test } from "bun:test";
import { parseJSON, runCLI } from "./helpers";

const UUID = "0123456789abcdef0123456789abcdef";

function fixtureJob(date: string) {
  return {
    uuid: UUID,
    title: "Data Engineer",
    description: "<p>Build pipelines</p>",
    hiringCompany: { name: "Example Co" },
    postedCompany: { name: "Example Co" },
    address: { districts: [{ location: "D01 Boat Quay" }] },
    salary: { minimum: 7000, maximum: 9000, type: { salaryType: "Monthly" } },
    employmentTypes: [{ employmentType: "Full Time" }],
    positionLevels: [{ position: "Professional" }],
    categories: [{ category: "Information Technology" }],
    skills: [{ skill: "SQL" }],
    minimumYearsExperience: 2,
    numberOfVacancies: 1,
    status: { jobStatus: "Open" },
    metadata: {
      newPostingDate: date,
      expiryDate: "2026-12-01",
      jobDetailsUrl: `https://www.mycareersfuture.gov.sg/job/${UUID}`,
      jobPostId: "MCF-TEST",
      isHideSalary: false,
    },
  };
}

describe("search and detail against a loopback API", () => {
  test("search sends one value per filter and returns the contract shape", async () => {
    const requests: URL[] = [];
    const server = Bun.serve({
      hostname: "127.0.0.1",
      port: 0,
      fetch(request) {
        requests.push(new URL(request.url));
        return Response.json({ results: [fixtureJob("2026-10-18")], total: 42, countWithoutFilters: 100 });
      },
    });
    try {
      const result = await runCLI(
        [
          "search",
          "-q",
          "data engineer",
          "--page",
          "2",
          "--limit",
          "5",
          "--salary-min",
          "6000",
          "--employment-type",
          "Full Time",
          "--sort",
          "new",
        ],
        { MCF_API_URL: server.url.toString() },
      );
      expect(result.exitCode).toBe(0);
      expect(result.stderr).toBe("");
      expect(requests).toHaveLength(1);
      expect(requests[0].pathname).toBe("/v2/jobs");
      expect(requests[0].searchParams.get("search")).toBe("data engineer");
      expect(requests[0].searchParams.get("page")).toBe("1");
      expect(requests[0].searchParams.get("limit")).toBe("5");
      expect(requests[0].searchParams.get("salary")).toBe("6000");
      expect(requests[0].searchParams.getAll("employmentTypes")).toEqual(["Full Time"]);
      expect(requests[0].searchParams.get("sortBy")).toBe("new_posting_date");
      const body = parseJSON<{ meta: { count: number; page: number; total: number }; results: Array<Record<string, unknown>> }>(
        result,
      );
      expect(body.meta).toEqual({ count: 1, page: 2, total: 42 });
      expect(body.results[0]).toMatchObject({
        id: UUID,
        title: "Data Engineer",
        company: "Example Co",
        date: "2026-10-18",
        salary: "SGD 7000-9000/Monthly",
      });
      expect(body.results[0].description).toBe("Build pipelines");
    } finally {
      server.stop(true);
    }
  });

  test("--jobage filters the fetched page client-side and says so in meta", async () => {
    const server = Bun.serve({
      hostname: "127.0.0.1",
      port: 0,
      fetch() {
        return Response.json({
          results: [fixtureJob("2000-01-01"), fixtureJob("2099-01-01")],
          total: 2,
        });
      },
    });
    try {
      const result = await runCLI(["search", "--jobage", "14", "--limit", "2"], {
        MCF_API_URL: server.url.toString(),
      });
      expect(result.exitCode).toBe(0);
      const body = parseJSON<{
        meta: { count: number; total: number; fetched: number; jobage_applied: string };
        results: Array<{ date: string }>;
      }>(result);
      expect(body.meta.fetched).toBe(2);
      expect(body.meta.total).toBe(2);
      expect(body.meta.jobage_applied).toBe("client-side");
      expect(body.meta.count).toBe(1);
      expect(body.results.map((r) => r.date)).toEqual(["2099-01-01"]);
    } finally {
      server.stop(true);
    }
  });

  test("detail reads /v2/jobs/{uuid} and a 404 is NOT_FOUND", async () => {
    const requests: string[] = [];
    const server = Bun.serve({
      hostname: "127.0.0.1",
      port: 0,
      fetch(request) {
        requests.push(new URL(request.url).pathname);
        if (new URL(request.url).pathname.endsWith(UUID)) {
          return Response.json(fixtureJob("2026-10-18"));
        }
        return new Response(JSON.stringify({ message: "not found" }), { status: 404 });
      },
    });
    try {
      const ok = await runCLI(
        ["detail", `https://www.mycareersfuture.gov.sg/job/data-engineer-${UUID}`, "--format", "plain"],
        { MCF_API_URL: server.url.toString() },
      );
      expect(ok.exitCode).toBe(0);
      expect(ok.stdout).toContain("Data Engineer");
      expect(ok.stdout).toContain("Build pipelines");
      expect(requests).toEqual([`/v2/jobs/${UUID}`]);

      const missing = await runCLI(["detail", "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"], {
        MCF_API_URL: server.url.toString(),
      });
      expect(missing.exitCode).toBe(1);
      expect(JSON.parse(missing.stderr).code).toBe("NOT_FOUND");
    } finally {
      server.stop(true);
    }
  });

  test("a bad id never reaches the API", async () => {
    const requests: string[] = [];
    const server = Bun.serve({
      hostname: "127.0.0.1",
      port: 0,
      fetch(request) {
        requests.push(request.url);
        return Response.json({});
      },
    });
    try {
      const result = await runCLI(["detail", "not-an-id"], { MCF_API_URL: server.url.toString() });
      expect(result.exitCode).toBe(1);
      expect(JSON.parse(result.stderr).code).toBe("BAD_ID");
      expect(requests).toEqual([]);
    } finally {
      server.stop(true);
    }
  });
});
