/**
 * Content migration 0010:
 * - upsert Google reviews into testimonials table
 *
 * Input options:
 * 1) GOOGLE_REVIEWS_JSON env var with a JSON array
 * 2) GOOGLE_REVIEWS_FILE env var path to a JSON file
 * 3) default file: scripts/data/google-reviews.json
 *
 * JSON shape:
 * [
 *   {
 *     "name": "Customer Name",
 *     "location": "City, ST",
 *     "text": "Review text",
 *     "rating": 5,
 *     "photoUrl": "/api/site/storage/testimonials/photo.jpg"
 *   }
 * ]
 */
import "dotenv/config";
import { config } from "dotenv";
import { resolve } from "path";
import { existsSync, readFileSync } from "fs";
import { and, eq } from "drizzle-orm";

config({ path: resolve(process.cwd(), ".env.local") });

import { db } from "../src/lib/db";
import { testimonials } from "../src/lib/schema";

type ReviewInput = {
  name: string;
  location?: string | null;
  text: string;
  rating?: number;
  photoUrl?: string | null;
  sortOrder?: number;
};

function normalizeReview(input: ReviewInput, index: number): ReviewInput {
  return {
    name: String(input.name || "").trim(),
    location: input.location ? String(input.location).trim() : null,
    text: String(input.text || "").trim(),
    rating: Math.min(5, Math.max(1, Number(input.rating ?? 5))),
    photoUrl: input.photoUrl ? String(input.photoUrl).trim() : null,
    sortOrder: Number.isFinite(input.sortOrder) ? Number(input.sortOrder) : index,
  };
}

function parsePayload(raw: string): ReviewInput[] {
  const parsed = JSON.parse(raw);
  if (Array.isArray(parsed)) return parsed as ReviewInput[];
  if (parsed && typeof parsed === "object" && Array.isArray((parsed as { reviews?: unknown }).reviews)) {
    return (parsed as { reviews: ReviewInput[] }).reviews;
  }
  return [];
}

function loadReviews(): ReviewInput[] {
  if (process.env.GOOGLE_REVIEWS_JSON) {
    try {
      return parsePayload(process.env.GOOGLE_REVIEWS_JSON);
    } catch {
      throw new Error("GOOGLE_REVIEWS_JSON has invalid JSON");
    }
  }

  const filePath = process.env.GOOGLE_REVIEWS_FILE
    ? resolve(process.cwd(), process.env.GOOGLE_REVIEWS_FILE)
    : resolve(process.cwd(), "scripts/data/google-reviews.json");

  if (!existsSync(filePath)) return [];

  try {
    const raw = readFileSync(filePath, "utf-8");
    return parsePayload(raw);
  } catch {
    throw new Error(`Could not parse reviews file: ${filePath}`);
  }
}

async function migrate0010() {
  const rawReviews = loadReviews();
  const reviews = rawReviews
    .map((review, index) => normalizeReview(review, index))
    .filter((review) => review.name.length > 0 && review.text.length > 0);

  if (reviews.length === 0) {
    console.log("migrate-0010 skipped: no Google reviews provided");
    return;
  }

  let inserted = 0;
  let updated = 0;
  const now = new Date();

  for (const review of reviews) {
    const existing = await db
      .select({ id: testimonials.id })
      .from(testimonials)
      .where(and(eq(testimonials.name, review.name), eq(testimonials.text, review.text)))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(testimonials)
        .set({
          location: review.location ?? null,
          photoUrl: review.photoUrl ?? null,
          rating: review.rating ?? 5,
          approved: true,
          sortOrder: review.sortOrder ?? 0,
        })
        .where(eq(testimonials.id, existing[0].id));
      updated += 1;
      continue;
    }

    await db.insert(testimonials).values({
      name: review.name,
      location: review.location ?? null,
      photoUrl: review.photoUrl ?? null,
      text: review.text,
      rating: review.rating ?? 5,
      approved: true,
      sortOrder: review.sortOrder ?? 0,
      createdAt: now,
    });
    inserted += 1;
  }

  console.log(`migrate-0010 done: inserted=${inserted}, updated=${updated}, total=${reviews.length}`);
}

migrate0010().catch((err) => {
  console.error("migrate-0010 failed:", err);
  process.exit(1);
});
