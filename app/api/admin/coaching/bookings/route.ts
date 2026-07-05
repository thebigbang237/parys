// app/api/admin/coaching/bookings/route.ts
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendBookingConfirmedEmail } from "@/lib/services/email.service";
import { createMeetSession } from "@/lib/services/google-meet.service";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, status } = await req.json();

  let meetJoinUrl: string | null = null;

  // Auto-generate Google Meet when confirming
  if (status === "CONFIRMED") {
    const existingBooking = await prisma.coachingBooking.findUnique({
      where: { id },
      include: {
        session_type: true,
        user: { select: { email: true, name: true, timezone: true } },
      },
    });

    if (existingBooking) {
      try {
        const meet = await createMeetSession({
          title: `Session Coaching — ${existingBooking.session_type.name} avec Parys`,
          description: [
            `Étudiante: ${existingBooking.user.name || ""}`,
            `Session: ${existingBooking.session_type.name} (${existingBooking.session_type.duration} min)`,
            existingBooking.intake_goal
              ? `Objectif: ${existingBooking.intake_goal}`
              : "",
            existingBooking.intake_challenges
              ? `Défis: ${existingBooking.intake_challenges}`
              : "",
          ]
            .filter(Boolean)
            .join("\n"),
          startTime: existingBooking.start_datetime,
          endTime: existingBooking.end_datetime,
          attendeeEmail: existingBooking.user.email,
          timezone:
            existingBooking.timezone ||
            existingBooking.user.timezone ||
            "Africa/Douala",
        });
        meetJoinUrl = meet.meetLink;
        console.log(`Google Meet created: ${meet.meetLink}`);
      } catch (err) {
        console.error("Failed to create Google Meet:", err);
        // Don't block confirmation — admin can still proceed
      }
    }
  }

  // Update booking
  const updatedBooking = await prisma.coachingBooking.update({
    where: { id },
    data: {
      status,
      meet_join_url: meetJoinUrl, // field reused for Meet link
    },
    include: {
      user: { select: { email: true, name: true } },
      session_type: true,
    },
  });

  // Send confirmation email
  if (status === "CONFIRMED") {
    try {
      await sendBookingConfirmedEmail(
        updatedBooking.user.email,
        updatedBooking.user.name || "",
        updatedBooking.session_type.name,
        updatedBooking.start_datetime,
        updatedBooking.session_type.duration,
        meetJoinUrl,
      );
    } catch (err) {
      console.error("Failed to send confirmation email:", err);
    }
  }

  // Handle cancellation email later if needed
  if (status === "CANCELLED") {
    // Optional: send cancellation email
  }

  return NextResponse.json(updatedBooking);
}
