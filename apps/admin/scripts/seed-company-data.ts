/**
 * Seed company data: settings (meta, contact, social), SEO, service areas.
 * Run: npm run seed:company (from apps/admin). Ensure .env.local has DATABASE_URL.
 * Uses upsert — safe to run multiple times; updates existing values.
 */
import "dotenv/config";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

import { db } from "../src/lib/db";
import { settings, pageSeo } from "../src/lib/schema";

/** Company settings: meta, contact, social, CTA, service areas */
const COMPANY_SETTINGS: Record<string, string> = {
  company_name: "AG&P Outdoor LLC",
  company_email: "INFO@APGOUTDOOR.COM",
  company_phone: "772-226-9087",
  company_address: "878 Keaton Pkwy, Ocoee, FL 34761",
  company_description: "Professional artificial turf installation done right — with expert base preparation, drainage solutions, and clean finishes.",
  company_tagline: "Professional Turf Installation",
  company_website: "https://agpoutdoor.com",
  company_whatsapp: "7722269087",
  logo_url: "https://horizons-cdn.hostinger.com/4846f768-3945-473c-8475-e6b3a010bfca/5f401154bcf4d55c08c87a16b309811a.png",
  cta_primary_text: "Free Estimate",
  cta_primary_url: "/contact",
  about_service_areas: "Ocoee, Orlando, Winter Garden, Windermere, Clermont, Kissimmee, Apopka, Central Florida",
  social_facebook: "",
  social_instagram: "",
  social_youtube: "",
  social_twitter: "",
  social_tiktok: "",
  social_linkedin: "",
  meta_pixel_id: "",
  google_ads_id: "",
  gtm_id: "",
  ga4_id: "",
  gsc_meta_tag: "",
  custom_scripts_head: "",
  custom_scripts_body: "",
  notification_email: "",
};

/** SEO per page: title, meta description. pageKey must match fetchSeo(page) and route. */
const PAGE_SEO: Record<string, { titleTag: string; metaDescription: string }> = {
  home: {
    titleTag: "AG&P Outdoor LLC | Professional Artificial Turf Installation - Central Florida",
    metaDescription: "Professional artificial turf installation in Central Florida. Expert base preparation, drainage solutions, and quality finishes. Free estimates. Licensed & insured.",
  },
  about: {
    titleTag: "About AG&P Outdoor LLC | Family-Owned Turf Installation - Central Florida",
    metaDescription: "Learn about AG&P Outdoor LLC, a family-owned artificial turf installation company serving Central Florida. Licensed, insured, and committed to quality.",
  },
  services: {
    titleTag: "Artificial Turf Services | Residential & Commercial - AG&P Outdoor LLC",
    metaDescription: "Residential and commercial artificial turf installation. Putting greens, pet turf, drainage solutions. Serving Ocoee, Orlando, Winter Garden, and Central Florida.",
  },
  contact: {
    titleTag: "Contact AG&P Outdoor LLC | Free Estimate - Central Florida",
    metaDescription: "Get a free estimate for artificial turf installation. Contact AG&P Outdoor LLC. Serving Ocoee, Orlando, Winter Garden, and Central Florida.",
  },
  portfolio: {
    titleTag: "Portfolio | Artificial Turf Projects - AG&P Outdoor LLC",
    metaDescription: "View our artificial turf installation projects. Residential lawns, putting greens, commercial landscapes. Central Florida.",
  },
  blog: {
    titleTag: "Blog | AG&P Outdoor LLC - Artificial Turf Tips & Insights",
    metaDescription: "Expert tips, guides, and insights from AG&P Outdoor LLC. Artificial turf maintenance, installation advice, and landscaping trends.",
  },
  reviews: {
    titleTag: "Customer Reviews | AG&P Outdoor LLC",
    metaDescription: "Read real customer reviews of AG&P Outdoor LLC. See why customers trust us for quality artificial turf installation in Central Florida.",
  },
  faq: {
    titleTag: "Frequently Asked Questions | AG&P Outdoor LLC - Artificial Turf Installation",
    metaDescription: "Get answers to common questions about artificial turf installation, maintenance, costs, and more. Expert advice from AG&P Outdoor LLC.",
  },
  "residential-turf": {
    titleTag: "Residential Artificial Turf Installation | AG&P Outdoor LLC - Central Florida",
    metaDescription: "Professional residential artificial turf installation in Central Florida. Expert base preparation, drainage solutions, and quality materials for a beautiful, low-maintenance lawn. Free estimates.",
  },
  "putting-green": {
    titleTag: "Custom Putting Green Installation | AG&P Outdoor LLC - Central Florida",
    metaDescription: "Professional custom putting green installation in Central Florida. Tournament-grade turf, precision slope design, and expert installation. Practice at home year-round.",
  },
  "pet-turf": {
    titleTag: "Pet-Friendly Artificial Turf Installation | AG&P Outdoor LLC",
    metaDescription: "Professional pet turf installation in Central Florida. Safe, durable, and easy to clean with superior drainage. Perfect for dogs and cats.",
  },
  "commercial-turf": {
    titleTag: "Commercial Artificial Turf Installation | AG&P Outdoor LLC",
    metaDescription: "Professional commercial artificial turf installation in Central Florida. Reduce maintenance costs and maintain a professional appearance year-round.",
  },
  pavers: {
    titleTag: "Professional Paver Installation | AG&P Outdoor LLC - Central Florida",
    metaDescription: "Expert paver installation for patios, walkways, and driveways in Central Florida. Transform your outdoor living spaces with professional craftsmanship.",
  },
  "drainage-grading": {
    titleTag: "Drainage & Grading Solutions | AG&P Outdoor LLC - Central Florida",
    metaDescription: "Professional drainage and grading services in Central Florida. Protect your property from water damage with expert solutions.",
  },
  "grass-removal": {
    titleTag: "Natural Grass Removal Services | AG&P Outdoor LLC - Central Florida",
    metaDescription: "Professional natural grass removal in Central Florida. Proper foundation preparation for artificial turf, pavers, and landscaping projects.",
  },
};

async function seedCompanyData() {
  const now = new Date();

  for (const [key, value] of Object.entries(COMPANY_SETTINGS)) {
    await db
      .insert(settings)
      .values({ key, value: value || "" })
      .onConflictDoUpdate({ target: settings.key, set: { value: value || "" } });
  }
  console.log(`Settings: ${Object.keys(COMPANY_SETTINGS).length} keys upserted`);

  for (const [pageKey, seo] of Object.entries(PAGE_SEO)) {
    await db
      .insert(pageSeo)
      .values({
        pageKey,
        titleTag: seo.titleTag,
        metaDescription: seo.metaDescription,
        ogImage: null,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: pageSeo.pageKey,
        set: {
          titleTag: seo.titleTag,
          metaDescription: seo.metaDescription,
          updatedAt: now,
        },
      });
  }
  console.log(`SEO: ${Object.keys(PAGE_SEO).length} pages upserted`);

  console.log("Company data seed done.");
}

seedCompanyData().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
