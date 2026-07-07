// app/(student)/(shell)/layout.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import StudentShell from "./_components/StudentShell";

export default async function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <StudentShell
      user={{
        name: session.user.name ?? null,
        email: session.user.email ?? "",
        image: session.user.image ?? null,
      }}
    >
      {children}
    </StudentShell>
  );
}
