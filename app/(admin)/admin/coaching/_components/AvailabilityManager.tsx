// app/(admin)/admin/coaching/_components/AvailabilityManager.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const DAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS_FR = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

type Availability = {
  id: string;
  date: string; // "YYYY-MM-DD"
  start_time: string;
  end_time: string;
  active: boolean;
};

function dateKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export default function AvailabilityManager({
  initialAvailabilities,
  year,
  month,
  bookingsPage,
}: {
  initialAvailabilities: Availability[];
  year: number;
  month: number; // 0-indexed
  bookingsPage?: number;
}) {
  const [availabilities, setAvailabilities] = useState(initialAvailabilities);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [form, setForm] = useState({ start_time: "09:00", end_time: "17:00" });
  const [loading, setLoading] = useState(false);

  const byDate = new Map<string, Availability[]>();
  for (const a of availabilities) {
    if (!byDate.has(a.date)) byDate.set(a.date, []);
    byDate.get(a.date)!.push(a);
  }

  async function handleAdd() {
    if (!selectedDate) return;
    setLoading(true);
    const res = await fetch("/api/admin/coaching/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: selectedDate, ...form }),
    });
    const data = await res.json();
    if (res.ok) {
      setAvailabilities((prev) => [
        ...prev,
        { ...data, date: selectedDate },
      ]);
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

  const firstDayJs = new Date(year, month, 1).getDay();
  const firstDay = firstDayJs === 0 ? 6 : firstDayJs - 1; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const prevMonth = new Date(year, month - 1, 1);
  const nextMonth = new Date(year, month + 1, 1);
  const monthHref = (d: Date) =>
    `/admin/coaching?availYear=${d.getFullYear()}&availMonth=${d.getMonth()}${
      bookingsPage && bookingsPage > 1 ? `&page=${bookingsPage}` : ""
    }`;

  const selectedRanges = selectedDate ? byDate.get(selectedDate) || [] : [];

  return (
    <div className="bg-white border border-gray-100 rounded p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xs tracking-[3px] uppercase text-gray-500 font-medium">
          Disponibilités
        </h2>
        <div className="flex items-center gap-3">
          <Link
            href={monthHref(prevMonth)}
            className="text-gray-500 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
          >
            <ChevronLeft size={16} />
          </Link>
          <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
            {MONTHS_FR[month]} {year}
          </span>
          <Link
            href={monthHref(nextMonth)}
            className="text-gray-500 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
          >
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {DAYS_FR.map((d) => (
          <div key={d} className="text-center text-xs text-gray-500 py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 mb-6">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const key = dateKey(year, month, day);
          const dayAvail = byDate.get(key) || [];
          const hasActive = dayAvail.some((a) => a.active);
          const cellDate = new Date(year, month, day);
          const isPast = cellDate < today;
          const isSelected = selectedDate === key;

          return (
            <button
              key={day}
              onClick={() => !isPast && setSelectedDate(key)}
              disabled={isPast}
              className={cn(
                "aspect-square text-sm rounded transition-colors relative",
                isPast && "text-gray-200 cursor-not-allowed",
                !isPast && !isSelected && "text-gray-700 hover:bg-[#fdf0fa]",
                isSelected && "bg-[#ff63ce] text-white",
              )}
            >
              {day}
              {hasActive && (
                <span
                  className={cn(
                    "absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full",
                    isSelected ? "bg-white" : "bg-[#ff63ce]",
                  )}
                />
              )}
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <div className="border border-[#f0e0ec] rounded p-4 space-y-3">
          <p className="text-sm font-medium text-gray-900">
            {new Date(selectedDate + "T12:00:00").toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>

          {selectedRanges.length > 0 && (
            <div className="space-y-2">
              {selectedRanges.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between p-2 border border-gray-100 rounded"
                >
                  <span
                    className={cn(
                      "text-sm",
                      a.active ? "text-gray-900" : "text-gray-500",
                    )}
                  >
                    {a.start_time} – {a.end_time}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggle(a.id, a.active)}
                      className="text-xs text-gray-500 hover:text-gray-600"
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
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-[1px]">
                Début
              </label>
              <input
                type="time"
                value={form.start_time}
                onChange={(e) =>
                  setForm({ ...form, start_time: e.target.value })
                }
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#ff63ce] mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-[1px]">
                Fin
              </label>
              <input
                type="time"
                value={form.end_time}
                onChange={(e) =>
                  setForm({ ...form, end_time: e.target.value })
                }
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
      )}

      {!selectedDate && (
        <p className="text-xs text-gray-500 text-center">
          Sélectionne une date pour définir tes disponibilités.
        </p>
      )}
    </div>
  );
}
