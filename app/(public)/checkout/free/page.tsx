// app/(public)/checkout/free/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { enrollFree } from "@/lib/actions/enrollment.actions";

export default async function FreeCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ courseId?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { courseId } = await searchParams;
  if (!courseId) redirect("/courses");

  // Auto-enroll immediately for free courses
  await enrollFree(courseId);

  // enrollFree redirects on success
  return null;
}
