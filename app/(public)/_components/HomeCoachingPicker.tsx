// app/(public)/_components/HomeCoachingPicker.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { cn, formatPrice } from "@/lib/utils";

type SessionType = {
  id: string;
  name: string;
  duration: number;
  price: number;
};

export default function HomeCoachingPicker({
  sessions,
  currency,
}: {
  sessions: SessionType[];
  currency: string;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(
    sessions[0]?.id ?? null,
  );

  return (
    <div className="bg-white border border-[#f0e0ec] p-6 sm:p-8 space-y-4 w-full">
      <h3 className="font-serif text-lg sm:text-xl font-medium text-gray-900 text-center mb-6">
        Réserver une séance
      </h3>

      {sessions.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => setSelectedId(s.id)}
          className={cn(
            "w-full p-5 border text-left transition-colors",
            selectedId === s.id
              ? "border-[#ff63ce] bg-[#fdf0fa]"
              : "border-[#f0e0ec] hover:border-[#ff63ce]",
          )}
        >
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs tracking-[2px] uppercase font-medium text-gray-900">
              {s.name}
            </span>
            <span className="font-serif text-lg text-gray-900">
              {formatPrice(s.price, currency as any)}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Session de {s.duration} minutes
          </p>
        </button>
      ))}

      <Link
        href={selectedId ? `/coaching?sessionType=${selectedId}` : "/coaching"}
        className="w-full bg-[#111] text-white py-4 text-xs tracking-[3px] uppercase hover:bg-[#ff63ce] transition-colors text-center block mt-4"
      >
        Continuer vers le calendrier →
      </Link>
    </div>
  );
}
