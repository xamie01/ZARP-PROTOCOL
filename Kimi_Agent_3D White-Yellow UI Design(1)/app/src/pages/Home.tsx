import Hero from "@/sections/home/Hero";
import Features from "@/sections/home/Features";
import TokenPairsPreview from "@/sections/home/TokenPairsPreview";
import HowItWorks from "@/sections/home/HowItWorks";
import TechnicalOverview from "@/sections/home/TechnicalOverview";

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <TokenPairsPreview />
      <HowItWorks />
      <TechnicalOverview />
    </>
  );
}
