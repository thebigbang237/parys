// app/(student)/(shell)/_components/StudentShell.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  CalendarClock,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/actions/auth.actions";
import NotificationsBell from "./NotificationsBell";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/courses", label: "Formations", icon: GraduationCap },
  { href: "/coaching", label: "Coaching", icon: CalendarClock },
  { href: "/settings", label: "Paramètres", icon: Settings },
];

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <ul className="space-y-1">
      {NAV_LINKS.map((link) => {
        const isActive =
          pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-6 py-3 text-xs tracking-[2px] uppercase transition-colors",
                isActive
                  ? "bg-[#f9eff4] text-gray-900 font-medium border-r-2 border-[#a61968]"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              <link.icon size={18} />
              <span>{link.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default function StudentShell({
  user,
  children,
}: {
  user: { name: string | null; email: string; image: string | null };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const firstName = user.name?.split(" ")[0] || "Étudiante";
  const initial = (user.name || user.email)[0]?.toUpperCase();

  return (
    <div className="min-h-screen bg-[#E9E4E0] lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-[#f3dfea] lg:h-screen lg:sticky lg:top-0 shrink-0">
        <div className="px-6 py-8">
          <Link href="/" className="shrink-0">
            <Image
              src="/images/Logo_Parys_Nom_Blanc.png"
              alt="Parys Batonda"
              width={292}
              height={100}
              priority
              className="h-20 w-auto"
            />
          </Link>
        </div>

        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-[#f9eff4] flex items-center justify-center shrink-0">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name || "Profil"}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-[#a61968] font-serif font-medium">
                {initial}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] tracking-[2px] uppercase text-gray-400"></p>
            <p className="text-sm font-medium text-gray-900 truncate">
              {firstName}{" "}
            </p>
          </div>
        </div>

        <nav className="flex-1">
          <NavLinks pathname={pathname} />
        </nav>

        <div className="p-6 border-t border-[#f3dfea]">
          <form action={logout}>
            <button className="flex items-center gap-2 text-xs tracking-[2px] uppercase text-gray-500 hover:text-gray-900 transition-colors">
              <LogOut size={16} />
              Déconnexion
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-[#f3dfea] px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Ouvrir le menu"
          className="p-1.5 text-gray-700"
        >
          <Menu size={22} />
        </button>
        <span className="font-serif text-base font-medium text-gray-900">
          Content Level Up{" "}
          <span className="text-[#a61968] italic">Academy</span>
        </span>
        <NotificationsBell />
      </div>

      {/* Mobile drawer */}
      <div
        aria-hidden="true"
        onClick={() => setIsOpen(false)}
        className={cn(
          "fixed inset-0 z-50 bg-black/30 lg:hidden transition-opacity duration-300",
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
      />
      <div
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-72 bg-white lg:hidden transition-transform duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="px-6 py-6 flex items-center justify-between border-b border-[#f3dfea]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-[#f9eff4] flex items-center justify-center shrink-0">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name || "Profil"}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[#a61968] font-serif font-medium">
                  {initial}
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-gray-900">{firstName}</p>
          </div>
          <button onClick={() => setIsOpen(false)} aria-label="Fermer le menu">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <nav className="flex-1 py-4">
          <NavLinks pathname={pathname} onNavigate={() => setIsOpen(false)} />
        </nav>

        <div className="p-6 border-t border-[#f3dfea]">
          <form action={logout}>
            <button className="flex items-center gap-2 text-xs tracking-[2px] uppercase text-gray-500 hover:text-gray-900 transition-colors">
              <LogOut size={16} />
              Déconnexion
            </button>
          </form>
        </div>
      </div>

      {/* Desktop notifications, floating top-right */}
      <div className="hidden lg:block fixed top-6 right-8 z-30">
        <NotificationsBell />
      </div>

      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
