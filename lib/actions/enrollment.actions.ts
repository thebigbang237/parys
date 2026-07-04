// lib/actions/enrollment.actions.ts
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function enrollFree(courseId: string) {
  const session = await auth();
  if (!session) redirect("/login");

  const course = await prisma.course.findUnique({
    where: { id: courseId, is_free: true, status: "PUBLISHED" },
  });

  if (!course) {
    return { error: "Course not found or not free" };
  }

  await prisma.enrollment.upsert({
    where: {
      user_id_course_id: {
        user_id: session.user.id,
        course_id: courseId,
      },
    },
    create: {
      user_id: session.user.id,
      course_id: courseId,
    },
    update: {},
  });

  redirect(`/checkout/success?productType=COURSE&productId=${courseId}`);
}
