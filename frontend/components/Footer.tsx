/**
 * @file components/Footer.tsx
 * @description Simple Kimi-style footer for the Next app shell.
 */

import Link from "next/link";
import { Shield } from "lucide-react";

const protocolLinks = [
  { label: "Home", href: "/" },
  { label: "Registry", href: "/registry" },
  { label: "Wrap", href: "/wrap" },
  { label: "Decrypt", href: "/decrypt" },
];

export function Footer() {
  return (
    <footer className="border-t border-black/5 bg-black text-white">
      <div className="section-shell py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-[#FFD100]" />
              <span className="text-2xl font-semibold tracking-tight">ZARP</span>
            </div>
            <p className="mt-3 text-sm text-white/65">
              Confidential token wrapping with the previous backend kept intact.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-white/45">
              Protocol
            </h4>
            <div className="flex flex-col gap-2">
              {protocolLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-sm text-white/65 transition-colors hover:text-[#FFD100]">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-white/45">
              Backend
            </h4>
            <p className="text-sm text-white/65">
              This frontend still uses the existing Zama FHEVM hooks, wallet
              connection, and registry/wrap/decrypt flows.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-white/45">
              Network
            </h4>
            <p className="text-sm text-white/65">Sepolia testnet</p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>2026 ZARP Protocol</p>
          <p>Built on the existing confidential token backend.</p>
        </div>
      </div>
    </footer>
  );
}
