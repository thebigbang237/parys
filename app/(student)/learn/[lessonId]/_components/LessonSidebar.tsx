// app/(student)/learn/[lessonId]/_components/LessonSidebar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ChevronDown, Play, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

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

type Course = {
  id: string;
  title: string;
  modules: Module[];
};

function formatDuration(seconds: number | null) {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function LessonSidebar({
  course,
  currentLessonId,
  userId,
}: {
  course: Course;
  currentLessonId: string;
  userId: string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedModules, setExpandedModules] = useState<string[]>(
    course.modules.map((m) => m.id),
  );

  // Default to collapsed on small screens so the video isn't squeezed
  useEffect(() => {
    if (window.innerWidth < 768) setCollapsed(true);
  }, []);

  function toggleModule(id: string) {
    setExpandedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  }

  if (collapsed) {
    return (
      <div className="w-10 bg-[#1a1a1a] border-r border-white/10 flex flex-col items-center py-4">
        <button
          onClick={() => setCollapsed(false)}
          className="text-white/40 hover:text-white transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-72 bg-[#1a1a1a] border-r border-white/10 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 border-b border-white/10 flex items-center justify-between">
        <span className="text-white/60 text-xs tracking-[2px] uppercase">
          Curriculum
        </span>
        <button
          onClick={() => setCollapsed(true)}
          className="text-white/30 hover:text-white transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* Modules */}
      <div className="flex-1 overflow-y-auto">
        {course.modules.map((module, moduleIdx) => (
          <div key={module.id} className="border-b border-white/5">
            <button
              onClick={() => toggleModule(module.id)}
              className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-white/5 transition-colors"
            >
              <span className="text-white/30 text-xs w-5">
                {String(moduleIdx + 1).padStart(2, "0")}
              </span>
              <span className="text-white/70 text-xs flex-1 font-medium">
                {module.title}
              </span>
              <span className="text-white/30">
                {expandedModules.includes(module.id) ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </span>
            </button>

            {expandedModules.includes(module.id) && (
              <div className="pb-1">
                {module.lessons.map((lesson, lessonIdx) => {
                  const isCurrent = lesson.id === currentLessonId;
                  const hasVideo = !!lesson.cloudflare_video_id;

                  return (
                    <Link
                      key={lesson.id}
                      href={`/learn/${lesson.id}`}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                        isCurrent
                          ? "bg-[#ff63ce]/20 border-l-2 border-[#ff63ce]"
                          : "hover:bg-white/5 border-l-2 border-transparent",
                      )}
                    >
                      <span className="text-white/20 text-xs w-5">
                        {String(lessonIdx + 1).padStart(2, "0")}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "text-xs truncate",
                            isCurrent ? "text-white" : "text-white/50",
                          )}
                        >
                          {lesson.title}
                        </p>
                        {lesson.duration_seconds && (
                          <p className="text-white/20 text-xs mt-0.5">
                            {formatDuration(lesson.duration_seconds)}
                          </p>
                        )}
                      </div>
                      {isCurrent && (
                        <Play size={12} className="text-[#ff63ce]" />
                      )}
                      {!hasVideo && !isCurrent && (
                        <Circle size={10} className="text-white/20" />
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
