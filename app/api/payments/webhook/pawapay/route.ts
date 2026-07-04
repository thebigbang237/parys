// app/api/payments/webhook/pawapay/route.ts
import { NextResponse } from "next/server";
import {
  handlePaymentSuccess,
  handlePaymentFailure,
} from "@/lib/services/payment.service";

export async function POST(req: Request) {
  const body = await req.text();
  const event = JSON.parse(body);

  console.log("PawaPay webhook received:", JSON.stringify(event, null, 2));

  const { depositId, status } = event;

  if (!depositId) {
    return NextResponse.json({ error: "depositId required" }, { status: 400 });
  }

  if (status === "COMPLETED") {
    await handlePaymentSuccess(depositId, "pawapay");
    console.log(`Payment ${depositId} completed → enrollment created`);
  } else if (status === "FAILED" || status === "CANCELLED") {
    await handlePaymentFailure(depositId);
  }

  // Always return 200 — PawaPay will retry if we return anything else
  return NextResponse.json({ received: true });
}
