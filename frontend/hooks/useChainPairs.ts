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
import { getStaticPairs, CHAIN_NAMES, SEPOLIA_CHAIN_ID } from "@/lib/registry-data";
import {
  mergeForSelectors,
  normalizeOnchainItem,
  normalizeStaticPair,
  type NormalizedPair,
} from "@/lib/registry-merge";

/*************** Types ***************/

/** A normalized pair ready for display and for building Token instances. */
export type ChainPair = NormalizedPair;

interface UseChainPairsReturn {
  /** Normalized pairs for the active chain. */
  pairs: ChainPair[];
  /** The chain id the pairs belong to. */
  chainId: number;
  /** Whether the on-chain registry read is in flight. */
  isLoading: boolean;
}

/*************** Helpers ***************/

const chainName = (id: number) => CHAIN_NAMES[id] ?? `Chain ${id}`;

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
    const onchain = (sdkPairs?.items ?? []).map((item) =>
      normalizeOnchainItem(item, chainId, chainName)
    );
    const staticForChain = getStaticPairs(chainId).map((p) =>
      normalizeStaticPair(p, chainName)
    );
    /* Selector merge: revoked wrappers are dropped so Wrap/Decrypt never act on
     * an invalid pair. See lib/registry-merge.ts. */
    return mergeForSelectors(onchain, staticForChain, chainId);
  }, [sdkPairs, chainId]);

  return { pairs, chainId, isLoading };
}
