// app/(admin)/admin/bookings/_components/MarkRefundedButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MarkRefundedButton({ paymentId }: { paymentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (
      !confirm(
        "Marquer ce paiement comme remboursé ? Ceci ne déclenche PAS de remboursement réel via PayPal/PawaPay — à faire manuellement sur leur dashboard d'abord.",
      )
    ) {
      return;
    }
    setLoading(true);
    await fetch("/api/admin/payments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: paymentId, status: "REFUNDED" }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-xs text-red-400 hover:text-red-600 disabled:opacity-50"
    >
      {loading ? "..." : "Marquer remboursé"}
    </button>
  );
}
