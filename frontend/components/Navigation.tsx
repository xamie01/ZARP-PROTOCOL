"use client";

/**
 * @file components/Navigation.tsx
 * @description Top navigation for the Kimi-styled shell.
 */

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Menu, Shield, X } from "lucide-react";
import { cn } from "@/lib/utils";

const routes = [
  { label: "Home", href: "/" },
  { label: "Registry", href: "/registry" },
  { label: "Wrap", href: "/wrap" },
  { label: "Decrypt", href: "/decrypt" },
  { label: "Faucet", href: "/faucet" },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-[var(--color-near-white)]/95 backdrop-blur-xl">
      <div className="section-shell flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-[#FFD100]">
            <Shield className="h-4.5 w-4.5" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">
            ZARP Protocol
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {routes.map((route) => {
            const active = pathname === route.href;
            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "relative rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                  active
                    ? "text-black"
                    : "text-[#4D535A] hover:bg-black/5 hover:text-black"
                )}
              >
                {route.label}
                {active && (
                  <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-[#FFD100]" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <ConnectButton
              chainStatus="icon"
              showBalance={false}
              accountStatus={{ smallScreen: "avatar", largeScreen: "full" }}
            />
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="rounded-lg p-2 transition-colors hover:bg-black/5 md:hidden"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-40 md:hidden",
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <div className="absolute inset-0 bg-black/25" onClick={() => setMobileOpen(false)} />
        <div
          className={cn(
            "absolute right-0 top-0 h-full w-[280px] border-l border-black/5 bg-white p-6 transition-transform",
            mobileOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="mt-10 flex flex-col gap-2">
            {routes.map((route) => {
              const active = pathname === route.href;
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                    active
                      ? "bg-[#FFD100]/10 text-black"
                      : "text-[#4D535A] hover:bg-black/5 hover:text-black"
                  )}
                >
                  {route.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
