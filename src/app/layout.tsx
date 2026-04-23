import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Inter — primary UI font. Using variable axes for weight range 100–900
// so every font-weight renders from one file with no layout shift.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  // preload the most-used weights up front; others are inferred from the variable font
  weight: "variable",
});

// JetBrains Mono — replaces Geist Mono.
// Optimised for on-screen code / data; ships with full tabular-nums support.
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "KOLPlanet — Campaign Plans",
  description: "KOL influencer management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="h-full bg-gray-50">{children}</body>
    </html>
  );
}
