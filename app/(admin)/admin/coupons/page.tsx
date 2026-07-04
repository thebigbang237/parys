// app/(admin)/admin/coupons/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import NewCouponForm from "./_components/NewCouponForm";
import ToggleCouponButton from "./_components/ToggleCouponButton";

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { created_at: "desc" },
    include: {
      course: { select: { title: true } },
      _count: { select: { usages: true } },
    },
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <p className="text-xs tracking-[3px] uppercase text-[#ff63ce] mb-1">
            Administration
          </p>
          <h1 className="text-2xl font-serif font-medium">Codes promo</h1>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* New coupon form */}
        <div className="col-span-1">
          <NewCouponForm />
        </div>

        {/* Coupons list */}
        <div className="col-span-2">
          {coupons.length === 0 ? (
            <div className="border border-dashed border-gray-200 p-12 text-center">
              <p className="text-gray-400 text-sm">Aucun code promo créé.</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#fdf0fa] border-b border-[#f0e0ec]">
                  <tr>
                    {[
                      "Code",
                      "Réduction",
                      "Formation",
                      "Utilisations",
                      "Expiration",
                      "Statut",
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
                  {coupons.map((coupon) => {
                    const isExpired =
                      coupon.expires_at && new Date() > coupon.expires_at;
                    const isMaxed =
                      coupon.max_uses !== null &&
                      coupon.uses_count >= coupon.max_uses;

                    return (
                      <tr key={coupon.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm font-medium bg-gray-100 px-2 py-1">
                            {coupon.code}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {coupon.discount_type === "PERCENTAGE"
                            ? `${coupon.value}%`
                            : formatPrice(coupon.value, "XAF")}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {coupon.course?.title || "Toutes les formations"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {coupon._count.usages}
                          {coupon.max_uses !== null && ` / ${coupon.max_uses}`}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {coupon.expires_at
                            ? new Date(coupon.expires_at).toLocaleDateString(
                                "fr-FR",
                              )
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-medium ${
                                !coupon.active || isExpired || isMaxed
                                  ? "bg-red-50 text-red-600"
                                  : "bg-green-50 text-green-700"
                              }`}
                            >
                              {!coupon.active
                                ? "Désactivé"
                                : isExpired
                                  ? "Expiré"
                                  : isMaxed
                                    ? "Épuisé"
                                    : "Actif"}
                            </span>
                            {/* Toggle button — only show for non-expired, non-maxed coupons */}
                            {!isExpired && !isMaxed && (
                              <ToggleCouponButton
                                couponId={coupon.id}
                                active={coupon.active}
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
