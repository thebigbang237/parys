// app/(public)/courses/_components/CourseCard.tsx
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

type Currency = "XAF" | "USD" | "EUR";

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    slug: string;
    description: string;
    thumbnail_url: string | null;
    price_xaf: number;
    price_usd: number;
    price_eur: number;
    is_free: boolean;
    _count: { enrollments: number; modules: number };
  };
  currency: Currency;
  lessonsCount: number;
  isEnrolled?: boolean;
}

export default function CourseCard({
  course,
  currency,
  lessonsCount,
  isEnrolled = false,
}: CourseCardProps) {
  const price =
    currency === "XAF"
      ? course.price_xaf
      : currency === "EUR"
        ? course.price_eur
        : course.price_usd;

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group bg-white border border-[#f0e0ec] flex flex-col hover:border-[#ff63ce] transition-colors duration-300"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-[#fdf0fa] overflow-hidden">
        {course.thumbnail_url ? (
          <Image
            src={course.thumbnail_url}
            alt={course.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[#ff63ce] opacity-30 text-5xl font-serif italic">
              P
            </span>
          </div>
        )}

        {course.is_free && (
          <div className="absolute top-3 left-3 bg-[#ff63ce] text-white text-xs px-2 py-1 tracking-[1px] uppercase">
            Gratuit
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-6">
        <p className="text-xs tracking-[2px] uppercase text-[#ff63ce] mb-2">
          Par Parys Batonda
        </p>
        <h3 className="font-serif text-xl font-medium text-gray-900 mb-3 transition-all">
          {course.title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-4">
          {course.description}
        </p>

        {/* Meta */}
        <div className="flex gap-4 text-xs text-gray-500 mb-6">
          <span>
            {course._count.modules} module
            {course._count.modules !== 1 ? "s" : ""}
          </span>
          <span>·</span>
          <span>
            {lessonsCount} leçon{lessonsCount !== 1 ? "s" : ""}
          </span>
          <span>·</span>
          <span>
            {course._count.enrollments} étudiant
            {course._count.enrollments !== 1 ? "es" : "e"}
          </span>
        </div>

        {/* Price + CTA */}
        <div className="mt-auto flex justify-between items-center pt-4 border-t border-[#f0e0ec]">

          <span className="text-xs tracking-[2px] uppercase text-[#ff63ce] group-hover:underline">
            {isEnrolled ? "Continuer →" : "Voir →"}
          </span>
        </div>
      </div>
    </Link>
  );
}
