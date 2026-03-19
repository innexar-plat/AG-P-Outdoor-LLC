function isPrivateIpv4(hostname: string): boolean {
  const match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!match) return false;

  const a = Number(match[1]);
  const b = Number(match[2]);
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  return false;
}

function isInternalHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return (
    host === "localhost" ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host.endsWith(".sslip.io") ||
    isPrivateIpv4(host)
  );
}

export function normalizeMediaUrl(
  value: string | null | undefined,
  proxyPrefix = "/admin/api/site/storage",
): string {
  if (!value) return "";
  if (value.startsWith("data:")) return value;
  if (value.startsWith("/api/site/storage/") || value.startsWith("/admin/api/site/storage/")) {
    return value;
  }

  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value);
      if (isInternalHost(url.hostname)) {
        return `${proxyPrefix}${url.pathname}`;
      }
      if (url.protocol === "http:") {
        url.protocol = "https:";
        return url.toString();
      }
      return value;
    } catch {
      return value;
    }
  }

  if (value.startsWith("/")) {
    return `${proxyPrefix}${value}`;
  }

  return `${proxyPrefix}/${value}`;
}

export function normalizeCarouselItems(
  raw: string | null | undefined,
  proxyPrefix = "/admin/api/site/storage",
): string | null {
  if (!raw) return raw ?? null;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return raw;
    const normalized = parsed.map((item) => {
      if (!item || typeof item !== "object") return item;
      const url = "url" in item ? normalizeMediaUrl(String((item as { url?: unknown }).url ?? ""), proxyPrefix) : undefined;
      return url ? { ...item, url } : item;
    });
    return JSON.stringify(normalized);
  } catch {
    return raw;
  }
}
