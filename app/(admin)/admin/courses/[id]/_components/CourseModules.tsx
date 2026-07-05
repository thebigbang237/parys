// app/(admin)/admin/courses/[id]/_components/CourseModules.tsx
"use client";

import { useState, useRef } from "react";
import {
  createModule,
  deleteModule,
  createLesson,
  deleteLesson,
  updateLesson,
} from "@/lib/actions/course.actions";
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  CheckCircle2,
  Upload,
  X,
} from "lucide-react";

type Lesson = {
  id: string;
  title: string;
  cloudflare_video_id: string | null;
  is_preview: boolean;
  order_index: number;
  status: string;
};

type Module = {
  id: string;
  title: string;
  order_index: number;
  lessons: Lesson[];
};

type Course = {
  id: string;
  modules: Module[];
};

export default function CourseModules({ course }: { course: Course }) {
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [addingModule, setAddingModule] = useState(false);
  const [expandedModules, setExpandedModules] = useState<string[]>(
    course.modules.map((m) => m.id),
  );

  async function handleAddModule() {
    if (!newModuleTitle.trim()) return;
    setAddingModule(true);
    await createModule(course.id, newModuleTitle.trim());
    setNewModuleTitle("");
    setAddingModule(false);
  }

  function toggleModule(id: string) {
    setExpandedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xs tracking-[3px] uppercase text-gray-500 font-medium">
          Curriculum
        </h2>
        <span className="text-xs text-gray-500">
          {course.modules.length} module(s)
        </span>
      </div>

      {course.modules.map((module) => (
        <div
          key={module.id}
          className="bg-white border border-gray-100 rounded overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <button
              onClick={() => toggleModule(module.id)}
              className="flex items-center gap-2 text-left flex-1"
            >
              <span className="text-[#ff63ce]">
                {expandedModules.includes(module.id) ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </span>
              <span className="font-medium text-sm">{module.title}</span>
              <span className="text-xs text-gray-500 ml-2">
                ({module.lessons.length} leçon
                {module.lessons.length !== 1 ? "s" : ""})
              </span>
            </button>
            <button
              onClick={async () => {
                if (confirm(`Supprimer le module "${module.title}" ?`)) {
                  await deleteModule(module.id, course.id);
                }
              }}
              className="text-xs text-red-400 hover:text-red-600 transition-colors px-2"
            >
              Supprimer
            </button>
          </div>

          {expandedModules.includes(module.id) && (
            <div className="p-4 space-y-2">
              {module.lessons.map((lesson) => (
                <LessonRow
                  key={lesson.id}
                  lesson={lesson}
                  courseId={course.id} // ← explicitly passed
                />
              ))}
              <AddLessonForm moduleId={module.id} courseId={course.id} />
            </div>
          )}
        </div>
      ))}

      <div className="bg-white border border-dashed border-gray-200 rounded p-4">
        <div className="flex gap-3">
          <input
            value={newModuleTitle}
            onChange={(e) => setNewModuleTitle(e.target.value)}
            placeholder="Titre du nouveau module..."
            onKeyDown={(e) => e.key === "Enter" && handleAddModule()}
            className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#ff63ce]"
          />
          <button
            onClick={handleAddModule}
            disabled={addingModule || !newModuleTitle.trim()}
            className="bg-[#ff63ce] text-white px-4 py-2 text-xs tracking-[1px] uppercase disabled:opacity-50 hover:bg-[#111] transition-colors"
          >
            {addingModule ? "..." : "+ Module"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Lesson Row ────────────────────────────────
function LessonRow({ lesson, courseId }: { lesson: Lesson; courseId: string }) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoId, setVideoId] = useState(lesson.cloudflare_video_id || "");
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleVideoUpload(file: File) {
    setUploading(true);
    setUploadProgress(0);
    setUploadError("");

    try {
      // Step 1 — get signed upload URL + videoId from our API
      const res = await fetch("/api/stream/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, fileSize: file.size }),
      });

      if (!res.ok) throw new Error("Failed to get upload URL");

      const { uploadUrl, videoId: newVideoId } = await res.json();

      // Step 2 — upload directly to Cloudflare via tus
      await uploadToCloudflare(file, uploadUrl, (progress) => {
        setUploadProgress(progress);
      });

      // Step 3 — save videoId to the lesson in DB
      await updateLesson(lesson.id, courseId, {
        cloudflare_video_id: newVideoId,
      });

      setVideoId(newVideoId);
    } catch (err) {
      console.error("Video upload failed:", err);
      setUploadError("Upload échoué. Réessaie.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded group">
      <GripVertical size={16} className="text-gray-300" />

      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{lesson.title}</div>
        <div className="flex items-center gap-2 mt-0.5">
          {videoId ? (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <CheckCircle2 size={12} /> Vidéo uploadée
            </span>
          ) : (
            <span className="text-xs text-gray-500">Pas de vidéo</span>
          )}
          {lesson.is_preview && (
            <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
              Aperçu
            </span>
          )}
        </div>
        {uploadError && (
          <p className="text-xs text-red-500 mt-1">{uploadError}</p>
        )}
      </div>

      {/* Progress bar */}
      {uploading && (
        <div className="flex items-center gap-2">
          <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#ff63ce] transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">{uploadProgress}%</span>
        </div>
      )}

      {!uploading && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleVideoUpload(file);
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 text-xs text-[#ff63ce] hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {videoId ? (
              "Remplacer"
            ) : (
              <>
                <Upload size={12} /> Upload
              </>
            )}
          </button>
        </>
      )}

      <button
        onClick={async () => {
          if (confirm(`Supprimer "${lesson.title}" ?`)) {
            await deleteLesson(lesson.id, courseId);
          }
        }}
        className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ── Add Lesson Form ───────────────────────────
function AddLessonForm({
  moduleId,
  courseId,
}: {
  moduleId: string;
  courseId: string;
}) {
  const [title, setTitle] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [adding, setAdding] = useState(false);

  async function handleAdd() {
    if (!title.trim()) return;
    setAdding(true);
    await createLesson(moduleId, courseId, {
      title: title.trim(),
      is_preview: isPreview,
    });
    setTitle("");
    setIsPreview(false);
    setAdding(false);
  }

  return (
    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titre de la leçon..."
        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        className="flex-1 border border-gray-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-[#ff63ce]"
      />
      <label className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
        <input
          type="checkbox"
          checked={isPreview}
          onChange={(e) => setIsPreview(e.target.checked)}
          className="accent-[#ff63ce]"
        />
        Aperçu
      </label>
      <button
        onClick={handleAdd}
        disabled={adding || !title.trim()}
        className="bg-gray-800 text-white px-3 py-1.5 text-xs disabled:opacity-50 hover:bg-[#ff63ce] transition-colors"
      >
        {adding ? "..." : "+ Leçon"}
      </button>
    </div>
  );
}

// ── Cloudflare tus upload ─────────────────────
async function uploadToCloudflare(
  file: File,
  uploadUrl: string,
  onProgress: (progress: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener("error", () =>
      reject(new Error("Network error during upload")),
    );

    xhr.open("PATCH", uploadUrl);
    xhr.setRequestHeader("Content-Type", "application/offset+octet-stream");
    xhr.setRequestHeader("Tus-Resumable", "1.0.0");
    xhr.setRequestHeader("Upload-Offset", "0");
    xhr.send(file);
  });
}
