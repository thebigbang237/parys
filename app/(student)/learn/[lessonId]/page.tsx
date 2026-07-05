// app/(student)/learn/[lessonId]/page.tsx
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSignedPlaybackToken } from "@/lib/services/stream.service";
import LessonPlayer from "./_components/LessonPlayer";
import LessonSidebar from "./_components/LessonSidebar";
import CommentsSection from "./_components/CommentsSection";

export default async function LearnPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const session = await auth();
  if (!session) redirect("/login");

  // Fetch lesson with full course context
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: {
          course: {
            include: {
              modules: {
                orderBy: { order_index: "asc" },
                include: {
                  lessons: {
                    orderBy: { order_index: "asc" },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!lesson) notFound();

  const course = lesson.module.course;

  // Check enrollment (unless preview lesson)
  if (!lesson.is_preview) {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        user_id_course_id: {
          user_id: session.user.id,
          course_id: course.id,
        },
      },
    });

    if (!enrollment) {
      redirect(`/courses/${course.slug}`);
    }
  }

  // Get signed video token if video exists
  let videoToken: string | null = null;
  if (lesson.cloudflare_video_id) {
    videoToken = await getSignedPlaybackToken(lesson.cloudflare_video_id);
  }

  // Fetch comments
  const comments = await prisma.comment.findMany({
    where: { lesson_id: lessonId, status: "ACTIVE", parent_id: null },
    include: {
      user: { select: { id: true, name: true, image: true } },
      replies: {
        where: { status: "ACTIVE" },
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
        orderBy: { created_at: "asc" },
      },
    },
    orderBy: { created_at: "desc" },
  });

  const serializedComments = comments.map((c) => ({
    ...c,
    created_at: c.created_at,
    replies: c.replies.map((r) => ({
      id: r.id,
      content: r.content,
      created_at: r.created_at,
      user: r.user,
    })),
  }));

  return (
    <div className="min-h-screen bg-[#111] flex flex-col">
      {/* Top bar */}
      <div className="bg-[#111] border-b border-white/10 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a
            href="/dashboard"
            className="text-white/50 hover:text-white text-xs tracking-[2px] uppercase transition-colors"
          >
            ← Mon espace
          </a>
          <span className="text-white/20">|</span>
          <span className="text-white/70 text-sm font-serif">
            {course.title}
          </span>
        </div>
        <span className="text-white/40 text-xs">
          {lesson.module.title} · {lesson.title}
        </span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <LessonSidebar
          course={course}
          currentLessonId={lessonId}
          userId={session.user.id}
        />

        {/* Main content */}
        <div className="flex-1 overflow-y-auto">
          {/* Video player */}
          <div className="bg-black">
            {videoToken ? (
              <LessonPlayer
                videoToken={videoToken}
                lessonTitle={lesson.title}
              />
            ) : (
              <div className="aspect-video flex items-center justify-center">
                <p className="text-white/40 text-sm">
                  Vidéo bientôt disponible
                </p>
              </div>
            )}
          </div>

          {/* Lesson info + comments */}
          <div className="bg-white max-w-4xl mx-auto px-8 py-10 space-y-10">
            <div>
              <p className="text-xs tracking-[3px] uppercase text-[#ff63ce] mb-2">
                {lesson.module.title}
              </p>
              <h1 className="font-serif text-3xl font-medium text-gray-900">
                {lesson.title}
              </h1>
            </div>

            <CommentsSection
              lessonId={lessonId}
              initialComments={serializedComments}
              currentUser={{
                id: session.user.id,
                name: session.user.name || "Anonyme",
                image: session.user.image || null,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
