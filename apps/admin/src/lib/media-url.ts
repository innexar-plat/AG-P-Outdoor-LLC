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

function isOwnPublicHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return (
    host === "agpoutdoor.com" ||
    host === "www.agpoutdoor.com" ||
    host === "localhost" ||
    host === "127.0.0.1"
  );
}

function isLikelyMediaFilenamePath(pathname: string): boolean {
  const clean = pathname.replace(/^\/+/, "");
  if (!clean || clean.includes("/")) return false;
  return /\.(mp4|webm|mov|avi|jpg|jpeg|png|webp|gif|svg)$/i.test(clean);
}

export function normalizeMediaUrl(
  value: string | null | undefined,
  proxyPrefix = "/admin/api/site/storage",
): string {
  if (!value) return "";
  if (value.startsWith("data:")) return value;
  if (value.startsWith("/api/site/storage/") || value.startsWith("/admin/api/site/storage/")) {
    if (proxyPrefix === "/api/site/storage" && value.startsWith("/admin/api/site/storage/")) {
      return value.replace("/admin/api/site/storage", "/api/site/storage");
    }
    if (proxyPrefix === "/admin/api/site/storage" && value.startsWith("/api/site/storage/")) {
      return value.replace("/api/site/storage", "/admin/api/site/storage");
    }
    return value;
  }

  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value);
      // Keep site media consistent by serving /uploads/* through the storage proxy.
      if (isOwnPublicHost(url.hostname) && url.pathname.startsWith("/uploads/")) {
        return `${proxyPrefix}${url.pathname}`;
      }

      if (isInternalHost(url.hostname)) {
        return `${proxyPrefix}${url.pathname}`;
      }

      // Some legacy records may contain public absolute URLs with only a filename path.
      // Route these through storage proxy only when the hostname is our own public host
      // or the URL points to an internal host. External hosts should remain untouched.
      if (isLikelyMediaFilenamePath(url.pathname)) {
        if (isOwnPublicHost(url.hostname) || isInternalHost(url.hostname)) {
          return `${proxyPrefix}${url.pathname}`;
        }
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
