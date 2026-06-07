import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import ShieldSphere from "@/components/ShieldSphere";

export default function Hero() {
  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* 3D Sphere Background */}
      <ShieldSphere />

      {/* Content */}
      <div className="relative z-10 text-center max-w-[800px] px-6">
        <div
          className="animate-[fadeInUp_600ms_ease_200ms_both]"
        >
          <h1 className="text-display-xl text-black">ZARP</h1>
        </div>
        <div
          className="animate-[fadeInUp_600ms_ease_350ms_both]"
        >
          <h1 className="text-display-xl text-black -mt-4">Protocol</h1>
        </div>
        <p
          className="text-lg text-[#656B73] mt-4 max-w-[520px] mx-auto leading-relaxed animate-[fadeInUp_500ms_ease_500ms_both]"
        >
          Confidential token wrapping. Shield your ERC-20 assets with ERC-7984 privacy.
        </p>
        <div
          className="flex items-center justify-center gap-4 mt-8 animate-[fadeInUp_400ms_ease_650ms_both]"
        >
          <Link to="/wrap" className="btn-yellow inline-flex items-center">
            Get Started
          </Link>
          <Link to="/registry" className="btn-secondary inline-flex items-center">
            View Registry
          </Link>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-[fadeIn_400ms_ease_1200ms_both]">
        <ChevronDown className="w-5 h-5 text-[#A7ACB3] animate-bounce-scroll" />
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </section>
  );
}
