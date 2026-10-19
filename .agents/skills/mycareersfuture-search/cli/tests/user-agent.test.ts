import { afterEach, describe, expect, test } from "bun:test";
import { USER_AGENT, apiGet } from "../src/helpers";

// Bun's fetch injects an anonymous default User-Agent when code sets none.
// This CLI names the tool, in the honest style the other portal CLIs use,
// and never impersonates a browser.
const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("apiGet user agent", () => {
  test("sends the shared User-Agent and asks for JSON", async () => {
    let init: RequestInit | undefined;
    globalThis.fetch = (async (_url: string | URL | Request, i?: RequestInit) => {
      init = i;
      return new Response("{}", { status: 200 });
    }) as unknown as typeof fetch;

    await apiGet("/v2/jobs");
    const headers = init?.headers as Record<string, string> | Headers | undefined;
    const value = headers instanceof Headers ? headers.get("User-Agent") : headers?.["User-Agent"];
    const accept = headers instanceof Headers ? headers.get("Accept") : headers?.["Accept"];
    expect(value).toBe(USER_AGENT);
    expect(value).toContain("mycareersfuture-cli/1.0");
    expect(value?.toLowerCase()).not.toContain("chrome");
    expect(accept).toBe("application/json");
  });
});
