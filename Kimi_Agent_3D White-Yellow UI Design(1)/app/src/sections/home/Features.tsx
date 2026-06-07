import { Link } from "react-router-dom";
import { Shield, Lock, ExternalLink } from "lucide-react";
import SectionTitle from "@/components/SectionTitle";
import ScrollReveal from "@/components/ScrollReveal";

const features = [
  {
    icon: Shield,
    iconColor: "text-[#FFD100]",
    title: "Shield Tokens",
    description:
      "Convert your public ERC-20 tokens into confidential ERC-7984 tokens. Your balances and transactions become encrypted on-chain, visible only to you.",
    link: { text: "Start Wrapping", href: "/wrap" },
  },
  {
    icon: Lock,
    iconColor: "text-[#5D5FEF]",
    title: "Decrypt Balances",
    description:
      "Reveal your confidential token balances using EIP-712 signatures. Decryption happens client-side — your private keys never leave your device.",
    link: { text: "Decrypt Now", href: "/decrypt" },
  },
  {
    icon: ExternalLink,
    iconColor: "text-[#00B4D8]",
    title: "ERC-7984 Standard",
    description:
      "Built on the ERC-7984 token standard for confidential assets. Fully compatible with existing ERC-20 infrastructure while adding programmable privacy.",
    link: { text: "Learn More", href: "#" },
  },
];

export default function Features() {
  return (
    <section className="py-20 md:py-20 px-6">
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
                <h3 className="text-xl font-semibold text-[#1A1D20] mt-4">
                  {feature.title}
                </h3>
                <p className="text-base text-[#656B73] mt-2 leading-relaxed flex-1">
                  {feature.description}
                </p>
                <Link
                  to={feature.link.href}
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
  );
}
