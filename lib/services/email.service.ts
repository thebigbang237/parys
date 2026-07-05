// lib/services/email.service.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export async function sendWelcomeEmail(to: string, name: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Bienvenue sur Content Level Up Academy 🎉",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#111;">Bienvenue, ${name} !</h2>
        <p>Ton compte Content Level Up Academy est créé. Tu peux maintenant accéder à toutes les formations.</p>
        <a href="${APP_URL}/courses" style="background:#ff63ce;color:white;padding:12px 24px;text-decoration:none;display:inline-block;margin-top:16px;">
          Voir les formations →
        </a>
        <p style="color:#888;font-size:12px;margin-top:32px;">Content Level Up Academy · parysbatonda.com</p>
      </div>
    `,
  });
}

export async function sendCourseEnrollmentEmail(
  to: string,
  name: string,
  courseTitle: string,
  courseSlug: string,
) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Inscription confirmée — ${courseTitle}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#111;">Inscription confirmée ✓</h2>
        <p>Bonjour ${name},</p>
        <p>Tu es maintenant inscrite à la formation <strong>${courseTitle}</strong>.</p>
        <a href="${APP_URL}/dashboard" style="background:#ff63ce;color:white;padding:12px 24px;text-decoration:none;display:inline-block;margin-top:16px;">
          Accéder à ma formation →
        </a>
        <p style="color:#888;font-size:12px;margin-top:32px;">Content Level Up Academy · parysbatonda.com</p>
      </div>
    `,
  });
}

export async function sendBookingConfirmedEmail(
  to: string,
  name: string,
  sessionName: string,
  startDatetime: Date,
  duration: number,
  zoomUrl?: string | null,
) {
  const dateStr = startDatetime.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeStr = startDatetime.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Session confirmée — ${sessionName}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#111;">Session confirmée ✓</h2>
        <p>Bonjour ${name},</p>
        <p>Votre session <strong>${sessionName}</strong> est confirmée.</p>
        <table style="border-collapse:collapse;width:100%;margin:16px 0;">
          <tr><td style="padding:8px;color:#888;border-bottom:1px solid #f0e0ec;">Date</td>
              <td style="padding:8px;border-bottom:1px solid #f0e0ec;">${dateStr} à ${timeStr}</td></tr>
          <tr><td style="padding:8px;color:#888;">Durée</td>
              <td style="padding:8px;">${duration} minutes</td></tr>
        </table>
        ${zoomUrl ? `<a href="${zoomUrl}" style="background:#ff63ce;color:white;padding:12px 24px;text-decoration:none;display:inline-block;margin-top:8px;">Rejoindre la session →</a>` : ""}
        <p style="color:#888;font-size:12px;margin-top:32px;">Content Level Up Academy · parysbatonda.com</p>
      </div>
    `,
  });
}

export async function sendBookingReminderEmail(
  to: string,
  name: string,
  sessionName: string,
  startDatetime: Date,
  zoomUrl?: string | null,
) {
  const timeStr = startDatetime.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Rappel — Votre session commence demain`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#111;">Votre session est demain ⏰</h2>
        <p>Bonjour ${name},</p>
        <p>Rappel : votre session <strong>${sessionName}</strong> commence demain à <strong>${timeStr}</strong>.</p>
        ${zoomUrl ? `<a href="${zoomUrl}" style="background:#ff63ce;color:white;padding:12px 24px;text-decoration:none;display:inline-block;margin-top:16px;">Rejoindre la session →</a>` : "<p>Le lien de visio vous sera envoyé bientôt.</p>"}
        <p style="color:#888;font-size:12px;margin-top:32px;">Content Level Up Academy · parysbatonda.com</p>
      </div>
    `,
  });
}
