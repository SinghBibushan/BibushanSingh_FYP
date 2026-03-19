import { NextResponse } from "next/server";

type RateLimitRecord = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
};

declare global {
  var __eventeaseRateLimitStore:
    | Map<string, RateLimitRecord>
    | undefined;
}

const store = global.__eventeaseRateLimitStore ?? new Map<string, RateLimitRecord>();
global.__eventeaseRateLimitStore = store;

function now() {
  return Date.now();
}

export function getRateLimitKey(request: Request, scope: string) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const userAgent = request.headers.get("user-agent") ?? "unknown";
  const ip = forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";

  return `${scope}:${ip}:${userAgent}`;
}

export function checkRateLimit(options: RateLimitOptions): RateLimitResult {
  const currentTime = now();
  const existing = store.get(options.key);

  if (!existing || existing.resetAt <= currentTime) {
    const resetAt = currentTime + options.windowMs;
    store.set(options.key, {
      count: 1,
      resetAt,
    });

    return {
      allowed: true,
      limit: options.limit,
      remaining: Math.max(options.limit - 1, 0),
      resetAt,
    };
  }

  existing.count += 1;
  store.set(options.key, existing);

  const remaining = Math.max(options.limit - existing.count, 0);
  return {
    allowed: existing.count <= options.limit,
    limit: options.limit,
    remaining,
    resetAt: existing.resetAt,
  };
}

export function buildRateLimitHeaders(result: RateLimitResult) {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
  };
}

export function applyRateLimit(request: Request, options: Omit<RateLimitOptions, "key"> & {
  scope: string;
}) {
  const result = checkRateLimit({
    key: getRateLimitKey(request, options.scope),
    limit: options.limit,
    windowMs: options.windowMs,
  });

  if (result.allowed) {
    return { ok: true as const, headers: buildRateLimitHeaders(result) };
  }

  return {
    ok: false as const,
    response: NextResponse.json(
      { message: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: buildRateLimitHeaders(result),
      },
    ),
  };
}

export function resetRateLimitStore() {
  store.clear();
}
