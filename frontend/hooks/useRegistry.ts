"use client";

/**
 * @file hooks/useRegistry.ts
 * @description Custom hook for querying the on-chain Wrappers Registry.
 * Wraps useListPairs from @zama-fhe/react-sdk with local search/filter
 * logic, chain filtering, and React Query caching (staleTime: 5 min).
 */

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ALL_STATIC_PAIRS } from "@/lib/registry-data";

import { useListPairs } from "@zama-fhe/react-sdk";

/*************** Types ***************/

/** Chain filter values for the registry table. */
export type ChainFilter = "all" | "sepolia" | "mainnet";

/** A registry pair with full metadata for display. */
export interface DisplayPair {
  erc20: { address: string; symbol: string; decimals: number };
  erc7984: { address: string; symbol: string; decimals: number };
  chainId: number;
  chainName: string;
  isValid: boolean;
}

interface UseRegistryReturn {
  /** All unfiltered pairs. */
  pairs: DisplayPair[];
  /** Filtered pairs after search + chain filter. */
  filteredPairs: DisplayPair[];
  /** Current search query. */
  search: string;
  /** Set the search query. */
  setSearch: (query: string) => void;
  /** Current chain filter. */
  chainFilter: ChainFilter;
  /** Set the chain filter. */
  setChainFilter: (filter: ChainFilter) => void;
  /** Whether data is still loading. */
  isLoading: boolean;
}

/*************** Constants ***************/

const CHAIN_NAMES: Record<number, string> = {
  1: "Mainnet",
  11155111: "Sepolia",
};

const CHAIN_IDS: Record<string, number> = {
  mainnet: 1,
  sepolia: 11155111,
};

/** Five minutes of cache staleness. */
const STALE_TIME = 5 * 60 * 1000;

/*************** Hook Implementation ***************/

/**
 * Query wrapper pairs from on-chain registry with search and chain filtering.
 *
 * Uses useListPairs from @zama-fhe/react-sdk as primary source, falls back
 * to static WRAPPER_PAIRS from registry-data.ts. Results are cached with
 * React Query (staleTime: 5 minutes).
 *
 * @returns Registry query state with search/filter support.
 */
export function useRegistry(): UseRegistryReturn {
  const [search, setSearch] = useState("");
  const [chainFilter, setChainFilter] = useState<ChainFilter>("all");

  /*
   * Fetch on-chain pairs via the SDK hook. Fetches up to 100 pairs in a
   * single page to support client-side filtering and search.
   */
  const {
    data: sdkPairs,
    isLoading: sdkLoading,
  } = useListPairs({ page: 1, pageSize: 100, metadata: true });

  /*
   * Local React Query for static fallback data. This ensures the static
   * pairs are cached with staleTime even when the SDK data isn't available.
   */
  const { data: staticPairs, isLoading: staticLoading } = useQuery({
    queryKey: ["registry", "static-pairs"],
    queryFn: () => ALL_STATIC_PAIRS,
    staleTime: STALE_TIME,
  });

  /** Normalize + MERGE on-chain and static pairs into DisplayPair format. */
  const pairs: DisplayPair[] = useMemo(() => {
    /* Normalize on-chain SDK pairs (authoritative for whatever chain the SDK
     * queried — typically only the connected chain). */
    const onchain: DisplayPair[] = (sdkPairs?.items ?? [])
      .map((item: any): DisplayPair => {
        const chainId = item.chainId ?? 11155111;
        return {
          erc20: {
            address: item.tokenAddress ?? "",
            symbol: item.underlying?.symbol ?? item.symbol ?? "???",
            decimals: item.underlying?.decimals ?? item.decimals ?? 18,
          },
          erc7984: {
            address: item.confidentialTokenAddress ?? "",
            symbol: item.confidential?.symbol ?? `c${item.underlying?.symbol ?? item.symbol ?? "???"}`,
            decimals: item.confidential?.decimals ?? item.underlying?.decimals ?? item.decimals ?? 18,
          },
          chainId,
          chainName: CHAIN_NAMES[chainId] ?? `Chain ${chainId}`,
          isValid: item.isValid ?? true,
        };
      })
      .filter((p) => p.erc7984.address);

    /* Normalize static pairs (covers every chain — this is what keeps the
     * mainnet pairs present even when useListPairs only returns Sepolia). */
    const staticAll: DisplayPair[] = (staticPairs ?? ALL_STATIC_PAIRS).map((p) => ({
      erc20: { address: p.erc20.address, symbol: p.erc20.symbol, decimals: p.erc20.decimals },
      erc7984: { address: p.erc7984.address, symbol: p.erc7984.symbol, decimals: p.erc7984.decimals },
      chainId: p.chainId,
      chainName: CHAIN_NAMES[p.chainId] ?? `Chain ${p.chainId}`,
      isValid: true,
    }));

    /* Merge: the verified static set is the stable base (always 7 Sepolia +
     * 7 mainnet, so the mainnet filter is never empty and the count never
     * shrinks). On-chain pairs are appended only when genuinely new. Dedup key
     * = chainId + confidential address. */
    const key = (p: DisplayPair) => `${p.chainId}:${p.erc7984.address.toLowerCase()}`;
    const seen = new Set(staticAll.map(key));
    const merged = [...staticAll];
    for (const o of onchain) {
      if (!seen.has(key(o))) {
        seen.add(key(o));
        merged.push(o);
      }
    }
    return merged;
  }, [sdkPairs, staticPairs]);

  /** Apply search + chain filter. */
  const filteredPairs = useMemo(() => {
    let result = pairs;

    /* Chain filter. */
    if (chainFilter !== "all") {
      const targetChainId = CHAIN_IDS[chainFilter];
      if (targetChainId) {
        result = result.filter((p) => p.chainId === targetChainId);
      }
    }

    /* Search filter (case-insensitive). */
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (p) =>
          p.erc20.symbol.toLowerCase().includes(q) ||
          p.erc7984.symbol.toLowerCase().includes(q) ||
          p.erc20.address.toLowerCase().includes(q) ||
          p.erc7984.address.toLowerCase().includes(q)
      );
    }

    return result;
  }, [pairs, search, chainFilter]);

  const isLoading = sdkLoading && staticLoading;

  return {
    pairs,
    filteredPairs,
    search,
    setSearch,
    chainFilter,
    setChainFilter,
    isLoading,
  };
}
