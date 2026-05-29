/**
 * @file app/faucet/page.tsx
 * @description Sepolia cTokenMock faucet page.
 */

import { FaucetPanel } from "@/components/FaucetPanel";

export default function FaucetPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-100">
          Test Token Faucet
        </h1>
        <p className="mx-auto max-w-lg text-sm text-slate-400">
          Request free cTokenMock test tokens on Sepolia. Use them to test
          shielding, unshielding, and confidential transfers.
        </p>
      </div>

      {/* Faucet Panel */}
      <FaucetPanel />
    </div>
  );
}
