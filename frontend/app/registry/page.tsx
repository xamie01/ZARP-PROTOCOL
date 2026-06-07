/**
 * @file app/registry/page.tsx
 * @description Full registry explorer route.
 */

import { PairTable } from "@/components/PairTable";
import { WRAPPER_PAIRS } from "@/lib/registry-data";

export default function RegistryPage() {
  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="space-y-3">
          <span className="section-chip">Registry</span>
          <h1 className="text-display-m">Wrapper registry</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-[#656B73]">
            Browse all registered ERC-20 and confidential ERC-7984 pairs on the
            existing Sepolia backend.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Pairs", value: WRAPPER_PAIRS.length },
            { label: "Valid", value: WRAPPER_PAIRS.length },
            { label: "Network", value: "Sepolia" },
          ].map((item) => (
            <div key={item.label} className="card-default px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#A7ACB3]">
                {item.label}
              </p>
              <p className="mt-2 text-lg font-semibold">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-card p-6 sm:p-8">
        <PairTable />
      </section>
    </div>
  );
}
