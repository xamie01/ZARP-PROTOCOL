"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount, useDisconnect, useSwitchChain, useChainId } from "wagmi";
import { sepolia, mainnet } from "wagmi/chains";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Menu, X, Eye, Wallet } from "lucide-react";

const NAV_LINKS = [
  { label: "Registry", href: "/registry" },
  { label: "Wrap", href: "/wrap" },
  { label: "Decrypt", href: "/decrypt" },
  { label: "Faucet", href: "/faucet" },
];

function formatAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const chainName = chainId === sepolia.id ? "Sepolia" : chainId === mainnet.id ? "Mainnet" : `Chain ${chainId}`;
  const chainColor = chainId === sepolia.id ? "bg-[#00B4D8]" : "bg-[#2ECC71]";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 ${
          scrolled
            ? "bg-white/92 backdrop-blur-xl border-b border-black/5"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Eye className="w-7 h-7 text-[#FFD100] group-hover:scale-110 transition-transform" />
            <span className="text-[15px] font-semibold text-[#1A1D20] tracking-tight">
              ZARP Protocol
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3 py-2 text-[13px] font-medium rounded-lg transition-colors ${
                  pathname === link.href
                    ? "text-[#1A1D20]"
                    : "text-[#4D535A] hover:text-[#1A1D20] hover:bg-black/5"
                }`}
              >
                {link.label}
                {pathname === link.href && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#FFD100] rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Wallet + Mobile Toggle */}
          <div className="flex items-center gap-3">
            {isConnected && (
              <div className="relative group">
                <button className="flex items-center gap-1.5 bg-[#F3F4F5] rounded-lg px-3 py-2 text-xs font-medium text-[#4D535A] hover:bg-[#E5E7E9] transition-all duration-200">
                  <span className={`w-2 h-2 rounded-full ${chainColor}`} />
                  {chainName}
                </button>
                <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl border border-[#E5E7E9] shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-1.5 z-50">
                  <button
                    onClick={() => switchChain({ chainId: sepolia.id })}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${chainId === sepolia.id ? 'bg-[#FFD100]/10 text-[#1A1D20] font-medium' : 'text-[#4D535A] hover:bg-[#F3F4F5]'}`}
                  >
                    <span className="w-2 h-2 rounded-full bg-[#00B4D8]" />Sepolia
                  </button>
                  <button
                    onClick={() => switchChain({ chainId: mainnet.id })}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${chainId === mainnet.id ? 'bg-[#FFD100]/10 text-[#1A1D20] font-medium' : 'text-[#4D535A] hover:bg-[#F3F4F5]'}`}
                  >
                    <span className="w-2 h-2 rounded-full bg-[#2ECC71]" />Mainnet
                  </button>
                </div>
              </div>
            )}
            {isConnected && address ? (
              <div className="relative group">
                <button className="flex items-center gap-2 bg-black text-white rounded-lg px-4 py-2 text-xs font-medium hover:bg-[#FFD100] hover:text-black transition-all duration-300">
                  <span className="w-2 h-2 rounded-full bg-[#2ECC71]" />
                  {formatAddress(address)}
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-[#E5E7E9] shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-2 z-50">
                  <button
                    onClick={() => disconnect()}
                    className="w-full text-left px-3 py-2 text-sm text-[#E74C3C] hover:bg-[#F3F4F5] rounded-lg transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={openConnectModal}
                className="flex items-center gap-2 bg-black text-white rounded-lg px-4 py-2 text-xs font-medium hover:bg-[#FFD100] hover:text-black transition-all duration-300"
              >
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </button>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-black/5 transition-colors"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 md:hidden ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/30"
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={`absolute right-0 top-0 bottom-0 w-[280px] bg-white shadow-xl transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="pt-20 px-6 flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  pathname === link.href
                    ? "bg-[#FFD100]/10 text-[#1A1D20] border-l-2 border-[#FFD100]"
                    : "text-[#4D535A] hover:bg-black/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
