// lib/services/payment.service.ts
import { prisma } from "@/lib/prisma";
import {
  sendCourseEnrollmentEmail,
  sendAdminNewEnrollmentEmail,
} from "@/lib/services/email.service";
import { confirmCoachingBooking } from "@/lib/services/coaching.service";

export type PaymentProvider = "pawapay" | "paypal";
export type ProductType = "COURSE" | "COACHING";

export interface CreatePaymentParams {
  userId: string;
  productType: ProductType;
  productId: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  phoneNumber?: string; // for mobile money
  returnUrl: string;
}

export interface PaymentResult {
  paymentId: string;
  redirectUrl?: string; // PayPal redirect
  status: "PENDING" | "SUCCESS" | "FAILED";
}

// ── Create a payment record ───────────────────
export async function createPaymentRecord(params: {
  userId: string;
  productType: ProductType;
  productId: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  externalReference?: string;
  couponId?: string;
}) {
  return prisma.payment.create({
    data: {
      user_id: params.userId,
      product_type: params.productType,
      course_id: params.productType === "COURSE" ? params.productId : null,
      booking_id: params.productType === "COACHING" ? params.productId : null,
      amount: params.amount,
      currency: params.currency,
      provider: params.provider,
      external_reference: params.externalReference,
      coupon_id: params.couponId ?? null,
      status: "PENDING",
    },
  });
}

// ── Handle successful payment ─────────────────
export async function handlePaymentSuccess(
  externalReference: string,
  provider: string,
) {
  const existing = await prisma.payment.findFirst({
    where: { external_reference: externalReference, status: "SUCCESS" },
  });
  if (existing) return;

  // ← explicitly select all fields including coupon_id
  const payment = await prisma.payment.findFirst({
    where: { external_reference: externalReference },
    select: {
      id: true,
      user_id: true,
      product_type: true,
      course_id: true,
      booking_id: true,
      coupon_id: true,
      amount: true,
      currency: true,
    },
  });
  if (!payment) return;

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: { status: "SUCCESS", updated_at: new Date() },
    });

    if (payment.product_type === "COURSE" && payment.course_id) {
      await tx.enrollment.upsert({
        where: {
          user_id_course_id: {
            user_id: payment.user_id,
            course_id: payment.course_id,
          },
        },
        create: {
          user_id: payment.user_id,
          course_id: payment.course_id,
        },
        update: {},
      });
    }

    if (payment.coupon_id) {
      await tx.couponUsage.upsert({
        where: {
          coupon_id_user_id: {
            coupon_id: payment.coupon_id,
            user_id: payment.user_id,
          },
        },
        create: {
          coupon_id: payment.coupon_id,
          user_id: payment.user_id,
        },
        update: {},
      });

      await tx.coupon.update({
        where: { id: payment.coupon_id },
        data: { uses_count: { increment: 1 } },
      });
    }
  });

  console.log(
    `Payment ${externalReference} processed. coupon_id: ${payment.coupon_id}`,
  );

  try {
    if (payment.product_type === "COURSE" && payment.course_id) {
      const [user, course] = await Promise.all([
        prisma.user.findUnique({
          where: { id: payment.user_id },
          select: { email: true, name: true },
        }),
        prisma.course.findUnique({
          where: { id: payment.course_id },
          select: { title: true, slug: true },
        }),
      ]);
      if (user && course) {
        await sendCourseEnrollmentEmail(
          user.email,
          user.name || "toi",
          course.title,
          course.slug,
        );

        await sendAdminNewEnrollmentEmail({
          studentName: user.name || "Anonyme",
          studentEmail: user.email,
          courseTitle: course.title,
          amount: payment.amount,
          currency: payment.currency,
        });
      }
    }

    if (payment.product_type === "COACHING" && payment.booking_id) {
      await confirmCoachingBooking(payment.booking_id);
    }
  } catch (err) {
    console.error("Failed to send payment confirmation email:", err);
  }

  return payment;
}

export async function handlePaymentFailure(externalReference: string) {
  await prisma.payment.updateMany({
    where: { external_reference: externalReference },
    data: { status: "FAILED", updated_at: new Date() },
  });
}
