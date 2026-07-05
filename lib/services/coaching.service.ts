// lib/services/coaching.service.ts
import { prisma } from "@/lib/prisma";
import { createMeetSession } from "@/lib/services/google-meet.service";
import { sendBookingConfirmedEmail } from "@/lib/services/email.service";

// Confirms a coaching booking: generates the Google Meet link (if not
// already set), marks the booking CONFIRMED, and emails the student.
// Shared by both the admin manual-confirm route and the automatic
// payment-success flow so the two paths can't drift apart.
export async function confirmCoachingBooking(bookingId: string) {
  const booking = await prisma.coachingBooking.findUnique({
    where: { id: bookingId },
    include: {
      session_type: true,
      user: { select: { email: true, name: true, timezone: true } },
    },
  });
  if (!booking) return null;

  let meetJoinUrl = booking.meet_join_url;

  if (!meetJoinUrl) {
    try {
      const meet = await createMeetSession({
        title: `Session Coaching — ${booking.session_type.name} avec Parys`,
        description: [
          `Étudiante: ${booking.user.name || ""}`,
          `Session: ${booking.session_type.name} (${booking.session_type.duration} min)`,
          booking.intake_goal ? `Objectif: ${booking.intake_goal}` : "",
          booking.intake_challenges
            ? `Défis: ${booking.intake_challenges}`
            : "",
        ]
          .filter(Boolean)
          .join("\n"),
        startTime: booking.start_datetime,
        endTime: booking.end_datetime,
        attendeeEmail: booking.user.email,
        timezone:
          booking.timezone || booking.user.timezone || "Africa/Douala",
      });
      meetJoinUrl = meet.meetLink;
    } catch (err) {
      console.error("Failed to create Google Meet:", err);
    }
  }

  const updatedBooking = await prisma.coachingBooking.update({
    where: { id: bookingId },
    data: { status: "CONFIRMED", meet_join_url: meetJoinUrl },
    include: {
      user: { select: { email: true, name: true } },
      session_type: true,
    },
  });

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

  return updatedBooking;
}
