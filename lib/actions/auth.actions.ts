// lib/actions/auth.actions.ts
"use server"

import { signIn, signOut } from "@/auth"
import { prisma } from "@/lib/prisma"
import { AuthError } from "next-auth"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { sendWelcomeEmail } from "@/lib/services/email.service"

const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  country: z.string().optional(),
})

export async function register(formData: z.infer<typeof RegisterSchema>) {
  const parsed = RegisterSchema.safeParse(formData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { name, email, password, country } = parsed.data

  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { error: "An account with this email already exists" }
  }

  const password_hash = await bcrypt.hash(password, 12)

  await prisma.user.create({
    data: {
      name,
      email,
      password_hash,
      country: country || null,
    },
  })

  try {
    await sendWelcomeEmail(email, name)
  } catch (err) {
    console.error("Failed to send welcome email:", err)
  }

  // Auto sign in after registration
  await signIn("credentials", {
    email,
    password,
    redirectTo: "/dashboard",
  })
}

export async function loginWithCredentials(
  email: string,
  password: string
) {
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password" }
    }
    throw error
  }
}

export async function loginWithGoogle() {
  await signIn("google", { redirectTo: "/dashboard" })
}

export async function logout() {
  await signOut({ redirectTo: "/" })
}