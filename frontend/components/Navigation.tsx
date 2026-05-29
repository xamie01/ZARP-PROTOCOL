"use client";

/**
 * @file components/Navigation.tsx
 * @description App-wide navigation bar with page links and wallet connect button.
 */

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { cn } from "@/lib/utils";
import type { NavRoute } from "@/types";

/*************** Route Configuration ***************/

const routes: NavRoute[] = [
  {
    label: "Registry",
    href: "/",
    description: "Browse ERC-20 ↔ ERC-7984 pairs",
  },
  {
    label: "Wrap",
    href: "/wrap",
    description: "Shield & unshield tokens",
  },
  {
    label: "Decrypt",
    href: "/decrypt",
    description: "Decrypt confidential balances",
  },
  {
    label: "Faucet",
    href: "/faucet",
    description: "Get test tokens",
  },
];

/*************** Navigation Component ***************/

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav
      id="main-navigation"
      className={cn(
        "sticky top-0 z-50 w-full",
        "border-b border-slate-800/50",
        "bg-slate-950/80 backdrop-blur-xl",
        "supports-[backdrop-filter]:bg-slate-950/60"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo / Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500">
            <span className="text-sm font-bold text-white">Z</span>
          </div>
          <span className="hidden text-lg font-semibold text-slate-100 sm:inline">
            ZARP Registry
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-1">
          {routes.map((route) => {
            const isActive = pathname === route.href;
            return (
              <Link
                key={route.href}
                href={route.href}
                id={`nav-${route.label.toLowerCase()}`}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-all",
                  "hover:bg-slate-800/50 hover:text-slate-100",
                  isActive
                    ? "bg-slate-800/70 text-slate-100"
                    : "text-slate-400"
                )}
                title={route.description}
              >
                {route.label}
              </Link>
            );
          })}
        </div>

        {/* Wallet Connect */}
        <div className="flex items-center">
          <ConnectButton
            chainStatus="icon"
            showBalance={false}
            accountStatus={{
              smallScreen: "avatar",
              largeScreen: "full",
            }}
          />
        </div>
      </div>
    </nav>
  );
}
