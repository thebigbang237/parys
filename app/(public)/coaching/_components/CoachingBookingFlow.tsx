// app/(public)/coaching/_components/CoachingBookingFlow.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Video, Calendar, FileText, ChevronLeft, ChevronRight } from "lucide-react";

type SessionType = {
  id: string;
  name: string;
  duration: number;
  price: number;
  price_xaf: number;
  price_usd: number;
  price_eur: number;
};

type TimeSlot = {
  start: string;
  end: string;
  available: boolean;
};

type Step = "select" | "calendar" | "slots" | "intake" | "payment";

const DAYS_FR = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
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

export default function CoachingBookingFlow({
  sessionTypes,
  currency,
  country,
  isLoggedIn,
  canUseMobileMoney,
  initialSessionTypeId,
}: {
  sessionTypes: SessionType[];
  currency: string;
  country: string;
  isLoggedIn: boolean;
  canUseMobileMoney: boolean;
  initialSessionTypeId?: string;
}) {
  const router = useRouter();
  const preselected = sessionTypes.find((t) => t.id === initialSessionTypeId);
  const [step, setStep] = useState<Step>(preselected ? "calendar" : "select");
  const [selectedType, setSelectedType] = useState<SessionType | null>(
    preselected ?? null,
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingDays, setLoadingDays] = useState(false);
  const [availableDays, setAvailableDays] = useState<number[]>([]);
  const [intake, setIntake] = useState({ goal: "", challenges: "" });
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Fetch available days when month or session type changes
  useEffect(() => {
    if (!selectedType || step !== "calendar") return;

    setLoadingDays(true);
    fetch(
      `/api/coaching/available-days?year=${year}&month=${month}&duration=${selectedType.duration}`,
    )
      .then((r) => r.json())
      .then((data) => setAvailableDays(data.availableDays || []))
      .catch(() => setAvailableDays([]))
      .finally(() => setLoadingDays(false));
  }, [year, month, selectedType, step]);

  function getDaysInMonth(y: number, m: number) {
    return new Date(y, m + 1, 0).getDate();
  }

  function getFirstDayOfMonth(y: number, m: number) {
    return new Date(y, m, 1).getDay();
  }

  async function handleDateSelect(date: Date) {
    setSelectedDate(date);
    setSelectedSlot(null);
    setLoadingSlots(true);
    setStep("slots");

    const res = await fetch(
      `/api/coaching/slots?date=${date.toISOString()}&duration=${selectedType!.duration}`,
    );
    const data = await res.json();
    setSlots(data.slots || []);
    setLoadingSlots(false);
  }

  async function createBooking() {
    if (!isLoggedIn) {
      router.push("/login?redirect=/coaching");
      return;
    }

    setLoading(true);
    setError("");

    const res = await fetch("/api/coaching/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_type_id: selectedType!.id,
        start_datetime: selectedSlot!.start,
        currency,
        amount: selectedType!.price,
        intake_goal: intake.goal,
        intake_challenges: intake.challenges,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Erreur lors de la réservation");
      setLoading(false);
      return;
    }

    // Redirect to checkout
    const params = new URLSearchParams({
      bookingId: data.id,
      sessionTypeId: selectedType!.id,
      currency,
      country,
      amount: String(selectedType!.price),
      type: "COACHING",
    });

    router.push(`/checkout?${params.toString()}`);
  }

  // ── STEP 1 — Session type selection (homepage-style) ──
  if (step === "select") {
    return (
      <div className="grid md:grid-cols-2 gap-12">
        {/* Left — features */}
        <div className="flex flex-col justify-center space-y-10">
          <div>
            <p className="text-xs tracking-[4px] uppercase text-[#ff63ce] mb-2">
              Accompagnement privé
            </p>
            <h2 className="font-serif text-xl md:text-3xl font-medium text-gray-900 md:mb-8">
              Le Coaching 1-to-1
            </h2>
          </div>

          <div className="space-y-8">
            {[
              {
                icon: Video,
                title: "Sessions visio",
                desc: "Des échanges intense pour débloquer vos problématiques business spécifiques.",
              },
              {
                icon: Calendar,
                title: "Calendrier flexible",
                desc: "Réservez votre créneau en fonction de vos disponibilités.",
              },
              {
                icon: FileText,
                title: "Suivi personnalisé",
                desc: "Compte-rendu écrit et plan d'action concret après chaque séance.",
              },
            ].map((feature) => (
              <div key={feature.title} className="flex gap-5">
                <feature.icon className="text-[#ff63ce] mt-0.5" size={22} />
                <div>
                  <h4 className="text-xs tracking-[2px] uppercase font-medium text-gray-900 mb-1">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — session selector */}
        <div className="bg-[#fdf0fa] max-sm:px-2 p-8">
          <div className="bg-white border border-[#f0e0ec]  p-8 space-y-6">
            <h3 className="font-serif text-xl font-medium text-gray-900 text-center">
              Réserver une séance
            </h3>

            <div className="space-y-3">
              {sessionTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type)}
                  className={cn(
                    "w-full p-5 border text-left transition-colors",
                    selectedType?.id === type.id
                      ? "border-[#ff63ce] bg-[#fdf0fa]"
                      : "border-[#f0e0ec] hover:border-[#ff63ce]",
                  )}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs tracking-[2px] uppercase font-medium text-gray-900">
                      {type.name}
                    </span>
                    <span className="font-serif text-lg text-gray-900">
                      {formatPrice(type.price, currency as any)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Session de {type.duration} minutes
                  </p>
                </button>
              ))}
            </div>

            <button
              onClick={() => selectedType && setStep("calendar")}
              disabled={!selectedType}
              className="w-full bg-[#111] text-white py-4 text-xs tracking-[3px] uppercase hover:bg-[#ff63ce] transition-colors disabled:opacity-40"
            >
              Continuer vers le calendrier →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── STEP 2 — Calendar with available days highlighted ──
  if (step === "calendar") {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setStep("select")}
            className="text-xs text-gray-500 hover:text-gray-600"
          >
            ← Retour
          </button>
          <span className="text-xs text-gray-300">|</span>
          <span className="text-xs text-gray-500">{selectedType?.name}</span>
        </div>

        <div>
          <p className="text-xs tracking-[4px] uppercase text-[#ff63ce] mb-2">
            02 — Choisir une date
          </p>
          <p className="text-xs text-gray-500 mb-6">
            Les dates disponibles sont mises en évidence en rose.
          </p>

          <div className="bg-white border border-[#f0e0ec] p-8 max-w-md">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
                className="text-gray-500 hover:text-gray-600 w-8 h-8 flex items-center justify-center"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="font-medium text-gray-900">
                {MONTHS_FR[month]} {year}
              </span>
              <button
                onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
                className="text-gray-500 hover:text-gray-600 w-8 h-8 flex items-center justify-center"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAYS_FR.map((d) => (
                <div key={d} className="text-center text-xs text-gray-500 py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Days grid */}
            {loadingDays ? (
              <div className="h-40 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-[#ff63ce] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const date = new Date(year, month, day);
                  date.setHours(12, 0, 0, 0);
                  const isPast = date < today;
                  const isAvailable = availableDays.includes(day);
                  const isSelected =
                    selectedDate?.toDateString() === date.toDateString();

                  return (
                    <button
                      key={day}
                      onClick={() =>
                        !isPast && isAvailable && handleDateSelect(date)
                      }
                      disabled={isPast || !isAvailable}
                      title={
                        !isAvailable && !isPast
                          ? "Pas de créneaux disponibles"
                          : undefined
                      }
                      className={cn(
                        "aspect-square text-sm rounded transition-colors relative",
                        isPast && "text-gray-200 cursor-not-allowed",
                        !isPast &&
                          !isAvailable &&
                          "text-gray-300 cursor-not-allowed",
                        !isPast &&
                          isAvailable &&
                          !isSelected &&
                          "text-[#ff63ce] font-medium hover:bg-[#fdf0fa] ring-1 ring-[#f0e0ec]",
                        isSelected &&
                          "bg-[#ff63ce] text-white ring-1 ring-[#ff63ce]",
                      )}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#f0e0ec]">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded ring-1 ring-[#f0e0ec] bg-white" />
                <span className="text-xs text-gray-500">Disponible</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-gray-100" />
                <span className="text-xs text-gray-500">Non disponible</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── STEP 3 — Time slots ──
  if (step === "slots") {
    const availableSlots = slots.filter((s) => s.available);

    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setStep("calendar")}
            className="text-xs text-gray-500 hover:text-gray-600"
          >
            ← Retour
          </button>
          <span className="text-xs text-gray-300">|</span>
          <span className="text-xs text-gray-500">
            {selectedDate?.toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </span>
        </div>

        <div>
          <p className="text-xs tracking-[4px] uppercase text-[#ff63ce] mb-2">
            03 — Choisir un créneau
          </p>
          <p className="text-xs text-gray-500 mb-6">
            Session de {selectedType?.duration} minutes
          </p>

          {loadingSlots ? (
            <div className="flex items-center gap-3 text-gray-500">
              <div className="w-4 h-4 border-2 border-[#ff63ce] border-t-transparent rounded-full animate-spin" />
              Chargement des créneaux...
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="bg-white border border-[#f0e0ec] p-8 text-center">
              <p className="text-gray-500 mb-4">
                Aucun créneau disponible ce jour-là.
              </p>
              <button
                onClick={() => setStep("calendar")}
                className="text-xs text-[#ff63ce] hover:underline"
              >
                Choisir une autre date
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {availableSlots.map((slot) => {
                const isSelected = selectedSlot?.start === slot.start;
                const start = new Date(slot.start);
                const end = new Date(slot.end);

                return (
                  <button
                    key={slot.start}
                    onClick={() => setSelectedSlot(slot)}
                    className={cn(
                      "px-5 py-3 border text-sm transition-colors text-left",
                      isSelected
                        ? "border-[#ff63ce] bg-[#fdf0fa] text-[#ff63ce] font-medium"
                        : "border-[#f0e0ec] bg-white hover:border-[#ff63ce] text-gray-700",
                    )}
                  >
                    <div className="font-medium">
                      {start.toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      →{" "}
                      {end.toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {selectedSlot && (
            <button
              onClick={() => setStep("intake")}
              className="mt-8 bg-[#ff63ce] text-white px-10 py-4 text-xs tracking-[3px] uppercase hover:bg-[#111] transition-colors"
            >
              Continuer →
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── STEP 4 — Intake form ──
  if (step === "intake") {
    return (
      <div className="space-y-8 max-w-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setStep("slots")}
            className="text-xs text-gray-500 hover:text-gray-600"
          >
            ← Retour
          </button>
        </div>

        <div>
          <p className="text-xs tracking-[4px] uppercase text-[#ff63ce] mb-6">
            04 — Préparer la session
          </p>

          <div className="bg-white border border-[#f0e0ec] p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-xs tracking-[2px] uppercase text-gray-500">
                Quel est votre objectif principal ?
              </label>
              <textarea
                value={intake.goal}
                onChange={(e) => setIntake({ ...intake, goal: e.target.value })}
                rows={3}
                placeholder="Ex: Développer ma stratégie de contenu Instagram..."
                className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#ff63ce] resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs tracking-[2px] uppercase text-gray-500">
                Quels défis rencontrez-vous ?
              </label>
              <textarea
                value={intake.challenges}
                onChange={(e) =>
                  setIntake({ ...intake, challenges: e.target.value })
                }
                rows={3}
                placeholder="Ex: Je n'arrive pas à être régulière..."
                className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#ff63ce] resize-none"
              />
            </div>

            {/* Summary */}
            <div className="border border-[#f0e0ec] rounded p-4 space-y-2 bg-[#fdf0fa]">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Session</span>
                <span className="font-medium">{selectedType?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Durée</span>
                <span>{selectedType?.duration} minutes</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Date</span>
                <span>
                  {selectedDate?.toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                  })}{" "}
                  à{" "}
                  {selectedSlot &&
                    new Date(selectedSlot.start).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                </span>
              </div>
              <div className="flex justify-between text-sm font-medium pt-2 border-t border-[#f0e0ec]">
                <span>Total</span>
                <span className="font-serif text-lg">
                  {formatPrice(selectedType!.price, currency as any)}
                </span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={createBooking}
              disabled={loading}
              className="w-full bg-[#ff63ce] text-white py-4 text-xs tracking-[3px] uppercase hover:bg-[#111] transition-colors disabled:opacity-60"
            >
              {loading
                ? "Création de la réservation..."
                : "Réserver et payer →"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
