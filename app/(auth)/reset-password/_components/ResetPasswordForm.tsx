// app/(auth)/reset-password/_components/ResetPasswordForm.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { resetPassword } from "@/lib/actions/auth.actions";
import { cn } from "@/lib/utils";

export default function ResetPasswordForm({ token }: { token: string }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    const result = await resetPassword({ token, newPassword });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // On success, resetPassword signs the user in and redirects to /dashboard.
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm space-y-2">
          <p>{error}</p>
          <Link
            href="/forgot-password"
            className="text-[#ff63ce] font-medium hover:underline inline-block"
          >
            Demander un nouveau lien
          </Link>
        </div>
      )}

      <div className="space-y-1">
        <label className="text-xs tracking-[2px] uppercase text-gray-500">
          Nouveau mot de passe
        </label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="••••••••"
          required
          minLength={8}
          className="w-full border-0 border-b border-gray-200 py-3 px-0 text-sm focus:outline-none focus:border-[#ff63ce] transition-colors bg-transparent"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs tracking-[2px] uppercase text-gray-500">
          Confirmer le mot de passe
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          required
          minLength={8}
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
        {loading ? "Enregistrement..." : "Réinitialiser le mot de passe"}
      </button>
    </form>
  );
}
