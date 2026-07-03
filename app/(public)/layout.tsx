// app/(public)/layout.tsx
import { auth } from "@/auth";
import Link from "next/link";
import { logout } from "@/lib/actions/auth.actions";

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

          <div className="hidden md:flex items-center gap-8">
            {[
              { href: "/courses", label: "Formations" },
              { href: "/coaching", label: "Coaching privé" },
              { href: "/about", label: "À propos" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs tracking-[2px] uppercase text-gray-500 hover:text-gray-900 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-xs tracking-[2px] uppercase text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Mon espace
                </Link>
                {session.user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="text-xs tracking-[2px] uppercase text-[#ff63ce] hover:text-gray-900 transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <form action={logout}>
                  <button className="text-xs tracking-[2px] uppercase text-gray-400 hover:text-gray-900 transition-colors">
                    Déconnexion
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs tracking-[2px] uppercase text-gray-500 hover:text-gray-900 transition-colors"
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
                className="text-xs tracking-[2px] uppercase text-gray-400 hover:text-white transition-colors"
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
