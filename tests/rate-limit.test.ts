import assert from "node:assert/strict";
import test from "node:test";

import {
  checkRateLimit,
  getRateLimitKey,
  resetRateLimitStore,
} from "../src/lib/rate-limit";

test.beforeEach(() => {
  resetRateLimitStore();
});

test("allows requests within limit and blocks excess requests", () => {
  const key = "test-limit";

  const first = checkRateLimit({ key, limit: 2, windowMs: 1_000 });
  const second = checkRateLimit({ key, limit: 2, windowMs: 1_000 });
  const third = checkRateLimit({ key, limit: 2, windowMs: 1_000 });

  assert.equal(first.allowed, true);
  assert.equal(first.remaining, 1);
  assert.equal(second.allowed, true);
  assert.equal(second.remaining, 0);
  assert.equal(third.allowed, false);
  assert.equal(third.remaining, 0);
});

test("resets the counter after the window expires", async () => {
  const key = "test-reset";

  const first = checkRateLimit({ key, limit: 1, windowMs: 20 });
  assert.equal(first.allowed, true);

  await new Promise((resolve) => setTimeout(resolve, 30));

  const second = checkRateLimit({ key, limit: 1, windowMs: 20 });
  assert.equal(second.allowed, true);
  assert.equal(second.remaining, 0);
});

test("builds a stable request fingerprint from request metadata", () => {
  const request = new Request("http://localhost/api/test", {
    headers: {
      "x-forwarded-for": "10.0.0.1, 10.0.0.2",
      "user-agent": "test-agent",
    },
  });

  const key = getRateLimitKey(request, "scope");
  assert.equal(key, "scope:10.0.0.1:test-agent");
});
