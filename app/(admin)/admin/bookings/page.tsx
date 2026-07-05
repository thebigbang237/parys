// app/(admin)/admin/bookings/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Prisma } from "@/generated/prisma/client";
import MarkRefundedButton from "./_components/MarkRefundedButton";
import Pagination from "@/components/admin/Pagination";

const PAGE_SIZE = 25;

const statusColor: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-600",
  SUCCESS: "bg-green-50 text-green-600",
  FAILED: "bg-red-50 text-red-600",
  REFUNDED: "bg-gray-100 text-gray-500",
};

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string; page?: string }>;
}) {
  const { type, status, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const where: Prisma.PaymentWhereInput = {
    ...(type === "COURSE" || type === "COACHING"
      ? { product_type: type }
      : {}),
    ...(status ? { status: status as Prisma.PaymentWhereInput["status"] } : {}),
  };

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { title: true } },
        booking: { include: { session_type: true } },
      },
    }),
    prisma.payment.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const typeTabs = [
    { key: undefined, label: "Tout" },
    { key: "COURSE", label: "Formations" },
    { key: "COACHING", label: "Coaching" },
  ];

  const statusTabs = [
    { key: undefined, label: "Tous statuts" },
    { key: "PENDING", label: "En attente" },
    { key: "SUCCESS", label: "Réussi" },
    { key: "FAILED", label: "Échoué" },
    { key: "REFUNDED", label: "Remboursé" },
  ];

  function buildHref(nextType?: string, nextStatus?: string) {
    const params = new URLSearchParams();
    if (nextType) params.set("type", nextType);
    if (nextStatus) params.set("status", nextStatus);
    const qs = params.toString();
    return qs ? `/admin/bookings?${qs}` : "/admin/bookings";
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-xs tracking-[3px] uppercase text-[#ff63ce] mb-1">
          Administration
        </p>
        <h1 className="text-2xl font-serif font-medium">
          Sessions & Paiements <span className="text-gray-500 text-lg">({total})</span>
        </h1>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {typeTabs.map((t) => (
          <Link
            key={t.label}
            href={buildHref(t.key, status)}
            className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
              (type || undefined) === t.key
                ? "bg-[#111] text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-8">
        {statusTabs.map((s) => (
          <Link
            key={s.label}
            href={buildHref(type, s.key)}
            className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
              (status || undefined) === s.key
                ? "bg-[#ff63ce] text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      {payments.length === 0 ? (
        <div className="border border-dashed border-gray-200 rounded p-16 text-center">
          <p className="text-gray-500 text-sm">Aucun paiement trouvé.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#fdf0fa] border-b border-[#f0e0ec]">
              <tr>
                {[
                  "Étudiante",
                  "Produit",
                  "Montant",
                  "Provider",
                  "Statut",
                  "Date",
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
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/students/${p.user.id}`}
                      className="text-sm text-gray-900 hover:text-[#ff63ce] hover:underline"
                    >
                      {p.user.name || p.user.email}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {p.product_type === "COURSE"
                      ? p.course?.title || "Formation supprimée"
                      : p.booking?.session_type.name || "Session supprimée"}
                  </td>
                  <td className="px-4 py-3 text-sm font-serif text-gray-900">
                    {p.amount.toLocaleString("en-US")} {p.currency}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {p.provider}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[p.status]}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(p.created_at).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3">
                    {p.status === "SUCCESS" && (
                      <MarkRefundedButton paymentId={p.id} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        basePath="/admin/bookings"
        currentPage={page}
        totalPages={totalPages}
        searchParams={{ type, status }}
      />
    </div>
  );
}
