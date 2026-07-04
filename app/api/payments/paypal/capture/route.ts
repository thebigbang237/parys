// app/api/payments/paypal/capture/route.ts
import { NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/services/paypal.service";
import { handlePaymentSuccess } from "@/lib/services/payment.service";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token"); // PayPal order ID
  const productType = searchParams.get("productType");
  const productId = searchParams.get("productId");

  if (!token) {
    return NextResponse.redirect(new URL("/checkout/cancelled", req.url));
  }

  try {
    await capturePayPalOrder(token);
    await handlePaymentSuccess(token, "paypal");

    return NextResponse.redirect(
      new URL(
        `/checkout/success?productType=${productType}&productId=${productId}`,
        req.url,
      ),
    );
  } catch (error) {
    console.error("PayPal capture error:", error);
    return NextResponse.redirect(new URL("/checkout/cancelled", req.url));
  }
}
