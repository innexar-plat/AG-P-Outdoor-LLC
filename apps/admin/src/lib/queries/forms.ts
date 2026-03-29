import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { db } from "../db";
import { formSubmissions } from "../schema";

/**
 * Lists form submissions with optional filters and limit/offset.
 */
export async function listFormSubmissions(opts?: {
  limit?: number;
  offset?: number;
  formType?: string;
  read?: boolean;
  leadStatus?: "new" | "called" | "not_called";
  from?: Date;
  to?: Date;
}) {
  const limit = opts?.limit ?? 50;
  const offset = opts?.offset ?? 0;
  const conditions = [];
  if (opts?.formType) {
    conditions.push(eq(formSubmissions.formType, opts.formType as "contact" | "quote" | "callback"));
  }
  if (opts?.read !== undefined) {
    conditions.push(eq(formSubmissions.read, opts.read));
  }
  if (opts?.leadStatus) {
    conditions.push(eq(formSubmissions.leadStatus, opts.leadStatus));
  }
  if (opts?.from !== undefined) {
    conditions.push(gte(formSubmissions.createdAt, opts.from));
  }
  if (opts?.to !== undefined) {
    conditions.push(lte(formSubmissions.createdAt, opts.to));
  }
  const baseQuery =
    conditions.length > 0
      ? db
          .select()
          .from(formSubmissions)
          .where(and(...conditions))
          .orderBy(desc(formSubmissions.createdAt))
          .limit(limit)
          .offset(offset)
      : db
          .select()
          .from(formSubmissions)
          .orderBy(desc(formSubmissions.createdAt))
          .limit(limit)
          .offset(offset);
  return baseQuery;
}

/**
 * Counts form submissions, optionally since a date and/or by read status.
 */
export async function countFormSubmissions(opts?: {
  since?: Date;
  read?: boolean;
}): Promise<number> {
  const conditions = [];
  if (opts?.since !== undefined) {
    conditions.push(gte(formSubmissions.createdAt, opts.since));
  }
  if (opts?.read !== undefined) {
    conditions.push(eq(formSubmissions.read, opts.read));
  }
  const q =
    conditions.length > 0
      ? db
          .select({ count: sql<number>`count(*)` })
          .from(formSubmissions)
          .where(and(...conditions))
      : db.select({ count: sql<number>`count(*)` }).from(formSubmissions);
  const [row] = await q;
  return Number(row?.count ?? 0);
}

/**
 * Creates a form submission.
 */
export async function createFormSubmission(data: {
  formType: "contact" | "quote" | "callback";
  name: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  metadata?: string | null;
}) {
  const [row] = await db
    .insert(formSubmissions)
    .values({
      formType: data.formType,
      name: data.name,
      email: data.email,
      phone: data.phone ?? null,
      message: data.message ?? null,
      metadata: data.metadata ?? null,
      read: false,
      createdAt: new Date(),
    })
    .returning({ id: formSubmissions.id });
  return row?.id ?? null;
}

/**
 * Marks a form submission as read.
 */
export async function updateFormSubmissionRead(id: number, read: boolean) {
  const [row] = await db
    .update(formSubmissions)
    .set({ read })
    .where(eq(formSubmissions.id, id))
    .returning();
  return row ?? null;
}

/**
 * Updates CRM fields for a form submission.
 */
export async function updateFormSubmission(id: number, data: Partial<{
  read: boolean;
  leadStatus: "new" | "called" | "not_called";
  crmComment: string | null;
}>) {
  const set: Record<string, unknown> = {};
  if (data.read !== undefined) set.read = data.read;
  if (data.leadStatus !== undefined) set.leadStatus = data.leadStatus;
  if (data.crmComment !== undefined) set.crmComment = data.crmComment;

  const [row] = await db
    .update(formSubmissions)
    .set(set)
    .where(eq(formSubmissions.id, id))
    .returning();

  return row ?? null;
}

/**
 * Deletes a form submission.
 */
export async function deleteFormSubmission(id: number) {
  await db.delete(formSubmissions).where(eq(formSubmissions.id, id));
}

/**
 * Gets a single form submission by id.
 */
export async function getFormSubmissionById(id: number) {
  const rows = await db
    .select()
    .from(formSubmissions)
    .where(eq(formSubmissions.id, id))
    .limit(1);
  return rows[0] ?? null;
}
