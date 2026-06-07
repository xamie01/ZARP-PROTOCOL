import { useState } from "react";
import { Shield, Lock, ExternalLink, Check, Copy } from "lucide-react";
import SectionTitle from "@/components/SectionTitle";
import ScrollReveal from "@/components/ScrollReveal";

const codeLines = [
  { num: 1, content: "// Import the ZARP SDK", type: "comment" as const },
  { num: 2, content: "import { ZarpSDK } from '@zarp/protocol-sdk';", type: "code" as const },
  { num: 3, content: "", type: "empty" as const },
  { num: 4, content: "// Initialize the SDK", type: "comment" as const },
  { num: 5, content: "const zarp = new ZarpSDK({", type: "code" as const },
  { num: 6, content: "  network: 'sepolia',", type: "code" as const },
  { num: 7, content: "  provider: window.ethereum", type: "code" as const },
  { num: 8, content: "});", type: "code" as const },
  { num: 9, content: "", type: "empty" as const },
  { num: 10, content: "// Shield 100 USDC", type: "comment" as const },
  { num: 11, content: "const tx = await zarp.shield({", type: "code" as const },
  { num: 12, content: "  token: '0x9b5Cd1...8aDFfF',", type: "code" as const },
  { num: 13, content: "  amount: '100000000'", type: "code" as const },
  { num: 14, content: "});", type: "code" as const },
  { num: 15, content: "", type: "empty" as const },
  { num: 16, content: "// Unshield back to public", type: "comment" as const },
  { num: 17, content: "const unwrap = await zarp.unshield({", type: "code" as const },
  { num: 18, content: "  token: '0x7c5BF4...223639',", type: "code" as const },
  { num: 19, content: "  amount: '50000000'", type: "code" as const },
  { num: 20, content: "});", type: "code" as const },
];

const features = [
  {
    icon: Shield,
    iconColor: "text-[#FFD100]",
    title: "EIP-712 Signatures",
    description: "Secure off-chain signature authorization for balance decryption. No private key exposure.",
  },
  {
    icon: Lock,
    iconColor: "text-[#5D5FEF]",
    title: "Client-Side Decryption",
    description: "All decryption happens in your browser. Encrypted balances are never exposed to our servers.",
  },
  {
    icon: ExternalLink,
    iconColor: "text-[#00B4D8]",
    title: "ERC-7984 Compliant",
    description: "Fully compatible with the emerging standard for confidential tokens on EVM chains.",
  },
  {
    icon: Check,
    iconColor: "text-[#2ECC71]",
    title: "Two-Phase Unshielding",
    description: "Secure withdrawal process with automatic phase handling by the SDK. No manual steps required.",
  },
];

function CodeBlock() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const code = codeLines.map((l) => l.content).join("\n");
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const getLineColor = (type: string, content: string) => {
    if (type === "comment") return "text-[#A7ACB3]";
    if (type === "empty") return "";
    if (content.includes("import") || content.includes("const") || content.includes("await") || content.includes("from") || content.includes("new"))
      return "text-[#FFD100]";
    if (content.includes("'")) return "text-[#2ECC71]";
    if (content.includes("ZarpSDK") || content.includes("shield") || content.includes("unshield"))
      return "text-[#00B4D8]";
    return "text-white";
  };

  return (
    <ScrollReveal>
      <div className="bg-black rounded-xl overflow-hidden relative group">
        {/* Window Chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
          <span className="w-3 h-3 rounded-full bg-[#E74C3C]" />
          <span className="w-3 h-3 rounded-full bg-[#FFD100]" />
          <span className="w-3 h-3 rounded-full bg-[#2ECC71]" />
          <span className="flex-1 text-center font-mono text-xs text-[#656B73]">
            zarp-sdk.example
          </span>
        </div>

        {/* Code */}
        <div className="p-4 overflow-x-auto">
          {codeLines.map((line) => (
            <div key={line.num} className="flex">
              <span className="w-8 text-right text-[#656B73] font-mono text-xs select-none mr-4 flex-shrink-0">
                {line.num}
              </span>
              <span className={`font-mono text-xs ${getLineColor(line.type, line.content)}`}>
                {line.content || "\u00A0"}
              </span>
            </div>
          ))}
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="absolute top-12 right-4 flex items-center gap-1.5 bg-black/80 border border-white/20 rounded-lg px-3 py-1.5 text-xs text-[#FFD100] opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white/10"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" /> Copied!
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" /> Copy Code
            </>
          )}
        </button>
      </div>
    </ScrollReveal>
  );
}

export default function TechnicalOverview() {
  return (
    <section className="py-20 px-6 bg-white border-t border-[#E5E7E9]">
      <div className="max-w-[1200px] mx-auto">
        <SectionTitle
          eyebrow="TECHNICAL DETAILS"
          title="Built for Developers"
          description="Integrate confidential token wrapping into your dApp with our simple SDK."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12">
          {/* Code Block */}
          <CodeBlock />

          {/* Feature List */}
          <div className="flex flex-col gap-6">
            {features.map((feature, i) => (
              <ScrollReveal key={feature.title} direction="right" delay={i * 150}>
                <div className="flex gap-4">
                  <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className={`w-5 h-5 ${feature.iconColor}`} strokeWidth={2} />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-[#1A1D20]">
                      {feature.title}
                    </h4>
                    <p className="text-base text-[#656B73] mt-1 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
