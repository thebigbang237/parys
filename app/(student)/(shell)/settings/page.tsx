// app/(student)/(shell)/settings/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Sparkles } from "lucide-react";
import SettingsForm from "./_components/SettingsForm";

export default async function SettingsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, image: true, password_hash: true },
  });

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-[#fcf8f8]">
      <div className="bg-white border-b border-[#f0e0ec] px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <p className="flex items-center gap-1.5 text-xs tracking-[4px] uppercase text-[#ff63ce] mb-2">
            <Sparkles size={12} /> Mon espace
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-gray-900">
            Paramètres
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Gère ton profil et ta sécurité.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <SettingsForm
          name={user.name || ""}
          email={user.email}
          image={user.image}
          hasPassword={!!user.password_hash}
        />
      </div>
    </div>
  );
}
