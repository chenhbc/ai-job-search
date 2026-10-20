import { afterEach, describe, expect, test } from "bun:test";
import { TIMEOUT_MS, apiGet } from "../src/helpers";

// A stalled upstream connection would otherwise hang the CLI. MCF responses
// routinely take 5-15s, so the wrapper uses a wider AbortSignal than the
// other portal CLIs.
const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("apiGet request timeout", () => {
  test("the documented window is 45 seconds", () => {
    expect(TIMEOUT_MS).toBe(45000);
  });

  test("passes an AbortSignal timeout to fetch", async () => {
    let init: RequestInit | undefined;
    globalThis.fetch = (async (_url: string | URL | Request, i?: RequestInit) => {
      init = i;
      return new Response(JSON.stringify({ results: [] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }) as unknown as typeof fetch;

    await apiGet("/v2/jobs");
    expect(init?.signal).toBeInstanceOf(AbortSignal);
  });
});
