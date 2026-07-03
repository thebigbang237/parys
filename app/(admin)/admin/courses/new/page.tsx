"use client";

import { useState } from "react";
import { createCourse } from "@/lib/actions/course.actions";
import ImageUpload from "@/components/admin/ImageUpload";
import Link from "next/link";

export default function NewCoursePage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    // Inject the uploaded image URL
    formData.set("thumbnail_url", thumbnailUrl);

    const result = await createCourse(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <p className="text-xs tracking-[3px] uppercase text-[#ff63ce] mb-1">
          Formations
        </p>
        <h1 className="text-2xl font-serif font-medium">Nouvelle formation</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm mb-6 rounded">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white border border-gray-100 rounded p-8"
      >
        {/* Thumbnail upload */}
        <ImageUpload
          value={thumbnailUrl}
          onChange={setThumbnailUrl}
          folder="courses"
          aspect="video"
          label="Image de couverture"
        />

        <div className="space-y-1">
          <label className="text-xs tracking-[2px] uppercase text-gray-500">
            Titre *
          </label>
          <input
            name="title"
            required
            placeholder="Création de contenu"
            className="w-full border border-gray-200 rounded px-4 py-3 text-sm focus:outline-none focus:border-[#ff63ce] transition-colors"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs tracking-[2px] uppercase text-gray-500">
            Description *
          </label>
          <textarea
            name="description"
            required
            rows={4}
            placeholder="Décris ta formation en détail..."
            className="w-full border border-gray-200 rounded px-4 py-3 text-sm focus:outline-none focus:border-[#ff63ce] transition-colors resize-none"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { name: "price_xaf", label: "Prix XAF", placeholder: "40000" },
            { name: "price_usd", label: "Prix USD", placeholder: "65" },
            { name: "price_eur", label: "Prix EUR", placeholder: "60" },
          ].map((field) => (
            <div key={field.name} className="space-y-1">
              <label className="text-xs tracking-[2px] uppercase text-gray-500">
                {field.label} *
              </label>
              <input
                name={field.name}
                type="number"
                min="0"
                required
                placeholder={field.placeholder}
                className="w-full border border-gray-200 rounded px-4 py-3 text-sm focus:outline-none focus:border-[#ff63ce] transition-colors"
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="is_free"
            id="is_free"
            className="accent-[#ff63ce]"
          />
          <label htmlFor="is_free" className="text-sm text-gray-600">
            Formation gratuite
          </label>
        </div>

        <div className="flex gap-4 pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#ff63ce] text-white px-8 py-3 text-xs tracking-[2px] uppercase hover:bg-[#111] transition-colors disabled:opacity-60"
          >
            {loading ? "Création..." : "Créer la formation"}
          </button>
          <Link
            href="/admin/courses"
            className="border border-gray-200 px-8 py-3 text-xs tracking-[2px] uppercase hover:bg-gray-50 transition-colors"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
