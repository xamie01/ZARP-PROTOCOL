import type { Metadata } from "next";
import { FhevmProvider } from "@/providers/FhevmProvider";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZARP Protocol",
  description: "Confidential token wrapping with ERC-7984 privacy.",
  keywords: ["ZARP", "ERC-7984", "confidential tokens", "wrapper registry"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[#F8F9FA] text-[#1A1D20] dark:bg-[#000000] dark:text-[#FFFFFF] antialiased overflow-x-hidden">
        <FhevmProvider>
          <Navigation />
          <main>{children}</main>
          <Footer />
        </FhevmProvider>
        <div className="noise-overlay" />
        <SpeedInsights />
      </body>
    </html>
  );
}
