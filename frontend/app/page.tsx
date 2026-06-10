import Link from "next/link";
import {
  ArrowRight,
  Coins,
  ExternalLink,
  Lock,
  Shield,
  Sparkles,
} from "lucide-react";
import { PairTable } from "@/components/PairTable";
import { ScrollReveal } from "@/components/ScrollReveal";
import { WRAPPER_PAIRS } from "@/lib/registry-data";

const features = [
  {
    icon: Shield,
    title: "Shield tokens",
    description: "Wrap ERC-20 assets into confidential ERC-7984 balances with the existing backend.",
    href: "/wrap",
  },
  {
    icon: Lock,
    title: "Decrypt balances",
    description: "Authorize the relayer once and reveal confidential balances client-side.",
    href: "/decrypt",
  },
  {
    icon: Coins,
    title: "Claim test tokens",
    description: "Use the faucet to get Sepolia mock assets for wrapping and unwrapping flows.",
    href: "/faucet",
  },
];

const steps = [
  {
    number: "01",
    title: "Connect your wallet",
    description: "Use RainbowKit to connect, then the FHEVM provider handles sessions and relayer access.",
  },
  {
    number: "02",
    title: "Pick a token pair",
    description: "Browse the registry and select the underlying ERC-20 and confidential wrapper pair.",
  },
  {
    number: "03",
    title: "Wrap or decrypt",
    description: "Keep the previous backend flows for shield, unshield, and balance decryption.",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-20 pb-12">
      {/* Hero */}
      <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <span className="section-chip">Confidential token UI</span>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-display-xl tracking-tight">
              ZARP Protocol
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-[#4D535A]">
              A new Kimi-style frontend layered over the existing FHEVM backend
              for registry browsing, token wrapping, balance decryption, and faucet access.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/wrap" className="btn-yellow animate-pulse-glow">
              Start wrapping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link href="/registry" className="btn-secondary">
              View registry
            </Link>
          </div>
        </div>

        <div className="section-card p-6">
          <div className="flex items-center justify-between border-b border-black/5 pb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#A7ACB3]">Network</p>
              <p className="mt-1 text-xl font-semibold">Sepolia</p>
            </div>
            <span className="rounded-full bg-[#FFD100] px-3 py-1 text-xs font-semibold text-black">
              Live backend
            </span>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-[#F3F4F5] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#A7ACB3]">Pairs</p>
              <p className="mt-2 text-3xl font-semibold">{WRAPPER_PAIRS.length}</p>
            </div>
            <div className="rounded-xl bg-[#F3F4F5] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#A7ACB3]">Modes</p>
              <p className="mt-2 text-3xl font-semibold">3</p>
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-black/5 bg-black p-5 text-white">
            <div className="flex items-center gap-2 text-[#FFD100]">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em]">
                Backend preserved
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-white/75">
              The wallet, relayer, registry, wrap, decrypt, and faucet logic
              still comes from the current Next app backend.
            </p>
          </div>
        </div>
      </section>

      {/* Scroll hint */}
      <div className="flex justify-center -mt-14">
        <div className="animate-bounce-scroll text-[#CDD0D4]">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Features */}
      <ScrollReveal>
        <section className="grid gap-4 md:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <ScrollReveal key={feature.title} delay={i * 80}>
                <div className="card-default h-full">
                  <Icon className="h-6 w-6 text-[#FFD100]" />
                  <h2 className="mt-4 text-xl font-semibold">{feature.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-[#656B73]">
                    {feature.description}
                  </p>
                  <Link
                    href={feature.href}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-black transition-colors hover:text-[#5D5FEF]"
                  >
                    Open
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </ScrollReveal>
            );
          })}
        </section>
      </ScrollReveal>

      {/* Registry Preview */}
      <ScrollReveal>
        <section className="section-card p-6 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="section-chip">Registry preview</span>
              <h2 className="mt-4 text-display-m">Supported pairs</h2>
            </div>
            <Link
              href="/registry"
              className="inline-flex items-center gap-1 text-sm font-semibold text-black"
            >
              Open full registry
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8">
            <PairTable />
          </div>
        </section>
      </ScrollReveal>

      {/* How it works + Dev flow */}
      <section className="grid gap-6 lg:grid-cols-2">
        <ScrollReveal direction="left">
          <div className="section-card p-6 sm:p-8 h-full">
            <span className="section-chip">How it works</span>
            <div className="mt-6 space-y-5">
              {steps.map((step, i) => (
                <ScrollReveal key={step.number} delay={i * 100}>
                  <div className="flex gap-4">
                    <div className="text-display-s text-[#FFD100]">{step.number}</div>
                    <div>
                      <h3 className="text-lg font-semibold">{step.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-[#656B73]">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="right">
          <div className="section-card overflow-hidden p-0 h-full">
            <div className="border-b border-black/5 px-6 py-4">
              <span className="text-xs uppercase tracking-[0.2em] text-[#A7ACB3]">
                Developer flow
              </span>
            </div>
            <div className="bg-black px-6 py-5 text-white h-full">
              <pre className="overflow-x-auto text-sm leading-7 text-white/80">
{`const token = sdk.createToken(erc20, wrapper);

await token.shield(100n, {
  approvalStrategy: "exact",
});

const balance = await token.balanceOf();`}
              </pre>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
