// app/(auth)/reset-password/page.tsx
import Link from "next/link";
import ResetPasswordForm from "./_components/ResetPasswordForm";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

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

      {/* Right — form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 bg-white">
        <div className="w-full max-w-[400px] space-y-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Nouveau mot de passe
            </h2>
            <p className="text-gray-500 mt-1 text-sm">
              Choisis un nouveau mot de passe pour ton compte.
            </p>
          </div>

          {token ? (
            <ResetPasswordForm token={token} />
          ) : (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-4 text-sm space-y-3">
              <p>Ce lien de réinitialisation est invalide.</p>
              <Link
                href="/forgot-password"
                className="text-[#ff63ce] font-medium hover:underline inline-block"
              >
                Demander un nouveau lien
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
