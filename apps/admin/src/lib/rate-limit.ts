/**
 * In-memory rate limit: max 5 submissions per IP per hour.
 * For production, use Redis (e.g. Upstash).
 */
const store = new Map<string, number[]>();

const MAX_REQUESTS = 5;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

function getClientId(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

/**
 * Returns true if the request is within limit, false if rate limited.
 */
export function checkRateLimit(request: Request): boolean {
  const key = getClientId(request);
  const now = Date.now();
  let timestamps = store.get(key) ?? [];
  timestamps = timestamps.filter((t) => now - t < WINDOW_MS);
  if (timestamps.length >= MAX_REQUESTS) {
    return false;
  }
  timestamps.push(now);
  store.set(key, timestamps);
  return true;
}
