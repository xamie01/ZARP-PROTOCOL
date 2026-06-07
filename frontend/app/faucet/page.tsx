/**
 * @file app/faucet/page.tsx
 * @description Faucet page in the new visual system.
 */

import { FaucetPanel } from "@/components/FaucetPanel";

export default function FaucetPage() {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <span className="section-chip">Faucet</span>
        <h1 className="text-display-m">Test tokens</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[#656B73]">
          Request Sepolia mock assets to test shielding, unshielding, and
          confidential transfer flows.
        </p>
      </section>

      <div className="section-card p-4 sm:p-6">
        <FaucetPanel />
      </div>
    </div>
  );
}
