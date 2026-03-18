-- Migration: site_images and page_seo
-- Date: 2025-03-15
-- Reason: RULES §10 — images by section and SEO per page

CREATE TABLE IF NOT EXISTS "site_images" (
  "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  "section" text NOT NULL,
  "slot_key" text NOT NULL UNIQUE,
  "label" text NOT NULL,
  "url" text NOT NULL,
  "alt_text" text,
  "updated_at" integer NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "page_seo" (
  "page_key" text PRIMARY KEY NOT NULL,
  "title_tag" text,
  "meta_description" text,
  "og_image" text,
  "updated_at" integer NOT NULL
);
