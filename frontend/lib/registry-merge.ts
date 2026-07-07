/**
 * @file lib/registry-merge.ts
 * @description Pure, framework-free logic for reconciling the on-chain Wrappers
 * Registry with the local static pair config. Extracted from the hooks so the
 * isValid-overlay and dedup rules can be unit-tested in isolation.
 *
 * Two merge strategies share the same normalization + validity rules:
 *   - `mergeForSelectors`  — used by Wrap/Decrypt: revoked wrappers are DROPPED
 *     so a user can never act on an invalid pair.
 *   - `mergeForBrowse`     — used by the Registry table: revoked wrappers are
 *     KEPT (so they can be badged) but carry the on-chain isValid verdict.
 */

/*************** Types ***************/

/** Optional per-token metadata carried alongside address/symbol/decimals. */
export interface TokenMeta {
  address: string;
  symbol: string;
  decimals: number;
  name?: string;
}

/** A single normalized ERC-20 <-> ERC-7984 pair. */
export interface NormalizedPair {
  erc20: TokenMeta;
  erc7984: TokenMeta;
  chainId: number;
  chainName: string;
  isValid: boolean;
  /** "registry" if sourced on-chain, "static" if from local config. */
  source: "registry" | "static";
}

/** Minimal shape of a static config pair (chain-scoped). */
export interface StaticPairInput {
  erc20: TokenMeta;
  erc7984: TokenMeta;
  chainId: number;
}

/*************** Helpers ***************/

/** Dedup / lookup key: chain-scoped, lowercased confidential address. */
export function pairKey(chainId: number, confidentialAddress: string): string {
  return `${chainId}:${confidentialAddress.toLowerCase()}`;
}

/**
 * Normalize one raw on-chain registry item (from `useListPairs`) into a
 * NormalizedPair. Tolerant of the SDK's optional metadata shape.
 *
 * @param item - Raw SDK item.
 * @param fallbackChainId - Chain id to use when the item omits one.
 * @param chainName - Resolver from chain id to display name.
 * @returns The normalized pair.
 */
export function normalizeOnchainItem(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: any,
  fallbackChainId: number,
  chainName: (id: number) => string
): NormalizedPair {
  const cid = item.chainId ?? fallbackChainId;
  const underSymbol = item.underlying?.symbol ?? item.symbol ?? "???";
  const underName = item.underlying?.name ?? item.name;
  return {
    erc20: {
      address: item.tokenAddress ?? "",
      symbol: underSymbol,
      decimals: item.underlying?.decimals ?? item.decimals ?? 18,
      name: underName,
    },
    erc7984: {
      address: item.confidentialTokenAddress ?? "",
      symbol: item.confidential?.symbol ?? `c${underSymbol}`,
      decimals: item.confidential?.decimals ?? item.underlying?.decimals ?? 18,
      name: item.confidential?.name ?? (underName ? `Confidential ${underName}` : undefined),
    },
    chainId: cid,
    chainName: chainName(cid),
    isValid: item.isValid ?? true,
    source: "registry",
  };
}

/** Normalize a static config pair into a NormalizedPair (assumed valid). */
export function normalizeStaticPair(
  p: StaticPairInput,
  chainName: (id: number) => string
): NormalizedPair {
  return {
    erc20: { ...p.erc20 },
    erc7984: { ...p.erc7984 },
    chainId: p.chainId,
    chainName: chainName(p.chainId),
    isValid: true,
    source: "static",
  };
}

/**
 * Build a map of on-chain validity verdicts keyed by pairKey. On-chain isValid
 * is authoritative: a `false` here overrides a statically-valid pair.
 */
export function onchainValidityMap(
  onchain: NormalizedPair[]
): Map<string, boolean> {
  return new Map(onchain.map((p) => [pairKey(p.chainId, p.erc7984.address), p.isValid]));
}

/*************** Merge strategies ***************/

/**
 * Selector merge (Wrap / Decrypt): valid on-chain pairs win; static pairs fill
 * gaps UNLESS the registry explicitly revoked them. Revoked pairs are dropped.
 *
 * @param onchain - Normalized on-chain pairs (any chain).
 * @param staticForChain - Normalized static pairs for the target chain.
 * @param chainId - The chain to filter on-chain pairs to.
 * @returns Usable pairs for the chain, revoked entries excluded.
 */
export function mergeForSelectors(
  onchain: NormalizedPair[],
  staticForChain: NormalizedPair[],
  chainId: number
): NormalizedPair[] {
  const onchainForChain = onchain.filter(
    (p) => p.chainId === chainId && p.erc7984.address
  );
  const validity = onchainValidityMap(onchainForChain);
  const validOnchain = onchainForChain.filter((p) => p.isValid);

  const seen = new Set(validOnchain.map((p) => pairKey(p.chainId, p.erc7984.address)));
  const merged = [...validOnchain];
  for (const s of staticForChain) {
    const k = pairKey(s.chainId, s.erc7984.address);
    if (seen.has(k)) continue;
    if (validity.get(k) === false) continue; /* revoked on-chain */
    merged.push(s);
  }
  return merged;
}

/**
 * Browse merge (Registry table): the static set is the stable base (kept for
 * every chain), inheriting the on-chain isValid verdict when the registry
 * reported one. Genuinely-new on-chain pairs (including revoked ones) are
 * appended so they can be shown and badged.
 *
 * @param onchain - Normalized on-chain pairs (any chain).
 * @param staticAll - Normalized static pairs across every chain.
 * @returns All known pairs with authoritative isValid flags.
 */
export function mergeForBrowse(
  onchain: NormalizedPair[],
  staticAll: NormalizedPair[]
): NormalizedPair[] {
  const cleanOnchain = onchain.filter((p) => p.erc7984.address);
  const validity = onchainValidityMap(cleanOnchain);

  const base = staticAll.map((p) => ({
    ...p,
    isValid: validity.get(pairKey(p.chainId, p.erc7984.address)) ?? true,
  }));

  const seen = new Set(base.map((p) => pairKey(p.chainId, p.erc7984.address)));
  const merged = [...base];
  for (const o of cleanOnchain) {
    const k = pairKey(o.chainId, o.erc7984.address);
    if (!seen.has(k)) {
      seen.add(k);
      merged.push(o);
    }
  }
  return merged;
}
