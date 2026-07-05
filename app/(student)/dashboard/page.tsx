// app/(student)/dashboard/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Sparkles } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [enrollments, bookings] = await Promise.all([
    prisma.enrollment.findMany({
      where: { user_id: session.user.id },
      include: {
        course: {
          include: {
            modules: {
              orderBy: { order_index: "asc" },
              include: {
                _count: { select: { lessons: true } },
                lessons: {
                  orderBy: { order_index: "asc" },
                  select: { id: true },
                  take: 1,
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
        user_id: session.user.id,
        status: { in: ["PENDING", "CONFIRMED"] },
        start_datetime: { gte: new Date() },
      },
      include: { session_type: true },
      orderBy: { start_datetime: "asc" },
      take: 5,
    }),
  ]);

  const firstName = session.user.name?.split(" ")[0] || "toi";

  const totalLessons = (enrollment: (typeof enrollments)[0]) =>
    enrollment.course.modules.reduce((sum, m) => sum + m._count.lessons, 0);

  return (
    <div className="min-h-screen bg-[#fcf8f8]">
      {/* Header */}
      <div className="bg-white border-b border-[#f0e0ec] px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <p className="flex items-center gap-1.5 text-xs tracking-[4px] uppercase text-[#ff63ce] mb-2">
            <Sparkles size={12} /> Mon espace
          </p>
          <h1 className="font-serif text-3xl font-medium text-gray-900">
            Bonjour, {firstName} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {enrollments.length} formation{enrollments.length !== 1 ? "s" : ""}{" "}
            · {bookings.length} session{bookings.length !== 1 ? "s" : ""} à
            venir
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">
        {/* Enrolled courses */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-serif text-2xl font-medium text-gray-900">
              Mes formations
            </h2>
            <Link
              href="/courses"
              className="text-xs tracking-[2px] uppercase text-[#ff63ce] hover:underline"
            >
              Découvrir plus →
            </Link>
          </div>

          {enrollments.length === 0 ? (
            <div className="border border-dashed border-[#f0e0ec] bg-white p-16 text-center">
              <p className="text-gray-500 text-sm mb-4">
                Tu n'es inscrite à aucune formation pour l'instant.
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
              {enrollments.map((enrollment) => {
                const course = enrollment.course;
                const lessons = totalLessons(enrollment);
                const firstLesson = course.modules[0]?.lessons?.[0];

                return (
                  <div
                    key={enrollment.id}
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
                      <h3 className="font-serif text-xl font-medium text-gray-900 mb-2">
                        {course.title}
                      </h3>
                      <div className="flex gap-4 text-xs text-gray-500 mb-6">
                        <span>{course.modules.length} modules</span>
                        <span>·</span>
                        <span>{lessons} leçons</span>
                        <span>·</span>
                        <span>
                          Inscrite le{" "}
                          {new Date(enrollment.enrolled_at).toLocaleDateString(
                            "fr-FR",
                          )}
                        </span>
                      </div>

                      {firstLesson ? (
                        <Link
                          href={`/learn/${firstLesson.id}`}
                          className="w-full bg-[#ff63ce] text-white py-3 text-xs tracking-[2px] uppercase hover:bg-[#111] transition-colors text-center block"
                        >
                          Continuer la formation →
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
        {bookings.length > 0 && (
          <section>
            <h2 className="font-serif text-2xl font-medium text-gray-900 mb-6">
              Sessions à venir
            </h2>
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white border border-[#f0e0ec] px-6 py-4 flex items-center justify-between"
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
