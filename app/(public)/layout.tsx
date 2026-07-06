// app/(public)/layout.tsx
import { auth } from "@/auth";
import Link from "next/link";
import HeaderNav from "./_components/HeaderNav";
import Image from "next/image";

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function TikTokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M16.6 5.82c-1.12-1.08-1.67-2.64-1.75-4.17h-3.9v14.63c0 1.79-1.45 3.25-3.25 3.25a3.25 3.25 0 0 1 0-6.5c.35 0 .69.05 1 .16V9.42a7.16 7.16 0 0 0-1-.07 7.14 7.14 0 1 0 7.14 7.14V8.87a9.24 9.24 0 0 0 5.4 1.73V6.7c-1.28 0-2.55-.4-3.64-1.05-.13-.08-.26-.16-.4-.25-.2-.14-.4-.3-.6-.48z" />
    </svg>
  );
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 1.913-.287 1.754h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.628-5.373-12-12-12s-12 5.372-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
    </svg>
  );
}

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
        <Link href="/" className="shrink-0">
          <Image
            src="/images/Logo_Parys_Nom_Noir.png"
            alt="Parys Batonda"
            width={292}
            height={100}
            priority
            className="h-20 w-auto"
          />
        </Link>

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
          <a
            href="https://www.instagram.com/parysbatonda?igsh=MTN5Ynh6ZmFnZ2VtNg=="
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <InstagramIcon
              width={20}
              height={20}
              className="cursor-pointer text-gray-400 hover:text-[#ff63ce] transition-colors"
            />
          </a>
          <a
            href="https://www.tiktok.com/@parysbatonda?_r=1&_t=ZS-97oGJZjnHXT"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
          >
            <TikTokIcon
              width={20}
              height={20}
              className="cursor-pointer text-gray-400 hover:text-[#ff63ce] transition-colors"
            />
          </a>
          <a
            href="https://www.facebook.com/share/1DAYvfhNmU/?mibextid=wwXIfr"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
          >
            <FacebookIcon
              width={20}
              height={20}
              className="cursor-pointer text-gray-400 hover:text-[#ff63ce] transition-colors"
            />
          </a>
        </div>

        <p className="text-[10px] uppercase tracking-[3px] text-gray-500 text-center">
          © 2024 Parys Batonda Academy. Tous droits réservés.
        </p>
      </footer>
    </div>
  );
}
