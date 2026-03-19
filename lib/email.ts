/**
 * MARKET-UP — Email service via Resend
 * Provides typed helpers for every notification type in the system.
 * All templates follow the Microsoft Fluent Design aesthetic.
 */
import { Resend } from 'resend';
import type { NotificationType } from '@/models/Notification';

// Lazily instantiated so missing RESEND_API_KEY doesn't crash at module load time
let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is not defined.');
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}
const FROM   = process.env.EMAIL_FROM ?? 'noreply@vivasky.media';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://vivasky.media';

// ─────────────────────────────────────────────────────────────────────────────
// Base email template (Fluent Design)
// ─────────────────────────────────────────────────────────────────────────────

function baseTemplate(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#F5F5F5;font-family:'Segoe UI',system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0"
               style="background:#FFFFFF;border:1px solid #E0E0E0;border-radius:8px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:#0078D4;padding:24px 32px;">
              <span style="color:#FFFFFF;font-size:22px;font-weight:700;letter-spacing:-0.01em;">
                MARKET<span style="color:#EFF6FC;">UP</span>
              </span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 16px;font-size:20px;font-weight:600;color:#242424;letter-spacing:-0.01em;">
                ${title}
              </h2>
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#F5F5F5;padding:20px 32px;border-top:1px solid #E0E0E0;">
              <p style="margin:0;font-size:12px;color:#616161;">
                Vous recevez cet email car vous êtes inscrit sur
                <a href="${APP_URL}" style="color:#0078D4;">vivasky.media</a>.
                © ${new Date().getFullYear()} AGGREGAX SUARL. Tous droits réservés.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function p(text: string): string {
  return `<p style="margin:0 0 12px;font-size:15px;color:#242424;line-height:1.6;">${text}</p>`;
}

function badge(text: string, color = '#107C10', bg = '#F0FDF4', border = '#B7EBC0'): string {
  return `<span style="display:inline-block;padding:4px 12px;border-radius:4px;
    font-size:13px;font-weight:600;color:${color};background:${bg};border:1px solid ${border};">
    ${text}</span>`;
}

function cta(text: string, href: string): string {
  return `<div style="margin:24px 0 0;">
    <a href="${href}"
       style="display:inline-block;background:#0078D4;color:#FFFFFF;padding:10px 24px;
              border-radius:4px;font-weight:600;font-size:14px;text-decoration:none;">
      ${text}
    </a>
  </div>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Subject lines
// ─────────────────────────────────────────────────────────────────────────────

export function getEmailSubject(
  type: NotificationType,
  data?: Record<string, unknown>
): string {
  const map: Record<NotificationType, string> = {
    account_approved:      'Votre compte MARKET-UP est activé',
    profile_validated:     `Votre profil ${data?.profileType ?? ''} est en ligne`,
    profile_rejected:      `Votre profil ${data?.profileType ?? ''} a été refusé`,
    account_suspended:     'Votre compte a été suspendu',
    rse_validated:         'Votre don RSE a été validé',
    rse_rejected:          'Votre don RSE a été refusé',
    boost_activated:       'Votre Boost est maintenant actif !',
    boost_expiring_soon:   'Votre Boost expire bientôt',
    sponsoring_approved:   'Votre campagne de sponsoring est approuvée',
    sponsoring_rejected:   'Votre campagne de sponsoring a été refusée',
  };
  return map[type] ?? 'Notification MARKET-UP';
}

// ─────────────────────────────────────────────────────────────────────────────
// HTML template bodies per notification type
// ─────────────────────────────────────────────────────────────────────────────

export function getEmailTemplate(
  type: NotificationType,
  data: Record<string, unknown> | undefined,
  companyName: string
): string {
  const dash = `${APP_URL}/dashboard`;

  switch (type) {
    case 'account_approved':
      return baseTemplate(
        'Bienvenue sur MARKET-UP !',
        p(`Bonjour <strong>${companyName}</strong>,`) +
        p('Votre compte a été <strong>vérifié et activé</strong>. Vous pouvez maintenant compléter vos profils BrandUP, TraceUP et LinkUP pour apparaître dans les moteurs de recherche.') +
        cta('Accéder au tableau de bord', dash)
      );

    case 'profile_validated':
      return baseTemplate(
        `Profil ${String(data?.profileType ?? '').toUpperCase()} validé`,
        p(`Bonjour <strong>${companyName}</strong>,`) +
        p(`Votre profil <strong>${String(data?.profileType ?? '').toUpperCase()}</strong> a été examiné et est maintenant ${badge('En ligne')}.`) +
        p('Il est désormais visible par tous les utilisateurs de la plateforme.') +
        cta('Voir mon profil', dash)
      );

    case 'profile_rejected':
      return baseTemplate(
        `Profil ${String(data?.profileType ?? '').toUpperCase()} refusé`,
        p(`Bonjour <strong>${companyName}</strong>,`) +
        p(`Votre profil <strong>${String(data?.profileType ?? '').toUpperCase()}</strong> n'a pas pu être validé.`) +
        (data?.reason ? p(`<strong>Motif :</strong> ${String(data.reason)}`) : '') +
        p('Veuillez corriger les informations et soumettre à nouveau.') +
        cta('Corriger mon profil', dash)
      );

    case 'account_suspended':
      return baseTemplate(
        'Compte suspendu',
        p(`Bonjour <strong>${companyName}</strong>,`) +
        p(`Votre compte a été ${badge('Suspendu', '#C2410C', '#FFF7ED', '#FED7AA')}.`) +
        (data?.reason ? p(`<strong>Motif :</strong> ${String(data.reason)}`) : '') +
        p('Pour toute contestation, contactez notre support.')
      );

    case 'rse_validated':
      return baseTemplate(
        'Don RSE validé',
        p(`Bonjour <strong>${companyName}</strong>,`) +
        p(`Votre don RSE a été ${badge('Validé')}. Votre badge RSE est maintenant actif et visible sur vos profils.`) +
        cta('Voir mon badge RSE', `${dash}/rse`)
      );

    case 'rse_rejected':
      return baseTemplate(
        'Don RSE refusé',
        p(`Bonjour <strong>${companyName}</strong>,`) +
        p(`Votre don RSE n'a pas pu être validé.`) +
        (data?.reason ? p(`<strong>Motif :</strong> ${String(data.reason)}`) : '') +
        cta('Soumettre un nouveau don', `${dash}/rse`)
      );

    case 'boost_activated':
      return baseTemplate(
        'Votre Boost est actif !',
        p(`Bonjour <strong>${companyName}</strong>,`) +
        p(`Votre Boost <strong>${String(data?.profileType ?? '').toUpperCase()}</strong> est maintenant ${badge('Actif')}. Votre profil apparaît en priorité dans les résultats de recherche.`) +
        cta('Voir mes statistiques', dash)
      );

    case 'boost_expiring_soon':
      return baseTemplate(
        'Votre Boost expire bientôt',
        p(`Bonjour <strong>${companyName}</strong>,`) +
        p(`Votre Boost <strong>${String(data?.profileType ?? '').toUpperCase()}</strong> expire dans <strong>${String(data?.daysLeft ?? '?')} jours</strong>.`) +
        p('Renouvelez votre Boost pour maintenir votre visibilité prioritaire.') +
        cta('Renouveler mon Boost', `${dash}/boost`)
      );

    case 'sponsoring_approved':
      return baseTemplate(
        'Campagne de sponsoring approuvée',
        p(`Bonjour <strong>${companyName}</strong>,`) +
        p(`Votre campagne de sponsoring a été ${badge('Approuvée')}. Elle sera diffusée selon les dates convenues.`) +
        cta('Voir mes campagnes', `${dash}/sponsoring`)
      );

    case 'sponsoring_rejected':
      return baseTemplate(
        'Campagne de sponsoring refusée',
        p(`Bonjour <strong>${companyName}</strong>,`) +
        p(`Votre demande de sponsoring n'a pas pu être approuvée.`) +
        (data?.reason ? p(`<strong>Motif :</strong> ${String(data.reason)}`) : '') +
        cta('Modifier ma demande', `${dash}/sponsoring`)
      );

    default:
      return baseTemplate(
        'Notification MARKET-UP',
        p(`Bonjour <strong>${companyName}</strong>,`) +
        p('Vous avez une nouvelle notification sur votre tableau de bord.') +
        cta('Voir mes notifications', `${dash}/notifications`)
      );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Send helper
// ─────────────────────────────────────────────────────────────────────────────

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  try {
    const { error } = await getResend().emails.send({ from: FROM, to, subject, html });
    if (error) {
      console.error('[sendEmail] Resend error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[sendEmail] Unexpected error:', err);
    return false;
  }
}
