/**
 * Seed script: default settings, page_seo, and site_images slots.
 * Run: npm run seed (from apps/admin). Ensure .env.local has DATABASE_URL.
 * First admin user: create via /admin/users after first deploy or use Better Auth sign-up once.
 */
import "dotenv/config";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

import { db } from "../src/lib/db";
import { settings, pageSeo, siteImages } from "../src/lib/schema";

const DEFAULT_SETTINGS_KEYS = [
  "company_name",
  "company_email",
  "company_phone",
  "company_address",
  "meta_pixel_id",
  "google_ads_id",
  "gtm_id",
  "ga4_id",
  "gsc_meta_tag",
  "custom_scripts_head",
  "custom_scripts_body",
  "cta_primary_text",
  "cta_primary_url",
  "social_facebook",
  "social_instagram",
  "social_youtube",
  "social_linkedin",
  "notification_email",
];

const PAGE_KEYS = ["home", "about", "services", "contact", "portfolio"];

const SITE_IMAGE_SLOTS = [
  { section: "home", slotKey: "home_hero", label: "Hero Banner" },
  { section: "home", slotKey: "home_gallery", label: "Gallery (carousel/grid)" },
  { section: "about", slotKey: "about_team", label: "Team / About" },
  { section: "services", slotKey: "services_hero", label: "Services Hero" },
  { section: "residential-turf", slotKey: "residential_turf_hero", label: "Residential Turf Hero" },
  { section: "putting-green", slotKey: "putting_green_hero", label: "Putting Green Hero" },
  { section: "pet-turf", slotKey: "pet_turf_hero", label: "Pet Turf Hero" },
  { section: "commercial-turf", slotKey: "commercial_turf_hero", label: "Commercial Turf Hero" },
  { section: "pavers", slotKey: "pavers_hero", label: "Pavers Hero" },
  { section: "drainage-grading", slotKey: "drainage_grading_hero", label: "Drainage & Grading Hero" },
  { section: "grass-removal", slotKey: "grass_removal_hero", label: "Grass Removal Hero" },
  { section: "portfolio", slotKey: "portfolio_hero", label: "Portfolio Hero" },
  { section: "contact", slotKey: "contact_hero", label: "Contact Hero" },
  { section: "blog", slotKey: "blog_cover", label: "Blog Default Cover" },
];

async function seed() {
  const now = new Date();

  for (const key of DEFAULT_SETTINGS_KEYS) {
    await db.insert(settings).values({ key, value: "" }).onConflictDoNothing({ target: settings.key }).catch(() => {});
  }

  for (const pageKey of PAGE_KEYS) {
    await db
      .insert(pageSeo)
      .values({
        pageKey,
        titleTag: null,
        metaDescription: null,
        ogImage: null,
        updatedAt: now,
      })
      .onConflictDoNothing({ target: pageSeo.pageKey })
      .catch(() => {});
  }

  const placeholderUrl = "https://placehold.co/1200x600/e5e7eb/6b7280?text=Replace+me";
  for (const slot of SITE_IMAGE_SLOTS) {
    await db
      .insert(siteImages)
      .values({
        section: slot.section,
        slotKey: slot.slotKey,
        label: slot.label,
        url: placeholderUrl,
        altText: null,
        updatedAt: now,
      })
      .onConflictDoNothing({ target: siteImages.slotKey })
      .catch(() => {});
  }

  console.log("Seed done: settings, page_seo, site_images.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
