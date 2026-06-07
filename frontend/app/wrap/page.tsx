/**
 * @file app/wrap/page.tsx
 * @description Wrap (shield) / unwrap page in the new visual system.
 */

import { Suspense } from "react";
import { WrapForm } from "@/components/WrapForm";

export default function WrapPage() {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <span className="section-chip">Wrap</span>
        <h1 className="text-display-m">Shield and unshield</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[#656B73]">
          Convert public ERC-20 tokens into confidential ERC-7984 balances or
          withdraw them back to public while keeping the existing backend flow.
        </p>
      </section>

      <Suspense
        fallback={
          <div className="section-card p-12 text-center text-[#656B73] animate-pulse">
            Loading wrap form...
          </div>
        }
      >
        <div className="section-card p-4 sm:p-6">
          <WrapForm />
        </div>
      </Suspense>

      <div className="section-card p-5 text-sm leading-relaxed text-[#656B73]">
        <p className="mb-3 font-semibold text-[#1A1D20]">How it works</p>
        <ul className="list-inside list-disc space-y-1">
          <li>
            <strong>Shield:</strong> approve the wrapper, then deposit ERC-20
            tokens to mint confidential balances.
          </li>
          <li>
            <strong>Unshield:</strong> use the SDK flow to complete the two-step
            withdrawal.
          </li>
          <li>
            Balances stay encrypted on-chain and are decrypted only through the
            existing relayer backend.
          </li>
        </ul>
      </div>
    </div>
  );
}
