import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type NotificationEmailOptions = {
  to?: string;
  html?: string;
};

export type LeadNotificationInput = {
  formType: "contact" | "quote" | "callback";
  name: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  metadata?: string | null;
};

function parseRecipients(input?: string | null): string[] {
  if (!input) return [];
  const list = input
    .split(/[;,]/)
    .map((value) => value.trim())
    .filter(Boolean);
  const unique = Array.from(new Set(list));
  const invalid = unique.filter((email) => !EMAIL_REGEX.test(email));
  if (invalid.length > 0) {
    console.error("[email] Invalid notification recipients:", invalid.join(", "));
  }
  return unique.filter((email) => EMAIL_REGEX.test(email));
}

/**
 * Sends a form submission notification to the configured notification email.
 * @param to - Email address to notify (defaults to NOTIFICATION_EMAIL env)
 * @param subject - Email subject
 * @param body - Plain text body
 */
export async function sendNotificationEmail(
  subject: string,
  body: string,
  options?: NotificationEmailOptions
): Promise<boolean> {
  const { to, html } = options ?? {};
  const recipients = parseRecipients(
    to ?? process.env.NOTIFICATION_EMAILS ?? process.env.NOTIFICATION_EMAIL
  );
  if (!resend) {
    console.error("[email] RESEND_API_KEY is missing or invalid");
    return false;
  }
  if (recipients.length === 0) {
    console.error("[email] No valid notification recipients configured");
    return false;
  }
  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM ?? "onboarding@resend.dev",
      to: recipients,
      subject,
      text: body,
      html,
    });
    if (result?.error) {
      console.error("[email] Resend API error:", result.error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] sendNotificationEmail failed", err);
    return false;
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function safeValue(value?: string | null): string {
  return value && value.trim().length > 0 ? value.trim() : "-";
}

function parseMetadata(metadata?: string | null): Record<string, unknown> {
  if (!metadata) return {};
  try {
    const parsed = JSON.parse(metadata);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function metadataRows(metadata?: string | null): string {
  const parsed = parseMetadata(metadata);
  const rows = Object.entries(parsed)
    .filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== "")
    .map(([key, value]) => {
      const label = key
        .replaceAll(/[_-]+/g, " ")
        .replaceAll(/\b\w/g, (c) => c.toUpperCase());
      return `<tr><td style="padding:8px 0;color:#4f6358;font-family:Arial,sans-serif;font-size:13px;width:34%;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:8px 0;color:#193126;font-family:Arial,sans-serif;font-size:14px;font-weight:600;">${escapeHtml(String(value))}</td></tr>`;
    });

  return rows.join("");
}

export function buildLeadNotificationEmail(input: LeadNotificationInput): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = `New ${input.formType} lead from ${input.name}`;

  const text = [
    "New lead received",
    "",
    `Form type: ${input.formType}`,
    `Name: ${safeValue(input.name)}`,
    `Email: ${safeValue(input.email)}`,
    `Phone: ${safeValue(input.phone)}`,
    `Message: ${safeValue(input.message)}`,
    `Metadata: ${safeValue(input.metadata)}`,
  ].join("\n");

  const metadataTableRows = metadataRows(input.metadata);
  const metadataSection = metadataTableRows
    ? `
      <div style="margin-top:18px;border-top:1px solid #e5ece8;padding-top:14px;">
        <div style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:14px;font-weight:700;color:#1f3a2e;">Extra Details</div>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          ${metadataTableRows}
        </table>
      </div>
    `
    : "";

  const html = `
    <div style="margin:0;padding:24px;background:#f4f7f5;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #dfe7e2;border-radius:12px;overflow:hidden;">
        <div style="padding:18px 22px;background:linear-gradient(135deg,#2f6f46 0%,#245739 100%);">
          <div style="margin:0;font-family:Arial,sans-serif;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:#d9eee0;">AG&P Outdoor LLC</div>
          <h1 style="margin:6px 0 0;font-family:Arial,sans-serif;font-size:22px;line-height:1.3;color:#ffffff;">New Lead Received</h1>
        </div>

        <div style="padding:20px 22px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr><td style="padding:8px 0;color:#4f6358;font-family:Arial,sans-serif;font-size:13px;width:34%;vertical-align:top;">Form Type</td><td style="padding:8px 0;color:#193126;font-family:Arial,sans-serif;font-size:14px;font-weight:600;">${escapeHtml(safeValue(input.formType))}</td></tr>
            <tr><td style="padding:8px 0;color:#4f6358;font-family:Arial,sans-serif;font-size:13px;width:34%;vertical-align:top;">Name</td><td style="padding:8px 0;color:#193126;font-family:Arial,sans-serif;font-size:14px;font-weight:600;">${escapeHtml(safeValue(input.name))}</td></tr>
            <tr><td style="padding:8px 0;color:#4f6358;font-family:Arial,sans-serif;font-size:13px;width:34%;vertical-align:top;">Email</td><td style="padding:8px 0;color:#193126;font-family:Arial,sans-serif;font-size:14px;font-weight:600;"><a href="mailto:${escapeHtml(safeValue(input.email))}" style="color:#245739;text-decoration:none;">${escapeHtml(safeValue(input.email))}</a></td></tr>
            <tr><td style="padding:8px 0;color:#4f6358;font-family:Arial,sans-serif;font-size:13px;width:34%;vertical-align:top;">Phone</td><td style="padding:8px 0;color:#193126;font-family:Arial,sans-serif;font-size:14px;font-weight:600;">${escapeHtml(safeValue(input.phone))}</td></tr>
          </table>

          <div style="margin-top:14px;border-top:1px solid #e5ece8;padding-top:14px;">
            <div style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:14px;font-weight:700;color:#1f3a2e;">Message</div>
            <div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.55;color:#293f35;white-space:pre-wrap;">${escapeHtml(safeValue(input.message))}</div>
          </div>

          ${metadataSection}
        </div>
      </div>
    </div>
  `;

  return { subject, text, html };
}
