// app/api/coaching/bookings/route.ts
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }


  const {
    session_type_id,
    start_datetime,
    currency,
    amount,
    intake_goal,
    intake_challenges,
  } = await req.json();

  
    // Get user's timezone
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { timezone: true },
  })

  const sessionType = await prisma.coachingSessionType.findUnique({
    where: { id: session_type_id, active: true },
  });

  if (!sessionType) {
    return NextResponse.json(
      { error: "Session type not found" },
      { status: 404 },
    );
  }

  const start = new Date(start_datetime);
  const end = new Date(start.getTime() + sessionType.duration * 60000);

  // Double-check slot is still available
  const conflicting = await prisma.coachingBooking.findFirst({
    where: {
      status: { in: ["PENDING", "CONFIRMED"] },
      OR: [
        {
          start_datetime: { lt: end },
          end_datetime: { gt: start },
        },
      ],
    },
  });

  if (conflicting) {
    return NextResponse.json(
      {
        error: "Ce créneau vient d'être réservé. Veuillez en choisir un autre.",
      },
      { status: 409 },
    );
  }

  const booking = await prisma.coachingBooking.create({
    data: {
      user_id: session.user.id,
      session_type_id,
      start_datetime: start,
      end_datetime: end,
      status: "PENDING",
      currency_paid: currency,
      amount_paid: amount,
      intake_goal: intake_goal || null,
      intake_challenges: intake_challenges || null,
      timezone: user?.timezone || "Africa/Douala", 
    },
  });

  return NextResponse.json(booking);
}
