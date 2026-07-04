// app/(student)/learn/[lessonId]/_components/LessonPlayer.tsx
"use client";

export default function LessonPlayer({
  videoToken,
  lessonTitle,
}: {
  videoToken: string;
  lessonTitle: string;
}) {
  return (
    <div className="relative w-full aspect-video bg-black">
      <iframe
        src={`https://iframe.cloudflarestream.com/${videoToken}`}
        title={lessonTitle}
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}
