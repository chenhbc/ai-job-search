import { describe, expect, test } from "bun:test";
import { runCLI } from "./helpers";

function parsedStderr(stderr: string): { error?: string; code?: string } {
  try {
    return JSON.parse(stderr);
  } catch {
    return {};
  }
}

describe("mycareersfuture CLI flag validation", () => {
  describe("numeric flag validation", () => {
    for (const name of ["jobage", "page", "limit", "salary-min"]) {
      test(`--${name} non-numeric exits 1 with BAD_ARG`, async () => {
        const result = await runCLI(["search", `--${name}`, "foo"]);
        expect(result.exitCode).not.toBe(0);
        const err = parsedStderr(result.stderr);
        expect(err.code).toBe("BAD_ARG");
        expect(err.error).toMatch(new RegExp(name));
      });

      test(`--${name} fractional exits 1 with BAD_ARG instead of truncating`, async () => {
        const result = await runCLI(["search", `--${name}`, "1.5"]);
        expect(result.exitCode).not.toBe(0);
        expect(parsedStderr(result.stderr).code).toBe("BAD_ARG");
      });

      test(`--${name} 0 exits 1 with BAD_ARG`, async () => {
        const result = await runCLI(["search", `--${name}`, "0"]);
        expect(result.exitCode).not.toBe(0);
        expect(parsedStderr(result.stderr).code).toBe("BAD_ARG");
      });
    }

    test("--limit above the API cap of 100 exits 1 before any request", async () => {
      const requests: string[] = [];
      const server = Bun.serve({
        hostname: "127.0.0.1",
        port: 0,
        fetch(request) {
          requests.push(request.url);
          return Response.json({ results: [], total: 0 });
        },
      });
      try {
        const result = await runCLI(["search", "--limit", "101"], { MCF_API_URL: server.url.toString() });
        expect(result.exitCode).toBe(1);
        expect(result.stdout).toBe("");
        expect(parsedStderr(result.stderr).code).toBe("BAD_ARG");
        expect(requests).toEqual([]);
      } finally {
        server.stop(true);
      }
    });
  });

  test("an unknown flag exits 1 with UNKNOWN_FLAG and is not sent", async () => {
    const requests: string[] = [];
    const server = Bun.serve({
      hostname: "127.0.0.1",
      port: 0,
      fetch(request) {
        requests.push(request.url);
        return Response.json({ results: [], total: 0 });
      },
    });
    try {
      const result = await runCLI(["search", "--region", "sg"], { MCF_API_URL: server.url.toString() });
      expect(result.exitCode).toBe(1);
      expect(parsedStderr(result.stderr).code).toBe("UNKNOWN_FLAG");
      expect(requests).toEqual([]);
    } finally {
      server.stop(true);
    }
  });

  test("an empty --query exits 1 with BAD_ARG", async () => {
    const result = await runCLI(["search", "--query"]);
    expect(result.exitCode).toBe(1);
    expect(parsedStderr(result.stderr).code).toBe("BAD_ARG");
  });

  test("--sort rejects a value outside relevance|new", async () => {
    const result = await runCLI(["search", "--sort", "salary"]);
    expect(result.exitCode).toBe(1);
    expect(parsedStderr(result.stderr).code).toBe("BAD_ARG");
  });

  test("detail without an id exits 1 with NO_ID", async () => {
    const result = await runCLI(["detail"]);
    expect(result.exitCode).toBe(1);
    expect(parsedStderr(result.stderr).code).toBe("NO_ID");
  });

  test("an unknown command exits 1 with BAD_CMD", async () => {
    const result = await runCLI(["facets"]);
    expect(result.exitCode).toBe(1);
    expect(parsedStderr(result.stderr).code).toBe("BAD_CMD");
  });

  test("search --help prints usage and exits 0", async () => {
    const result = await runCLI(["search", "--help"]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("mycareersfuture-cli");
    expect(result.stderr).toBe("");
  });
});
