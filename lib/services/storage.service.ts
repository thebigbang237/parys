// lib/services/storage.service.ts
import { createClient } from "@supabase/supabase-js"

// Use service role client — bypasses RLS, admin only
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function uploadImage(
  file: File,
  folder: "courses" | "profiles"
): Promise<string> {
  const supabase = getServiceClient()

  const ext = file.name.split(".").pop()
  const fileName = `${folder}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { error } = await supabase.storage
    .from("images")
    .upload(fileName, buffer, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    })

  if (error) throw new Error(error.message)

  const { data } = supabase.storage
    .from("images")
    .getPublicUrl(fileName)

  return data.publicUrl
}

export async function deleteImage(url: string): Promise<void> {
  const supabase = getServiceClient()

  const path = url.split("/storage/v1/object/public/images/")[1]
  if (!path) return

  await supabase.storage.from("images").remove([path])
}