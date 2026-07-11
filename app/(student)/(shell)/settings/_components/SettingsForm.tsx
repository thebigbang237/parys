// app/(student)/(shell)/settings/_components/SettingsForm.tsx
"use client";

import { useState } from "react";
import ImageUpload from "@/components/admin/ImageUpload";
import { updateProfile, changePassword } from "@/lib/actions/user.actions";

export default function SettingsForm({
  name: initialName,
  email,
  image: initialImage,
  hasPassword,
}: {
  name: string;
  email: string;
  image: string | null;
  hasPassword: boolean;
}) {
  const [name, setName] = useState(initialName);
  const [image, setImage] = useState(initialImage || "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage(null);

    const result = await updateProfile({ name, image });

    if (result?.error) {
      setProfileMessage({ type: "error", text: result.error });
    } else {
      setProfileMessage({ type: "success", text: "Profil mis à jour." });
    }
    setProfileSaving(false);
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordMessage({
        type: "error",
        text: "Les mots de passe ne correspondent pas.",
      });
      return;
    }

    setPasswordSaving(true);
    const result = await changePassword({ currentPassword, newPassword });

    if (result?.error) {
      setPasswordMessage({ type: "error", text: result.error });
    } else {
      setPasswordMessage({ type: "success", text: "Mot de passe mis à jour." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setPasswordSaving(false);
  }

  return (
    <div className="space-y-12">
      {/* Profile */}
      <form
        onSubmit={handleProfileSubmit}
        className="bg-white border border-[#f3dfea] p-6 sm:p-8 space-y-6"
      >
        <h2 className="font-serif text-lg sm:text-xl font-medium text-gray-900">
          Profil
        </h2>

        <div className="max-w-[160px]">
          <ImageUpload
            value={image}
            onChange={setImage}
            folder="profiles"
            aspect="square"
            label="Photo de profil"
            endpoint="/api/upload/avatar"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs tracking-[2px] uppercase text-gray-500">
            Nom
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#a61968]"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs tracking-[2px] uppercase text-gray-500">
            Email
          </label>
          <input
            value={email}
            disabled
            className="w-full border border-gray-200 px-4 py-3 text-sm bg-gray-50 text-gray-400"
          />
        </div>

        {profileMessage && (
          <p
            className={`text-sm ${
              profileMessage.type === "success"
                ? "text-[#a61968]"
                : "text-red-500"
            }`}
          >
            {profileMessage.text}
          </p>
        )}

        <button
          type="submit"
          disabled={profileSaving}
          className="bg-[#a61968] text-white px-8 py-3 text-xs tracking-[2px] uppercase hover:bg-[#172A39] transition-colors disabled:opacity-60"
        >
          {profileSaving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>

      {/* Password */}
      <div className="bg-white border border-[#f3dfea] p-6 sm:p-8 space-y-6">
        <h2 className="font-serif text-lg sm:text-xl font-medium text-gray-900">
          Mot de passe
        </h2>

        {!hasPassword ? (
          <p className="text-sm text-gray-500">
            Tu es connectée via Google — il n&apos;y a pas de mot de passe à gérer
            pour ce compte.
          </p>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs tracking-[2px] uppercase text-gray-500">
                Mot de passe actuel
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#a61968]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs tracking-[2px] uppercase text-gray-500">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#a61968]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs tracking-[2px] uppercase text-gray-500">
                Confirmer le nouveau mot de passe
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#a61968]"
              />
            </div>

            {passwordMessage && (
              <p
                className={`text-sm ${
                  passwordMessage.type === "success"
                    ? "text-[#a61968]"
                    : "text-red-500"
                }`}
              >
                {passwordMessage.text}
              </p>
            )}

            <button
              type="submit"
              disabled={passwordSaving}
              className="bg-[#172A39] text-white px-8 py-3 text-xs tracking-[2px] uppercase hover:bg-[#a61968] transition-colors disabled:opacity-60"
            >
              {passwordSaving ? "Enregistrement..." : "Changer le mot de passe"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
