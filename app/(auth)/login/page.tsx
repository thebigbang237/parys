// app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import {
  loginWithCredentials,
  loginWithGoogle,
} from "@/lib/actions/auth.actions";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await loginWithCredentials(email, password);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

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
          <div className="text-xs tracking-[4px] text-gray-400 uppercase">
            by Parys Batonda
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 bg-white">
        <div className="w-full max-w-[400px] space-y-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Connexion</h2>
            <p className="text-gray-500 mt-1 text-sm">
              Bienvenue dans votre espace d'apprentissage.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}

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
                className="w-full border-0 border-b border-gray-200 py-3 px-0 text-sm focus:outline-none focus:border-[#ff63ce] transition-colors bg-transparent"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="text-xs tracking-[2px] uppercase text-gray-500">
                  Mot de passe
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-[#ff63ce] hover:underline"
                >
                  Oublié ?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border-0 border-b border-gray-200 py-3 px-0 text-sm focus:outline-none focus:border-[#ff63ce] transition-colors bg-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full bg-[#ff63ce] text-white py-4 text-xs tracking-[3px] uppercase font-medium transition-all",
                loading ? "opacity-60 cursor-not-allowed" : "hover:bg-[#111]",
              )}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-xs text-gray-400 uppercase tracking-[2px]">
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
            Pas encore de compte ?{" "}
            <Link
              href="/register"
              className="text-[#ff63ce] font-medium hover:underline"
            >
              Créer mon compte
            </Link>
          </p>
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
