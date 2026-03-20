/**
 * Seed portfolio categories and tags for AG&P Outdoor LLC.
 * Safe to run multiple times (uses ON CONFLICT DO NOTHING).
 * Run: npm run seed:portfolio-taxonomy (from apps/admin)
 */
import "dotenv/config";
import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import { createClient } from "@libsql/client";

const url = process.env.DATABASE_URL ?? "http://127.0.0.1:8080";
const db = createClient({ url });

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const CATEGORIES: { name: string; sortOrder: number }[] = [
  { name: "Residential Turf",     sortOrder: 0 },
  { name: "Commercial Turf",      sortOrder: 1 },
  { name: "Putting Green",        sortOrder: 2 },
  { name: "Pet Turf",             sortOrder: 3 },
  { name: "Pavers",               sortOrder: 4 },
  { name: "Drainage & Grading",   sortOrder: 5 },
  { name: "Grass Removal",        sortOrder: 6 },
];

const TAGS: string[] = [
  // Location
  "Ocoee",
  "Orlando",
  "Winter Garden",
  "Windermere",
  "Clermont",
  "Kissimmee",
  "Apopka",
  // Project type / scope
  "Backyard",
  "Front Yard",
  "Side Yard",
  "Pool Area",
  "Patio",
  "Rooftop",
  // Features
  "Before & After",
  "Large Area",
  "Small Yard",
  "Drainage Solution",
  "Base Preparation",
  "Premium Turf",
  "Pet-Friendly",
  "HOA Approved",
  "Low Maintenance",
  // Visual/finish
  "Natural Look",
  "Lush & Dense",
  "Clean Finish",
];

async function seed() {
  const now = Date.now();

  console.log("Seeding portfolio categories…");
  for (const cat of CATEGORIES) {
    const slug = slugify(cat.name);
    await db.execute({
      sql: `INSERT INTO portfolio_categories (name, slug, sort_order, active, created_at, updated_at)
            VALUES (?, ?, ?, 1, ?, ?)
            ON CONFLICT(slug) DO UPDATE SET
              name = excluded.name,
              sort_order = excluded.sort_order,
              updated_at = excluded.updated_at`,
      args: [cat.name, slug, cat.sortOrder, now, now],
    });
    console.log(`  ✔ ${cat.name}`);
  }

  console.log("Seeding portfolio tags…");
  for (const tagName of TAGS) {
    const slug = slugify(tagName);
    await db.execute({
      sql: `INSERT INTO portfolio_tags (name, slug, created_at, updated_at)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(slug) DO NOTHING`,
      args: [tagName, slug, now, now],
    });
    console.log(`  ✔ ${tagName}`);
  }

  console.log("\nDone! Categories:", CATEGORIES.length, "| Tags:", TAGS.length);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => { console.error(err); process.exit(1); });
