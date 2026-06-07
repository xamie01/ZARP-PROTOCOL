/**
 * @file app/layout.tsx
 * @description Root layout for the Kimi-styled frontend shell.
 */

import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { FhevmProvider } from "@/providers/FhevmProvider";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
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
  title: "ZARP Protocol",
  description: "Confidential token wrapping with the existing FHEVM backend.",
  keywords: [
    "ZARP",
    "ERC-7984",
    "confidential tokens",
    "wrapper registry",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-[var(--color-near-white)] font-sans antialiased text-[#1A1D20]">
        <FhevmProvider>
          <Navigation />
          <main className="section-shell py-8 sm:py-10">
            {children}
          </main>
          <Footer />
        </FhevmProvider>
        <div className="noise-overlay" />
      </body>
    </html>
  );
}
