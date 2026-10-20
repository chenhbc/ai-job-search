import { afterEach, describe, expect, test } from "bun:test";
import { apiGet } from "../src/helpers";

// The portal contract requires backoff on 429/5xx. These tests pin the retry
// loop offline: a stubbed fetch counts attempts, and a stubbed setTimeout
// fires immediately so the exhaustion case does not sleep through the real
// 500ms -> 8s backoff schedule. A connection failure fails fast, no retry.

const originalFetch = globalThis.fetch;
const originalSetTimeout = globalThis.setTimeout;

afterEach(() => {
  globalThis.fetch = originalFetch;
  globalThis.setTimeout = originalSetTimeout;
});

function instantTimers() {
  globalThis.setTimeout = ((fn: () => void) => originalSetTimeout(fn, 0)) as unknown as typeof setTimeout;
}

function stubFetch(responses: Array<() => Response>): { calls: number } {
  const state = { calls: 0 };
  globalThis.fetch = (async () => {
    const i = Math.min(state.calls, responses.length - 1);
    state.calls++;
    return responses[i]();
  }) as unknown as typeof fetch;
  return state;
}

describe("apiGet retry/backoff", () => {
  test("retries a 429 and succeeds on the next attempt", async () => {
    instantTimers();
    const state = stubFetch([
      () => new Response("", { status: 429 }),
      () => new Response('{"results":[]}', { status: 200 }),
    ]);

    const body = await apiGet<unknown>("/v2/jobs");
    expect(body).not.toBeNull();
    expect(state.calls).toBe(2);
  });

  test("returns null on 404 without retrying", async () => {
    const state = stubFetch([() => new Response("", { status: 404 })]);
    expect(await apiGet("/v2/jobs/missing")).toBeNull();
    expect(state.calls).toBe(1);
  });

  test("gives up after the initial attempt plus six retries on persistent 5xx", async () => {
    instantTimers();
    const state = stubFetch([() => new Response("", { status: 500 })]);
    await expect(apiGet("/v2/jobs")).rejects.toThrow(/500/);
    expect(state.calls).toBe(7);
  });

  test("fails fast on a connection error - no retry", async () => {
    const state = { calls: 0 };
    globalThis.fetch = (async () => {
      state.calls++;
      throw new TypeError("Unable to connect");
    }) as unknown as typeof fetch;

    await expect(apiGet("/v2/jobs")).rejects.toThrow(/could not reach the MyCareersFuture API/);
    expect(state.calls).toBe(1);
  });

  test("a 400 surfaces the API validation message and does not retry", async () => {
    const state = stubFetch([
      () =>
        new Response(JSON.stringify({ errors: [{ path: "limit", message: "must be <= 100" }] }), {
          status: 400,
          headers: { "content-type": "application/json" },
        }),
    ]);
    await expect(apiGet("/v2/jobs")).rejects.toThrow(/limit: must be <= 100/);
    expect(state.calls).toBe(1);
  });
});
