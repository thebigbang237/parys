// app/api/admin/coaching/availability/route.ts
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

async function requireAdmin() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized")
}

export async function POST(req: Request) {
  try { await requireAdmin() } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { date, start_time, end_time } = await req.json()

  if (!date || !start_time || !end_time) {
    return NextResponse.json(
      { error: "date, start_time and end_time are required" },
      { status: 400 },
    )
  }

  // Normalize to a UTC-midnight instant, matching how @db.Date is stored
  const [y, m, d] = date.split("-").map(Number)
  const dateUTC = new Date(Date.UTC(y, m - 1, d))

  const availability = await prisma.coachingAvailability.create({
    data: { date: dateUTC, start_time, end_time, active: true },
  })

  return NextResponse.json(availability)
}

export async function PATCH(req: Request) {
  try { await requireAdmin() } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id, active } = await req.json()

  const availability = await prisma.coachingAvailability.update({
    where: { id },
    data: { active },
  })

  return NextResponse.json(availability)
}

export async function DELETE(req: Request) {
  try { await requireAdmin() } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await req.json()

  await prisma.coachingAvailability.delete({ where: { id } })

  return NextResponse.json({ success: true })
}