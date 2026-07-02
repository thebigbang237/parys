// app/(admin)/admin/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  return (
    <main className="min-h-screen bg-[#fcf8f8] p-8">
      <div className="max-w-6xl mx-auto">
        <p className="text-xs tracking-[3px] uppercase text-[#ff63ce] mb-2">
          Administration
        </p>
        <h1 className="text-3xl font-serif font-medium text-gray-900">
          Panel Admin
        </h1>
        <p className="text-gray-500 mt-2">
          Connecté en tant que {session.user.email}
        </p>
      </div>
    </main>
  );
}
