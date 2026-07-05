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
  meetUrl?: string | null,
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
        ${meetUrl ? `<a href="${meetUrl}" style="background:#ff63ce;color:white;padding:12px 24px;text-decoration:none;display:inline-block;margin-top:8px;">Rejoindre la session →</a>` : ""}
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
  meetUrl?: string | null,
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
        ${meetUrl ? `<a href="${meetUrl}" style="background:#ff63ce;color:white;padding:12px 24px;text-decoration:none;display:inline-block;margin-top:16px;">Rejoindre la session →</a>` : "<p>Le lien de visio vous sera envoyé bientôt.</p>"}
        <p style="color:#888;font-size:12px;margin-top:32px;">Content Level Up Academy · parysbatonda.com</p>
      </div>
    `,
  });
}

export async function sendBookingCancelledEmail(
  to: string,
  name: string,
  sessionName: string,
  startDatetime: Date,
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
    subject: `Session annulée — ${sessionName}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#111;">Votre session a été annulée</h2>
        <p>Bonjour ${name},</p>
        <p>Votre session <strong>${sessionName}</strong> prévue le ${dateStr} à ${timeStr} a été annulée.</p>
        <p>Si tu penses qu'il s'agit d'une erreur ou souhaites reprogrammer, réponds simplement à cet email.</p>
        <p style="color:#888;font-size:12px;margin-top:32px;">Content Level Up Academy · parysbatonda.com</p>
      </div>
    `,
  });
}

export async function sendBookingCompletedEmail(
  to: string,
  name: string,
  sessionName: string,
) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Merci pour votre session — ${sessionName}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#111;">Session terminée ✓</h2>
        <p>Bonjour ${name},</p>
        <p>Ta session <strong>${sessionName}</strong> est maintenant marquée comme terminée. Merci de ta confiance !</p>
        <a href="${APP_URL}/dashboard" style="background:#ff63ce;color:white;padding:12px 24px;text-decoration:none;display:inline-block;margin-top:16px;">
          Retrouver mon espace →
        </a>
        <p style="color:#888;font-size:12px;margin-top:32px;">Content Level Up Academy · parysbatonda.com</p>
      </div>
    `,
  });
}

// ── Admin notifications ────────────────────────────────

export async function sendAdminNewBookingEmail(params: {
  studentName: string;
  studentEmail: string;
  sessionName: string;
  startDatetime: Date;
  duration: number;
  intakeGoal?: string | null;
  intakeChallenges?: string | null;
  amount: number;
  currency: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL!;

  const dateStr = params.startDatetime.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeStr = params.startDatetime.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  await resend.emails.send({
    from: FROM,
    to: adminEmail,
    subject: `📅 Nouvelle réservation — ${params.sessionName}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#111;">Nouvelle réservation coaching 📅</h2>

        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr style="background:#fdf0fa;">
            <td style="padding:10px;color:#888;border-bottom:1px solid #f0e0ec;width:35%;">Étudiante</td>
            <td style="padding:10px;border-bottom:1px solid #f0e0ec;font-weight:bold;">
              ${params.studentName}
            </td>
          </tr>
          <tr>
            <td style="padding:10px;color:#888;border-bottom:1px solid #f0e0ec;">Email</td>
            <td style="padding:10px;border-bottom:1px solid #f0e0ec;">
              <a href="mailto:${params.studentEmail}">${params.studentEmail}</a>
            </td>
          </tr>
          <tr style="background:#fdf0fa;">
            <td style="padding:10px;color:#888;border-bottom:1px solid #f0e0ec;">Session</td>
            <td style="padding:10px;border-bottom:1px solid #f0e0ec;">${params.sessionName}</td>
          </tr>
          <tr>
            <td style="padding:10px;color:#888;border-bottom:1px solid #f0e0ec;">Date</td>
            <td style="padding:10px;border-bottom:1px solid #f0e0ec;">${dateStr} à ${timeStr}</td>
          </tr>
          <tr style="background:#fdf0fa;">
            <td style="padding:10px;color:#888;border-bottom:1px solid #f0e0ec;">Durée</td>
            <td style="padding:10px;border-bottom:1px solid #f0e0ec;">${params.duration} minutes</td>
          </tr>
          <tr>
            <td style="padding:10px;color:#888;border-bottom:1px solid #f0e0ec;">Montant</td>
            <td style="padding:10px;border-bottom:1px solid #f0e0ec;color:#ff63ce;font-weight:bold;">
              ${new Intl.NumberFormat("en-US").format(Math.round(params.amount))} ${params.currency}
            </td>
          </tr>
          ${
            params.intakeGoal
              ? `
          <tr style="background:#fdf0fa;">
            <td style="padding:10px;color:#888;border-bottom:1px solid #f0e0ec;">Objectif</td>
            <td style="padding:10px;border-bottom:1px solid #f0e0ec;">${params.intakeGoal}</td>
          </tr>`
              : ""
          }
          ${
            params.intakeChallenges
              ? `
          <tr>
            <td style="padding:10px;color:#888;">Défis</td>
            <td style="padding:10px;">${params.intakeChallenges}</td>
          </tr>`
              : ""
          }
        </table>

        <a href="${APP_URL}/admin/coaching"
           style="background:#111;color:white;padding:12px 24px;text-decoration:none;display:inline-block;margin-top:8px;">
          Confirmer la session →
        </a>

        <p style="color:#888;font-size:12px;margin-top:32px;">
          Content Level Up Academy · parysbatonda.com
        </p>
      </div>
    `,
  });
}

export async function sendAdminNewEnrollmentEmail(params: {
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  amount: number;
  currency: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL!;

  await resend.emails.send({
    from: FROM,
    to: adminEmail,
    subject: `💰 Nouvelle inscription — ${params.courseTitle}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#111;">Nouvelle inscription formation 💰</h2>

        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr style="background:#fdf0fa;">
            <td style="padding:10px;color:#888;border-bottom:1px solid #f0e0ec;width:35%;">Étudiante</td>
            <td style="padding:10px;border-bottom:1px solid #f0e0ec;font-weight:bold;">
              ${params.studentName}
            </td>
          </tr>
          <tr>
            <td style="padding:10px;color:#888;border-bottom:1px solid #f0e0ec;">Email</td>
            <td style="padding:10px;border-bottom:1px solid #f0e0ec;">
              <a href="mailto:${params.studentEmail}">${params.studentEmail}</a>
            </td>
          </tr>
          <tr style="background:#fdf0fa;">
            <td style="padding:10px;color:#888;border-bottom:1px solid #f0e0ec;">Formation</td>
            <td style="padding:10px;border-bottom:1px solid #f0e0ec;">${params.courseTitle}</td>
          </tr>
          <tr>
            <td style="padding:10px;color:#888;">Montant encaissé</td>
            <td style="padding:10px;color:#ff63ce;font-weight:bold;">
              ${new Intl.NumberFormat("en-US").format(Math.round(params.amount))} ${params.currency}
            </td>
          </tr>
        </table>

        <a href="${APP_URL}/admin/students"
           style="background:#111;color:white;padding:12px 24px;text-decoration:none;display:inline-block;margin-top:8px;">
          Voir les étudiantes →
        </a>

        <p style="color:#888;font-size:12px;margin-top:32px;">
          Content Level Up Academy · parysbatonda.com
        </p>
      </div>
    `,
  });
}
