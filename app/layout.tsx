import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";
import "./globals.css";

const inter = localFont({
  src: "../public/fonts/Inter_28pt-Regular.ttf",
  variable: "--font-inter",
  weight: "400",
  display: "swap",
});

const merriweather = localFont({
  src: "../public/fonts/Merriweather_96pt-Regular.ttf",
  variable: "--font-merriweather",
  weight: "400",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Content Level Up Academy",
  description: "Formations et coaching privé pour créatrices de contenu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${merriweather.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ReactLenis root>{children}</ReactLenis>
      </body>
    </html>
  );
}
