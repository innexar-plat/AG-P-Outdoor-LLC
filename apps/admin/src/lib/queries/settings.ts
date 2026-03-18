import { eq } from "drizzle-orm";
import { db } from "../db";
import { settings } from "../schema";

/**
 * Gets all settings as a key-value object.
 */
export async function getAllSettings(): Promise<Record<string, string | null>> {
  const rows = await db.select().from(settings);
  const out: Record<string, string | null> = {};
  for (const row of rows) {
    out[row.key] = row.value;
  }
  return out;
}

/**
 * Gets a single setting by key.
 */
export async function getSetting(key: string): Promise<string | null> {
  const rows = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  return rows[0]?.value ?? null;
}

/**
 * Sets multiple settings. Keys not present are left unchanged.
 */
export async function setSettings(entries: Record<string, string | null>): Promise<void> {
  for (const [key, value] of Object.entries(entries)) {
    await db
      .insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({ target: settings.key, set: { value } });
  }
}

/** Keys exposed to the public site for pixel injection and config. */
const PUBLIC_KEYS = [
  "gtm_id",
  "ga4_id",
  "meta_pixel_id",
  "google_ads_id",
  "gsc_meta_tag",
  "custom_scripts_head",
  "custom_scripts_body",
  "company_name",
  "company_email",
  "company_phone",
  "company_address",
  "company_description",
  "company_tagline",
  "company_website",
  "company_whatsapp",
  "logo_url",
  "cta_primary_text",
  "cta_primary_url",
  "social_facebook",
  "social_instagram",
  "social_youtube",
  "social_twitter",
  "social_tiktok",
  "social_linkedin",
  "about_service_areas",
];

/**
 * Gets settings needed for public site (pixels, company, CTA). No auth required.
 */
export async function getPublicSettings(): Promise<Record<string, string | null>> {
  const all = await getAllSettings();
  const out: Record<string, string | null> = {};
  for (const key of PUBLIC_KEYS) {
    if (key in all) out[key] = all[key];
  }
  return out;
}
