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
  searchParams: Promise<{
    page?: string
    availYear?: string
    availMonth?: string
  }>
}) {
  const {
    page: pageParam,
    availYear: availYearParam,
    availMonth: availMonthParam,
  } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)

  const now = new Date()
  const availYear = Number(availYearParam) || now.getFullYear()
  const availMonth = availMonthParam !== undefined ? Number(availMonthParam) : now.getMonth()

  const monthStartUTC = new Date(Date.UTC(availYear, availMonth, 1))
  const monthEndUTC = new Date(Date.UTC(availYear, availMonth + 1, 0))

  const [sessionTypes, availabilitiesRaw, bookings, bookingsTotal] = await Promise.all([
    prisma.coachingSessionType.findMany({
      orderBy: { price_xaf: "asc" },
    }),
    prisma.coachingAvailability.findMany({
      where: { date: { gte: monthStartUTC, lte: monthEndUTC } },
      orderBy: { date: "asc" },
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

  const availabilities = availabilitiesRaw.map((a) => ({
    ...a,
    date: a.date.toISOString().slice(0, 10),
  }))

  const totalPages = Math.max(1, Math.ceil(bookingsTotal / PAGE_SIZE))

  return (
    <div className="p-8 space-y-12">
      <div>
        <p className="text-xs tracking-[3px] uppercase text-[#ff63ce] mb-1">
          Administration
        </p>
        <h1 className="text-2xl font-serif font-medium">Coaching privé</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <SessionTypesManager initialSessionTypes={sessionTypes} />
        <AvailabilityManager
          initialAvailabilities={availabilities}
          year={availYear}
          month={availMonth}
          bookingsPage={page}
        />
      </div>

      <div>
        <BookingsList bookings={bookings} total={bookingsTotal} />
        <Pagination
          basePath="/admin/coaching"
          currentPage={page}
          totalPages={totalPages}
          searchParams={{
            availYear: String(availYear),
            availMonth: String(availMonth),
          }}
        />
      </div>
    </div>
  )
}