// app/(auth)/register/page.tsx
"use client";

import { useState } from "react";
import {
  register,
  loginWithGoogle,
  resendVerificationEmail,
} from "@/lib/actions/auth.actions";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleResend() {
    setResending(true);
    await resendVerificationEmail(registeredEmail);
    setResending(false);
    setResent(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const result = await register({
      name: form.get("name") as string,
      email,
      password: form.get("password") as string,
      timezone,
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else if (result?.success) {
      setRegisteredEmail(email);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex">
      <div className="hidden md:flex w-1/2 bg-[#f9eff4] border-r border-[#f3dfea] flex-col justify-center items-center px-16">
        <div className="max-w-md space-y-8">
          <h1 className="font-serif text-5xl font-medium leading-tight">
            Rejoins l'
            <span className="italic text-[#a61968]">Académie</span>
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed">
            Des formations premium pour les créatrices de contenu ambitieuses
            d'Afrique et du monde.
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center px-6 bg-white">
        <div className="w-full max-w-[400px] space-y-8">
          {registeredEmail ? (
            <>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Vérifie ta boîte mail 📬
                </h2>
                <p className="text-gray-500 mt-1 text-sm">
                  On a envoyé un lien de confirmation à{" "}
                  <span className="font-medium text-gray-900">
                    {registeredEmail}
                  </span>
                  . Clique dessus pour activer ton compte.
                </p>
              </div>

              {resent && (
                <div className="bg-[#f9eff4] border border-[#a61968]/30 text-gray-700 px-4 py-3 text-sm">
                  Email renvoyé — pense à vérifier tes spams.
                </div>
              )}

              <button
                onClick={handleResend}
                disabled={resending}
                className={cn(
                  "w-full border border-gray-200 py-4 text-xs tracking-[2px] uppercase transition-colors",
                  resending
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:bg-gray-50",
                )}
              >
                {resending ? "Envoi..." : "Renvoyer l'email"}
              </button>

              <p className="text-center text-sm text-gray-500">
                <Link
                  href="/login"
                  className="text-[#a61968] font-medium hover:underline"
                >
                  ← Retour à la connexion
                </Link>
              </p>
            </>
          ) : (
            <>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Créer mon compte
                </h2>
                <p className="text-gray-500 mt-1 text-sm">
                  Rejoins des milliers d'étudiantes.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {[
                  {
                    name: "name",
                    label: "Nom complet",
                    type: "text",
                    placeholder: "Parys Batonda",
                  },
                  {
                    name: "email",
                    label: "Adresse e-mail",
                    type: "email",
                    placeholder: "votre@email.com",
                  },
                  {
                    name: "password",
                    label: "Mot de passe",
                    type: "password",
                    placeholder: "8 caractères minimum",
                  },
                ].map((field) => (
                  <div key={field.name} className="space-y-1">
                    <label className="text-xs tracking-[2px] uppercase text-gray-500">
                      {field.label}
                    </label>
                    <input
                      name={field.name}
                      type={field.type}
                      placeholder={field.placeholder}
                      required
                      minLength={field.name === "password" ? 8 : undefined}
                      className="w-full border-0 border-b border-gray-200 py-3 px-0 text-sm focus:outline-none focus:border-[#a61968] transition-colors bg-transparent"
                    />
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    "w-full bg-[#a61968] text-white py-4 text-xs tracking-[3px] uppercase font-medium transition-all",
                    loading
                      ? "opacity-60 cursor-not-allowed"
                      : "hover:bg-[#172A39]",
                  )}
                >
                  {loading ? "Création..." : "Créer mon compte"}
                </button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-xs text-gray-500 uppercase tracking-[2px]">
                    ou
                  </span>
                </div>
              </div>

              <form action={loginWithGoogle}>
                <button
                  type="submit"
                  className="w-full border border-gray-200 py-4 text-xs tracking-[2px] uppercase flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors"
                >
                  <GoogleIcon />
                  Continuer avec Google
                </button>
              </form>

              <p className="text-center text-sm text-gray-500">
                Déjà un compte ?{" "}
                <Link
                  href="/login"
                  className="text-[#a61968] font-medium hover:underline"
                >
                  Se connecter
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
