// lib/actions/course.actions.ts
"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { slugify } from "@/lib/utils"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { deleteVideo } from "@/lib/services/stream.service"
import { z } from "zod"

// ── Guard ─────────────────────────────────────
async function requireAdmin() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }
  return session
}

// ── Course ────────────────────────────────────
const CourseSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  price_xaf: z.coerce.number().min(0),
  price_usd: z.coerce.number().min(0),
  price_eur: z.coerce.number().min(0),
  is_free: z.coerce.boolean().optional(),
  thumbnail_url: z.string().optional(),
})

export async function createCourse(formData: FormData) {
  await requireAdmin()

  const parsed = CourseSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    price_xaf: formData.get("price_xaf"),
    price_usd: formData.get("price_usd"),
    price_eur: formData.get("price_eur"),
    is_free: formData.get("is_free") === "on",
    thumbnail_url: formData.get("thumbnail_url"),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { title, ...rest } = parsed.data
  const slug = slugify(title)

  // Ensure slug is unique
  const existing = await prisma.course.findUnique({ where: { slug } })
  if (existing) {
    return { error: "A course with this title already exists" }
  }

  const course = await prisma.course.create({
    data: { title, slug, ...rest },
  })

  revalidatePath("/admin/courses")
  redirect(`/admin/courses/${course.id}`)
}

export async function updateCourse(id: string, formData: FormData) {
  await requireAdmin()

  const parsed = CourseSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    price_xaf: formData.get("price_xaf"),
    price_usd: formData.get("price_usd"),
    price_eur: formData.get("price_eur"),
    is_free: formData.get("is_free") === "on",
    thumbnail_url: formData.get("thumbnail_url"),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { title, ...rest } = parsed.data

  await prisma.course.update({
    where: { id },
    data: { title, slug: slugify(title), ...rest },
  })

  revalidatePath(`/admin/courses/${id}`)
  revalidatePath("/admin/courses")
  return { success: true }
}

export async function publishCourse(id: string) {
  await requireAdmin()

  await prisma.course.update({
    where: { id },
    data: { status: "PUBLISHED" },
  })

  revalidatePath(`/admin/courses/${id}`)
  revalidatePath("/admin/courses")
}

export async function unpublishCourse(id: string) {
  await requireAdmin()

  await prisma.course.update({
    where: { id },
    data: { status: "DRAFT" },
  })

  revalidatePath(`/admin/courses/${id}`)
}

export async function deleteCourse(id: string) {
  await requireAdmin()

  // Delete all videos from Cloudflare first
  const lessons = await prisma.lesson.findMany({
    where: { module: { course_id: id } },
    select: { cloudflare_video_id: true },
  })

  await Promise.all(
    lessons
      .filter((l) => l.cloudflare_video_id)
      .map((l) => deleteVideo(l.cloudflare_video_id!))
  )

  await prisma.course.delete({ where: { id } })

  revalidatePath("/admin/courses")
  redirect("/admin/courses")
}

// ── Modules ───────────────────────────────────
export async function createModule(courseId: string, title: string) {
  await requireAdmin()

  const lastModule = await prisma.module.findFirst({
    where: { course_id: courseId },
    orderBy: { order_index: "desc" },
  })

  await prisma.module.create({
    data: {
      course_id: courseId,
      title,
      order_index: (lastModule?.order_index ?? 0) + 1,
    },
  })

  revalidatePath(`/admin/courses/${courseId}`)
}

export async function updateModule(id: string, title: string, courseId: string) {
  await requireAdmin()

  await prisma.module.update({
    where: { id },
    data: { title },
  })

  revalidatePath(`/admin/courses/${courseId}`)
}

export async function deleteModule(id: string, courseId: string) {
  await requireAdmin()

  await prisma.module.delete({ where: { id } })

  revalidatePath(`/admin/courses/${courseId}`)
}

// ── Lessons ───────────────────────────────────
export async function createLesson(
  moduleId: string,
  courseId: string,
  data: {
    title: string
    cloudflare_video_id?: string
    duration_seconds?: number
    is_preview?: boolean
  }
) {
  await requireAdmin()

  const lastLesson = await prisma.lesson.findFirst({
    where: { module_id: moduleId },
    orderBy: { order_index: "desc" },
  })

  await prisma.lesson.create({
    data: {
      module_id: moduleId,
      title: data.title,
      cloudflare_video_id: data.cloudflare_video_id,
      duration_seconds: data.duration_seconds,
      is_preview: data.is_preview ?? false,
      order_index: (lastLesson?.order_index ?? 0) + 1,
      status: "DRAFT",
    },
  })

  revalidatePath(`/admin/courses/${courseId}`)
}

export async function updateLesson(
  id: string,
  courseId: string,
  data: {
    title?: string
    cloudflare_video_id?: string
    duration_seconds?: number
    is_preview?: boolean
    status?: "DRAFT" | "PUBLISHED"
  }
) {
  await requireAdmin()

  await prisma.lesson.update({
    where: { id },
    data,
  })

  revalidatePath(`/admin/courses/${courseId}`)
}

export async function deleteLesson(
  id: string,
  courseId: string
) {
  await requireAdmin()

  const lesson = await prisma.lesson.findUnique({ where: { id } })

  if (lesson?.cloudflare_video_id) {
    await deleteVideo(lesson.cloudflare_video_id)
  }

  await prisma.lesson.delete({ where: { id } })

  revalidatePath(`/admin/courses/${courseId}`)
}