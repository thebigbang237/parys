// app/(public)/courses/[slug]/_components/EnrollButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface EnrollButtonProps {
  courseId: string;
  courseSlug: string;
  price: number;
  currency: "XAF" | "USD" | "EUR";
  isFree: boolean;
  isEnrolled: boolean;
  isLoggedIn: boolean;
  canUseMobileMoney: boolean;
  country: string;
  fullWidth?: boolean;
}

export default function EnrollButton({
  courseId,
  courseSlug,
  price,
  currency,
  isFree,
  isEnrolled,
  isLoggedIn,
  canUseMobileMoney,
  country,
  fullWidth = false,
}: EnrollButtonProps) {
  const router = useRouter();

  function handleClick() {
    if (isEnrolled) {
      router.push(`/dashboard`);
      return;
    }

    if (!isLoggedIn) {
      router.push(`/login?redirect=/courses/${courseSlug}`);
      return;
    }

    if (isFree) {
      router.push(`/checkout/free?courseId=${courseId}`);
      return;
    }

    router.push(
      `/checkout?courseId=${courseId}&currency=${currency}&country=${country}`,
    );
  }

  if (isEnrolled) {
    return (
      <button
        onClick={handleClick}
        className={cn(
          "bg-[#111] text-white py-4 text-xs tracking-[3px] uppercase font-medium hover:bg-[#ff63ce] transition-colors",
          fullWidth ? "w-full" : "px-10",
        )}
      >
        Accéder à la formation →
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "bg-[#ff63ce] text-white py-4 text-xs tracking-[3px] uppercase font-medium hover:bg-[#111] transition-colors",
        fullWidth ? "w-full" : "px-10",
      )}
    >
      {isFree ? "S'inscrire gratuitement" : "S'inscrire maintenant"}
    </button>
  );
}
