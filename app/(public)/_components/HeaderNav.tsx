// app/(public)/_components/HeaderNav.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/actions/auth.actions";
import { LogOut } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/courses", label: "Formations" },
  { href: "/coaching", label: "Coaching privé" },
  { href: "/about", label: "À propos" },
];

function HamburgerIcon({ open }: { open: boolean }) {
  const base =
    "block w-[18px] h-[1.75px] bg-gray-900 rounded-full transition-all duration-300 ease-in-out";
  return (
    <span className="flex flex-col items-center justify-center gap-[4.5px] w-9 h-9">
      <span className={cn(base, open && "rotate-45 translate-y-[6.25px]")} />
      <span className={cn(base, open && "opacity-0 scale-x-0")} />
      <span className={cn(base, open && "-rotate-45 -translate-y-[6.25px]")} />
    </span>
  );
}

export default function HeaderNav({
  isLoggedIn,
  isAdmin,
}: {
  isLoggedIn: boolean;
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setIsOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  function isActive(href: string) {
    return href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      {/* Scrim — closes menu when tapping outside on mobile */}
      <div
        aria-hidden="true"
        onClick={() => setIsOpen(false)}
        className={cn(
          "fixed inset-0 z-40 md:hidden transition-opacity duration-300",
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
      />

      {/* Floating nav pill */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] max-w-5xl">
        <nav
          className={cn(
            "rounded-[20px] overflow-hidden backdrop-blur-2xl [backdrop-filter:blur(24px)_saturate(180%)] transition-[background-color,box-shadow] duration-300",
            scrolled
              ? "bg-white/[.9] ring-1 ring-black/[.07] shadow-[inset_0_1px_0_rgba(255,255,255,.8),0_8px_32px_rgba(0,0,0,.10)]"
              : "bg-white/[.78] ring-1 ring-black/[.05] shadow-[inset_0_1px_0_rgba(255,255,255,.7),0_4px_20px_rgba(0,0,0,.07)]",
          )}
        >
          {/* Top row */}
          <div className="flex items-center gap-4 px-5 py-3.5">
            <Link href="/" className="shrink-0">
              <Image
                src="/images/Logo_Parys_Nom_Blanc.png"
                alt="Parys Batonda"
                width={292}
                height={100}
                priority
                className="h-10 w-auto"
              />
            </Link>

            {/* Center — nav links (desktop only) */}
            <div className="hidden md:flex items-center justify-center gap-0.5 flex-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[13px] font-medium tracking-wide transition-all duration-150",
                    isActive(link.href)
                      ? "text-[#ff63ce] bg-[#ff63ce]/[.08]"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-900/[.04]",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right — auth actions (desktop only) */}
            <div className="hidden md:flex items-center gap-3 shrink-0">
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
                      <LogOut size={16} color="#ff63ce" />
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
                    className="inline-flex items-center bg-[#ff63ce] text-white text-xs tracking-[2px] uppercase px-5 py-2.5 rounded-xl hover:brightness-110 active:scale-95 transition-all"
                  >
                    S'inscrire
                  </Link>
                </>
              )}
            </div>

            {/* Mobile — hamburger */}
            <div className="md:hidden ml-auto flex items-center gap-2">
              <button
                onClick={() => setIsOpen((v) => !v)}
                aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
                aria-expanded={isOpen}
                className="rounded-xl hover:bg-gray-900/[.06] active:bg-gray-900/10 transition-colors"
              >
                <HamburgerIcon open={isOpen} />
              </button>
            </div>
          </div>

          {/* Mobile dropdown */}
          <div
            className={cn(
              "md:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out",
              isOpen ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0",
            )}
          >
            <div className="px-3 pb-3 pt-1 flex flex-col gap-0.5 border-t border-black/[.06]">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-colors",
                    isActive(link.href)
                      ? "text-[#ff63ce] bg-[#ff63ce]/[.08]"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-900/[.06]",
                  )}
                >
                  {link.label}
                </Link>
              ))}

              {isLoggedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center px-3 py-3 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-900/[.06] transition-colors"
                  >
                    Mon espace
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center px-3 py-3 rounded-xl text-sm font-medium text-[#ff63ce] hover:bg-gray-900/[.06] transition-colors"
                    >
                      Admin
                    </Link>
                  )}
                  <form action={logout}>
                    <button className="w-full text-left px-3 py-3 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-900/[.06] transition-colors">
                      Déconnexion
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="flex items-center px-3 py-3 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-900/[.06] transition-colors"
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/register"
                    className="mt-2 flex items-center justify-center gap-2 bg-[#ff63ce] text-white text-sm font-medium px-5 py-3 rounded-xl hover:brightness-110 active:scale-[.98] transition-all"
                  >
                    S'inscrire
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}
