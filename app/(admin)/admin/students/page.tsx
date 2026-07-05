// app/(admin)/admin/students/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Pagination from "@/components/admin/Pagination";

const PAGE_SIZE = 20;

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { email: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        email: true,
        country: true,
        role: true,
        created_at: true,
        _count: { select: { enrollments: true, bookings: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <p className="text-xs tracking-[3px] uppercase text-[#ff63ce] mb-1">
            Administration
          </p>
          <h1 className="text-2xl font-serif font-medium">
            Étudiantes <span className="text-gray-400 text-lg">({total})</span>
          </h1>
        </div>
        <form className="flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Rechercher par nom ou email..."
            className="border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#ff63ce] w-64"
          />
          <button className="bg-[#111] text-white px-4 py-2 text-xs tracking-[1px] uppercase hover:bg-[#ff63ce] transition-colors">
            Chercher
          </button>
        </form>
      </div>

      {users.length === 0 ? (
        <div className="border border-dashed border-gray-200 rounded p-16 text-center">
          <p className="text-gray-400 text-sm">Aucune étudiante trouvée.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#fdf0fa] border-b border-[#f0e0ec]">
              <tr>
                {[
                  "Nom",
                  "Pays",
                  "Rôle",
                  "Formations",
                  "Coaching",
                  "Inscrite le",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs tracking-[2px] uppercase text-gray-500 font-medium"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">
                      {user.name || "—"}
                    </div>
                    <div className="text-xs text-gray-400">{user.email}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {user.country || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        user.role === "ADMIN"
                          ? "bg-[#fdf0fa] text-[#ff63ce]"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {user.role === "ADMIN" ? "Admin" : "Étudiante"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {user._count.enrollments}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {user._count.bookings}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/students/${user.id}`}
                      className="text-xs text-[#ff63ce] hover:underline"
                    >
                      Voir →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        basePath="/admin/students"
        currentPage={page}
        totalPages={totalPages}
        searchParams={{ q }}
      />
    </div>
  );
}
