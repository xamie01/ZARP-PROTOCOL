"use client";

import { useState } from "react";
import { Search, Copy, ExternalLink, Shield, Check } from "lucide-react";
import CountUp from "react-countup";
import ScrollReveal from "@/components/ScrollReveal";
import { useRegistry } from "@/hooks/useRegistry";
import { explorerUrl } from "@/lib/registry-data";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      className="relative ml-1.5 text-[#A7ACB3] hover:text-[#FFD100] transition-colors"
    >
      <Copy className="w-3.5 h-3.5" />
      {copied && (
        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-[#FFD100] text-black text-[10px] font-medium px-2 py-0.5 rounded whitespace-nowrap">
          Copied!
        </span>
      )}
    </button>
  );
}

function truncate(addr: string) {
  if (addr.length <= 14) return addr;
  return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
}

export default function RegistryPage() {
  const [chainDropdownOpen, setChainDropdownOpen] = useState(false);
  const { filteredPairs, search, setSearch, chainFilter, setChainFilter, isLoading } = useRegistry();

  const chainLabel = chainFilter === "all" ? "All Chains" : chainFilter === "sepolia" ? "Sepolia" : "Mainnet";

  return (
    <div className="min-h-screen pt-16">
      {/* Page Header */}
      <div className="border-b border-[#E5E7E9] dark:border-[#2A2D31]">
        <div className="max-w-[1200px] mx-auto px-6 pt-28 pb-12">
          <span className="text-xs font-medium text-[#FFD100] uppercase tracking-[0.1em]">
            WRAPPER REGISTRY
          </span>
          <h1 className="text-[40px] font-semibold text-[#1A1D20] dark:text-white tracking-tight mt-2">Registry</h1>
          <p className="text-base text-[#656B73] dark:text-[#A7ACB3] mt-3 max-w-[640px] leading-relaxed">
            Browse all registered ERC-20 to ERC-7984 confidential wrapper pairs.
            Search by token name, symbol, or contract address.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <ScrollReveal delay={0}>
              <div className="card-default flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center text-[#FFD100]">
                  <Shield className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <div>
                  <span className="text-xs text-[#A7ACB3] uppercase tracking-wider">Total Pairs</span>
                  <p className="text-3xl font-semibold text-[#1A1D20] dark:text-white">
                    <CountUp end={filteredPairs.length} duration={1.5} />
                  </p>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <div className="card-default flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center text-[#2ECC71]">
                  <Check className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <div>
                  <span className="text-xs text-[#A7ACB3] uppercase tracking-wider">Valid Wrappers</span>
                  <p className="text-3xl font-semibold text-[#1A1D20] dark:text-white">
                    <CountUp end={filteredPairs.filter((p) => p.isValid).length} duration={1.5} />
                  </p>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <div className="card-default flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center text-[#00B4D8]">
                  <ExternalLink className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <div>
                  <span className="text-xs text-[#A7ACB3] uppercase tracking-wider">Network</span>
                  <p className="text-2xl font-semibold text-[#00B4D8]">{chainLabel}</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="sticky top-16 z-40 bg-[#F8F9FA]/95 dark:bg-[#0A0A0C]/95 backdrop-blur-md border-b border-[#E5E7E9] dark:border-[#2A2D31]">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A7ACB3]" />
            <input
              type="text"
              placeholder="Search by name, symbol, or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-10 pr-4 border-[1.5px] border-[#CDD0D4] dark:border-[#33383D] rounded-lg bg-white dark:bg-[#141416] text-[#1A1D20] dark:text-white text-base focus:border-[#FFD100] focus:shadow-[0_0_0_3px_rgba(255,209,0,0.2)] outline-none transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A7ACB3] hover:text-[#1A1D20] dark:hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => setChainDropdownOpen(!chainDropdownOpen)}
              className="h-12 px-4 border-[1.5px] border-[#CDD0D4] dark:border-[#33383D] rounded-lg bg-white dark:bg-[#141416] text-[#1A1D20] dark:text-white text-sm min-w-[180px] flex items-center justify-between gap-2 focus:border-[#FFD100] outline-none transition-all"
            >
              {chainLabel}
              <span className="text-[#A7ACB3]">▼</span>
            </button>
            {chainDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setChainDropdownOpen(false)} />
                <div className="absolute top-full mt-1 right-0 w-48 bg-white dark:bg-[#0A0A0C] rounded-xl border border-[#E5E7E9] dark:border-[#2A2D31] shadow-lg z-20 py-1">
                  {[
                    { label: "All Chains", value: "all" as const },
                    { label: "Sepolia", value: "sepolia" as const },
                    { label: "Mainnet", value: "mainnet" as const },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setChainFilter(opt.value); setChainDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#F3F4F5] dark:hover:bg-[#1D1D20] transition-colors ${
                        chainFilter === opt.value ? "text-[#1A1D20] dark:text-white font-medium bg-[#FFD100]/10" : "text-[#4D535A] dark:text-[#CDD0D4]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <ScrollReveal>
          <div className="card-default p-0 overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-[#F3F4F5] dark:bg-[#1D1D20]">
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#A7ACB3] uppercase tracking-wider rounded-tl-xl">ERC-20 Symbol</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#A7ACB3] uppercase tracking-wider">ERC-20 Address</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#A7ACB3] uppercase tracking-wider">ERC-7984 Symbol</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#A7ACB3] uppercase tracking-wider">ERC-7984 Address</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#A7ACB3] uppercase tracking-wider">Chain</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#A7ACB3] uppercase tracking-wider rounded-tr-xl">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16">
                      <div className="w-8 h-8 border-2 border-[#FFD100] border-t-transparent rounded-full animate-spin-loader mx-auto" />
                    </td>
                  </tr>
                ) : filteredPairs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16">
                      <p className="text-xl font-semibold text-[#A7ACB3]">No pairs found</p>
                      <p className="text-sm text-[#A7ACB3] mt-2">Try adjusting your search or filter</p>
                      <button
                        onClick={() => { setSearch(""); setChainFilter("all"); }}
                        className="btn-yellow mt-4"
                      >
                        Clear Filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredPairs.map((pair, i) => (
                    <tr key={i} className="border-b border-[#F3F4F5] dark:border-[#2A2D31] hover:bg-[rgba(255,209,0,0.04)] dark:hover:bg-[rgba(255,209,0,0.08)] transition-colors">
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-2 bg-[#F3F4F5] dark:bg-[#1D1D20] text-[#4D535A] dark:text-[#CDD0D4] text-xs font-medium px-3 py-1 rounded-full">
                          <span className="w-5 h-5 rounded-full bg-gradient-to-br from-[#FFD100] to-[#FFD100]/60 flex items-center justify-center text-[8px] font-bold text-black">
                            {pair.erc20.symbol[0]}
                          </span>
                          {pair.erc20.symbol}
                        </span>
                        {pair.erc20.name && (
                          <span className="block text-[11px] text-[#A7ACB3] mt-1 pl-1">
                            {pair.erc20.name}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-[#656B73] dark:text-[#A7ACB3]">
                        <span className="flex items-center">
                          {truncate(pair.erc20.address)}
                          <CopyButton text={pair.erc20.address} />
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="inline-flex items-center bg-[rgba(93,95,239,0.15)] text-[#5D5FEF] text-xs font-medium px-3 py-1 rounded-full">
                            {pair.erc7984.symbol}
                          </span>
                          {!pair.isValid && (
                            <span
                              title="This wrapper has been revoked in the on-chain registry. Do not use it."
                              className="inline-flex items-center bg-[rgba(231,76,60,0.12)] text-[#E74C3C] text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            >
                              Revoked
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-[#656B73] dark:text-[#A7ACB3]">
                        <span className="flex items-center">
                          {truncate(pair.erc7984.address)}
                          <CopyButton text={pair.erc7984.address} />
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center bg-[#00B4D8] text-white text-xs font-medium px-3 py-1 rounded-full">
                          {pair.chainName}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigator.clipboard.writeText(
                              `${pair.erc20.symbol} (${pair.erc20.address}) → ${pair.erc7984.symbol} (${pair.erc7984.address}) - ${pair.chainName}`
                            )}
                            className="text-[#A7ACB3] hover:text-[#FFD100] transition-colors"
                            title="Copy pair info"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <a
                            href={explorerUrl(pair.chainId, "address", pair.erc20.address)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#A7ACB3] hover:text-[#FFD100] transition-colors"
                            title="View on explorer"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </ScrollReveal>
        <p className="text-sm text-[#A7ACB3] mt-4">
          Showing {filteredPairs.length} pair{filteredPairs.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
