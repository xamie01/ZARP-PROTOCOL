import SectionTitle from "@/components/SectionTitle";
import ScrollReveal from "@/components/ScrollReveal";

const steps = [
  {
    number: "01",
    title: "Connect Your Wallet",
    description:
      "Link your Web3 wallet to the ZARP Protocol. We support MetaMask, WalletConnect, and Coinbase Wallet.",
    side: "left" as const,
  },
  {
    number: "02",
    title: "Select Your Token",
    description:
      "Choose from the registry of supported ERC-20 tokens. Each token has a corresponding confidential ERC-7984 wrapper.",
    side: "right" as const,
  },
  {
    number: "03",
    title: "Shield & Go Private",
    description:
      "Approve the wrapper contract and deposit your tokens. They instantly become encrypted on-chain. Only you can see your balances and transactions.",
    side: "left" as const,
  },
];

export default function HowItWorks() {
  return (
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

        {/* Timeline */}
        <div className="relative mt-16">
          {/* Vertical Line - Desktop */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#E5E7E9] -translate-x-1/2" />

          {/* Vertical Line - Mobile */}
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
                {/* Content */}
                <div
                  className={`pl-12 md:pl-0 md:w-[calc(50%-32px)] ${
                    step.side === "left" ? "md:pr-12" : "md:pl-12"
                  }`}
                >
                  <span className="text-display-s text-[#FFD100]/40 font-semibold leading-none">
                    {step.number}
                  </span>
                  <h3 className="text-xl font-semibold text-[#1A1D20] mt-2">
                    {step.title}
                  </h3>
                  <p className="text-base text-[#656B73] mt-2 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Center Dot */}
                <div className="absolute left-4 md:left-1/2 top-2 md:-translate-x-1/2 z-10">
                  <div
                    className={`w-4 h-4 rounded-full bg-[#FFD100] border-[3px] border-black ${
                      i === 2 ? "animate-pulse-glow" : ""
                    }`}
                  />
                </div>

                {/* Spacer for opposite side */}
                <div className="hidden md:block md:w-[calc(50%-32px)]" />
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
