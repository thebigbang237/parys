// app/(auth)/forgot-password/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/actions/auth.actions";
import { cn } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await requestPasswordReset(email);
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen flex">
      {/* Left — brand panel */}
      <div className="hidden md:flex w-1/2 bg-[#f9eff4] border-r border-[#f3dfea] flex-col justify-center items-center px-16">
        <div className="max-w-md space-y-8">
          <h1 className="font-serif text-5xl font-medium leading-tight">
            Content Level Up
            <span className="italic text-[#a61968]"> Academy</span>
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
              Mot de passe oublié
            </h2>
            <p className="text-gray-500 mt-1 text-sm">
              Indique ton email, on t&apos;envoie un lien pour en choisir un
              nouveau.
            </p>
          </div>

          {submitted ? (
            <div className="bg-[#f9eff4] border border-[#a61968]/30 text-gray-700 px-4 py-4 text-sm space-y-3">
              <p>
                Si un compte existe avec cet email, un lien de réinitialisation
                vient d&apos;être envoyé. Pense à vérifier tes spams.
              </p>
              <Link
                href="/login"
                className="text-[#a61968] font-medium hover:underline inline-block"
              >
                ← Retour à la connexion
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-xs tracking-[2px] uppercase text-gray-500">
                  Adresse e-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  className="w-full border-0 border-b border-gray-200 py-3 px-0 text-sm focus:outline-none focus:border-[#a61968] transition-colors bg-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full bg-[#a61968] text-white py-4 text-xs tracking-[3px] uppercase font-medium transition-all",
                  loading ? "opacity-60 cursor-not-allowed" : "hover:bg-[#172A39]",
                )}
              >
                {loading ? "Envoi..." : "Envoyer le lien"}
              </button>

              <p className="text-center text-sm text-gray-500">
                <Link
                  href="/login"
                  className="text-[#a61968] font-medium hover:underline"
                >
                  ← Retour à la connexion
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
