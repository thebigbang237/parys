// app/(student)/dashboard/page.tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) redirect("/login")

  return (
    <main className="min-h-screen bg-[#fcf8f8] p-8">
      <div className="max-w-4xl mx-auto">
        <p className="text-xs tracking-[3px] uppercase text-[#ff63ce] mb-2">
          Espace étudiant
        </p>
        <h1 className="text-3xl font-serif font-medium text-gray-900">
          Bonjour, {session.user.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-500 mt-2">
          Ton espace d'apprentissage arrive bientôt.
        </p>
      </div>
    </main>
  )
}