// app/api/upload/image/route.ts
import { auth } from "@/auth"
import { uploadImage } from "@/lib/services/storage.service"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await auth()

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get("file") as File
  const folder = (formData.get("folder") as string) || "courses"

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "File must be an image" }, { status: 400 })
  }

  // Validate file size — max 5MB
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Image must be under 5MB" }, { status: 400 })
  }

  const url = await uploadImage(file, folder as "courses" | "profiles")

  return NextResponse.json({ url })
}