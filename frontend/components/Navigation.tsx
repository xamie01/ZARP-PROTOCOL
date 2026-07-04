"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount, useDisconnect, useSwitchChain, useChainId } from "wagmi";
import { sepolia, mainnet } from "wagmi/chains";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Menu, X, Wallet, Sun, Moon } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "/" },
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
  const [isDark, setIsDark] = useState(false);
  const pathname = usePathname();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const chainName =
    chainId === sepolia.id ? "Sepolia" : chainId === mainnet.id ? "Mainnet" : `Chain ${chainId}`;
  const chainColor = chainId === sepolia.id ? "bg-[#00B4D8]" : "bg-[#2ECC71]";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Theme initialization and synchronization
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialDark = saved === "dark" || (!saved && systemPrefersDark);
    
    setIsDark(initialDark);
    if (initialDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 ${
          scrolled
            ? "bg-white/92 dark:bg-[#000000]/92 backdrop-blur-xl border-b border-black/5 dark:border-white/10"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-xl font-bold text-[#1A1D20] dark:text-white tracking-tight">
              ZARP Protocol
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-5 py-2 text-[15px] font-bold rounded-full transition-all duration-300 ${
                    active
                      ? "bg-black text-[#FFD100] dark:bg-[#FFD100] dark:text-black"
                      : "bg-[#F3F4F5] text-[#4D535A] hover:bg-black hover:text-[#FFD100] dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-[#FFD100]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Wallet + Dark Mode Toggle + Mobile Toggle */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Slider */}
            <button
              onClick={toggleTheme}
              className="relative w-14 h-7 bg-[#E5E7E9] dark:bg-[#2A2D31] rounded-full transition-colors duration-300 flex items-center px-1"
              aria-label="Toggle dark mode"
            >
              <Sun className="w-3.5 h-3.5 text-[#FFD100] absolute left-1.5" />
              <Moon className="w-3.5 h-3.5 text-[#A7ACB3] absolute right-1.5" />
              <span
                className={`w-5 h-5 bg-white dark:bg-[#FFD100] rounded-full shadow-md transform transition-transform duration-300 ${
                  isDark ? "translate-x-7" : "translate-x-0"
                }`}
              />
            </button>

            {isConnected && (
              <div className="relative group">
                <button className="flex items-center gap-1.5 bg-[#F3F4F5] dark:bg-[#1A1D20] dark:border dark:border-[#2A2D31] rounded-lg px-3 py-2 text-xs font-medium text-[#4D535A] dark:text-[#CDD0D4] hover:bg-[#E5E7E9] dark:hover:bg-[#2A2D31] transition-all duration-200">
                  <span className={`w-2 h-2 rounded-full ${chainColor}`} />
                  {chainName}
                </button>
                <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-[#0A0A0C] rounded-xl border border-[#E5E7E9] dark:border-[#1D1D20] shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-1.5 z-50">
                  <button
                    onClick={() => switchChain({ chainId: sepolia.id })}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${
                      chainId === sepolia.id
                        ? "bg-[#FFD100]/10 dark:bg-[#FFD100]/20 text-[#1A1D20] dark:text-[#FFD100] font-medium"
                        : "text-[#4D535A] dark:text-[#A7ACB3] hover:bg-[#F3F4F5] dark:hover:bg-[#1A1D20]"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-[#00B4D8]" />
                    Sepolia
                  </button>
                  <button
                    onClick={() => switchChain({ chainId: mainnet.id })}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${
                      chainId === mainnet.id
                        ? "bg-[#FFD100]/10 dark:bg-[#FFD100]/20 text-[#1A1D20] dark:text-[#FFD100] font-medium"
                        : "text-[#4D535A] dark:text-[#A7ACB3] hover:bg-[#F3F4F5] dark:hover:bg-[#1A1D20]"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-[#2ECC71]" />
                    Mainnet
                  </button>
                </div>
              </div>
            )}
            {isConnected && address ? (
              <div className="relative group">
                <button className="flex items-center gap-2 bg-black dark:bg-[#FFD100] text-white dark:text-black rounded-lg px-4 py-2 text-xs font-medium hover:bg-[#FFD100] dark:hover:bg-white hover:text-black transition-all duration-300">
                  <span className="w-2 h-2 rounded-full bg-[#2ECC71]" />
                  {formatAddress(address)}
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#0A0A0C] rounded-xl border border-[#E5E7E9] dark:border-[#1D1D20] shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-2 z-50">
                  <button
                    onClick={() => disconnect()}
                    className="w-full text-left px-3 py-2 text-sm text-[#E74C3C] hover:bg-[#F3F4F5] dark:hover:bg-[#1A1D20] rounded-lg transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={openConnectModal}
                className="flex items-center gap-2 bg-black dark:bg-[#FFD100] text-white dark:text-black rounded-lg px-4 py-2 text-xs font-medium hover:bg-[#FFD100] dark:hover:bg-white hover:text-black transition-all duration-300"
              >
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </button>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-[#1A1D20] dark:text-white"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
        <div className="absolute inset-0 bg-black/30 dark:bg-black/50" onClick={() => setMobileOpen(false)} />
        <div
          className={`absolute right-0 top-0 bottom-0 w-[280px] bg-white dark:bg-[#0A0A0C] shadow-xl transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="pt-20 px-6 flex flex-col gap-2">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-5 py-3 text-[15px] font-bold rounded-full transition-colors ${
                    active
                      ? "bg-black text-[#FFD100] dark:bg-[#FFD100] dark:text-black"
                      : "text-[#4D535A] dark:text-[#A7ACB3] hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
