/**
 * API client for the admin panel's public endpoints.
 * All data the site needs comes from /api/site/* routes on the admin server.
 */
const API_BASE_RAW = import.meta.env.VITE_API_URL?.trim()
  || (typeof window !== 'undefined' ? window.location.origin : '/admin');
// Prevent double slashes when env has trailing `/` (e.g. `.../admin/`).
const API_BASE_TRIMMED = API_BASE_RAW.replace(/\/+$/, '');
const API_BASE = API_BASE_TRIMMED.endsWith('/admin') ? API_BASE_TRIMMED : `${API_BASE_TRIMMED}/admin`;

function normalizeMediaUrl(url) {
  if (!url || typeof url !== 'string') return url;

  try {
    // Keep current host (apex or www) when media URL points to one of our domains.
    const parsed = new URL(url, window.location.origin);
    const isOurHost = parsed.hostname === 'agpoutdoor.com' || parsed.hostname === 'www.agpoutdoor.com';
    if (isOurHost) {
      return `${window.location.origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

function normalizeSlotUrls(slot) {
  if (!slot || typeof slot !== 'object') return slot;

  const next = { ...slot };
  if (next.url) next.url = normalizeMediaUrl(next.url);

  if (next.carouselItems) {
    try {
      const parsed = Array.isArray(next.carouselItems)
        ? next.carouselItems
        : JSON.parse(next.carouselItems);
      if (Array.isArray(parsed)) {
        const normalizedItems = parsed.map((item) => ({
          ...item,
          url: normalizeMediaUrl(item?.url),
        }));
        next.carouselItems = Array.isArray(next.carouselItems)
          ? normalizedItems
          : JSON.stringify(normalizedItems);
      }
    } catch {
      // Keep original carouselItems when parsing fails.
    }
  }

  return next;
}

async function fetchJson(path) {
  try {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function fetchSettings() {
  return fetchJson('/api/site/settings');
}

export async function fetchPortfolio(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.category) params.set('category', String(filters.category));
    if (filters.tag) params.set('tag', String(filters.tag));
    if (filters.q) params.set('q', String(filters.q));
    const suffix = params.toString() ? `?${params.toString()}` : '';

    const res = await fetch(`${API_BASE}/api/site/portfolio${suffix}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function fetchPortfolioMeta() {
  return fetchJson('/api/site/portfolio/meta');
}

export async function fetchTestimonials() {
  return fetchJson('/api/site/testimonials');
}

export async function fetchBlogPosts(limit = 20, offset = 0) {
  return fetchJson(`/api/site/blog?limit=${limit}&offset=${offset}`);
}

export async function fetchBlogPost(slug) {
  return fetchJson(`/api/site/blog/${slug}`);
}

export async function fetchSiteImages(section) {
  try {
    const res = await fetch(`${API_BASE}/api/site/images/${section}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    const data = json.data ?? null;
    if (!Array.isArray(data)) return data;
    return data.map(normalizeSlotUrls);
  } catch {
    return null;
  }
}

export async function fetchBanners(placement) {
  return fetchJson(`/api/site/banners/${placement}`);
}

export async function fetchSeo(page) {
  return fetchJson(`/api/site/seo/${page}`);
}

export async function submitForm(formData) {
  try {
    const res = await fetch(`${API_BASE}/api/site/forms/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const json = await res.json();
    return { ok: res.ok, data: json.data, error: json.error };
  } catch {
    return { ok: false, data: null, error: 'Connection error' };
  }
}
