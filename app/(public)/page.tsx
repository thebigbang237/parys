// app/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getUserGeoContext } from "@/lib/actions/geo.actions";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import { Video, Calendar, FileText, Sparkles } from "lucide-react";

export default async function HomePage() {
  const [courses, geo, coachingSessions] = await Promise.all([
    prisma.course.findMany({
      where: { status: "PUBLISHED" },
      take: 3,
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        thumbnail_url: true,
        price_xaf: true,
        price_usd: true,
        price_eur: true,
        is_free: true,
      },
    }),
    getUserGeoContext(),
    prisma.coachingSessionType.findMany({
      where: { active: true },
      orderBy: { price_xaf: "asc" },
      take: 3,
    }),
  ]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <p className="flex items-center gap-1.5 text-xs tracking-[4px] uppercase text-[#ff63ce] mb-6">
            <Sparkles size={12} /> Content Level Up Academy
          </p>
          <h1 className="font-serif text-5xl md:text-6xl font-medium text-gray-900 leading-tight mb-8">
            Construis ton succès avec{" "}
            <span className="italic text-[#ff63ce]">Parys</span>
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed mb-10 max-w-md">
            Des formations premium en création de contenu conçues pour les
            femmes ambitieuses d'Afrique et du monde.
          </p>
          <div className="flex gap-4">
            <Link
              href="/courses"
              className="bg-[#ff63ce] text-white px-10 py-4 text-xs tracking-[3px] uppercase hover:bg-[#111] transition-colors"
            >
              Voir les formations
            </Link>
            <Link
              href="/coaching"
              className="border border-gray-200 text-gray-900 px-10 py-4 text-xs tracking-[3px] uppercase hover:bg-gray-50 transition-colors"
            >
              Coaching privé
            </Link>
          </div>

          {/* Stats */}
          <div className="flex gap-10 mt-14 pt-10 border-t border-[#f0e0ec]">
            {[
              { value: "2 400+", label: "Étudiantes" },
              { value: "4.9★", label: "Note moyenne" },
              { value: "30+", label: "Pays africains" },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-serif text-2xl font-medium text-gray-900">
                  {s.value}
                </div>
                <div className="text-xs tracking-[2px] uppercase text-gray-500 mt-1">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="relative bg-[#fdf0fa] border border-[#f0e0ec] aspect-[4/5] hidden md:block overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-serif text-[200px] text-[#ff63ce] opacity-10 italic select-none">
              P
            </span>
          </div>
          <div className="absolute bottom-8 left-8 right-8 bg-white border border-[#f0e0ec] p-6">
            <p className="text-xs tracking-[2px] uppercase text-[#ff63ce] mb-2">
              Formation disponible
            </p>
            <p className="font-serif text-xl font-medium text-gray-900">
              Création de contenu
            </p>
          </div>
        </div>
      </section>

      {/* Courses preview */}
      {courses.length > 0 && (
        <section className="bg-[#fdf0fa] border-y border-[#f0e0ec] py-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex justify-between items-end mb-12">
              <div>
                <p className="flex items-center gap-1.5 text-xs tracking-[4px] uppercase text-[#ff63ce] mb-3">
                  <Sparkles size={12} /> Mes formations
                </p>
                <h2 className="font-serif text-4xl font-medium text-gray-900">
                  Des programmes pensés pour toi
                </h2>
              </div>
              <Link
                href="/courses"
                className="text-xs tracking-[2px] uppercase border-b border-gray-900 pb-0.5 hover:text-[#ff63ce] hover:border-[#ff63ce] transition-colors hidden md:block"
              >
                Tout voir →
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {courses.map((course) => {
                const price =
                  geo.currency === "XAF"
                    ? course.price_xaf
                    : geo.currency === "EUR"
                      ? course.price_eur
                      : course.price_usd;

                return (
                  <Link
                    key={course.id}
                    href={`/courses/${course.slug}`}
                    className="group bg-white border border-[#f0e0ec] hover:border-[#ff63ce] transition-colors"
                  >
                    <div className="relative aspect-video bg-[#fdf0fa] overflow-hidden">
                      {course.thumbnail_url ? (
                        <Image
                          src={course.thumbnail_url}
                          alt={course.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="font-serif text-5xl text-[#ff63ce] opacity-20 italic">
                            P
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-serif text-xl font-medium text-gray-900 mb-2 group-hover:italic transition-all">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                        {course.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="font-serif text-xl text-gray-900">
                          {course.is_free
                            ? "Gratuit"
                            : formatPrice(price, geo.currency)}
                        </span>
                        <span className="text-xs text-[#ff63ce]">
                          S'inscrire →
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Coaching section */}
      <section className="border-b border-[#f0e0ec]">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2">
            {/* Left — features */}
            <div className="px-6 py-24 border-r border-[#f0e0ec]">
              <p className="text-xs tracking-[4px] uppercase text-[#ff63ce] mb-4">
                Accompagnement privé
              </p>
              <h2 className="font-serif text-4xl font-medium text-gray-900 mb-12">
                Le Coaching 1-to-1
              </h2>
              <div className="space-y-10">
                {[
                  {
                    icon: Video,
                    title: "Sessions visio",
                    desc: "60 minutes d'échange intense pour débloquer vos problématiques business spécifiques.",
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
                ].map((f) => (
                  <div key={f.title} className="flex gap-5">
                    <f.icon className="text-[#ff63ce] mt-0.5" size={22} />
                    <div>
                      <h4 className="text-xs tracking-[2px] uppercase font-medium text-gray-900 mb-1">
                        {f.title}
                      </h4>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        {f.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — session types */}
            <div className="bg-[#fdf0fa] px-6 py-24 flex items-center">
              <div className="bg-white border border-[#f0e0ec] p-8 space-y-4 w-full">
                <h3 className="font-serif text-xl font-medium text-gray-900 text-center mb-6">
                  Réserver une séance
                </h3>
                {coachingSessions.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Sessions bientôt disponibles
                  </p>
                ) : (
                  coachingSessions.slice(0, 3).map((s, idx) => (
                    <div
                      key={s.id}
                      className={`p-5 border cursor-pointer transition-colors ${
                        idx === 0
                          ? "border-[#ff63ce] bg-[#fdf0fa]"
                          : "border-[#f0e0ec] hover:border-[#ff63ce]"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs tracking-[2px] uppercase font-medium text-gray-900">
                          {s.name}
                        </span>
                        <span className="font-serif text-lg text-gray-900">
                          {formatPrice(
                            geo.currency === "EUR"
                              ? s.price_eur
                              : geo.currency === "USD"
                                ? s.price_usd
                                : s.price_xaf,
                            geo.currency,
                          )}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Session de {s.duration} minutes
                      </p>
                    </div>
                  ))
                )}
                <Link
                  href="/coaching"
                  className="w-full bg-[#111] text-white py-4 text-xs tracking-[3px] uppercase hover:bg-[#ff63ce] transition-colors text-center block mt-4"
                >
                  Continuer vers le calendrier →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payment methods */}
      <section className="py-12 border-b border-[#f0e0ec]">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-xs tracking-[4px] uppercase text-gray-500 text-center mb-6">
            Moyens de paiement acceptés
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { label: "MTN MoMo", color: "#ffcc00" },
              { label: "Orange Money", color: "#ff6600" },
              { label: "Wave", color: "#2c4eff" },
              { label: "M-Pesa", color: "#00a550" },
              { label: "Airtel Money", color: "#e31837" },
              { label: "PayPal", color: "#003087" },
              { label: "Visa / Mastercard", color: "#555" },
            ].map((p) => (
              <div
                key={p.label}
                className="border border-[#f0e0ec] bg-white px-4 py-2 text-xs font-medium"
                style={{ color: p.color }}
              >
                {p.label}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
