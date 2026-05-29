/**
 * @file app/wrap/page.tsx
 * @description Wrap (shield) / Unwrap (unshield) interface page.
 */

import { Suspense } from "react";
import { WrapForm } from "@/components/WrapForm";

export default function WrapPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-100">
          Shield & Unshield
        </h1>
        <p className="mx-auto max-w-lg text-sm text-slate-400">
          Convert public ERC-20 tokens to confidential ERC-7984 tokens (shield)
          or withdraw back to public (unshield).
        </p>
      </div>

      {/* Wrap Form */}
      <Suspense fallback={
        <div className="mx-auto max-w-lg rounded-2xl border border-slate-800/50 bg-slate-900/30 p-12 text-center text-slate-400 animate-pulse">
          Loading wrap form...
        </div>
      }>
        <WrapForm />
      </Suspense>

      {/* Info Panel */}
      <div className="mx-auto max-w-lg rounded-xl border border-slate-800/30 bg-slate-900/20 p-4 text-xs text-slate-500">
        <p className="mb-2 font-medium text-slate-400">How it works</p>
        <ul className="list-inside list-disc space-y-1">
          <li>
            <strong>Shield:</strong> Approve the wrapper, then deposit your
            ERC-20 tokens. They become encrypted (confidential).
          </li>
          <li>
            <strong>Unshield:</strong> Two-phase withdrawal. The SDK handles
            both phases automatically.
          </li>
          <li>
            Balances are encrypted on-chain. Only you can decrypt them.
          </li>
        </ul>
      </div>
    </div>
  );
}
