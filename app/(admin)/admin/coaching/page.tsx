// app/(admin)/admin/coaching/page.tsx
import { prisma } from "@/lib/prisma"
import SessionTypesManager from "./_components/SessionTypesManager"
import AvailabilityManager from "./_components/AvailabilityManager"
import BookingsList from "./_components/BookingsList"
import Pagination from "@/components/admin/Pagination"

const PAGE_SIZE = 20

export default async function AdminCoachingPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)

  const [sessionTypes, availabilities, bookings, bookingsTotal] = await Promise.all([
    prisma.coachingSessionType.findMany({
      orderBy: { price_xaf: "asc" },
    }),
    prisma.coachingAvailability.findMany({
      orderBy: { day_of_week: "asc" },
    }),
    prisma.coachingBooking.findMany({
      orderBy: { start_datetime: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        user: { select: { name: true, email: true } },
        session_type: true,
      },
    }),
    prisma.coachingBooking.count(),
  ])

  const totalPages = Math.max(1, Math.ceil(bookingsTotal / PAGE_SIZE))

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

      <div>
        <BookingsList bookings={bookings} total={bookingsTotal} />
        <Pagination
          basePath="/admin/coaching"
          currentPage={page}
          totalPages={totalPages}
        />
      </div>
    </div>
  )
}