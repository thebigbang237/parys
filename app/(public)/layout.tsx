// app/(public)/layout.tsx
import { auth } from "@/auth";
import Link from "next/link";
import { Camera, Music2, Mail } from "lucide-react";
import HeaderNav from "./_components/HeaderNav";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderNav
        isLoggedIn={!!session}
        isAdmin={session?.user.role === "ADMIN"}
      />

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="w-full px-6 py-16 flex flex-col items-center gap-12 bg-[#111] text-white border-t border-[#f0e0ec]/10">
        <div className="font-serif text-2xl md:text-3xl font-medium tracking-tight text-center">
          Content Level Up{" "}
          <span className="text-[#ff63ce] italic">Academy</span>
        </div>

        <nav className="flex flex-wrap justify-center gap-6 md:gap-10">
          {[
            { href: "/courses", label: "Formations" },
            { href: "/coaching", label: "Coaching" },
            { href: "/about", label: "À propos" },
            { href: "/contact", label: "Contact" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs tracking-[2px] uppercase text-gray-400 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex gap-8">
          <Camera
            size={20}
            className="cursor-pointer text-gray-400 hover:text-[#ff63ce] transition-colors"
          />
          <Music2
            size={20}
            className="cursor-pointer text-gray-400 hover:text-[#ff63ce] transition-colors"
          />
          <Mail
            size={20}
            className="cursor-pointer text-gray-400 hover:text-[#ff63ce] transition-colors"
          />
        </div>

        <p className="text-[10px] uppercase tracking-[3px] text-gray-500 text-center">
          © 2024 Parys Batonda Academy. Tous droits réservés.
        </p>
      </footer>
    </div>
  );
}
