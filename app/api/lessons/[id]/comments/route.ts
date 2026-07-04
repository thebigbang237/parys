// app/api/lessons/[id]/comments/route.ts
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: lessonId } = await params;
  const { content, parent_id } = await req.json();

  if (!content?.trim()) {
    return NextResponse.json({ error: "Content required" }, { status: 400 });
  }

  // Verify lesson exists
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, module: { select: { course_id: true } } },
  });

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  // Verify enrollment (unless preview)
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      user_id_course_id: {
        user_id: session.user.id,
        course_id: lesson.module.course_id,
      },
    },
  });

  if (!enrollment) {
    return NextResponse.json({ error: "Not enrolled" }, { status: 403 });
  }

  const comment = await prisma.comment.create({
    data: {
      lesson_id: lessonId,
      user_id: session.user.id,
      content: content.trim(),
      parent_id: parent_id || null,
      status: "ACTIVE",
    },
    include: {
      user: { select: { id: true, name: true, avatar_url: true } },
    },
  });

  return NextResponse.json(comment);
}
