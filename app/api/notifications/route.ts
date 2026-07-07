// app/api/notifications/route.ts
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type ActivityItem = {
  id: string;
  type: "payment" | "reply";
  title: string;
  subtitle: string;
  created_at: string;
};

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const [payments, replies] = await Promise.all([
    prisma.payment.findMany({
      where: { user_id: userId, status: "SUCCESS" },
      orderBy: { created_at: "desc" },
      take: 5,
      include: {
        course: { select: { title: true } },
        booking: { include: { session_type: { select: { name: true } } } },
      },
    }),
    prisma.comment.findMany({
      where: { parent: { user_id: userId }, status: "ACTIVE" },
      orderBy: { created_at: "desc" },
      take: 5,
      include: {
        user: { select: { name: true } },
        lesson: { select: { title: true } },
      },
    }),
  ]);

  const paymentItems: ActivityItem[] = payments.map((p) => ({
    id: `payment-${p.id}`,
    type: "payment",
    title:
      p.product_type === "COURSE"
        ? `Paiement confirmé — ${p.course?.title ?? "Formation"}`
        : `Paiement confirmé — ${p.booking?.session_type.name ?? "Coaching"}`,
    subtitle: `${p.amount} ${p.currency}`,
    created_at: p.created_at.toISOString(),
  }));

  const replyItems: ActivityItem[] = replies.map((c) => ({
    id: `reply-${c.id}`,
    type: "reply",
    title: `${c.user.name || "Quelqu'un"} a répondu à ton commentaire`,
    subtitle: c.lesson.title,
    created_at: c.created_at.toISOString(),
  }));

  const activity = [...paymentItems, ...replyItems]
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .slice(0, 6);

  return NextResponse.json({ activity });
}
