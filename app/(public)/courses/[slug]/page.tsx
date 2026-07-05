// app/(public)/courses/[slug]/page.tsx
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { notFound } from "next/navigation"
import { getUserGeoContext } from "@/lib/actions/geo.actions"
import Image from "next/image"
import { formatPrice } from "@/lib/utils"
import EnrollButton from "../_components/EnrollButton"
import CourseCurriculum from "../_components/CourseCurriculum"
import { Check, Sparkles } from "lucide-react"

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const [course, session, geo] = await Promise.all([
    prisma.course.findUnique({
      where: { slug, status: "PUBLISHED" },
      include: {
        modules: {
          orderBy: { order_index: "asc" },
          include: {
            lessons: {
              orderBy: { order_index: "asc" },
            },
          },
        },
        _count: { select: { enrollments: true } },
      },
    }),
    auth(),
    getUserGeoContext(),
  ])

  if (!course) notFound()

  // Check if user is already enrolled
  let isEnrolled = false
  if (session?.user?.id) {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        user_id_course_id: {
          user_id: session.user.id,
          course_id: course.id,
        },
      },
    })
    isEnrolled = !!enrollment
  }

  const price =
    geo.currency === "XAF"
      ? course.price_xaf
      : geo.currency === "EUR"
      ? course.price_eur
      : course.price_usd

  const firstLessonId = course.modules[0]?.lessons?.[0]?.id ?? null

  const totalLessons = course.modules.reduce(
    (sum, m) => sum + m.lessons.length,
    0
  )

  const totalDuration = course.modules.reduce(
    (sum, m) =>
      sum + m.lessons.reduce((s, l) => s + (l.duration_seconds || 0), 0),
    0
  )

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h${minutes > 0 ? ` ${minutes}min` : ""}`
    return `${minutes}min`
  }

  return (
    <div className="min-h-screen bg-[#fcf8f8]">
      {/* Hero */}
      <div className="bg-white border-b pt-24 border-[#f0e0ec]">
        <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="flex items-center gap-1.5 text-xs tracking-[4px] uppercase text-[#ff63ce] mb-4">
              Formation
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-medium text-gray-900 leading-tight">
              {course.title}
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed mb-8">
              {course.description}
            </p>

            {/* Stats */}
            <div className="flex gap-8 pb-8 border-b border-[#f0e0ec]">
              {[
                { value: course.modules.length, label: "Modules" },
                { value: totalLessons, label: "Leçons" },
                {
                  value: totalDuration > 0 ? formatDuration(totalDuration) : "—",
                  label: "Durée totale",
                },
                { value: course._count.enrollments, label: "Étudiantes" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="font-serif text-2xl font-medium text-gray-900">
                    {stat.value}
                  </div>
                  <div className="text-xs tracking-[2px] uppercase text-gray-500 mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Price + Enroll */}
            <div className="pt-8 flex items-center gap-6">
              <div>
                {isEnrolled ? (
                  <div className="flex items-center gap-2 text-sm font-medium text-[#ff63ce]">
                     Formation débloquée
                  </div>
                ) : (
                  <>
                    <div className="font-serif text-4xl font-medium text-gray-900">
                      {course.is_free
                        ? "Gratuit"
                        : formatPrice(price, geo.currency)}
                    </div>
                    {!course.is_free && geo.currency !== "XAF" && (
                      <div className="text-xs text-gray-500 mt-1">
                        ≈ {formatPrice(course.price_xaf, "XAF")}
                      </div>
                    )}
                  </>
                )}
              </div>

              <EnrollButton
                courseId={course.id}
                courseSlug={course.slug}
                price={price}
                currency={geo.currency}
                isFree={course.is_free}
                isEnrolled={isEnrolled}
                isLoggedIn={!!session}
                canUseMobileMoney={geo.mobileMoney}
                country={geo.country}
                firstLessonId={firstLessonId}
              />
            </div>
          </div>

          {/* Thumbnail */}
          <div className="relative aspect-video bg-[#fdf0fa] border border-[#f0e0ec] overflow-hidden">
            {course.thumbnail_url ? (
              <Image
                src={course.thumbnail_url}
                alt={course.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-serif text-8xl text-[#ff63ce] opacity-20 italic">
                  P
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Curriculum */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-12">
          <div className="md:col-span-2">
            <p className="flex items-center gap-1.5 text-xs tracking-[4px] uppercase text-[#ff63ce] mb-4">
               Programme
            </p>
            <h2 className="font-serif text-3xl font-medium text-gray-900 mb-8">
              Ce que tu vas apprendre
            </h2>
            <CourseCurriculum
              modules={course.modules}
              isEnrolled={isEnrolled}
            />
          </div>

          {/* Sticky sidebar */}
          <div className="hidden md:block">
            <div className="sticky top-8 bg-white border border-[#f0e0ec] p-6 space-y-4">
              <p className="text-xs tracking-[3px] uppercase text-gray-500">
                Cette formation inclut
              </p>
              {[
                `${course.modules.length} modules structurés`,
                `${totalLessons} leçons vidéo`,
                totalDuration > 0
                  ? `${formatDuration(totalDuration)} de contenu`
                  : null,
                "Accès à vie",
                "Discussion sous chaque leçon",
              ]
                .filter(Boolean)
                .map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm text-gray-600"
                  >
                    <Check size={16} className="text-[#ff63ce]" />
                    {item}
                  </div>
                ))}

              <div className="pt-4 border-t border-[#f0e0ec]">
                {isEnrolled ? (
                  <div className="flex items-center gap-2 text-sm font-medium text-[#ff63ce] mb-4">
                    <Check size={16} /> Formation débloquée
                  </div>
                ) : (
                  <div className="font-serif text-3xl font-medium text-gray-900 mb-4">
                    {course.is_free
                      ? "Gratuit"
                      : formatPrice(price, geo.currency)}
                  </div>
                )}
                <EnrollButton
                  courseId={course.id}
                  courseSlug={course.slug}
                  price={price}
                  currency={geo.currency}
                  isFree={course.is_free}
                  isEnrolled={isEnrolled}
                  isLoggedIn={!!session}
                  canUseMobileMoney={geo.mobileMoney}
                  country={geo.country}
                  firstLessonId={firstLessonId}
                  fullWidth
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}