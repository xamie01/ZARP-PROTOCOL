import { Link } from "react-router-dom";
import { Copy } from "lucide-react";
import CountUp from "react-countup";
import SectionTitle from "@/components/SectionTitle";
import ScrollReveal from "@/components/ScrollReveal";
import { TOKEN_PAIRS } from "@/data/tokens";
import { useState } from "react";

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
      className="relative ml-2 text-[#A7ACB3] hover:text-[#FFD100] transition-colors"
    >
      <Copy className="w-3.5 h-3.5" />
      {copied && (
        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-[#FFD100] text-black text-[10px] font-medium px-2 py-0.5 rounded whitespace-nowrap">
          Copied!
        </span>
      )}
    </button>
  );
}

export default function TokenPairsPreview() {
  const previewPairs = TOKEN_PAIRS.slice(0, 5);

  return (
    <section className="py-20 px-6 bg-white border-y border-[#E5E7E9]">
      <div className="max-w-[1200px] mx-auto">
        <SectionTitle
          eyebrow="SUPPORTED TOKENS"
          title="Wrapper Registry"
          description="Browse all registered ERC-20 to ERC-7984 confidential wrapper pairs across supported networks."
        />

        {/* Stats */}
        <ScrollReveal>
          <div className="flex gap-8 mt-8 mb-8">
            <div>
              <span className="text-xs text-[#A7ACB3] uppercase tracking-wider">
                Total Pairs
              </span>
              <p className="text-display-s text-[#1A1D20]">
                <CountUp end={8} duration={1.5} />
              </p>
            </div>
            <div>
              <span className="text-xs text-[#A7ACB3] uppercase tracking-wider">
                Valid Wrappers
              </span>
              <p className="text-display-s text-[#1A1D20]">
                <CountUp end={8} duration={1.5} />
              </p>
            </div>
            <div>
              <span className="text-xs text-[#A7ACB3] uppercase tracking-wider">
                Network
              </span>
              <p className="text-2xl font-semibold text-[#00B4D8] mt-1">
                Sepolia
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Table */}
        <ScrollReveal>
          <div className="card-default p-0 overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-[#F3F4F5]">
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#A7ACB3] uppercase tracking-wider rounded-tl-xl">
                    ERC-20 Token
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#A7ACB3] uppercase tracking-wider">
                    ERC-20 Address
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-[#A7ACB3] uppercase tracking-wider">
                    →
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#A7ACB3] uppercase tracking-wider">
                    ERC-7984 Token
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#A7ACB3] uppercase tracking-wider">
                    ERC-7984 Address
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#A7ACB3] uppercase tracking-wider rounded-tr-xl">
                    Network
                  </th>
                </tr>
              </thead>
              <tbody>
                {previewPairs.map((pair, i) => (
                  <tr
                    key={pair.id}
                    className="border-b border-[#F3F4F5] hover:bg-[rgba(255,209,0,0.04)] transition-colors"
                    style={{ animationDelay: `${i * 80}ms` }}
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
                    <td className="px-4 py-3.5 text-center text-[#A7ACB3] text-sm">
                      →
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-2 bg-[rgba(93,95,239,0.15)] text-[#5D5FEF] text-xs font-medium px-3 py-1 rounded-full">
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollReveal>

        <div className="text-center mt-6">
          <Link
            to="/registry"
            className="text-sm font-medium text-[#FFD100] hover:underline underline-offset-4"
          >
            View All Pairs →
          </Link>
        </div>
      </div>
    </section>
  );
}
