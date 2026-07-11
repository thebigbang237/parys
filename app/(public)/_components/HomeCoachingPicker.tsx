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
    <div className="bg-white/60 rounded-3xl border border-[#f3dfea] p-6 sm:p-8 space-y-4 w-full">
      <h3 className="font-serif text-lg sm:text-xl font-medium text-[#172A39] text-center mb-6">
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
              ? "border-[#a61968] bg-[#f9eff4]"
              : "border-[#f3dfea] hover:border-[#a61968]",
          )}
        >
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs tracking-[2px] uppercase font-medium text-[#172A39]">
              {s.name}
            </span>
            <span className="font-serif text-lg text-[#172A39]">
              {formatPrice(s.price, currency as any)}
            </span>
          </div>
          <p className="text-xs text-[#172A39]/80">
            Session de {s.duration} minutes
          </p>
        </button>
      ))}

      <Link
        href={selectedId ? `/coaching?sessionType=${selectedId}` : "/coaching"}
        className="w-full bg-[#172A39] text-white py-4 text-xs tracking-[3px] uppercase hover:bg-[#a61968] transition-colors text-center block mt-4"
      >
        Continuer vers le calendrier →
      </Link>
    </div>
  );
}
