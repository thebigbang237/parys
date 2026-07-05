// app/(admin)/admin/courses/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

export default async function AdminCoursesPage() {
  const courses = await prisma.course.findMany({
    orderBy: { created_at: "desc" },
    include: {
      _count: {
        select: { enrollments: true, modules: true },
      },
    },
  });

  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <p className="text-xs tracking-[3px] uppercase text-[#ff63ce] mb-1">
            Administration
          </p>
          <h1 className="text-2xl font-serif font-medium">Formations</h1>
        </div>
        <Link
          href="/admin/courses/new"
          className="bg-[#ff63ce] text-white px-6 py-3 text-xs tracking-[2px] uppercase hover:bg-[#111] transition-colors"
        >
          + Nouvelle formation
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="border border-dashed border-gray-200 rounded p-16 text-center">
          <p className="text-gray-500 text-sm">
            Aucune formation pour l'instant.
          </p>
          <Link
            href="/admin/courses/new"
            className="text-[#ff63ce] text-sm mt-2 inline-block hover:underline"
          >
            Créer la première →
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#fdf0fa] border-b border-[#f0e0ec]">
              <tr>
                {[
                  "Formation",
                  "Prix XAF",
                  "Modules",
                  "Inscriptions",
                  "Statut",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-6 py-3 text-xs tracking-[2px] uppercase text-gray-500 font-medium"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {courses.map((course) => (
                <tr
                  key={course.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-sm">{course.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {course.slug}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-serif">
                    {formatPrice(course.price_xaf, "XAF")}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {course._count.modules}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {course._count.enrollments}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        course.status === "PUBLISHED"
                          ? "bg-[#fdf0fa] text-[#ff63ce]"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {course.status === "PUBLISHED" ? "Publié" : "Brouillon"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/courses/${course.id}`}
                      className="text-xs text-[#ff63ce] hover:underline"
                    >
                      Gérer →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
