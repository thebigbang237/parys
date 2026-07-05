// app/(admin)/layout.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "./_components/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#fcf8f8]">
      <AdminSidebar email={session.user.email} />
      <main className="flex-1 overflow-auto min-w-0">{children}</main>
    </div>
  );
}
