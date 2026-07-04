// lib/services/payment.service.ts
import { prisma } from "@/lib/prisma";

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
      status: "PENDING",
    },
  });
}

// ── Handle successful payment ─────────────────
export async function handlePaymentSuccess(
  externalReference: string,
  provider: string,
) {
  // Idempotency — never process twice
  const existing = await prisma.payment.findFirst({
    where: {
      external_reference: externalReference,
      status: "SUCCESS",
    },
  });

  if (existing) {
    console.log(`Payment ${externalReference} already processed — skipping`);
    return;
  }

  const payment = await prisma.payment.findFirst({
    where: { external_reference: externalReference },
  });

  if (!payment) {
    console.error(`Payment not found: ${externalReference}`);
    return;
  }

  // Transaction — all or nothing
  await prisma.$transaction(async (tx) => {
    // Mark payment as successful
    await tx.payment.update({
      where: { id: payment.id },
      data: { status: "SUCCESS", updated_at: new Date() },
    });

    // Grant access based on product type
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

    if (payment.product_type === "COACHING" && payment.booking_id) {
      await tx.coachingBooking.update({
        where: { id: payment.booking_id },
        data: { status: "CONFIRMED" },
      });
    }
  });

  return payment;
}

export async function handlePaymentFailure(externalReference: string) {
  await prisma.payment.updateMany({
    where: { external_reference: externalReference },
    data: { status: "FAILED", updated_at: new Date() },
  });
}
