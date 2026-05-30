type RateLimitEntry = {
  count: number;
  firstRequestAt: number;
};

const store = new Map<string, RateLimitEntry>();

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now - entry.firstRequestAt > CLEANUP_INTERVAL_MS) {
      store.delete(key);
    }
  }
}, CLEANUP_INTERVAL_MS);

export type RateLimitOptions = {
  windowMs: number;
  maxRequests: number;
};

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

export function checkRateLimit(
  key: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry) {
    store.set(key, { count: 1, firstRequestAt: now });
    return { allowed: true };
  }

  const windowElapsed = now - entry.firstRequestAt;

  if (windowElapsed > options.windowMs) {
    store.set(key, { count: 1, firstRequestAt: now });
    return { allowed: true };
  }

  if (entry.count >= options.maxRequests) {
    const retryAfterSeconds = Math.ceil(
      (options.windowMs - windowElapsed) / 1000
    );
    return { allowed: false, retryAfterSeconds };
  }

  entry.count += 1;
  return { allowed: true };
}

export function getClientIp(headers: Record<string, string | string[] | undefined>): string {
  const forwarded = headers["x-forwarded-for"];
  if (forwarded) {
    const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(",")[0];
    return ip.trim();
  }
  return headers["x-real-ip"] as string || "unknown";
}
