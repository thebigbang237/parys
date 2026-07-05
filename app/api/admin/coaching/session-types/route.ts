// app/api/admin/coaching/session-types/route.ts
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

async function requireAdmin() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }
  return session
}

export async function POST(req: Request) {
  try { await requireAdmin() } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { name, duration, price_xaf, price_usd, price_eur } = await req.json()

  const sessionType = await prisma.coachingSessionType.create({
    data: { name, duration, price_xaf, price_usd, price_eur, active: true },
  })

  return NextResponse.json(sessionType)
}

export async function PATCH(req: Request) {
  try { await requireAdmin() } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id, active } = await req.json()

  const sessionType = await prisma.coachingSessionType.update({
    where: { id },
    data: { active },
  })

  return NextResponse.json(sessionType)
}