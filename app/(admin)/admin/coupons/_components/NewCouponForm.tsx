// app/(admin)/admin/coupons/_components/NewCouponForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewCouponForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">(
    "PERCENTAGE",
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData(e.currentTarget);

    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: (formData.get("code") as string).toUpperCase().trim(),
        discount_type: discountType,
        value: Number(formData.get("value")),
        expires_at: formData.get("expires_at") || null,
        max_uses: formData.get("max_uses")
          ? Number(formData.get("max_uses"))
          : null,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Erreur lors de la création");
      setLoading(false);
      return;
    }

    setSuccess(`Code "${data.code}" créé avec succès !`);
    setLoading(false);
    (e.target as HTMLFormElement).reset();
    router.refresh();
  }

  return (
    <div className="bg-white border border-gray-100 rounded p-6">
      <h2 className="text-xs tracking-[3px] uppercase text-gray-500 font-medium mb-6">
        Créer un code promo
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs text-gray-400 uppercase tracking-[1px]">
            Code *
          </label>
          <input
            name="code"
            required
            placeholder="BLACKFRIDAY2024"
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#ff63ce] uppercase"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-gray-400 uppercase tracking-[1px]">
            Type de réduction
          </label>
          <div className="flex gap-2">
            {(["PERCENTAGE", "FIXED"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setDiscountType(t)}
                className={`flex-1 py-2 text-xs border transition-colors ${
                  discountType === t
                    ? "border-[#ff63ce] bg-[#fdf0fa] text-[#ff63ce]"
                    : "border-gray-200 text-gray-500"
                }`}
              >
                {t === "PERCENTAGE" ? "Pourcentage %" : "Montant fixe"}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-gray-400 uppercase tracking-[1px]">
            Valeur * {discountType === "PERCENTAGE" ? "(%)" : "(XAF)"}
          </label>
          <input
            name="value"
            type="number"
            min="1"
            max={discountType === "PERCENTAGE" ? "100" : undefined}
            required
            placeholder={discountType === "PERCENTAGE" ? "30" : "5000"}
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#ff63ce]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-gray-400 uppercase tracking-[1px]">
            Date d'expiration
          </label>
          <input
            name="expires_at"
            type="date"
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#ff63ce]"
          />
          <p className="text-xs text-gray-300">
            Laisser vide = pas d'expiration
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-gray-400 uppercase tracking-[1px]">
            Limite d'utilisation
          </label>
          <input
            name="max_uses"
            type="number"
            min="1"
            placeholder="100"
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#ff63ce]"
          />
          <p className="text-xs text-gray-300">Laisser vide = illimité</p>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}
        {success && <p className="text-xs text-green-600">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#ff63ce] text-white py-2.5 text-xs tracking-[2px] uppercase hover:bg-[#111] transition-colors disabled:opacity-60"
        >
          {loading ? "Création..." : "Créer le code"}
        </button>
      </form>
    </div>
  );
}
