// app/(public)/checkout/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CheckoutClient from "./_components/CheckoutClient";
import { Sparkles } from "lucide-react";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{
    courseId?: string;
    bookingId?: string;
    sessionTypeId?: string;
    currency?: string;
    country?: string;
    amount?: string;
    type?: string;
  }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const {
    courseId,
    bookingId,
    sessionTypeId,
    currency = "XAF",
    country = "CM",
    amount: amountStr,
    type = "COURSE",
  } = await searchParams;

  // ── COACHING FLOW ──────────────────────────
  if (type === "COACHING" && bookingId && sessionTypeId) {
    const sessionType = await prisma.coachingSessionType.findUnique({
      where: { id: sessionTypeId },
    });

    if (!sessionType) redirect("/coaching");

    const price =
      Number(amountStr) ||
      (currency === "EUR"
        ? sessionType.price_eur
        : currency === "USD"
          ? sessionType.price_usd
          : sessionType.price_xaf);

    return (
      <div className="min-h-screen bg-[#E9E4E0] py-16">
        <div className="max-w-4xl mx-auto px-6">
          <p className="flex items-center gap-1.5 text-xs tracking-[4px] uppercase text-[#a61968] mb-3">
            Paiement sécurisé
          </p>
          <h1 className="font-serif text-3xl font-medium text-[#172A39] mb-12">
            Finaliser ma réservation
          </h1>
          <CheckoutClient
            course={{
              id: bookingId,
              title: sessionType.name,
              thumbnail_url: null,
              price_xaf: sessionType.price_xaf,
              price_usd: sessionType.price_usd,
              price_eur: sessionType.price_eur,
              is_free: false,
            }}
            initialCurrency={currency}
            initialCountry={country}
            userEmail={session.user.email!}
            productType="COACHING"
            productId={bookingId}
          />
        </div>
      </div>
    );
  }

  // ── COURSE FLOW ────────────────────────────
  if (!courseId) redirect("/courses");

  const course = await prisma.course.findUnique({
    where: { id: courseId, status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      thumbnail_url: true,
      price_xaf: true,
      price_usd: true,
      price_eur: true,
      is_free: true,
    },
  });

  if (!course) redirect("/courses");

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      user_id_course_id: {
        user_id: session.user.id,
        course_id: courseId,
      },
    },
  });

  if (enrollment) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-[#E9E4E0] py-16">
      <div className="max-w-4xl mx-auto pt-24 px-6">
        <p className="flex items-center gap-1.5 text-xs tracking-[4px] uppercase text-[#a61968] mb-3">
          Paiement sécurisé
        </p>
        <h1 className="font-serif text-3xl font-medium text-[#172A39] mb-12">
          Finaliser mon inscription
        </h1>
        <CheckoutClient
          course={course}
          initialCurrency={currency}
          initialCountry={country}
          userEmail={session.user.email!}
          productType="COURSE"
          productId={courseId}
        />
      </div>
    </div>
  );
}
