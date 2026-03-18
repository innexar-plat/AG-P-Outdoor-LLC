import { z } from "zod";
import { NextResponse } from "next/server";
import { createFormSubmission } from "@/lib/queries/forms";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendNotificationEmail } from "@/lib/services/email";
import { getSetting } from "@/lib/queries/settings";

const submitSchema = z.object({
  formType: z.enum(["contact", "quote", "callback"]),
  name: z.string().min(1).max(500),
  email: z.string().email(),
  phone: z.string().max(100).optional(),
  message: z.string().max(10000).optional(),
  metadata: z.string().max(2000).optional(),
});

/**
 * POST /api/site/forms/submit
 * Public form submission. Rate limited 5/IP/hour. Sends notification email.
 */
export async function POST(request: Request) {
  if (!checkRateLimit(request)) {
    return NextResponse.json(
      { data: null, error: "Too many submissions. Try again later.", code: "RATE_LIMIT" },
      { status: 429 }
    );
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { data: null, error: "Invalid JSON" },
      { status: 400 }
    );
  }
  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => e.message).join("; ") || "Validation failed";
    return NextResponse.json(
      { data: null, error: msg },
      { status: 400 }
    );
  }
  const { formType, name, email, phone, message, metadata } = parsed.data;
  try {
    const id = await createFormSubmission({
      formType,
      name,
      email,
      phone: phone ?? null,
      message: message ?? null,
      metadata: metadata ?? null,
    });
    const notifyEmail = (await getSetting("notification_email")) ?? process.env.NOTIFICATION_EMAIL;
    await sendNotificationEmail(
      `New form: ${formType} from ${name}`,
      `Name: ${name}\nEmail: ${email}\nPhone: ${phone ?? "—"}\nMessage: ${message ?? "—"}\nMetadata: ${metadata ?? "—"}`,
      notifyEmail ?? undefined
    );
    return NextResponse.json({ data: { id }, error: null }, { status: 201 });
  } catch (err) {
    console.error("[forms/submit]", err);
    return NextResponse.json(
      { data: null, error: "Something went wrong" },
      { status: 500 }
    );
  }
}
