// app/api/admin/payments/route.ts
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Record-keeping only — does NOT call PayPal/PawaPay to actually refund the
// money. Use this after refunding manually through the provider's dashboard.
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, status } = await req.json();

  if (status !== "REFUNDED") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const payment = await prisma.payment.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json(payment);
}
