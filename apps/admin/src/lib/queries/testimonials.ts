import { eq, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { testimonials } from "@/lib/schema";

/** Lists all testimonials sorted by sort_order */
export async function listTestimonials() {
  return db.select().from(testimonials).orderBy(asc(testimonials.sortOrder), asc(testimonials.id));
}

/** Lists only approved testimonials */
export async function listApprovedTestimonials() {
  return db
    .select()
    .from(testimonials)
    .where(eq(testimonials.approved, true))
    .orderBy(asc(testimonials.sortOrder), asc(testimonials.id));
}

/** Gets a single testimonial by id */
export async function getTestimonialById(id: number) {
  const [row] = await db.select().from(testimonials).where(eq(testimonials.id, id)).limit(1);
  return row ?? null;
}

/** Creates a testimonial */
export async function createTestimonial(data: {
  name: string;
  location?: string | null;
  photoUrl?: string | null;
  text: string;
  rating?: number;
  approved?: boolean;
  sortOrder?: number;
}) {
  const [row] = await db
    .insert(testimonials)
    .values({
      name: data.name,
      location: data.location ?? null,
      photoUrl: data.photoUrl ?? null,
      text: data.text,
      rating: data.rating ?? 5,
      approved: data.approved ?? false,
      sortOrder: data.sortOrder ?? 0,
      createdAt: new Date(),
    })
    .returning();
  return row ?? null;
}

/** Updates a testimonial */
export async function updateTestimonial(
  id: number,
  data: Partial<{
    name: string;
    location: string | null;
    photoUrl: string | null;
    text: string;
    rating: number;
    approved: boolean;
    sortOrder: number;
  }>
) {
  const set: Record<string, unknown> = {};
  if (data.name !== undefined) set.name = data.name;
  if (data.location !== undefined) set.location = data.location;
  if (data.photoUrl !== undefined) set.photoUrl = data.photoUrl;
  if (data.text !== undefined) set.text = data.text;
  if (data.rating !== undefined) set.rating = data.rating;
  if (data.approved !== undefined) set.approved = data.approved;
  if (data.sortOrder !== undefined) set.sortOrder = data.sortOrder;

  const [row] = await db
    .update(testimonials)
    .set(set)
    .where(eq(testimonials.id, id))
    .returning();
  return row ?? null;
}

/** Deletes a testimonial */
export async function deleteTestimonial(id: number) {
  await db.delete(testimonials).where(eq(testimonials.id, id));
}
