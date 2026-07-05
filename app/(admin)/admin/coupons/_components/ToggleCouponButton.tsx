// app/(admin)/admin/coupons/_components/ToggleCouponButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ToggleCouponButton({
  couponId,
  active,
}: {
  couponId: string;
  active: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggle() {
    setLoading(true);
    await fetch("/api/admin/coupons", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: couponId, active: !active }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`text-xs underline transition-colors ${
        active
          ? "text-red-400 hover:text-red-600"
          : "text-[#ff63ce] hover:text-[#111]"
      }`}
    >
      {loading ? "..." : active ? "Désactiver" : "Activer"}
    </button>
  );
}
