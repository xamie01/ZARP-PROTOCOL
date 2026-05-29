/**
 * @file app/page.tsx
 * @description Registry explorer - searchable table of ERC-20 <-> ERC-7984 pairs.
 * This page can stay as a Server Component since PairTable is a Client Component.
 */

import { PairTable } from "@/components/PairTable";

export default function RegistryPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-100">
          Wrapper Registry
        </h1>
        <p className="max-w-2xl text-sm text-slate-400">
          Browse all registered ERC-20 to ERC-7984 confidential wrapper pairs.
          Search by token name, symbol, or contract address.
        </p>
      </div>

      {/* Registry Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Total Pairs", value: "---", colorClass: "text-violet-400" },
          { label: "Valid Wrappers", value: "---", colorClass: "text-emerald-400" },
          { label: "Network", value: "Sepolia", colorClass: "text-cyan-400" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-800/50 bg-slate-900/30 p-4"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              {stat.label}
            </p>
            <p className={`mt-1 text-2xl font-bold ${stat.colorClass}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Pair Table */}
      <PairTable />
    </div>
  );
}
