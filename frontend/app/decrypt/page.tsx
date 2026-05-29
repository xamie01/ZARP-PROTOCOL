/**
 * @file app/decrypt/page.tsx
 * @description EIP-712 balance decryption flow page.
 */

import { DecryptFlow } from "@/components/DecryptFlow";

export default function DecryptPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-100">
          Decrypt Balance
        </h1>
        <p className="mx-auto max-w-lg text-sm text-slate-400">
          Reveal your confidential token balance using EIP-712 signatures.
          Your balance stays private to you.
        </p>
      </div>

      {/* Decrypt Flow */}
      <DecryptFlow />

      {/* Info Panel */}
      <div className="mx-auto max-w-lg rounded-xl border border-slate-800/30 bg-slate-900/20 p-4 text-xs text-slate-500">
        <p className="mb-2 font-medium text-slate-400">How decryption works</p>
        <ul className="list-inside list-disc space-y-1">
          <li>
            <strong>Step 1:</strong> Select a confidential token to decrypt.
          </li>
          <li>
            <strong>Step 2:</strong> Authorize the SDK with a one-time EIP-712
            wallet signature.
          </li>
          <li>
            <strong>Step 3:</strong> Your encrypted balance is decrypted
            client-side. Only you see it.
          </li>
          <li>
            After the first signature, subsequent decryptions are silent
            (cached session).
          </li>
        </ul>
      </div>
    </div>
  );
}
