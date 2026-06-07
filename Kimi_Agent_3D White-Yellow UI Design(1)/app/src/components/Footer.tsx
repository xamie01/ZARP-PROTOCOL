import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const PROTOCOL_LINKS = [
  { label: "Registry", path: "/registry" },
  { label: "Wrap", path: "/wrap" },
  { label: "Decrypt", path: "/decrypt" },
  { label: "Faucet", path: "/faucet" },
];

const RESOURCE_LINKS = [
  { label: "Documentation", href: "#" },
  { label: "GitHub", href: "#" },
  { label: "ERC-7984 Standard", href: "#" },
];

const COMMUNITY_LINKS = [
  { label: "Twitter/X", href: "#" },
  { label: "Discord", href: "#" },
];

export default function Footer() {
  const { ref, isVisible } = useScrollReveal(0.05);

  return (
    <footer ref={ref} className="bg-black text-white">
      <div
        className={`max-w-[1200px] mx-auto px-6 pt-16 pb-8 transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-[#FFD100]" />
              <span className="text-2xl font-semibold tracking-tight">ZARP</span>
            </div>
            <p className="text-sm text-[#A7ACB3] mt-3">
              Confidential Token Wrapping Protocol
            </p>
          </div>

          {/* Protocol */}
          <div>
            <h4 className="text-xs font-medium text-[#A7ACB3] uppercase tracking-wider mb-4">
              Protocol
            </h4>
            <div className="flex flex-col gap-2">
              {PROTOCOL_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-sm text-[#A7ACB3] hover:text-[#FFD100] transition-colors duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-medium text-[#A7ACB3] uppercase tracking-wider mb-4">
              Resources
            </h4>
            <div className="flex flex-col gap-2">
              {RESOURCE_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-[#A7ACB3] hover:text-[#FFD100] transition-colors duration-300"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-xs font-medium text-[#A7ACB3] uppercase tracking-wider mb-4">
              Community
            </h4>
            <div className="flex flex-col gap-2">
              {COMMUNITY_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-[#A7ACB3] hover:text-[#FFD100] transition-colors duration-300"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2 */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[#A7ACB3]">
            2025 ZARP Protocol. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-[#A7ACB3] hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-xs text-[#A7ACB3] hover:text-white transition-colors">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
