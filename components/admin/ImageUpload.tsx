// components/admin/ImageUpload.tsx
"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: "courses" | "profiles";
  aspect?: "video" | "square" | "wide";
  label?: string;
}

export default function ImageUpload({
  value,
  onChange,
  folder = "courses",
  aspect = "video",
  label = "Image",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectClass = {
    video: "aspect-video",
    square: "aspect-square",
    wide: "aspect-[3/1]",
  }[aspect];

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Fichier invalide — images uniquement (JPG, PNG, WebP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image trop lourde — maximum 5MB");
      return;
    }

    setError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload échoué");
        return;
      }

      onChange(data.url);
    } catch {
      setError("Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div className="space-y-2">
      <label className="text-xs tracking-[2px] uppercase text-gray-500">
        {label}
      </label>

      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        className={cn(
          "relative border-2 border-dashed rounded overflow-hidden cursor-pointer transition-all",
          aspectClass,
          dragOver
            ? "border-[#ff63ce] bg-[#fdf0fa]"
            : "border-gray-200 hover:border-[#ff63ce]",
          uploading && "pointer-events-none opacity-60",
        )}
      >
        {value ? (
          // Preview existing image
          <div className="relative w-full h-full group">
            <Image src={value} alt="Preview" fill className="object-cover" />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs tracking-[2px] uppercase">
                Changer l'image
              </span>
            </div>
          </div>
        ) : (
          // Empty state
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400">
            <svg
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <div className="text-center">
              <p className="text-xs font-medium text-gray-500">
                Glisse une image ici
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                ou clique pour choisir
              </p>
              <p className="text-xs text-gray-300 mt-1">
                JPG, PNG, WebP — max 5MB
              </p>
            </div>
          </div>
        )}

        {/* Upload progress overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-[#ff63ce] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-gray-500">Upload en cours...</p>
            </div>
          </div>
        )}
      </div>

      {/* Remove button */}
      {value && !uploading && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onChange("");
          }}
          className="text-xs text-red-400 hover:text-red-600 transition-colors"
        >
          Supprimer l'image
        </button>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
