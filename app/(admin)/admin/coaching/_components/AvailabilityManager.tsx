// app/(admin)/admin/coaching/_components/AvailabilityManager.tsx
"use client";

import { useState } from "react";

const DAYS = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

type Availability = {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  active: boolean;
};

export default function AvailabilityManager({
  initialAvailabilities,
}: {
  initialAvailabilities: Availability[];
}) {
  const [availabilities, setAvailabilities] = useState(initialAvailabilities);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    day_of_week: 0,
    start_time: "09:00",
    end_time: "17:00",
  });

  async function handleAdd() {
    setLoading(true);
    const res = await fetch("/api/admin/coaching/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setAvailabilities((prev) => [...prev, data]);
    }
    setLoading(false);
  }

  async function handleToggle(id: string, active: boolean) {
    await fetch("/api/admin/coaching/availability", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active: !active }),
    });
    setAvailabilities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: !active } : a)),
    );
  }

  async function handleDelete(id: string) {
    await fetch("/api/admin/coaching/availability", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setAvailabilities((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="bg-white border border-gray-100 rounded p-6">
      <h2 className="text-xs tracking-[3px] uppercase text-gray-500 font-medium mb-6">
        Disponibilités hebdomadaires
      </h2>

      {/* Add availability */}
      <div className="border border-[#f0e0ec] rounded p-4 mb-4 space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-[1px]">
              Jour
            </label>
            <select
              value={form.day_of_week}
              onChange={(e) =>
                setForm({ ...form, day_of_week: Number(e.target.value) })
              }
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#ff63ce] mt-1"
            >
              {DAYS.map((day, idx) => (
                <option key={idx} value={idx}>
                  {day}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-[1px]">
              Début
            </label>
            <input
              type="time"
              value={form.start_time}
              onChange={(e) => setForm({ ...form, start_time: e.target.value })}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#ff63ce] mt-1"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-[1px]">
              Fin
            </label>
            <input
              type="time"
              value={form.end_time}
              onChange={(e) => setForm({ ...form, end_time: e.target.value })}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#ff63ce] mt-1"
            />
          </div>
        </div>
        <button
          onClick={handleAdd}
          disabled={loading}
          className="w-full bg-[#111] text-white py-2 text-xs tracking-[2px] uppercase disabled:opacity-50 hover:bg-[#ff63ce] transition-colors"
        >
          {loading ? "..." : "+ Ajouter ce créneau"}
        </button>
      </div>

      {/* Existing availabilities */}
      <div className="space-y-2">
        {availabilities.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            Aucune disponibilité définie
          </p>
        ) : (
          availabilities.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between p-3 border border-gray-100 rounded"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-2 h-2 rounded-full ${
                    a.active ? "bg-green-400" : "bg-gray-200"
                  }`}
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {DAYS[a.day_of_week]}
                  </p>
                  <p className="text-xs text-gray-400">
                    {a.start_time} – {a.end_time}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggle(a.id, a.active)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  {a.active ? "Désactiver" : "Activer"}
                </button>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="text-xs text-red-400 hover:text-red-600"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
