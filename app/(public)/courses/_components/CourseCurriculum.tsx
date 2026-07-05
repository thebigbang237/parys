// app/(public)/courses/[slug]/_components/CourseCurriculum.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronUp, ChevronDown, Play, Lock } from "lucide-react";

type Lesson = {
  id: string;
  title: string;
  duration_seconds: number | null;
  is_preview: boolean;
  cloudflare_video_id: string | null;
};

type Module = {
  id: string;
  title: string;
  lessons: Lesson[];
};

export default function CourseCurriculum({
  modules,
  isEnrolled,
}: {
  modules: Module[];
  isEnrolled: boolean;
}) {
  const [expanded, setExpanded] = useState<string[]>([modules[0]?.id]);

  function toggle(id: string) {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  }

  function formatDuration(seconds: number | null) {
    if (!seconds) return "";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  return (
    <div className="space-y-3">
      {modules.map((module, idx) => (
        <div
          key={module.id}
          className="border border-[#f0e0ec] bg-white overflow-hidden"
        >
          <button
            onClick={() => toggle(module.id)}
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-[#fdf0fa] transition-colors"
          >
            <div className="flex items-center gap-4">
              <span className="text-xs text-[#ff63ce] font-medium w-6">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span className="font-medium text-gray-900">{module.title}</span>
              <span className="text-xs text-gray-500">
                {module.lessons.length} leçon
                {module.lessons.length !== 1 ? "s" : ""}
              </span>
            </div>
            <span className="text-[#ff63ce]">
              {expanded.includes(module.id) ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </span>
          </button>

          {expanded.includes(module.id) && (
            <div className="border-t border-[#f0e0ec] divide-y divide-[#f0e0ec]">
              {module.lessons.map((lesson, lessonIdx) => {
                const canAccess = isEnrolled || lesson.is_preview;

                const lessonContent = (
                  <>
                    <span className="text-xs text-gray-300 w-6">
                      {String(lessonIdx + 1).padStart(2, "0")}
                    </span>

                    <div className="flex-1 flex items-center gap-3">
                      <span
                        className={
                          canAccess ? "text-[#ff63ce]" : "text-gray-200"
                        }
                      >
                        {canAccess ? <Play size={14} /> : <Lock size={14} />}
                      </span>

                      <span
                        className={`text-sm ${
                          canAccess ? "text-gray-700" : "text-gray-500"
                        }`}
                      >
                        {lesson.title}
                      </span>

                      {lesson.is_preview && !isEnrolled && (
                        <span className="text-xs bg-[#fdf0fa] text-[#ff63ce] border border-[#f0e0ec] px-2 py-0.5">
                          Aperçu gratuit
                        </span>
                      )}
                    </div>

                    {lesson.duration_seconds && (
                      <span className="text-xs text-gray-500">
                        {formatDuration(lesson.duration_seconds)}
                      </span>
                    )}
                  </>
                );

                return canAccess ? (
                  <Link
                    key={lesson.id}
                    href={`/learn/${lesson.id}`}
                    className="flex items-center gap-4 px-6 py-3 hover:bg-[#fdf0fa] transition-colors"
                  >
                    {lessonContent}
                  </Link>
                ) : (
                  <div
                    key={lesson.id}
                    className="flex items-center gap-4 px-6 py-3"
                  >
                    {lessonContent}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
