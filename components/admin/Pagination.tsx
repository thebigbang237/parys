// components/admin/Pagination.tsx
import Link from "next/link";

export default function Pagination({
  basePath,
  currentPage,
  totalPages,
  searchParams = {},
}: {
  basePath: string;
  currentPage: number;
  totalPages: number;
  searchParams?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  function hrefFor(page: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) params.set(key, value);
    }
    params.set("page", String(page));
    return `${basePath}?${params.toString()}`;
  }

  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-xs text-gray-500">
        Page {currentPage} / {totalPages}
      </p>
      <div className="flex gap-2">
        <Link
          href={hrefFor(Math.max(1, currentPage - 1))}
          aria-disabled={currentPage <= 1}
          className={`text-xs px-3 py-1.5 rounded border transition-colors ${
            currentPage <= 1
              ? "border-gray-100 text-gray-300 pointer-events-none"
              : "border-gray-200 text-gray-600 hover:border-[#a61968] hover:text-[#a61968]"
          }`}
        >
          ← Précédent
        </Link>
        <Link
          href={hrefFor(Math.min(totalPages, currentPage + 1))}
          aria-disabled={currentPage >= totalPages}
          className={`text-xs px-3 py-1.5 rounded border transition-colors ${
            currentPage >= totalPages
              ? "border-gray-100 text-gray-300 pointer-events-none"
              : "border-gray-200 text-gray-600 hover:border-[#a61968] hover:text-[#a61968]"
          }`}
        >
          Suivant →
        </Link>
      </div>
    </div>
  );
}
