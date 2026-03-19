/**
 * MARKET-UP — Notification helper
 * Creates a Notification document AND sends the corresponding email.
 * Every state change that the user should know about flows through this helper.
 */
import { connectDB } from '@/lib/mongodb';
import { Notification, type NotificationType } from '@/models/Notification';
import { Company } from '@/models/Company';
import { sendEmail, getEmailSubject, getEmailTemplate } from '@/lib/email';

/**
 * Creates a notification in the DB and sends an email to the company.
 * Fails silently on email errors so the main flow is never blocked.
 *
 * @param companyId - MongoDB ObjectId string of the company
 * @param type      - One of the defined NotificationType values
 * @param data      - Optional metadata (profileType, reason, daysLeft, …)
 */
export async function createNotification(
  companyId: string,
  type: NotificationType,
  data?: Record<string, unknown>
): Promise<void> {
  await connectDB();

  // 1. Persist the notification
  const notification = await Notification.create({ companyId, type, data });

  // 2. Fetch the company's email and name (never expose passwordHash)
  const company = await Company.findById(companyId)
    .select('email name')
    .lean<{ email: string; name: string }>();

  if (!company) {
    console.error('[createNotification] Company not found:', companyId);
    return;
  }

  // 3. Attempt to send the email
  const subject = getEmailSubject(type, data);
  const html    = getEmailTemplate(type, data, company.name);

  const sent = await sendEmail({ to: company.email, subject, html });

  // 4. Mark email as sent (best-effort — don't throw on failure)
  if (sent) {
    await Notification.findByIdAndUpdate(notification._id, { emailSent: true });
  }
}
