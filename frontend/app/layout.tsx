/**
 * @file app/layout.tsx
 * @description Root layout with FhevmProvider, dark theme, and Inter font.
 * This file stays as a Server Component; the providers are client-only.
 */

import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { FhevmProvider } from "@/providers/FhevmProvider";
import { Navigation } from "@/components/Navigation";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ZARP Registry - Confidential Wrapper Registry",
  description:
    "Explore, wrap, and decrypt ERC-7984 confidential tokens on the Zama FHEVM. Built for the Zama Developer Program Bounty Track.",
  keywords: [
    "FHEVM",
    "Zama",
    "ERC-7984",
    "confidential tokens",
    "FHE",
    "homomorphic encryption",
    "wrapper registry",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-slate-950 font-sans antialiased">
        <FhevmProvider>
          <Navigation />
          <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
        </FhevmProvider>
      </body>
    </html>
  );
}
