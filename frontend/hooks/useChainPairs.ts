"use client";

/**
 * @file hooks/useChainPairs.ts
 * @description Chain-aware wrapper-pair source. The on-chain Wrappers Registry
 * (via @zama-fhe/react-sdk `useListPairs`) is the primary source of truth;
 * static + custom pairs from registry-data.ts are the fallback / extension
 * layer. Pairs are normalized to a single display shape and filtered to the
 * connected chain.
 */

import { useMemo } from "react";
import { useAccount } from "wagmi";
import { useListPairs } from "@zama-fhe/react-sdk";
import {
  getStaticPairs,
  CHAIN_NAMES,
  SEPOLIA_CHAIN_ID,
  type WrapperPairConfig,
} from "@/lib/registry-data";

/*************** Types ***************/

/** A normalized pair ready for display and for building Token instances. */
export interface ChainPair {
  erc20: { address: string; symbol: string; decimals: number };
  erc7984: { address: string; symbol: string; decimals: number };
  chainId: number;
  chainName: string;
  isValid: boolean;
  /** "registry" if sourced on-chain, "static" if from local config. */
  source: "registry" | "static";
}

interface UseChainPairsReturn {
  /** Normalized pairs for the active chain. */
  pairs: ChainPair[];
  /** The chain id the pairs belong to. */
  chainId: number;
  /** Whether the on-chain registry read is in flight. */
  isLoading: boolean;
}

/*************** Helpers ***************/

function fromStatic(p: WrapperPairConfig): ChainPair {
  return {
    erc20: { ...p.erc20 },
    erc7984: { ...p.erc7984 },
    chainId: p.chainId,
    chainName: CHAIN_NAMES[p.chainId] ?? `Chain ${p.chainId}`,
    isValid: true,
    source: "static",
  };
}

/*************** Hook ***************/

/**
 * Return the wrapper pairs for a chain, on-chain first with static fallback.
 *
 * @param chainIdOverride - Force a specific chain instead of the connected one.
 * @returns Normalized pairs, the resolved chain id, and loading state.
 */
export function useChainPairs(chainIdOverride?: number): UseChainPairsReturn {
  const { chainId: connectedChainId } = useAccount();
  const chainId = chainIdOverride ?? connectedChainId ?? SEPOLIA_CHAIN_ID;

  const { data: sdkPairs, isLoading } = useListPairs({
    page: 1,
    pageSize: 100,
    metadata: true,
  });

  const pairs = useMemo<ChainPair[]>(() => {
    const staticForChain = getStaticPairs(chainId);

    /* Normalize on-chain pairs for this chain. */
    const onchain: ChainPair[] = (sdkPairs?.items ?? [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any): ChainPair => {
        const cid = item.chainId ?? chainId;
        const underSymbol = item.underlying?.symbol ?? item.symbol ?? "???";
        return {
          erc20: {
            address: item.tokenAddress ?? "",
            symbol: underSymbol,
            decimals: item.underlying?.decimals ?? item.decimals ?? 18,
          },
          erc7984: {
            address: item.confidentialTokenAddress ?? "",
            symbol: item.confidential?.symbol ?? `c${underSymbol}`,
            decimals: item.confidential?.decimals ?? item.underlying?.decimals ?? 18,
          },
          chainId: cid,
          chainName: CHAIN_NAMES[cid] ?? `Chain ${cid}`,
          isValid: item.isValid ?? true,
          source: "registry",
        };
      })
      .filter((p: ChainPair) => p.chainId === chainId && p.erc7984.address);

    /* Merge: on-chain wins; add any static pair the registry did not return. */
    const seen = new Set(onchain.map((p) => p.erc7984.address.toLowerCase()));
    const merged = [...onchain];
    for (const s of staticForChain) {
      if (!seen.has(s.erc7984.address.toLowerCase())) merged.push(fromStatic(s));
    }
    return merged;
  }, [sdkPairs, chainId]);

  return { pairs, chainId, isLoading };
}
