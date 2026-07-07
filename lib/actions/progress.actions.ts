// lib/actions/progress.actions.ts
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function markLessonComplete(lessonId: string, courseSlug: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  await prisma.lessonProgress.upsert({
    where: {
      user_id_lesson_id: {
        user_id: session.user.id,
        lesson_id: lessonId,
      },
    },
    create: {
      user_id: session.user.id,
      lesson_id: lessonId,
    },
    update: {},
  });

  revalidatePath(`/learn/${lessonId}`);
  revalidatePath(`/courses/${courseSlug}`);
  revalidatePath("/dashboard");
}

export async function markLessonIncomplete(lessonId: string, courseSlug: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  await prisma.lessonProgress.deleteMany({
    where: {
      user_id: session.user.id,
      lesson_id: lessonId,
    },
  });

  revalidatePath(`/learn/${lessonId}`);
  revalidatePath(`/courses/${courseSlug}`);
  revalidatePath("/dashboard");
}
