// lib/actions/user.actions.ts
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";

const UpdateProfileSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  image: z.string().optional(),
});

export async function updateProfile(formData: z.infer<typeof UpdateProfileSchema>) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const parsed = UpdateProfileSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: parsed.data.name,
      image: parsed.data.image || null,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/settings");

  return { success: true };
}

const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mot de passe actuel requis"),
    newPassword: z.string().min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères"),
  });

export async function changePassword(formData: z.infer<typeof ChangePasswordSchema>) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const parsed = ChangePasswordSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password_hash: true },
  });

  if (!user?.password_hash) {
    return { error: "Ce compte n'a pas de mot de passe à modifier" };
  }

  const isValid = await bcrypt.compare(parsed.data.currentPassword, user.password_hash);
  if (!isValid) {
    return { error: "Mot de passe actuel incorrect" };
  }

  const password_hash = await bcrypt.hash(parsed.data.newPassword, 12);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { password_hash },
  });

  return { success: true };
}
