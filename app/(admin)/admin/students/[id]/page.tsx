// app/(admin)/admin/students/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

const statusColor: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-600",
  SUCCESS: "bg-green-50 text-green-600",
  FAILED: "bg-red-50 text-red-600",
  REFUNDED: "bg-gray-100 text-gray-500",
  CONFIRMED: "bg-green-50 text-green-600",
  CANCELLED: "bg-red-50 text-red-600",
  COMPLETED: "bg-gray-100 text-gray-500",
};

export default async function AdminStudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      enrollments: {
        include: { course: { select: { title: true, slug: true } } },
        orderBy: { enrolled_at: "desc" },
      },
      bookings: {
        include: { session_type: true },
        orderBy: { start_datetime: "desc" },
      },
      payments: {
        orderBy: { created_at: "desc" },
      },
    },
  });

  if (!user) notFound();

  return (
    <div className="p-8 space-y-10">
      <div>
        <Link
          href="/admin/students"
          className="text-xs text-gray-500 hover:text-[#ff63ce] transition-colors"
        >
          ← Étudiantes
        </Link>
        <div className="flex items-center gap-3 mt-2">
          <h1 className="text-2xl font-serif font-medium">
            {user.name || "Anonyme"}
          </h1>
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${
              user.role === "ADMIN"
                ? "bg-[#fdf0fa] text-[#ff63ce]"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {user.role === "ADMIN" ? "Admin" : "Étudiante"}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">{user.email}</p>
        <p className="text-xs text-gray-500 mt-1">
          {user.country || "Pays inconnu"} · Inscrite le{" "}
          {new Date(user.created_at).toLocaleDateString("fr-FR")}
        </p>
      </div>

      {/* Enrollments */}
      <div>
        <h2 className="text-xs tracking-[3px] uppercase text-gray-500 font-medium mb-4">
          Formations ({user.enrollments.length})
        </h2>
        {user.enrollments.length === 0 ? (
          <p className="text-sm text-gray-500">Aucune formation.</p>
        ) : (
          <div className="bg-white border border-gray-100 rounded overflow-x-auto">
            <table className="w-full">
              <tbody className="divide-y divide-gray-50">
                {user.enrollments.map((e) => (
                  <tr key={e.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {e.course.title}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 text-right">
                      Inscrite le{" "}
                      {new Date(e.enrolled_at).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Coaching bookings */}
      <div>
        <h2 className="text-xs tracking-[3px] uppercase text-gray-500 font-medium mb-4">
          Sessions coaching ({user.bookings.length})
        </h2>
        {user.bookings.length === 0 ? (
          <p className="text-sm text-gray-500">Aucune session.</p>
        ) : (
          <div className="bg-white border border-gray-100 rounded overflow-x-auto">
            <table className="w-full">
              <tbody className="divide-y divide-gray-50">
                {user.bookings.map((b) => (
                  <tr key={b.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {b.session_type.name}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(b.start_datetime).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${statusColor[b.status]}`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payments */}
      <div>
        <h2 className="text-xs tracking-[3px] uppercase text-gray-500 font-medium mb-4">
          Paiements ({user.payments.length})
        </h2>
        {user.payments.length === 0 ? (
          <p className="text-sm text-gray-500">Aucun paiement.</p>
        ) : (
          <div className="bg-white border border-gray-100 rounded overflow-x-auto">
            <table className="w-full">
              <tbody className="divide-y divide-gray-50">
                {user.payments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {p.product_type === "COURSE" ? "Formation" : "Coaching"}
                    </td>
                    <td className="px-4 py-3 text-sm font-serif text-gray-900">
                      {p.amount.toLocaleString("en-US")} {p.currency}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {p.provider}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(p.created_at).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${statusColor[p.status]}`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
