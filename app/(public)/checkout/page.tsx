// app/(public)/checkout/page.tsx
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import CheckoutClient from "./_components/CheckoutClient"

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{
    courseId?: string
    currency?: string
    country?: string
  }>
}) {
  const session = await auth()
  if (!session) redirect("/login")

  const { courseId, currency = "XAF", country = "CM" } = await searchParams

  if (!courseId) redirect("/courses")

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
  })

  if (!course) redirect("/courses")

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      user_id_course_id: {
        user_id: session.user.id,
        course_id: courseId,
      },
    },
  })

  if (enrollment) redirect("/dashboard")

  return (
    <div className="min-h-screen bg-[#fcf8f8] py-16">
      <div className="max-w-4xl mx-auto px-6">
        <p className="text-xs tracking-[4px] uppercase text-[#ff63ce] mb-3">
          ✦ Paiement sécurisé
        </p>
        <h1 className="font-serif text-3xl font-medium text-gray-900 mb-12">
          Finaliser mon inscription
        </h1>

        <CheckoutClient
          course={course}
          initialCurrency={currency}
          initialCountry={country}
          userEmail={session.user.email!}
        />
      </div>
    </div>
  )
}