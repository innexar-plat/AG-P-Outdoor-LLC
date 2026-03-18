/**
 * API client for the admin panel's public endpoints.
 * All data the site needs comes from /api/site/* routes on the admin server.
 */
const API_BASE_RAW = import.meta.env.VITE_API_URL || 'http://localhost:3001';
// Prevent double slashes when env has trailing `/` (e.g. `.../admin/`).
const API_BASE = API_BASE_RAW.replace(/\/+$/, '');

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

export async function fetchPortfolio() {
  try {
    const res = await fetch(`${API_BASE}/api/site/portfolio`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
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
    return json.data ?? null;
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
