// lib/actions/auth.actions.ts
"use server";

import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { randomBytes, createHash } from "crypto";
import { z } from "zod";
import {
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendGoogleAccountResetAttemptEmail,
} from "@/lib/services/email.service";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function issueAndSendVerificationEmail(
  userId: string,
  email: string,
  name: string,
) {
  // Clear any previous outstanding tokens so only the latest link works
  await prisma.emailVerificationToken.deleteMany({ where: { user_id: userId } });

  const rawToken = randomBytes(32).toString("hex");
  await prisma.emailVerificationToken.create({
    data: {
      user_id: userId,
      token_hash: hashToken(rawToken),
      expires_at: new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS),
    },
  });

  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${rawToken}`;

  try {
    await sendVerificationEmail(email, name, verifyUrl);
  } catch (err) {
    console.error("Failed to send verification email:", err);
  }
}

const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  country: z.string().optional(),
  timezone: z.string().optional(),
});

export async function register(formData: z.infer<typeof RegisterSchema>) {
  const parsed = RegisterSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, email, password, country, timezone } = parsed.data;

  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists" };
  }

  const password_hash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password_hash,
      country: country || null,
      timezone: timezone || "Africa/Douala",
    },
  });

  try {
    await sendWelcomeEmail(email, name);
  } catch (err) {
    console.error("Failed to send welcome email:", err);
  }

  await issueAndSendVerificationEmail(user.id, user.email, user.name || "toi");

  // No auto sign-in — the account must be verified via email first.
  return { success: true };
}

export async function loginWithCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.password_hash) {
    return { error: "Email ou mot de passe incorrect." };
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) {
    return { error: "Email ou mot de passe incorrect." };
  }

  if (!user.emailVerified) {
    return {
      error: "Merci de confirmer ton email avant de te connecter.",
      code: "EMAIL_NOT_VERIFIED" as const,
    };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email ou mot de passe incorrect." };
    }
    throw error;
  }
}

export async function loginWithGoogle() {
  await signIn("google", { redirectTo: "/" });
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    if (!user.password_hash) {
      try {
        await sendGoogleAccountResetAttemptEmail(user.email, user.name || "toi");
      } catch (err) {
        console.error("Failed to send Google-account reset notice:", err);
      }
    } else {
      // Clear any previous outstanding tokens so only the latest link works
      await prisma.passwordResetToken.deleteMany({ where: { user_id: user.id } });

      const rawToken = randomBytes(32).toString("hex");
      await prisma.passwordResetToken.create({
        data: {
          user_id: user.id,
          token_hash: hashToken(rawToken),
          expires_at: new Date(Date.now() + RESET_TOKEN_TTL_MS),
        },
      });

      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${rawToken}`;

      try {
        await sendPasswordResetEmail(user.email, user.name || "toi", resetUrl);
      } catch (err) {
        console.error("Failed to send password reset email:", err);
      }
    }
  }

  // Always return the same response whether or not the account exists,
  // so this endpoint can't be used to enumerate registered emails.
  return {
    success: true,
    message:
      "Si un compte existe avec cet email, un lien de réinitialisation vient d'être envoyé.",
  };
}

const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Token manquant"),
  newPassword: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

export async function resetPassword(
  formData: z.infer<typeof ResetPasswordSchema>,
) {
  const parsed = ResetPasswordSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const tokenHash = hashToken(parsed.data.token);

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token_hash: tokenHash },
  });

  if (!resetToken || resetToken.used_at || resetToken.expires_at < new Date()) {
    return { error: "Ce lien de réinitialisation est invalide ou a expiré." };
  }

  const password_hash = await bcrypt.hash(parsed.data.newPassword, 12);

  const user = await prisma.user.update({
    where: { id: resetToken.user_id },
    data: { password_hash },
  });

  await prisma.passwordResetToken.update({
    where: { id: resetToken.id },
    data: { used_at: new Date() },
  });

  // Invalidate any other outstanding tokens for this user
  await prisma.passwordResetToken.deleteMany({
    where: { user_id: resetToken.user_id, id: { not: resetToken.id } },
  });

  // Auto sign-in after a successful reset, same convenience as registration
  await signIn("credentials", {
    email: user.email,
    password: parsed.data.newPassword,
    redirectTo: "/",
  });
}

export async function verifyEmail(token: string) {
  const tokenHash = hashToken(token);

  const verificationToken = await prisma.emailVerificationToken.findUnique({
    where: { token_hash: tokenHash },
  });

  if (
    !verificationToken ||
    verificationToken.used_at ||
    verificationToken.expires_at < new Date()
  ) {
    return { error: "Ce lien de confirmation est invalide ou a expiré." };
  }

  await prisma.user.update({
    where: { id: verificationToken.user_id },
    data: { emailVerified: new Date() },
  });

  await prisma.emailVerificationToken.update({
    where: { id: verificationToken.id },
    data: { used_at: new Date() },
  });

  // Invalidate any other outstanding tokens for this user
  await prisma.emailVerificationToken.deleteMany({
    where: {
      user_id: verificationToken.user_id,
      id: { not: verificationToken.id },
    },
  });

  return { success: true };
}

export async function resendVerificationEmail(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (user && user.password_hash && !user.emailVerified) {
    // Simple abuse guard — don't resend if one was just issued
    const recent = await prisma.emailVerificationToken.findFirst({
      where: {
        user_id: user.id,
        created_at: { gt: new Date(Date.now() - 60_000) },
      },
    });

    if (!recent) {
      await issueAndSendVerificationEmail(user.id, user.email, user.name || "toi");
    }
  }

  // Same generic response regardless of account state — avoids leaking
  // whether the email is registered or already verified.
  return {
    success: true,
    message:
      "Si un compte non vérifié existe avec cet email, un nouveau lien vient d'être envoyé.",
  };
}
