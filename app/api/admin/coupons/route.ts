// app/api/admin/coupons/route.ts
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { code, discount_type, value, expires_at, max_uses } = await req.json();

  if (!code || !discount_type || !value) {
    return NextResponse.json(
      { error: "Champs requis manquants" },
      { status: 400 },
    );
  }

  // Check code uniqueness
  const existing = await prisma.coupon.findUnique({ where: { code } });
  if (existing) {
    return NextResponse.json({ error: "Ce code existe déjà" }, { status: 400 });
  }

  const coupon = await prisma.coupon.create({
    data: {
      code,
      discount_type,
      value,
      expires_at: expires_at ? new Date(expires_at) : null,
      max_uses: max_uses || null,
      active: true,
    },
  });

  return NextResponse.json(coupon);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, active } = await req.json();

  const coupon = await prisma.coupon.update({
    where: { id },
    data: { active },
  });

  return NextResponse.json(coupon);
}
