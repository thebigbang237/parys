// app/(admin)/layout.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logout } from "@/lib/actions/auth.actions";

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
    <div className="min-h-screen flex bg-[#fcf8f8]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#111] text-white flex flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="text-xs tracking-[3px] uppercase text-[#ff63ce] mb-1">
            Admin Panel
          </div>
          <div className="font-serif text-lg">Content Level Up</div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { href: "/admin", label: "Dashboard", icon: "▦" },
            { href: "/admin/courses", label: "Formations", icon: "▤" },
            { href: "/admin/students", label: "Étudiantes", icon: "▣" },
            { href: "/admin/bookings", label: "Sessions", icon: "▢" },
            { href: "/admin/coupons", label: "Coupons", icon: "◈" },
            { href: "/admin/coaching", label: "Coaching", icon: "◎" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <span className="text-[#ff63ce]">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="text-xs text-white/40 mb-3 px-3">
            {session.user.email}
          </div>
          <form action={logout}>
            <button className="w-full text-left px-3 py-2 text-sm text-white/60 hover:text-white transition-colors">
              Déconnexion →
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
