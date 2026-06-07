import { useState, useMemo } from "react";
import { Search, Copy, ExternalLink, Shield, Check } from "lucide-react";
import CountUp from "react-countup";
import ScrollReveal from "@/components/ScrollReveal";
import { TOKEN_PAIRS } from "@/data/tokens";

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

function StatCard({
  icon: Icon,
  iconColor,
  label,
  value,
  isNetwork = false,
}: {
  icon: React.ElementType;
  iconColor: string;
  label: string;
  value: string | number;
  isNetwork?: boolean;
}) {
  return (
    <ScrollReveal delay={0}>
      <div className="card-default flex items-center gap-4">
        <div className={`w-10 h-10 flex items-center justify-center ${iconColor}`}>
          <Icon className="w-6 h-6" strokeWidth={1.5} />
        </div>
        <div>
          <span className="text-xs text-[#A7ACB3] uppercase tracking-wider">
            {label}
          </span>
          {isNetwork ? (
            <p className="text-2xl font-semibold text-[#00B4D8]">{value}</p>
          ) : (
            <p className="text-3xl font-semibold text-[#1A1D20]">
              <CountUp end={value as number} duration={1.5} />
            </p>
          )}
        </div>
      </div>
    </ScrollReveal>
  );
}

export default function Registry() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChain, setSelectedChain] = useState<string>("All Chains");
  const [chainDropdownOpen, setChainDropdownOpen] = useState(false);

  const filteredPairs = useMemo(() => {
    return TOKEN_PAIRS.filter((pair) => {
      const matchesSearch =
        !searchQuery ||
        pair.erc20Symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pair.erc7984Symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pair.erc20Address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pair.erc7984Address.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesChain =
        selectedChain === "All Chains" || pair.chain === selectedChain;

      return matchesSearch && matchesChain;
    });
  }, [searchQuery, selectedChain]);

  return (
    <div className="min-h-screen pt-16">
      {/* Page Header */}
      <div className="border-b border-[#E5E7E9]">
        <div className="max-w-[1200px] mx-auto px-6 pt-28 pb-12">
          <span className="text-xs font-medium text-[#FFD100] uppercase tracking-[0.1em]">
            WRAPPER REGISTRY
          </span>
          <h1 className="text-[40px] font-semibold text-[#1A1D20] tracking-tight mt-2">
            Registry
          </h1>
          <p className="text-base text-[#656B73] mt-3 max-w-[640px] leading-relaxed">
            Browse all registered ERC-20 to ERC-7984 confidential wrapper pairs.
            Search by token name, symbol, or contract address.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <StatCard
              icon={Shield}
              iconColor="text-[#FFD100]"
              label="Total Pairs"
              value={filteredPairs.length}
            />
            <StatCard
              icon={Check}
              iconColor="text-[#2ECC71]"
              label="Valid Wrappers"
              value={filteredPairs.length}
            />
            <StatCard
              icon={ExternalLink}
              iconColor="text-[#00B4D8]"
              label="Network"
              value="Sepolia"
              isNetwork
            />
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="sticky top-16 z-40 bg-[#F8F9FA]/95 backdrop-blur-md border-b border-[#E5E7E9]">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A7ACB3]" />
            <input
              type="text"
              placeholder="Search by symbol or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-10 pr-4 border-[1.5px] border-[#CDD0D4] rounded-lg bg-white text-[#1A1D20] text-base focus:border-[#FFD100] focus:shadow-[0_0_0_3px_rgba(255,209,0,0.2)] outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A7ACB3] hover:text-[#1A1D20]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Chain Filter */}
          <div className="relative">
            <button
              onClick={() => setChainDropdownOpen(!chainDropdownOpen)}
              className="h-12 px-4 border-[1.5px] border-[#CDD0D4] rounded-lg bg-white text-[#1A1D20] text-sm min-w-[180px] flex items-center justify-between gap-2 focus:border-[#FFD100] focus:shadow-[0_0_0_3px_rgba(255,209,0,0.2)] outline-none transition-all"
            >
              {selectedChain}
              <span className="text-[#A7ACB3]">▼</span>
            </button>
            {chainDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setChainDropdownOpen(false)}
                />
                <div className="absolute top-full mt-1 right-0 w-48 bg-white rounded-xl border border-[#E5E7E9] shadow-lg z-20 py-1">
                  {["All Chains", "Sepolia", "Mainnet"].map((chain) => (
                    <button
                      key={chain}
                      onClick={() => {
                        setSelectedChain(chain);
                        setChainDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#F3F4F5] transition-colors ${
                        selectedChain === chain
                          ? "text-[#1A1D20] font-medium bg-[#FFD100]/10"
                          : "text-[#4D535A]"
                      }`}
                    >
                      {chain}
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
                <tr className="bg-[#F3F4F5]">
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#A7ACB3] uppercase tracking-wider rounded-tl-xl">
                    ERC-20 Symbol
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#A7ACB3] uppercase tracking-wider">
                    ERC-20 Address
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#A7ACB3] uppercase tracking-wider">
                    ERC-7984 Symbol
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#A7ACB3] uppercase tracking-wider">
                    ERC-7984 Address
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#A7ACB3] uppercase tracking-wider">
                    Chain
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#A7ACB3] uppercase tracking-wider rounded-tr-xl">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPairs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16">
                      <p className="text-xl font-semibold text-[#A7ACB3]">
                        No pairs found
                      </p>
                      <p className="text-sm text-[#A7ACB3] mt-2">
                        Try adjusting your search or filter
                      </p>
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedChain("All Chains");
                        }}
                        className="btn-yellow mt-4"
                      >
                        Clear Filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredPairs.map((pair) => (
                    <tr
                      key={pair.id}
                      className="border-b border-[#F3F4F5] hover:bg-[rgba(255,209,0,0.04)] transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-2 bg-[#F3F4F5] text-[#4D535A] text-xs font-medium px-3 py-1 rounded-full">
                          <span className="w-5 h-5 rounded-full bg-gradient-to-br from-[#FFD100] to-[#FFD100]/60 flex items-center justify-center text-[8px] font-bold text-black">
                            {pair.erc20Symbol[0]}
                          </span>
                          {pair.erc20Symbol}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-[#656B73]">
                        <span className="flex items-center">
                          {pair.erc20Address}
                          <CopyButton text={pair.erc20Address} />
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center bg-[rgba(93,95,239,0.15)] text-[#5D5FEF] text-xs font-medium px-3 py-1 rounded-full">
                          {pair.erc7984Symbol}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-[#656B73]">
                        <span className="flex items-center">
                          {pair.erc7984Address}
                          <CopyButton text={pair.erc7984Address} />
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center bg-[#00B4D8] text-white text-xs font-medium px-3 py-1 rounded-full">
                          {pair.chain}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `${pair.erc20Symbol} (${pair.erc20Address}) → ${pair.erc7984Symbol} (${pair.erc7984Address}) - ${pair.chain}`
                              );
                            }}
                            className="text-[#A7ACB3] hover:text-[#FFD100] transition-colors"
                            title="Copy pair info"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <a
                            href={`https://sepolia.etherscan.io/address/${pair.erc20Address.replace(/\./g, "")}`}
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
