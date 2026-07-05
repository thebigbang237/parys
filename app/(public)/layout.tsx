// app/(public)/layout.tsx
import { auth } from "@/auth";
import Link from "next/link";
import HeaderNav from "./_components/HeaderNav";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-[#f0e0ec] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="font-serif text-xl font-medium tracking-tight text-gray-900"
          >
            Content Level Up{" "}
            <span className="text-[#ff63ce] italic">Academy</span>
          </Link>

          <HeaderNav
            isLoggedIn={!!session}
            isAdmin={session?.user.role === "ADMIN"}
          />
        </div>
      </nav>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-[#111] text-white py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-serif text-lg">
            Content Level Up{" "}
            <span className="text-[#ff63ce] italic">Academy</span>
          </div>
          <div className="flex gap-8">
            {[
              { href: "/courses", label: "Formations" },
              { href: "/coaching", label: "Coaching" },
              { href: "/about", label: "À propos" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs tracking-[2px] uppercase text-gray-500 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <p className="text-xs text-gray-500 tracking-[2px]">
            © 2024 PARYS BATONDA
          </p>
        </div>
      </footer>
    </div>
  );
}
