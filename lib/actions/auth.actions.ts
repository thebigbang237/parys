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
  sendPasswordResetEmail,
  sendGoogleAccountResetAttemptEmail,
} from "@/lib/services/email.service";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
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

  await prisma.user.create({
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

  // Auto sign in after registration
  await signIn("credentials", {
    email,
    password,
    redirectTo: "/dashboard",
  });
}

export async function loginWithCredentials(email: string, password: string) {
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password" };
    }
    throw error;
  }
}

export async function loginWithGoogle() {
  await signIn("google", { redirectTo: "/dashboard" });
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
    redirectTo: "/dashboard",
  });
}
