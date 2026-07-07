// app/(student)/(shell)/dashboard/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, TrendingUp, Clock, CheckCircle2 } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const userId = session.user.id;

  const [enrollments, upcomingBookings, pastBookings, lessonsCompletedTotal] =
    await Promise.all([
      prisma.enrollment.findMany({
        where: { user_id: userId },
        include: {
          course: {
            include: {
              modules: {
                orderBy: { order_index: "asc" },
                include: {
                  lessons: {
                    orderBy: { order_index: "asc" },
                    select: { id: true },
                  },
                },
              },
            },
          },
        },
        orderBy: { enrolled_at: "desc" },
      }),
      prisma.coachingBooking.findMany({
        where: {
          user_id: userId,
          status: { in: ["PENDING", "CONFIRMED"] },
          start_datetime: { gte: new Date() },
        },
        include: { session_type: true },
        orderBy: { start_datetime: "asc" },
        take: 5,
      }),
      prisma.coachingBooking.findMany({
        where: {
          user_id: userId,
          OR: [
            { status: "COMPLETED" },
            { status: "CONFIRMED", start_datetime: { lt: new Date() } },
          ],
        },
        include: { session_type: { select: { duration: true } } },
      }),
      prisma.lessonProgress.count({ where: { user_id: userId } }),
    ]);

  const allLessonIds = enrollments.flatMap((e) =>
    e.course.modules.flatMap((m) => m.lessons.map((l) => l.id)),
  );

  const progress =
    allLessonIds.length > 0
      ? await prisma.lessonProgress.findMany({
          where: { user_id: userId, lesson_id: { in: allLessonIds } },
          select: { lesson_id: true },
        })
      : [];
  const completedSet = new Set(progress.map((p) => p.lesson_id));

  const enrollmentStats = enrollments.map((enrollment) => {
    const lessonIdsOrdered = enrollment.course.modules.flatMap((m) =>
      m.lessons.map((l) => l.id),
    );
    const totalLessons = lessonIdsOrdered.length;
    const completedCount = lessonIdsOrdered.filter((id) =>
      completedSet.has(id),
    ).length;
    const progressPct =
      totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
    const resumeLessonId =
      lessonIdsOrdered.find((id) => !completedSet.has(id)) ??
      lessonIdsOrdered[lessonIdsOrdered.length - 1] ??
      null;
    const isCompleted = totalLessons > 0 && completedCount === totalLessons;

    return {
      enrollment,
      totalLessons,
      completedCount,
      progressPct,
      resumeLessonId,
      isCompleted,
    };
  });

  const coursesCompleted = enrollmentStats.filter((s) => s.isCompleted).length;
  const coachingMinutes = pastBookings.reduce(
    (sum, b) => sum + b.session_type.duration,
    0,
  );
  const coachingHours = Math.round((coachingMinutes / 60) * 10) / 10;

  const firstName = session.user.name?.split(" ")[0] || "toi";

  return (
    <div className="min-h-screen bg-[#fcf8f8]">
      {/* Header */}
      <div className="bg-white border-b border-[#f0e0ec] px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <p className="flex items-center gap-1.5 text-xs tracking-[4px] uppercase text-[#ff63ce] mb-2">
            Mon espace
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-gray-900">
            Bonjour, {firstName} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Prête à poursuivre ta progression aujourd&apos;hui ?
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">
        {/* Stats */}
        <section className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="p-6 bg-white border border-[#f0e0ec] flex flex-col gap-2">
            <span className="text-xs tracking-[2px] uppercase text-gray-500">
              Cours complétés
            </span>
            <span className="font-serif text-3xl sm:text-4xl text-gray-900">
              {coursesCompleted}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-[#ff63ce]">
              <TrendingUp size={13} />
              <span>
                sur {enrollments.length} formation
                {enrollments.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div className="p-6 bg-white border border-[#f0e0ec] flex flex-col gap-2">
            <span className="text-xs tracking-[2px] uppercase text-gray-500">
              Heures de coaching
            </span>
            <span className="font-serif text-3xl sm:text-4xl text-gray-900">
              {coachingHours}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-[#ff63ce]">
              <Clock size={13} />
              <span>
                {upcomingBookings.length} session
                {upcomingBookings.length !== 1 ? "s" : ""} à venir
              </span>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 p-6 bg-[#fdf0fa] border border-[#ff63ce]/20 flex flex-col gap-2">
            <span className="text-xs tracking-[2px] uppercase text-gray-500">
              Leçons terminées
            </span>
            <span className="font-serif text-3xl sm:text-4xl text-gray-900">
              {lessonsCompletedTotal}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-[#ff63ce] font-medium">
              <CheckCircle2 size={13} />
              <span>Continue comme ça</span>
            </div>
          </div>
        </section>

        {/* Enrolled courses */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-serif text-xl sm:text-2xl font-medium text-gray-900">
              Continuer l&apos;apprentissage
            </h2>
            <Link
              href="/courses"
              className="text-xs tracking-[2px] uppercase text-[#ff63ce] hover:underline shrink-0"
            >
              Voir tout →
            </Link>
          </div>

          {enrollmentStats.length === 0 ? (
            <div className="border border-dashed border-[#f0e0ec] bg-white p-16 text-center">
              <p className="text-gray-500 text-sm mb-4">
                Tu n&apos;es inscrite à aucune formation pour l&apos;instant.
              </p>
              <Link
                href="/courses"
                className="bg-[#ff63ce] text-white px-8 py-3 text-xs tracking-[2px] uppercase hover:bg-[#111] transition-colors inline-block"
              >
                Voir les formations
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {enrollmentStats.map((stat) => {
                const course = stat.enrollment.course;

                return (
                  <div
                    key={stat.enrollment.id}
                    className="bg-white border border-[#f0e0ec] hover:border-[#ff63ce] transition-colors group"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-[#fdf0fa] overflow-hidden">
                      {course.thumbnail_url ? (
                        <Image
                          src={course.thumbnail_url}
                          alt={course.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="font-serif text-5xl text-[#ff63ce] opacity-20 italic">
                            P
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <h3 className="font-serif text-lg sm:text-xl font-medium text-gray-900 mb-3">
                        {course.title}
                      </h3>

                      {stat.totalLessons > 0 && (
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>
                              {stat.completedCount}/{stat.totalLessons} leçons
                            </span>
                            <span>{stat.progressPct}%</span>
                          </div>
                          <div className="w-full h-1 bg-[#f0e0ec]">
                            <div
                              className="h-full bg-[#ff63ce]"
                              style={{ width: `${stat.progressPct}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {stat.resumeLessonId ? (
                        <Link
                          href={`/learn/${stat.resumeLessonId}`}
                          className="w-full bg-[#ff63ce] text-white py-3 text-xs tracking-[2px] uppercase hover:bg-[#111] transition-colors text-center block"
                        >
                          {stat.isCompleted
                            ? "Revoir la formation →"
                            : stat.completedCount > 0
                              ? "Continuer la formation →"
                              : "Commencer la formation →"}
                        </Link>
                      ) : (
                        <div className="w-full bg-gray-100 text-gray-500 py-3 text-xs tracking-[2px] uppercase text-center">
                          Contenu bientôt disponible
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Upcoming sessions */}
        {upcomingBookings.length > 0 && (
          <section>
            <h2 className="font-serif text-xl sm:text-2xl font-medium text-gray-900 mb-6">
              Sessions à venir
            </h2>
            <div className="space-y-3">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white border border-[#f0e0ec] px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div>
                    <p className="font-medium text-sm text-gray-900">
                      {booking.session_type.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(booking.start_datetime).toLocaleDateString(
                        "fr-FR",
                        {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        },
                      )}{" "}
                      à{" "}
                      {new Date(booking.start_datetime).toLocaleTimeString(
                        "fr-FR",
                        { hour: "2-digit", minute: "2-digit" },
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        booking.status === "CONFIRMED"
                          ? "bg-[#fdf0fa] text-[#ff63ce]"
                          : "bg-yellow-50 text-yellow-600"
                      }`}
                    >
                      {booking.status === "CONFIRMED"
                        ? "Confirmée"
                        : "En attente"}
                    </span>
                    {booking.meet_join_url && (
                      <a
                        href={booking.meet_join_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#ff63ce] text-white px-4 py-2 text-xs tracking-[1px] uppercase hover:bg-[#111] transition-colors"
                      >
                        Rejoindre
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
