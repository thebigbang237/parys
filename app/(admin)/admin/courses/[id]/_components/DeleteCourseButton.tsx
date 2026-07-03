// app/(admin)/admin/courses/[id]/_components/DeleteCourseButton.tsx
"use client";

import { deleteCourse } from "@/lib/actions/course.actions";
import { useState } from "react";

export default function DeleteCourseButton({
  courseId,
  courseTitle,
}: {
  courseId: string;
  courseTitle: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (
      !confirm(`Supprimer "${courseTitle}" ? Cette action est irréversible.`)
    ) {
      return;
    }
    setLoading(true);
    await deleteCourse(courseId);
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="border border-red-200 text-red-600 px-5 py-2.5 text-xs tracking-[2px] uppercase hover:bg-red-50 transition-colors disabled:opacity-50"
    >
      {loading ? "Suppression..." : "Supprimer"}
    </button>
  );
}
