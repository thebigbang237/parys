// app/api/coaching/available-days/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const year = Number(searchParams.get("year"))
  const month = Number(searchParams.get("month")) // 0-indexed
  const duration = Number(searchParams.get("duration") || "60")

  if (!year || month === undefined) {
    return NextResponse.json({ error: "year and month required" }, { status: 400 })
  }

  // Get existing bookings for this month
  const startOfMonth = new Date(year, month, 1)
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59)

  // Get availabilities set for specific dates within this month
  const monthStartUTC = new Date(Date.UTC(year, month, 1))
  const monthEndUTC = new Date(Date.UTC(year, month + 1, 0))

  const availabilities = await prisma.coachingAvailability.findMany({
    where: { active: true, date: { gte: monthStartUTC, lte: monthEndUTC } },
  })

  if (availabilities.length === 0) {
    return NextResponse.json({ availableDays: [] })
  }

  const bookings = await prisma.coachingBooking.findMany({
    where: {
      start_datetime: { gte: startOfMonth, lte: endOfMonth },
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    select: { start_datetime: true, end_datetime: true },
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const availableDays: number[] = []
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    if (date < today) continue

    const dateUTC = new Date(Date.UTC(year, month, day))

    // Check if at least one slot is available this day
    const dayAvailabilities = availabilities.filter(
      (a) => a.date.getTime() === dateUTC.getTime()
    )

    if (dayAvailabilities.length === 0) continue

    let hasAvailableSlot = false

    for (const avail of dayAvailabilities) {
      const [startH, startM] = avail.start_time.split(":").map(Number)
      const [endH, endM] = avail.end_time.split(":").map(Number)

      let current = new Date(date)
      current.setHours(startH, startM, 0, 0)
      const windowEnd = new Date(date)
      windowEnd.setHours(endH, endM, 0, 0)

      while (current < windowEnd) {
        const slotEnd = new Date(current.getTime() + duration * 60000)
        if (slotEnd > windowEnd) break

        const isBooked = bookings.some((b) => {
          const bStart = new Date(b.start_datetime)
          const bEnd = new Date(b.end_datetime)
          return current < bEnd && slotEnd > bStart
        })

        if (!isBooked && current > new Date()) {
          hasAvailableSlot = true
          break
        }

        // Move by duration, not 30min
        current = new Date(current.getTime() + duration * 60000)
      }

      if (hasAvailableSlot) break
    }

    if (hasAvailableSlot) {
      availableDays.push(day)
    }
  }

  return NextResponse.json({ availableDays })
}