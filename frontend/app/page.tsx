"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronDown, Shield, Lock, ExternalLink, Check } from "lucide-react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import SectionTitle from "@/components/SectionTitle";
import ScrollReveal from "@/components/ScrollReveal";

const ShieldSphere = dynamic(() => import("@/components/ShieldSphere"), { ssr: false });

const TOKEN_PAIRS = [
  { id: 1, erc20Symbol: "USDCMock", erc20Address: "0x9b5Cd1...8aDFfF", erc7984Symbol: "cUSDCMock", erc7984Address: "0x7c5BF4...223639", chain: "Sepolia" },
  { id: 2, erc20Symbol: "USDTMock", erc20Address: "0xa7dA08...e8e9b0", erc7984Symbol: "cUSDTMock", erc7984Address: "0x4E7B06...554491", chain: "Sepolia" },
  { id: 3, erc20Symbol: "WETHMock", erc20Address: "0xff5473...9A5f3F", erc7984Symbol: "cWETHMock", erc7984Address: "0x462086...d83158", chain: "Sepolia" },
  { id: 4, erc20Symbol: "BRONMock", erc20Address: "0xFf021f...DEb25E", erc7984Symbol: "cBRONMock", erc7984Address: "0xaa5612...F9C891", chain: "Sepolia" },
  { id: 5, erc20Symbol: "ZAMAMock", erc20Address: "0x75355a...a0BF57", erc7984Symbol: "cZAMAMock", erc7984Address: "0xf2D628...8FfbFB", chain: "Sepolia" },
];

const features = [
  {
    icon: Shield,
    iconColor: "text-[#FFD100]",
    title: "Shield Tokens",
    description: "Convert your public ERC-20 tokens into confidential ERC-7984 tokens. Your balances and transactions become encrypted on-chain, visible only to you.",
    link: { text: "Start Wrapping", href: "/wrap" },
  },
  {
    icon: Lock,
    iconColor: "text-[#5D5FEF]",
    title: "Decrypt Balances",
    description: "Reveal your confidential token balances using EIP-712 signatures. Decryption happens client-side — your private keys never leave your device.",
    link: { text: "Decrypt Now", href: "/decrypt" },
  },
  {
    icon: ExternalLink,
    iconColor: "text-[#00B4D8]",
    title: "ERC-7984 Standard",
    description: "Built on the ERC-7984 token standard for confidential assets. Fully compatible with existing ERC-20 infrastructure while adding programmable privacy.",
    link: { text: "Learn More", href: "#" },
  },
];

const steps = [
  {
    number: "01",
    title: "Connect Your Wallet",
    description: "Link your Web3 wallet to the ZARP Protocol. We support MetaMask, WalletConnect, and Coinbase Wallet.",
    side: "left" as const,
  },
  {
    number: "02",
    title: "Select Your Token",
    description: "Choose from the registry of supported ERC-20 tokens. Each token has a corresponding confidential ERC-7984 wrapper.",
    side: "right" as const,
  },
  {
    number: "03",
    title: "Shield & Go Private",
    description: "Approve the wrapper contract and deposit your tokens. They instantly become encrypted on-chain. Only you can see your balances and transactions.",
    side: "left" as const,
  },
];

const codeLines = [
  { num: 1,  content: "// Zama FHE React SDK", type: "comment" },
  { num: 2,  content: "import { useShield } from '@zama-fhe/react-sdk';", type: "code" },
  { num: 3,  content: "", type: "empty" },
  { num: 4,  content: "// Shield 100 USDC to cUSDC", type: "comment" },
  { num: 5,  content: "const { mutateAsync: shield } = useShield({", type: "code" },
  { num: 6,  content: "  tokenAddress: '0x9b5C...DFfF',", type: "code" },
  { num: 7,  content: "  wrapperAddress: '0x7c5B...3639',", type: "code" },
  { num: 8,  content: "});", type: "code" },
  { num: 9,  content: "", type: "empty" },
  { num: 10, content: "// Approve + wrap in one call", type: "comment" },
  { num: 11, content: "await shield({", type: "code" },
  { num: 12, content: "  amount: 100_000_000n,  // 100 USDC", type: "code" },
  { num: 13, content: "  approvalStrategy: 'exact',", type: "code" },
  { num: 14, content: "});", type: "code" },
];

const techFeatures = [
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

function getLineColor(type: string, content: string) {
  if (type === "comment") return "text-[#A7ACB3]";
  if (type === "empty") return "";
  if (content.includes("import") || content.includes("const") || content.includes("await") || content.includes("from") || content.includes("new"))
    return "text-[#FFD100]";
  if (content.includes("'")) return "text-[#2ECC71]";
  if (content.includes("ZarpSDK") || content.includes("shield") || content.includes("unshield"))
    return "text-[#00B4D8]";
  return "text-white";
}

export default function HomePage() {
  const previewPairs = TOKEN_PAIRS.slice(0, 5);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (heroRef.current) {
      const targets = heroRef.current.querySelectorAll(".reveal-target");
      gsap.fromTo(
        targets,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.0,
          stagger: 0.12,
          ease: "power4.out",
          delay: 0.1,
        }
      );
    }
  }, []);

  return (
    <>
      {/* ───── Hero ───── */}
      <section ref={heroRef} className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
        <ShieldSphere />
        <div className="relative z-10 text-center max-w-[800px] px-6">
          <div className="reveal-target opacity-0">
            <h1 className="text-display-xl text-black dark:text-[#FFD100]">ZARP</h1>
          </div>
          <div className="reveal-target opacity-0">
            <h1 className="text-display-xl text-black dark:text-[#FFD100] -mt-4">PROTOCOL</h1>
          </div>
          <p className="reveal-target opacity-0 text-lg font-bold text-black dark:text-[#FFD100] mt-4 max-w-[520px] mx-auto leading-relaxed">
            Shield your Ethereum native tokens using Zama&apos;s FHE encryption layer.
          </p>
          <div className="reveal-target opacity-0 flex items-center justify-center gap-4 mt-8">
            <Link href="/wrap" className="btn-yellow inline-flex items-center">
              Get Started
            </Link>
            <Link href="/registry" className="btn-secondary inline-flex items-center">
              View Registry
            </Link>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 reveal-target opacity-0">
          <ChevronDown className="w-5 h-5 text-[#A7ACB3] animate-bounce-scroll" />
        </div>
      </section>

      {/* ───── Features ───── */}
      <section className="py-20 px-6">
        <div className="max-w-[1200px] mx-auto">
          <SectionTitle
            eyebrow="PROTOCOL FEATURES"
            title="Why ZARP?"
            description="The simplest way to add confidentiality to your existing ERC-20 tokens."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {features.map((feature, i) => (
              <ScrollReveal key={feature.title} delay={i * 150}>
                <div className="card-default h-full flex flex-col">
                  <div className="w-12 h-12 flex items-center justify-center">
                    <feature.icon className={`w-7 h-7 ${feature.iconColor}`} strokeWidth={2} />
                  </div>
                  <h3 className="text-xl font-semibold text-[#1A1D20] dark:text-white mt-4">{feature.title}</h3>
                  <p className="text-base text-[#656B73] mt-2 leading-relaxed flex-1">{feature.description}</p>
                  <Link
                    href={feature.link.href}
                    className="text-sm font-medium text-[#FFD100] mt-4 inline-flex items-center gap-1 hover:underline underline-offset-4"
                  >
                    {feature.link.text} →
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Token Pairs Preview ───── */}
      <section className="py-20 px-6 bg-white dark:bg-[#000000] border-y border-[#E5E7E9] dark:border-[#2A2D31]">
        <div className="max-w-[1200px] mx-auto">
          <SectionTitle
            eyebrow="SUPPORTED TOKENS"
            title="Wrapper Registry"
            description="Browse all registered ERC-20 to ERC-7984 confidential wrapper pairs across supported networks."
          />
          <ScrollReveal>
            <div className="flex gap-8 mt-8 mb-8">
              <div>
                <span className="text-xs text-[#A7ACB3] uppercase tracking-wider">Total Pairs</span>
                <p className="text-display-s text-[#1A1D20] dark:text-white">8</p>
              </div>
              <div>
                <span className="text-xs text-[#A7ACB3] uppercase tracking-wider">Valid Wrappers</span>
                <p className="text-display-s text-[#1A1D20] dark:text-white">8</p>
              </div>
              <div>
                <span className="text-xs text-[#A7ACB3] uppercase tracking-wider">Network</span>
                <p className="text-2xl font-semibold text-[#00B4D8] mt-1">Sepolia</p>
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal>
            <div className="card-default p-0 overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="bg-[#F3F4F5]">
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#A7ACB3] uppercase tracking-wider rounded-tl-xl">ERC-20 Token</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#A7ACB3] uppercase tracking-wider">ERC-20 Address</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-[#A7ACB3] uppercase tracking-wider">→</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#A7ACB3] uppercase tracking-wider">ERC-7984 Token</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#A7ACB3] uppercase tracking-wider">ERC-7984 Address</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#A7ACB3] uppercase tracking-wider rounded-tr-xl">Network</th>
                  </tr>
                </thead>
                <tbody>
                  {previewPairs.map((pair) => (
                    <tr key={pair.id} className="border-b border-[#F3F4F5] hover:bg-[rgba(255,209,0,0.04)] transition-colors">
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-2 bg-[#F3F4F5] text-[#4D535A] text-xs font-medium px-3 py-1 rounded-full">
                          <span className="w-5 h-5 rounded-full bg-gradient-to-br from-[#FFD100] to-[#FFD100]/60 flex items-center justify-center text-[8px] font-bold text-black">
                            {pair.erc20Symbol[0]}
                          </span>
                          {pair.erc20Symbol}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-[#656B73]">{pair.erc20Address}</td>
                      <td className="px-4 py-3.5 text-center text-[#A7ACB3] text-sm">→</td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-2 bg-[rgba(93,95,239,0.15)] text-[#5D5FEF] text-xs font-medium px-3 py-1 rounded-full">
                          {pair.erc7984Symbol}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-[#656B73]">{pair.erc7984Address}</td>
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
            <Link href="/registry" className="text-sm font-medium text-[#FFD100] hover:underline underline-offset-4">
              View All Pairs →
            </Link>
          </div>
        </div>
      </section>

      {/* ───── How It Works ───── */}
      <section className="py-20 px-6">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center">
            <SectionTitle
              eyebrow="HOW IT WORKS"
              title="Three Steps to Privacy"
              description="Shield your tokens in seconds. The ZARP Protocol handles the complexity — you enjoy the privacy."
              centered
            />
          </div>
          <div className="relative mt-16">
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#E5E7E9] -translate-x-1/2" />
            <div className="md:hidden absolute left-4 top-0 bottom-0 w-0.5 bg-[#E5E7E9]" />
            {steps.map((step, i) => (
              <ScrollReveal
                key={step.number}
                direction={step.side === "left" ? "left" : "right"}
                delay={i * 150}
              >
                <div
                  className={`relative flex items-start mb-16 last:mb-0 ${
                    step.side === "left"
                      ? "md:flex-row md:text-right"
                      : "md:flex-row-reverse md:text-left"
                  } flex-row text-left`}
                >
                  <div
                    className={`pl-12 md:pl-0 md:w-[calc(50%-32px)] ${
                      step.side === "left" ? "md:pr-12" : "md:pl-12"
                    }`}
                  >
                    <span className="text-display-s text-[#FFD100]/40 font-semibold leading-none">
                      {step.number}
                    </span>
                    <h3 className="text-xl font-semibold text-[#1A1D20] dark:text-white mt-2">{step.title}</h3>
                    <p className="text-base text-[#656B73] mt-2 leading-relaxed">{step.description}</p>
                  </div>
                  <div className="absolute left-4 md:left-1/2 top-2 md:-translate-x-1/2 z-10">
                    <div
                      className={`w-4 h-4 rounded-full bg-[#FFD100] border-[3px] border-black ${
                        i === 2 ? "animate-pulse-glow" : ""
                      }`}
                    />
                  </div>
                  <div className="hidden md:block md:w-[calc(50%-32px)]" />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Technical Overview ───── */}
      <section className="py-20 px-6 bg-white dark:bg-[#000000] border-t border-[#E5E7E9] dark:border-[#2A2D31]">
        <div className="max-w-[1200px] mx-auto">
          <SectionTitle
            eyebrow="TECHNICAL DETAILS"
            title="Built for Developers"
            description="Integrate confidential token wrapping into your dApp with our simple SDK."
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12">
            {/* Code Block */}
            <ScrollReveal>
              <div className="bg-black rounded-xl overflow-hidden relative group">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                  <span className="w-3 h-3 rounded-full bg-[#E74C3C]" />
                  <span className="w-3 h-3 rounded-full bg-[#FFD100]" />
                  <span className="w-3 h-3 rounded-full bg-[#2ECC71]" />
                  <span className="flex-1 text-center font-mono text-xs text-[#656B73]">shield-tokens.tsx</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  {codeLines.map((line) => (
                    <div key={line.num} className="flex">
                      <span className="w-8 text-right text-[#656B73] font-mono text-xs select-none mr-4 flex-shrink-0">
                        {line.num}
                      </span>
                      <span className={`font-mono text-xs ${getLineColor(line.type, line.content)}`}>
                        {line.content || " "}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Feature List */}
            <div className="flex flex-col gap-6">
              {techFeatures.map((feature, i) => (
                <ScrollReveal key={feature.title} direction="right" delay={i * 150}>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                      <feature.icon className={`w-5 h-5 ${feature.iconColor}`} strokeWidth={2} />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-[#1A1D20] dark:text-white">{feature.title}</h4>
                      <p className="text-base text-[#656B73] mt-1 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
