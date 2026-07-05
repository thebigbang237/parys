// app/(public)/courses/page.tsx
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { getUserGeoContext } from "@/lib/actions/geo.actions"
import CourseCard from "./_components/CourseCard"
import { Sparkles } from "lucide-react"

export default async function CoursesPage() {
  const [courses, geo, session] = await Promise.all([
    prisma.course.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { created_at: "desc" },
      include: {
        _count: {
          select: { enrollments: true, modules: true },
        },
        modules: {
          include: {
            _count: { select: { lessons: true } },
          },
        },
      },
    }),
    getUserGeoContext(),
    auth(),
  ])

  let enrolledCourseIds = new Set<string>()
  if (session?.user?.id) {
    const enrollments = await prisma.enrollment.findMany({
      where: { user_id: session.user.id },
      select: { course_id: true },
    })
    enrolledCourseIds = new Set(enrollments.map((e) => e.course_id))
  }

  const totalLessons = (course: typeof courses[0]) =>
    course.modules.reduce((sum, m) => sum + m._count.lessons, 0)

  return (
    <div className="min-h-screen bg-[#fcf8f8] ">
      {/* Header */}
      <div className="bg-white pt-24 border-b border-[#f0e0ec]">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <p className="flex items-center gap-1.5 text-xs tracking-[4px] uppercase text-[#ff63ce] mb-3">
            <Sparkles size={12} /> Formations
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-medium text-gray-900 mb-4">
            Toutes les formations
          </h1>
          <p className="text-gray-500 text-lg max-w-xl">
            Des programmes premium pour développer tes compétences et
            propulser ta carrière créative.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        {courses.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-500">Aucune formation disponible pour l'instant.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                currency={geo.currency}
                lessonsCount={totalLessons(course)}
                isEnrolled={enrolledCourseIds.has(course.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}