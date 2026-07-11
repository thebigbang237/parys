// app/(admin)/admin/courses/[id]/page.tsx
// Replace the entire file with this:

import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { publishCourse, unpublishCourse } from "@/lib/actions/course.actions"
import CourseModules from "./_components/CourseModules"
import CourseForm from "./_components/CourseForm"
import DeleteCourseButton from "./_components/DeleteCourseButton"

export default async function AdminCourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const course = await prisma.course.findUnique({
    where: { id },
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
  })

  if (!course) notFound()

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-8">
        <div>
          <p className="text-xs tracking-[3px] uppercase text-[#a61968] mb-1">
            Formations / {course.title}
          </p>
          <h1 className="text-2xl font-serif font-medium">{course.title}</h1>
          <div className="flex items-center gap-4 mt-2">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              course.status === "PUBLISHED"
                ? "bg-[#f9eff4] text-[#a61968]"
                : "bg-gray-100 text-gray-500"
            }`}>
              {course.status === "PUBLISHED" ? "Publié" : "Brouillon"}
            </span>
            <span className="text-xs text-gray-500">
              {course._count.enrollments} inscription(s)
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          {course.status === "DRAFT" ? (
            <form action={publishCourse.bind(null, course.id)}>
              <button className="bg-[#a61968] text-white px-5 py-2.5 text-xs tracking-[2px] uppercase hover:bg-[#172A39] transition-colors">
                Publier
              </button>
            </form>
          ) : (
            <form action={unpublishCourse.bind(null, course.id)}>
              <button className="bg-gray-600 text-white px-5 py-2.5 text-xs tracking-[2px] uppercase hover:bg-gray-700 transition-colors">
                Dépublier
              </button>
            </form>
          )}

          {/* Client component — needs confirm() dialog */}
          <DeleteCourseButton courseId={course.id} courseTitle={course.title} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CourseModules course={course} />
        </div>
        <div>
          <CourseForm course={course} />
        </div>
      </div>
    </div>
  )
}