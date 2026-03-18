import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * Sends a form submission notification to the configured notification email.
 * @param to - Email address to notify (defaults to NOTIFICATION_EMAIL env)
 * @param subject - Email subject
 * @param body - Plain text body
 */
export async function sendNotificationEmail(
  subject: string,
  body: string,
  to?: string
): Promise<boolean> {
  const recipient = to ?? process.env.NOTIFICATION_EMAIL;
  if (!resend || !recipient) {
    return false;
  }
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM ?? "onboarding@resend.dev",
      to: recipient,
      subject,
      text: body,
    });
    return true;
  } catch (err) {
    console.error("[email] sendNotificationEmail failed", err);
    return false;
  }
}
