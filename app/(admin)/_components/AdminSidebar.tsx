// app/(admin)/_components/AdminSidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Receipt,
  Ticket,
  Video,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/actions/auth.actions";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/courses", label: "Formations", icon: BookOpen },
  { href: "/admin/students", label: "Étudiantes", icon: Users },
  { href: "/admin/bookings", label: "Sessions", icon: Receipt },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/coaching", label: "Coaching", icon: Video },
];

export default function AdminSidebar({
  email,
}: {
  email?: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between bg-[#111] text-white p-4">
        <div className="font-serif text-lg">Content Level Up</div>
        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          className="text-white/80 hover:text-white"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Backdrop on mobile when drawer is open */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
        />
      )}

      <aside
        className={cn(
          "w-64 bg-[#111] text-white flex flex-col shrink-0",
          "fixed inset-y-0 left-0 z-40 transition-transform duration-200 md:transition-none",
          "md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="p-6 border-b border-white/10 hidden md:block">
          <div className="text-xs tracking-[3px] uppercase text-[#ff63ce] mb-1">
            Admin Panel
          </div>
          <div className="font-serif text-lg">Content Level Up</div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Icon size={18} className="text-[#ff63ce]" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="text-xs text-white/40 mb-3 px-3 truncate">
            {email}
          </div>
          <form action={logout}>
            <button className="w-full text-left px-3 py-2 text-sm text-white/60 hover:text-white transition-colors">
              Déconnexion →
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
