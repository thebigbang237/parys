// app/(public)/coaching/page.tsx
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getUserGeoContext } from "@/lib/actions/geo.actions";
import { formatPrice } from "@/lib/utils";
import CoachingBookingFlow from "./_components/CoachingBookingFlow";
import { Sparkles } from "lucide-react";

export default async function CoachingPage({
  searchParams,
}: {
  searchParams: Promise<{ sessionType?: string }>;
}) {
  const { sessionType } = await searchParams;
  const [session, sessionTypes, geo] = await Promise.all([
    auth(),
    prisma.coachingSessionType.findMany({
      where: { active: true },
      orderBy: { price_xaf: "asc" },
    }),
    getUserGeoContext(),
  ]);

  return (
    <div className="min-h-screen bg-[#E9E4E0]">
      {/* Hero */}
      <div className="bg-[#E9E4E0] border-b pt-24 border-[#f3dfea]">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <p className="flex items-center gap-1.5 text-xs tracking-[4px] uppercase text-[#a61968] mb-1">
            Coaching privé
          </p>
          <h1 className="font-serif text-xl md:text-3xl font-medium text-[#172A39] mb-2">
            Un accompagnement{" "}
            <span className=" text-[#a61968]">sur-mesure</span>
          </h1>
          <p className="text-[#172A39]/80 text-base sm:text-lg max-w-xl">
            Réservez une session en tête-à-tête avec Parys. Stratégie, création
            de contenu, personal branding — des moments qui change tout.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">
        {sessionTypes.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[#172A39]/80">
              Aucune session disponible pour l'instant.
            </p>
          </div>
        ) : (
          <CoachingBookingFlow
            sessionTypes={sessionTypes.map((s) => ({
              ...s,
              price:
                geo.currency === "EUR"
                  ? s.price_eur
                  : geo.currency === "USD"
                    ? s.price_usd
                    : s.price_xaf,
            }))}
            currency={geo.currency}
            country={geo.country}
            isLoggedIn={!!session}
            canUseMobileMoney={geo.mobileMoney}
            initialSessionTypeId={sessionType}
          />
        )}
      </div>
    </div>
  );
}
