"use client";

/**
 * @file components/PairTable.tsx
 * @description Searchable, filterable table of ERC-20 ↔ ERC-7984 wrapper pairs.
 * Columns: ERC-20 Symbol, ERC-20 Address (truncated), ERC-7984 Symbol,
 * ERC-7984 Address (truncated), Chain (badge). Supports search, chain filter,
 * copy-to-clipboard, row click navigation, loading skeletons, and empty state.
 */

import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useRegistry, type ChainFilter, type DisplayPair } from "@/hooks/useRegistry";
import { cn, truncateAddress } from "@/lib/utils";

/*************** Copy Helper ***************/

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/*************** Copy Button ***************/

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      const ok = await copyToClipboard(text);
      if (ok) {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    },
    [text]
  );

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copy full address"
      className={cn(
        "ml-1.5 inline-flex items-center rounded p-0.5",
        "text-[#A7ACB3] transition-colors hover:text-[#5D5FEF]",
        copied && "text-[#2ECC71]"
      )}
    >
      {copied ? (
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      )}
    </button>
  );
}

/*************** Chain Badge ***************/

function ChainBadge({ chainId, chainName }: { chainId: number; chainName: string }) {
  const colors =
    chainId === 11155111
      ? "bg-[#FFD100]/15 text-[#B78D00] border-[#FFD100]/30"
      : chainId === 1
        ? "bg-black/10 text-black border-black/15"
        : "bg-[#F3F4F5] text-[#656B73] border-[#E5E7E9]";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        colors
      )}
    >
      {chainName}
    </span>
  );
}

/*************** Chain Filter Dropdown ***************/

const CHAIN_OPTIONS: { value: ChainFilter; label: string }[] = [
  { value: "all", label: "All Chains" },
  { value: "sepolia", label: "Sepolia" },
  { value: "mainnet", label: "Mainnet" },
];

/*************** Loading Skeleton ***************/

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="h-16 animate-shimmer rounded-xl bg-gradient-to-r from-[#F3F4F5] via-[#E5E7E9] to-[#F3F4F5] bg-[length:200%_100%]"
        />
      ))}
    </div>
  );
}

/*************** Empty State ***************/

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#CDD0D4] bg-[#F8F9FA] px-6 py-16">
      <svg
        className="mb-4 h-12 w-12 text-[#A7ACB3]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
      <p className="text-sm font-medium text-[#4D535A]">
        {hasSearch ? "No pairs match your search" : "No pairs found"}
      </p>
      <p className="mt-1 text-xs text-[#656B73]">
        {hasSearch
          ? "Try adjusting your search query or chain filter"
          : "The registry is empty or unavailable"}
      </p>
    </div>
  );
}

/*************** Mobile Pair Card ***************/

function PairCard({ pair, onClick }: { pair: DisplayPair; onClick: () => void }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      className={cn(
        "rounded-xl border border-[#E5E7E9] bg-white p-4",
        "cursor-pointer transition-all hover:border-[#FFD100]/40 hover:bg-[#F8F9FA]"
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-md bg-[#FFD100]/15 px-2 py-0.5 font-mono text-sm text-black">
          {pair.erc20.symbol}
        </span>
        <ChainBadge chainId={pair.chainId} chainName={pair.chainName} />
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[#A7ACB3]">ERC-20</span>
          <div className="flex items-center">
            <span className="font-mono text-[#4D535A]">
              {truncateAddress(pair.erc20.address, 6)}
            </span>
            <CopyButton text={pair.erc20.address} />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#A7ACB3]">ERC-7984</span>
          <div className="flex items-center">
            <span className="font-mono text-[#5D5FEF]">
              {truncateAddress(pair.erc7984.address, 6)}
            </span>
            <CopyButton text={pair.erc7984.address} />
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-[#656B73]">
        <span>{pair.erc7984.symbol}</span>
        <span className="text-[#5D5FEF]">Click to wrap →</span>
      </div>
    </div>
  );
}

/*************** PairTable Component ***************/

export function PairTable() {
  const {
    filteredPairs,
    search,
    setSearch,
    chainFilter,
    setChainFilter,
    isLoading,
  } = useRegistry();

  const router = useRouter();

  const handleRowClick = useCallback(
    (pair: DisplayPair) => {
      router.push(
        `/wrap?erc20=${pair.erc20.address}&erc7984=${pair.erc7984.address}`
      );
    },
    [router]
  );

  return (
    <div id="pair-table" className="animate-fade-in space-y-6">
      {/* Search + Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <input
            id="pair-search"
            type="text"
            placeholder="Search by symbol or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              "w-full rounded-xl border border-[#E5E7E9] bg-white px-4 py-3 pl-11",
              "text-sm text-[#1A1D20] placeholder:text-[#A7ACB3]",
              "transition-all focus:border-[#FFD100]/70 focus:outline-none focus:ring-2 focus:ring-[#FFD100]/20"
            )}
          />
          <svg
            className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A7ACB3]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Chain Filter Dropdown */}
        <select
          id="chain-filter"
          value={chainFilter}
          onChange={(e) => setChainFilter(e.target.value as ChainFilter)}
          className={cn(
            "rounded-xl border border-[#E5E7E9] bg-white px-4 py-3",
            "text-sm text-[#1A1D20]",
            "transition-all focus:border-[#FFD100]/70 focus:outline-none focus:ring-2 focus:ring-[#FFD100]/20",
            "sm:w-44"
          )}
        >
          {CHAIN_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Loading Skeleton */}
      {isLoading && <TableSkeleton />}

      {/* Empty State */}
      {!isLoading && filteredPairs.length === 0 && (
        <EmptyState hasSearch={search.trim().length > 0 || chainFilter !== "all"} />
      )}

      {/* Desktop Table */}
      {!isLoading && filteredPairs.length > 0 && (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-[#E5E7E9] bg-white md:block">
            <table className="w-full">
              <thead>
              <tr className="border-b border-[#E5E7E9] text-left">
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-[#A7ACB3]">
                    ERC-20 Symbol
                  </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-[#A7ACB3]">
                    ERC-20 Address
                  </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-[#A7ACB3]">
                    ERC-7984 Symbol
                  </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-[#A7ACB3]">
                    ERC-7984 Address
                  </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-[#A7ACB3]">
                    Chain
                  </th>
                </tr>
              </thead>
            <tbody className="divide-y divide-[#F3F4F5]">
                {filteredPairs.map((pair) => (
                  <tr
                    key={`${pair.erc20.address}-${pair.chainId}`}
                    onClick={() => handleRowClick(pair)}
                    className="cursor-pointer transition-colors hover:bg-[#F8F9FA]"
                  >
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-[#FFD100]/15 px-2 py-0.5 font-mono text-sm text-black">
                        {pair.erc20.symbol}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <span className="font-mono text-xs text-[#4D535A]">
                          {truncateAddress(pair.erc20.address, 6)}
                        </span>
                        <CopyButton text={pair.erc20.address} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-[#5D5FEF]/10 px-2 py-0.5 font-mono text-sm text-[#5D5FEF]">
                        {pair.erc7984.symbol}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <span className="font-mono text-xs text-[#00B4D8]">
                          {truncateAddress(pair.erc7984.address, 6)}
                        </span>
                        <CopyButton text={pair.erc7984.address} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <ChainBadge chainId={pair.chainId} chainName={pair.chainName} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Stack */}
          <div className="space-y-3 md:hidden">
            {filteredPairs.map((pair) => (
              <PairCard
                key={`${pair.erc20.address}-${pair.chainId}`}
                pair={pair}
                onClick={() => handleRowClick(pair)}
              />
            ))}
          </div>

          {/* Result Count */}
          <div className="text-sm text-[#656B73]">
            Showing {filteredPairs.length} pair{filteredPairs.length !== 1 ? "s" : ""}
          </div>
        </>
      )}
    </div>
  );
}
