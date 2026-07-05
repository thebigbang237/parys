// app/(admin)/admin/coaching/_components/SessionTypesManager.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";

type SessionType = {
  id: string;
  name: string;
  duration: number;
  price_xaf: number;
  price_usd: number;
  price_eur: number;
  active: boolean;
};

export default function SessionTypesManager({
  initialSessionTypes,
}: {
  initialSessionTypes: SessionType[];
}) {
  const router = useRouter();
  const [sessionTypes, setSessionTypes] = useState(initialSessionTypes);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    duration: 60,
    price_xaf: 0,
    price_usd: 0,
    price_eur: 0,
  });

  async function handleCreate() {
    setLoading(true);
    const res = await fetch("/api/admin/coaching/session-types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setSessionTypes((prev) => [...prev, data]);
      setShowForm(false);
      setForm({
        name: "",
        duration: 60,
        price_xaf: 0,
        price_usd: 0,
        price_eur: 0,
      });
    }
    setLoading(false);
  }

  async function toggleActive(id: string, active: boolean) {
    await fetch("/api/admin/coaching/session-types", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active: !active }),
    });
    setSessionTypes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !active } : s)),
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xs tracking-[3px] uppercase text-gray-500 font-medium">
          Types de sessions
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs text-[#ff63ce] hover:underline"
        >
          + Ajouter
        </button>
      </div>

      {showForm && (
        <div className="border border-[#f0e0ec] rounded p-4 mb-4 space-y-3">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nom de la session"
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#ff63ce]"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-[1px]">
                Durée (min)
              </label>
              <input
                type="number"
                value={form.duration}
                onChange={(e) =>
                  setForm({ ...form, duration: Number(e.target.value) })
                }
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#ff63ce] mt-1"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: "price_xaf", label: "XAF" },
              { key: "price_usd", label: "USD" },
              { key: "price_eur", label: "EUR" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="text-xs text-gray-400 uppercase tracking-[1px]">
                  {label}
                </label>
                <input
                  type="number"
                  value={form[key as keyof typeof form]}
                  onChange={(e) =>
                    setForm({ ...form, [key]: Number(e.target.value) })
                  }
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#ff63ce] mt-1"
                />
              </div>
            ))}
          </div>
          <button
            onClick={handleCreate}
            disabled={loading || !form.name}
            className="w-full bg-[#ff63ce] text-white py-2 text-xs tracking-[2px] uppercase disabled:opacity-50 hover:bg-[#111] transition-colors"
          >
            {loading ? "..." : "Créer"}
          </button>
        </div>
      )}

      <div className="space-y-3">
        {sessionTypes.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            Aucun type de session
          </p>
        ) : (
          sessionTypes.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between p-3 border border-gray-100 rounded"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{s.name}</p>
                <p className="text-xs text-gray-400">
                  {s.duration} min · {formatPrice(s.price_xaf, "XAF")}
                </p>
              </div>
              <button
                onClick={() => toggleActive(s.id, s.active)}
                className={`text-xs px-2 py-1 rounded-full ${
                  s.active
                    ? "bg-green-50 text-green-600"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {s.active ? "Actif" : "Inactif"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
