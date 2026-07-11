// app/(student)/learn/[lessonId]/_components/LessonCompleteToggle.tsx
"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  markLessonComplete,
  markLessonIncomplete,
} from "@/lib/actions/progress.actions";

export default function LessonCompleteToggle({
  lessonId,
  courseSlug,
  initialCompleted,
}: {
  lessonId: string;
  courseSlug: string;
  initialCompleted: boolean;
}) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = !completed;
    setCompleted(next);
    startTransition(async () => {
      if (next) {
        await markLessonComplete(lessonId, courseSlug);
      } else {
        await markLessonIncomplete(lessonId, courseSlug);
      }
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className={cn(
        "flex items-center gap-2 px-4 py-2 text-xs tracking-[2px] uppercase border transition-colors disabled:opacity-60",
        completed
          ? "border-[#a61968] bg-[#f9eff4] text-[#a61968]"
          : "border-gray-200 text-gray-500 hover:border-[#a61968] hover:text-[#a61968]",
      )}
    >
      {completed ? <CheckCircle2 size={14} /> : <Circle size={14} />}
      {completed ? "Terminé" : "Marquer comme terminé"}
    </button>
  );
}
