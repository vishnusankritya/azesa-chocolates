// Lightweight, dependency-free security helpers.
// In-memory (per-process) limiter — fine for a single Node instance; swap for
// Redis if/when the app runs across multiple instances.

const buckets = new Map<string, { count: number; resetAt: number }>();

/**
 * Fixed-window rate limit. Returns true if the call should be allowed.
 */
export function rateLimit(key: string, limit: number, windowMs = 60_000): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now >= b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  b.count += 1;
  return b.count <= limit;
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

/**
 * CSRF / same-origin guard for mutating routes. Rejects cross-origin requests
 * that carry an Origin header. Requests without Origin (curl, same-origin
 * fetch from same host) are allowed.
 */
export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  const host = req.headers.get("host");
  if (!host) return false;
  try {
    const o = new URL(origin);
    return o.host === host;
  } catch {
    return false;
  }
}
