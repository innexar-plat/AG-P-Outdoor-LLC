import { eq, asc, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { testimonials, testimonialImages } from "@/lib/schema";

type TestimonialBase = typeof testimonials.$inferSelect;

export type TestimonialWithImages = TestimonialBase & {
  photoUrls: string[];
};

function normalizeUrls(urls: Array<string | null | undefined>): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of urls) {
    const value = String(raw ?? "").trim();
    if (!value || seen.has(value)) continue;
    seen.add(value);
    out.push(value);
  }
  return out;
}

async function getImageRowsByTestimonialIds(ids: number[]) {
  if (ids.length === 0) return [] as Array<typeof testimonialImages.$inferSelect>;
  return db
    .select()
    .from(testimonialImages)
    .where(inArray(testimonialImages.testimonialId, ids))
    .orderBy(asc(testimonialImages.testimonialId), asc(testimonialImages.sortOrder), asc(testimonialImages.id));
}

function attachPhotoUrls(
  rows: TestimonialBase[],
  imageRows: Array<typeof testimonialImages.$inferSelect>
): TestimonialWithImages[] {
  const byTestimonial = new Map<number, string[]>();
  for (const image of imageRows) {
    const list = byTestimonial.get(image.testimonialId) ?? [];
    list.push(image.imageUrl);
    byTestimonial.set(image.testimonialId, list);
  }

  return rows.map((row) => {
    const photoUrls = normalizeUrls(byTestimonial.get(row.id) ?? []);
    return {
      ...row,
      photoUrls,
    };
  });
}

async function replaceTestimonialImages(testimonialId: number, urls: string[]) {
  await db.delete(testimonialImages).where(eq(testimonialImages.testimonialId, testimonialId));
  if (urls.length === 0) return;

  const now = new Date();
  await db.insert(testimonialImages).values(
    urls.map((url, index) => ({
      testimonialId,
      imageUrl: url,
      sortOrder: index,
      createdAt: now,
    }))
  );
}

/** Lists all testimonials sorted by sort_order */
export async function listTestimonials() {
  const rows = await db.select().from(testimonials).orderBy(asc(testimonials.sortOrder), asc(testimonials.id));
  const imageRows = await getImageRowsByTestimonialIds(rows.map((row) => row.id));
  return attachPhotoUrls(rows, imageRows);
}

/** Lists only approved testimonials */
export async function listApprovedTestimonials() {
  const rows = await db
    .select()
    .from(testimonials)
    .where(eq(testimonials.approved, true))
    .orderBy(asc(testimonials.sortOrder), asc(testimonials.id));
  const imageRows = await getImageRowsByTestimonialIds(rows.map((row) => row.id));
  return attachPhotoUrls(rows, imageRows);
}

/** Gets a single testimonial by id */
export async function getTestimonialById(id: number) {
  const [row] = await db.select().from(testimonials).where(eq(testimonials.id, id)).limit(1);
  if (!row) return null;
  const imageRows = await getImageRowsByTestimonialIds([row.id]);
  return attachPhotoUrls([row], imageRows)[0] ?? null;
}

/** Creates a testimonial */
export async function createTestimonial(data: {
  name: string;
  location?: string | null;
  photoUrl?: string | null;
  photoUrls?: string[];
  text: string;
  rating?: number;
  approved?: boolean;
  sortOrder?: number;
}) {
  const normalizedPhotoUrls = normalizeUrls(data.photoUrls ?? []);
  const primaryPhotoUrl = data.photoUrl ?? normalizedPhotoUrls[0] ?? null;
  const [row] = await db
    .insert(testimonials)
    .values({
      name: data.name,
      location: data.location ?? null,
      photoUrl: primaryPhotoUrl,
      text: data.text,
      rating: data.rating ?? 5,
      approved: data.approved ?? false,
      sortOrder: data.sortOrder ?? 0,
      createdAt: new Date(),
    })
    .returning();
  if (!row) return null;

  await replaceTestimonialImages(row.id, normalizedPhotoUrls);
  const imageRows = await getImageRowsByTestimonialIds([row.id]);
  return attachPhotoUrls([row], imageRows)[0] ?? null;
}

/** Updates a testimonial */
export async function updateTestimonial(
  id: number,
  data: Partial<{
    name: string;
    location: string | null;
    photoUrl: string | null;
    photoUrls: string[];
    text: string;
    rating: number;
    approved: boolean;
    sortOrder: number;
  }>
) {
  const set: Record<string, unknown> = {};
  let normalizedPhotoUrls: string[] | null = null;

  if (data.name !== undefined) set.name = data.name;
  if (data.location !== undefined) set.location = data.location;
  if (data.photoUrl !== undefined) set.photoUrl = data.photoUrl;
  if (data.photoUrls !== undefined) normalizedPhotoUrls = normalizeUrls(data.photoUrls);
  if (data.text !== undefined) set.text = data.text;
  if (data.rating !== undefined) set.rating = data.rating;
  if (data.approved !== undefined) set.approved = data.approved;
  if (data.sortOrder !== undefined) set.sortOrder = data.sortOrder;

  const [row] = await db
    .update(testimonials)
    .set(set)
    .where(eq(testimonials.id, id))
    .returning();
  if (!row) return null;

  if (normalizedPhotoUrls !== null) {
    await replaceTestimonialImages(id, normalizedPhotoUrls);
  }

  const imageRows = await getImageRowsByTestimonialIds([id]);
  return attachPhotoUrls([row], imageRows)[0] ?? null;
}

/** Deletes a testimonial */
export async function deleteTestimonial(id: number) {
  await db.delete(testimonialImages).where(eq(testimonialImages.testimonialId, id));
  await db.delete(testimonials).where(eq(testimonials.id, id));
}
