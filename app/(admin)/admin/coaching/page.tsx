// app/(admin)/admin/coaching/page.tsx
import { prisma } from "@/lib/prisma"
import SessionTypesManager from "./_components/SessionTypesManager"
import AvailabilityManager from "./_components/AvailabilityManager"
import BookingsList from "./_components/BookingsList"

export default async function AdminCoachingPage() {
  const [sessionTypes, availabilities, bookings] = await Promise.all([
    prisma.coachingSessionType.findMany({
      orderBy: { price_xaf: "asc" },
    }),
    prisma.coachingAvailability.findMany({
      orderBy: { day_of_week: "asc" },
    }),
    prisma.coachingBooking.findMany({
      orderBy: { start_datetime: "desc" },
      take: 20,
      include: {
        user: { select: { name: true, email: true } },
        session_type: true,
      },
    }),
  ])

  return (
    <div className="p-8 space-y-12">
      <div>
        <p className="text-xs tracking-[3px] uppercase text-[#ff63ce] mb-1">
          Administration
        </p>
        <h1 className="text-2xl font-serif font-medium">Coaching privé</h1>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <SessionTypesManager initialSessionTypes={sessionTypes} />
        <AvailabilityManager initialAvailabilities={availabilities} />
      </div>

      <BookingsList bookings={bookings} />
    </div>
  )
}