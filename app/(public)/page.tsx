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

  const homeVideoId = process.env.HOME_VIDEO_ID;
  const streamCustomerCode = process.env.CLOUDFLARE_STREAM_CUSTOMER_CODE;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="max-w-6xl h-dvh mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <h1 className="font-serif text-5xl md:text-6xl font-medium text-gray-900 leading-none mb-5">
            Bienvenue <span>Chez</span>{" "}
            <span className="font-bold font-sans text-[#ff63ce]">Parys</span>
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed mb-5 max-w-md">
            Des formations premium en création de contenu conçues pour les
            femmes ambitieuses d'Afrique et du monde.
          </p>
          <div className="flex gap-4">
            <Link
              href="/courses"
              className="bg-[#ff63ce] text-white rounded-3xl px-10 py-4 text-xs tracking-[3px] uppercase hover:bg-[#ff63cec7] transition-colors"
            >
              Rejoins-moi
            </Link>
          </div>
        </div>

        {/* Right panel */}
        <div className="relative h-full aspect-4/6 hidden md:flex overflow-hidden">
          <Image
            src="/images/Parys-Acceuil.png"
            alt="Parys Batonda"
            fill
            priority
            className="object-contain object-bottom"
          />
        </div>
      </section>

      {/* Intro video */}
      <section className="max-w-6xl mx-auto mb-20 px-6">
        <div className="relative aspect-video bg-[#111] overflow-hidden">
          {homeVideoId && streamCustomerCode ? (
            <iframe
              src={`https://customer-${streamCustomerCode}.cloudflarestream.com/${homeVideoId}/iframe?preload=true&poster=${encodeURIComponent(
                `https://customer-${streamCustomerCode}.cloudflarestream.com/${homeVideoId}/thumbnails/thumbnail.jpg?height=600`,
              )}`}
              loading="lazy"
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-white/40 text-sm">Vidéo bientôt disponible</p>
            </div>
          )}
        </div>
      </section>

      {/* Courses preview */}
      {courses.length > 0 && (
        <section className="bg-[#fdf0fa]  py-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex justify-between items-end mb-12">
              <div>
                <p className="flex items-center gap-1.5 text-xs tracking-[4px] uppercase text-[#ff63ce] mb-3">
                  Mes formations
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

      {/* Testimonials */}
      <section className="px-6 py-24 border-b border-[#f0e0ec]">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-4xl font-medium text-gray-900 text-center underline decoration-[#ff63ce] decoration-1 underline-offset-8 mb-16">
            Ils nous font confiance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                quote:
                  "L'académie a radicalement changé ma vision du branding. Je vends maintenant trois fois plus cher.",
                name: "Marie-Lucie, Dakar",
              },
              {
                quote:
                  "Un contenu d'une qualité rare en Afrique. Parys est une mentore exceptionnelle et dévouée.",
                name: "Fatou, Abidjan",
              },
              {
                quote:
                  "Enfin une formation qui comprend les réalités de nos marchés tout en visant l'excellence internationale.",
                name: "Grace, Douala",
              },
            ].map((t) => (
              <div
                key={t.name}
                className="flex flex-col items-center text-center"
              >
                <p className="font-serif text-xl italic text-gray-900 leading-relaxed mb-8">
                  "{t.quote}"
                </p>
                <p className="text-xs tracking-[4px] uppercase font-medium text-gray-500">
                  {t.name}
                </p>
              </div>
            ))}
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
