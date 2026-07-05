// lib/services/booking.service.ts

export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

export async function getAvailableSlots(
  date: Date,
  durationMinutes: number,
): Promise<TimeSlot[]> {
  const { prisma } = await import("@/lib/prisma");

  // @db.Date columns are stored/returned as UTC-midnight instants —
  // build the filter the same way regardless of server timezone.
  const dateOnly = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );

  // Get availabilities set for this specific date
  const availabilities = await prisma.coachingAvailability.findMany({
    where: { date: dateOnly, active: true },
  });

  if (availabilities.length === 0) return [];

  // Get existing bookings for this date
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const existingBookings = await prisma.coachingBooking.findMany({
    where: {
      start_datetime: { gte: startOfDay, lte: endOfDay },
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    select: { start_datetime: true, end_datetime: true },
  });

  const slots: TimeSlot[] = [];

  for (const availability of availabilities) {
    const [startHour, startMin] = availability.start_time
      .split(":")
      .map(Number);
    const [endHour, endMin] = availability.end_time.split(":").map(Number);

    let current = new Date(date);
    current.setHours(startHour, startMin, 0, 0);

    const windowEnd = new Date(date);
    windowEnd.setHours(endHour, endMin, 0, 0);

    while (current < windowEnd) {
      const slotEnd = new Date(current.getTime() + durationMinutes * 60000);

      if (slotEnd > windowEnd) break;

      const isBooked = existingBookings.some((booking) => {
        const bStart = new Date(booking.start_datetime);
        const bEnd = new Date(booking.end_datetime);
        return current < bEnd && slotEnd > bStart;
      });

      const isInFuture = current > new Date();

      slots.push({
        start: new Date(current),
        end: slotEnd,
        available: !isBooked && isInFuture,
      });

      current = new Date(current.getTime() + durationMinutes * 60000);
    }
  }

  return slots;
}
