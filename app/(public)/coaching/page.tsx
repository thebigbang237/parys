// app/(public)/coaching/page.tsx
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { getUserGeoContext } from "@/lib/actions/geo.actions"
import { formatPrice } from "@/lib/utils"
import CoachingBookingFlow from "./_components/CoachingBookingFlow"

export default async function CoachingPage() {
  const [session, sessionTypes, geo] = await Promise.all([
    auth(),
    prisma.coachingSessionType.findMany({
      where: { active: true },
      orderBy: { price_xaf: "asc" },
    }),
    getUserGeoContext(),
  ])

  return (
    <div className="min-h-screen bg-[#fcf8f8]">
      {/* Hero */}
      <div className="bg-white border-b border-[#f0e0ec]">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <p className="text-xs tracking-[4px] uppercase text-[#ff63ce] mb-3">
            ✦ Coaching privé
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-medium text-gray-900 mb-4">
            Un accompagnement{" "}
            <span className="italic text-[#ff63ce]">sur-mesure</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-xl">
            Réservez une session en tête-à-tête avec Parys. Stratégie,
            création de contenu, personal branding — une heure qui change tout.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">
        {sessionTypes.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400">
              Aucune session disponible pour l'instant.
            </p>
          </div>
        ) : (
          <CoachingBookingFlow
            sessionTypes={sessionTypes.map((s) => ({
              ...s,
              price: geo.currency === "EUR"
                ? s.price_eur
                : geo.currency === "USD"
                ? s.price_usd
                : s.price_xaf,
            }))}
            currency={geo.currency}
            country={geo.country}
            isLoggedIn={!!session}
            canUseMobileMoney={geo.mobileMoney}
          />
        )}
      </div>
    </div>
  )
}