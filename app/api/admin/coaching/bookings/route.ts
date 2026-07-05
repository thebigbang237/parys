// app/api/admin/coaching/bookings/route.ts
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { confirmCoachingBooking } from "@/lib/services/coaching.service";
import {
  sendBookingCancelledEmail,
  sendBookingCompletedEmail,
} from "@/lib/services/email.service";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, status } = await req.json();

  if (status === "CONFIRMED") {
    const updatedBooking = await confirmCoachingBooking(id);
    if (!updatedBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    return NextResponse.json(updatedBooking);
  }

  const updatedBooking = await prisma.coachingBooking.update({
    where: { id },
    data: { status },
    include: {
      user: { select: { email: true, name: true } },
      session_type: true,
    },
  });

  if (status === "CANCELLED") {
    try {
      await sendBookingCancelledEmail(
        updatedBooking.user.email,
        updatedBooking.user.name || "",
        updatedBooking.session_type.name,
        updatedBooking.start_datetime,
      );
    } catch (err) {
      console.error("Failed to send cancellation email:", err);
    }
  }

  if (status === "COMPLETED") {
    try {
      await sendBookingCompletedEmail(
        updatedBooking.user.email,
        updatedBooking.user.name || "",
        updatedBooking.session_type.name,
      );
    } catch (err) {
      console.error("Failed to send completion email:", err);
    }
  }

  return NextResponse.json(updatedBooking);
}
