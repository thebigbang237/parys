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

  // Get all active availabilities
  const availabilities = await prisma.coachingAvailability.findMany({
    where: { active: true },
  })

  if (availabilities.length === 0) {
    return NextResponse.json({ availableDays: [] })
  }

  // Get available day_of_week numbers (0=Monday)
  const availableDayOfWeek = new Set(availabilities.map((a) => a.day_of_week))

  // Get existing bookings for this month
  const startOfMonth = new Date(year, month, 1)
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59)

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

    // JS getDay(): 0=Sunday → convert to our 0=Monday
    const jsDay = date.getDay()
    const ourDay = jsDay === 0 ? 6 : jsDay - 1

    if (!availableDayOfWeek.has(ourDay)) continue

    // Check if at least one slot is available this day
    const dayAvailabilities = availabilities.filter(
      (a) => a.day_of_week === ourDay
    )

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