// app/api/admin/coaching/bookings/route.ts
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { sendBookingConfirmedEmail } from "@/lib/services/email.service"


const resend = new Resend(process.env.RESEND_API_KEY);

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, status, zoom_join_url } = await req.json();

  const booking = await prisma.coachingBooking.update({
    where: { id },
    data: {
      status,
      zoom_join_url: zoom_join_url || null,
    },
    include: {
      user: { select: { email: true, name: true } },
      session_type: true,
    },
  });

  // Send confirmation email if confirmed
if (status === "CONFIRMED") {
  try {
    await sendBookingConfirmedEmail(
      booking.user.email,
      booking.user.name || "",
      booking.session_type.name,
      booking.start_datetime,
      booking.session_type.duration,
      zoom_join_url
    )
  } catch (err) {
    console.error("Failed to send confirmation email:", err)
  }
}

  return NextResponse.json(booking);
}
