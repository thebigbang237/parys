// app/(public)/_components/HeaderNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/actions/auth.actions";

const NAV_LINKS = [
  { href: "/courses", label: "Formations" },
  { href: "/coaching", label: "Coaching privé" },
  { href: "/about", label: "À propos" },
];

export default function HeaderNav({
  isLoggedIn,
  isAdmin,
}: {
  isLoggedIn: boolean;
  isAdmin: boolean;
}) {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      <div className="hidden md:flex items-center gap-8">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "text-xs tracking-[2px] uppercase pb-1 border-b-2 transition-colors",
              isActive(link.href)
                ? "text-[#ff63ce] border-[#ff63ce]"
                : "text-gray-500 border-transparent hover:text-gray-900",
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4">
        {isLoggedIn ? (
          <>
            <Link
              href="/dashboard"
              className={cn(
                "text-xs tracking-[2px] uppercase transition-colors",
                isActive("/dashboard")
                  ? "text-gray-900 font-medium"
                  : "text-gray-500 hover:text-gray-900",
              )}
            >
              Mon espace
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className={cn(
                  "text-xs tracking-[2px] uppercase transition-colors",
                  isActive("/admin")
                    ? "text-gray-900 font-medium"
                    : "text-[#ff63ce] hover:text-gray-900",
                )}
              >
                Admin
              </Link>
            )}
            <form action={logout}>
              <button className="text-xs tracking-[2px] uppercase text-gray-500 hover:text-gray-900 transition-colors">
                Déconnexion
              </button>
            </form>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className={cn(
                "text-xs tracking-[2px] uppercase transition-colors",
                isActive("/login")
                  ? "text-gray-900 font-medium"
                  : "text-gray-500 hover:text-gray-900",
              )}
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="bg-[#ff63ce] text-white px-5 py-2.5 text-xs tracking-[2px] uppercase hover:bg-[#111] transition-colors"
            >
              S'inscrire
            </Link>
          </>
        )}
      </div>
    </>
  );
}
