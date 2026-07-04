// app/api/payments/pawapay/route.ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { createDeposit } from "@/lib/services/pawapay.service";
import { createPaymentRecord } from "@/lib/services/payment.service";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    productType,
    productId,
    amount,
    currency,
    country,
    phoneNumber,
    provider, // ← exact provider code from PawaPay config e.g. "MTN_MOMO_CMR"
  } = await req.json();

  if (!phoneNumber) {
    return NextResponse.json(
      { error: "Numéro de téléphone requis" },
      { status: 400 },
    );
  }

  if (!provider) {
    return NextResponse.json(
      { error: "Opérateur mobile money requis" },
      { status: 400 },
    );
  }

  const deposit = await createDeposit({
    amount,
    currency,
    phoneNumber,
    country,
    provider, // pass exact code
    description: "Content Level Up Academy",
  });

  if (deposit.status === "REJECTED") {
    return NextResponse.json(
      { error: deposit.failureReason || "Paiement rejeté par l'opérateur." },
      { status: 400 },
    );
  }

  await createPaymentRecord({
    userId: session.user.id,
    productType,
    productId,
    amount,
    currency,
    provider: "pawapay",
    externalReference: deposit.depositId,
  });

  return NextResponse.json({
    depositId: deposit.depositId,
    status: "PENDING",
  });
}
