// app/api/payments/paypal/create/route.ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { createPayPalOrder } from "@/lib/services/paypal.service";
import { createPaymentRecord } from "@/lib/services/payment.service";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productType, productId, amount, currency } = await req.json();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  const { orderId, approvalUrl } = await createPayPalOrder({
    amount,
    currency,
    description: "Content Level Up Academy",
    returnUrl: `${appUrl}/api/payments/paypal/capture?productType=${productType}&productId=${productId}&userId=${session.user.id}`,
    cancelUrl: `${appUrl}/checkout/cancelled`,
  });

  // Save payment record
  await createPaymentRecord({
    userId: session.user.id,
    productType,
    productId,
    amount,
    currency,
    provider: "paypal",
    externalReference: orderId,
  });

  return NextResponse.json({ orderId, approvalUrl });
}
