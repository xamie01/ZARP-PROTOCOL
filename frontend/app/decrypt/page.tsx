/**
 * @file app/decrypt/page.tsx
 * @description Balance decryption page in the new visual system.
 */

import { DecryptFlow } from "@/components/DecryptFlow";

export default function DecryptPage() {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <span className="section-chip">Decrypt</span>
        <h1 className="text-display-m">Reveal balances</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[#656B73]">
          Use the existing EIP-712 authorization and relayer session flow to
          decrypt confidential balances in your browser.
        </p>
      </section>

      <div className="section-card p-4 sm:p-6">
        <DecryptFlow />
      </div>

      <div className="section-card p-5 text-sm leading-relaxed text-[#656B73]">
        <p className="mb-3 font-semibold text-[#1A1D20]">How decryption works</p>
        <ul className="list-inside list-disc space-y-1">
          <li>Select a confidential token.</li>
          <li>Authorize the SDK with a one-time wallet signature.</li>
          <li>The encrypted balance is decrypted client-side through the backend session.</li>
          <li>Later decrypts stay silent until the session expires.</li>
        </ul>
      </div>
    </div>
  );
}
