// app/(admin)/admin/courses/[id]/_components/CourseForm.tsx
"use client";

import { useState } from "react";
import { updateCourse } from "@/lib/actions/course.actions";
import ImageUpload from "@/components/admin/ImageUpload";
import { Check, X } from "lucide-react";

export default function CourseForm({ course }: { course: any }) {
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState(course.thumbnail_url || "");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("thumbnail_url", thumbnailUrl);

    const result = await updateCourse(course.id, formData);
    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Sauvegardé" });
      setTimeout(() => setMessage(null), 3000);
    }
  }

  return (
    <div className="bg-white border border-gray-100 rounded p-6 space-y-5">
      <h2 className="text-xs tracking-[3px] uppercase text-gray-500 font-medium">
        Paramètres
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <ImageUpload
          value={thumbnailUrl}
          onChange={setThumbnailUrl}
          folder="courses"
          aspect="video"
          label="Image de couverture"
        />

        <div className="space-y-1">
          <label className="text-xs text-gray-500 uppercase tracking-[1px]">
            Titre
          </label>
          <input
            name="title"
            defaultValue={course.title}
            required
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#ff63ce]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-gray-500 uppercase tracking-[1px]">
            Description
          </label>
          <textarea
            name="description"
            defaultValue={course.description}
            rows={3}
            required
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#ff63ce] resize-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-3">
          {[
            { name: "price_xaf", label: "XAF", value: course.price_xaf },
            { name: "price_usd", label: "USD", value: course.price_usd },
            { name: "price_eur", label: "EUR", value: course.price_eur },
          ].map((f) => (
            <div key={f.name} className="space-y-1">
              <label className="text-xs text-gray-500 uppercase tracking-[1px]">
                Prix {f.label}
              </label>
              <input
                name={f.name}
                type="number"
                defaultValue={f.value}
                min="0"
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#ff63ce]"
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_free"
            id="is_free_edit"
            defaultChecked={course.is_free}
            className="accent-[#ff63ce]"
          />
          <label htmlFor="is_free_edit" className="text-sm text-gray-600">
            Gratuite
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-[#111] text-white py-2.5 text-xs tracking-[2px] uppercase hover:bg-[#ff63ce] transition-colors"
        >
          Sauvegarder
        </button>

        {message && (
          <p
            className={`flex items-center justify-center gap-1.5 text-xs ${
              message.type === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {message.type === "success" ? (
              <Check size={14} />
            ) : (
              <X size={14} />
            )}
            {message.text}
          </p>
        )}
      </form>
    </div>
  );
}
