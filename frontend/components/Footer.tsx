"use client";

import Link from "next/link";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const PROTOCOL_LINKS = [
  { label: "Registry", href: "/registry" },
  { label: "Wrap", href: "/wrap" },
  { label: "Decrypt", href: "/decrypt" },
  { label: "Faucet", href: "/faucet" },
];

const RESOURCE_LINKS = [
  { label: "Documentation", href: "https://docs.zama.org/homepage" },
  { label: "GitHub", href: "https://github.com/xamie01/ZARP-PROTOCOL.git" },
];

export function Footer() {
  const { ref, isVisible } = useScrollReveal(0.05);

  return (
    <footer ref={ref} className="bg-black text-white">
      <div
        className={`max-w-[1200px] mx-auto px-6 pt-16 pb-8 transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold tracking-tight">ZARP</span>
            </div>
            <p className="text-base font-medium text-[#A7ACB3] mt-3">
              Confidential Token Wrapping Protocol
            </p>
          </div>

          {/* Protocol */}
          <div>
            <h4 className="text-sm font-bold text-[#A7ACB3] uppercase tracking-wider mb-4">
              Protocol
            </h4>
            <div className="flex flex-col gap-2">
              {PROTOCOL_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-base font-medium text-[#A7ACB3] hover:text-[#FFD100] transition-colors duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-bold text-[#A7ACB3] uppercase tracking-wider mb-4">
              Resources
            </h4>
            <div className="flex flex-col gap-2">
              {RESOURCE_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-base font-medium text-[#A7ACB3] hover:text-[#FFD100] transition-colors duration-300"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2 */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm font-medium text-[#A7ACB3]">
            2026 ZARP Protocol. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-sm font-medium text-[#A7ACB3] hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-sm font-medium text-[#A7ACB3] hover:text-white transition-colors">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
