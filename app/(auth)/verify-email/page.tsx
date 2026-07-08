// app/(auth)/verify-email/page.tsx
import Link from "next/link";
import { verifyEmail } from "@/lib/actions/auth.actions";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = token ? await verifyEmail(token) : { error: "Lien invalide." };

  return (
    <main className="min-h-screen flex">
      {/* Left — brand panel */}
      <div className="hidden md:flex w-1/2 bg-[#fdf0fa] border-r border-[#f0e0ec] flex-col justify-center items-center px-16">
        <div className="max-w-md space-y-8">
          <h1 className="font-serif text-5xl font-medium leading-tight">
            Content Level Up
            <span className="italic text-[#ff63ce]"> Academy</span>
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed">
            La plateforme de référence pour les créatrices de contenu
            ambitieuses en Afrique.
          </p>
          <div className="text-xs tracking-[4px] text-gray-500 uppercase">
            by Parys Batonda
          </div>
        </div>
      </div>

      {/* Right — result */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 bg-white">
        <div className="w-full max-w-[400px] space-y-6">
          {result.error ? (
            <>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Lien invalide
                </h2>
                <p className="text-gray-500 mt-1 text-sm">{result.error}</p>
              </div>
              <Link
                href="/forgot-password"
                className="text-[#ff63ce] font-medium hover:underline inline-block text-sm"
              >
                Besoin d&apos;un nouveau lien ? Repars de la connexion →
              </Link>
            </>
          ) : (
            <>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Email confirmé ✓
                </h2>
                <p className="text-gray-500 mt-1 text-sm">
                  Ton adresse email est vérifiée. Tu peux maintenant te
                  connecter.
                </p>
              </div>
              <Link
                href="/login"
                className="w-full bg-[#ff63ce] text-white py-4 text-xs tracking-[3px] uppercase font-medium hover:bg-[#111] transition-all inline-block text-center"
              >
                Se connecter →
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
