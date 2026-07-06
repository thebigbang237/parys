// app/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getUserGeoContext } from "@/lib/actions/geo.actions";
import Image from "next/image";
import {
  Video,
  Calendar,
  FileText,
  Wallet,
  CreditCard,
  Landmark,
} from "lucide-react";
import TestimonialsCarousel from "./_components/TestimonialsCarousel";
import HomeCoachingPicker from "./_components/HomeCoachingPicker";

export default async function HomePage() {
  const [courses, geo, coachingSessions, session] = await Promise.all([
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
    auth(),
  ]);

  let enrolledCourseIds = new Set<string>();
  if (session?.user?.id) {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        user_id: session.user.id,
        course_id: { in: courses.map((c) => c.id) },
      },
      select: { course_id: true },
    });
    enrolledCourseIds = new Set(enrollments.map((e) => e.course_id));
  }

  const homeVideoId = process.env.HOME_VIDEO_ID;
  const streamCustomerCode = process.env.CLOUDFLARE_STREAM_CUSTOMER_CODE;

  return (
    <div className="min-h-screen bg-white pt-24">
              {/* Dot pattern overlay */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[.5] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, #ff63ce 1.5px, transparent 1.5px)",
            backgroundSize: "24px 24px",
          }}
        />
      {/* Hero */}
      <section className="relative overflow-hidden max-w-6xl h-dvh mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">


        <div className="relative z-10">
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-medium text-gray-900 leading-tight sm:leading-none mb-5">
            Bienvenue <span>Chez</span>{" "}
            <span className="font-bold font-sans text-[#ff63ce]">Parys</span>
          </h1>
          <p className="text-gray-500 text-base sm:text-lg leading-relaxed mb-5 max-w-md">
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
        <div className="relative z-10 h-full aspect-4/6 hidden md:flex overflow-hidden">
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
            <div className="flex justify-between items-end mb-12 gap-4">
              <div>
                <p className="flex items-center gap-1.5 text-xs tracking-[4px] uppercase text-[#ff63ce] mb-2">
                  Mes formations
                </p>
                <h2 className="font-serif text-xl leading-none sm:text-3xl md:text-4xl font-medium text-gray-900">
                  Des programmes pensés pour toi
                </h2>
              </div>
              <Link
                href="/courses"
                className="text-xs tracking-[2px] uppercase border-b border-gray-900 pb-0.5 hover:text-[#ff63ce] hover:border-[#ff63ce] transition-colors shrink-0"
              >
                Tout voir →
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {courses.map((course) => {
                const isEnrolled = enrolledCourseIds.has(course.id);

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
                      <h3 className="font-serif text-xl font-medium text-gray-900 mb-2  transition-all">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                        {course.description}
                      </p>
                      <div className="flex justify-between items-center">

                        <span className="text-xs text-[#ff63ce]">
                          {isEnrolled ? "Continuer →" : "S'inscrire →"}
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
              <div className="flex items-start justify-between gap-4 mb-12">
                <div>
                  <p className="text-xs tracking-[4px] uppercase text-[#ff63ce] mb-2">
                    Accompagnement privé
                  </p>
                  <h2 className="font-serif text-xl leading-none md:text-3xl font-medium text-gray-900">
                    Le Coaching 1-to-1
                  </h2>
                </div>
                <Link
                  href="/coaching"
                  className="text-xs tracking-[2px] uppercase border-b border-gray-900 pb-0.5 hover:text-[#ff63ce] hover:border-[#ff63ce] transition-colors shrink-0"
                >
                  Tout voir →
                </Link>
              </div>
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
              {coachingSessions.length === 0 ? (
                <div className="bg-white border border-[#f0e0ec] p-8 w-full">
                  <h3 className="font-serif text-lg sm:text-xl font-medium text-gray-900 text-center mb-6">
                    Réserver une séance
                  </h3>
                  <p className="text-sm text-gray-500 text-center py-4">
                    Sessions bientôt disponibles
                  </p>
                </div>
              ) : (
                <HomeCoachingPicker
                  sessions={coachingSessions.slice(0, 3).map((s) => ({
                    id: s.id,
                    name: s.name,
                    duration: s.duration,
                    price:
                      geo.currency === "EUR"
                        ? s.price_eur
                        : geo.currency === "USD"
                          ? s.price_usd
                          : s.price_xaf,
                  }))}
                  currency={geo.currency}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-24 border-b border-[#f0e0ec]">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-medium text-gray-900 text-center underline decoration-[#ff63ce] decoration-1 underline-offset-8 mb-16">
            Ils nous font confiance
          </h2>
          <TestimonialsCarousel
            testimonials={[
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
            ]}
          />
        </div>
      </section>

      {/* Payment methods */}
      <section className="py-12 border-b border-[#f0e0ec]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <span className="text-xs tracking-[3px] uppercase text-gray-500 whitespace-nowrap">
              Paiement sécurisé via mobile money
            </span>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { label: "MTN", color: "#ffcc00" },
                { label: "Orange", color: "#ff6600" },
                { label: "Wave", color: "#2c4eff" },
                { label: "M-Pesa", color: "#e31837" },
                { label: "+", color: "#6a7282 " },
              ].map((p) => (
                <div
                  key={p.label}
                  className="px-3 py-1 bg-white border border-[#f0e0ec] font-bold text-[10px]"
                  style={{ color: p.color }}
                >
                  {p.label}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-6 text-gray-400">
            <Wallet size={20} strokeWidth={1.5} />
            <CreditCard size={20} strokeWidth={1.5} />
            <span>PAYPAL</span>
          </div>
        </div>
      </section>
    </div>
  );
}
