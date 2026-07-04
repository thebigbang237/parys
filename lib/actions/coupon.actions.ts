// lib/actions/coupon.actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function validateCoupon(
  code: string,
  courseId: string,
  originalPrice: number,
): Promise<{
  valid: boolean;
  discountedPrice?: number;
  discountAmount?: number;
  couponId?: string;
  message?: string;
}> {
  const session = await auth();
  if (!session) return { valid: false, message: "Non authentifié" };

  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase().trim(), active: true },
  });

  if (!coupon) {
    return { valid: false, message: "Code promo invalide ou expiré" };
  }

  // Check expiry
  if (coupon.expires_at && new Date() > coupon.expires_at) {
    return { valid: false, message: "Ce code promo a expiré" };
  }

  // Check max uses
  if (coupon.max_uses !== null && coupon.uses_count >= coupon.max_uses) {
    return {
      valid: false,
      message: "Ce code promo a atteint sa limite d'utilisation",
    };
  }

  // Check if coupon is for a specific course
  if (coupon.course_id && coupon.course_id !== courseId) {
    return {
      valid: false,
      message: "Ce code promo n'est pas valable pour cette formation",
    };
  }

  // Check if user already used this coupon
  const alreadyUsed = await prisma.couponUsage.findUnique({
    where: {
      coupon_id_user_id: {
        coupon_id: coupon.id,
        user_id: session.user.id,
      },
    },
  });

  if (alreadyUsed) {
    return { valid: false, message: "Vous avez déjà utilisé ce code promo" };
  }

  // Calculate discount
  let discountAmount = 0;
  if (coupon.discount_type === "PERCENTAGE") {
    discountAmount = Math.round((originalPrice * coupon.value) / 100);
  } else {
    discountAmount = Math.min(coupon.value, originalPrice);
  }

  const discountedPrice = Math.max(0, originalPrice - discountAmount);

  return {
    valid: true,
    discountedPrice,
    discountAmount,
    couponId: coupon.id,
    message:
      coupon.discount_type === "PERCENTAGE"
        ? `${coupon.value}% de réduction appliquée`
        : `${discountAmount} XAF de réduction appliquée`,
  };
}
