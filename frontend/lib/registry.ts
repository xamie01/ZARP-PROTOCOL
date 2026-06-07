/**
 * @file lib/registry.ts
 * @description Registry contract call helpers for querying the on-chain
 * WrappersRegistry. Uses the new @zama-fhe/sdk WrappersRegistry class.
 */

import type { Address } from "viem";
import type { RegistryEntry } from "@/types";

interface PairLike {
  tokenAddress?: Address;
  confidentialTokenAddress?: Address;
  isValid?: boolean;
  name?: string;
  symbol?: string;
  decimals?: number;
  totalSupply?: bigint;
}

interface WrappersRegistryLike {
  listPairs(options: {
    page: number;
    pageSize: number;
    metadata: boolean;
  }): Promise<{ pairs: PairLike[] }>;
  getConfidentialToken(
    tokenAddress: Address
  ): Promise<{ confidentialTokenAddress?: Address } | null | undefined>;
  getUnderlyingToken(
    confidentialAddress: Address
  ): Promise<{ tokenAddress?: Address } | null | undefined>;
}

/*************** Registry Helpers ***************/

/**
 * Fetch a paginated list of token pairs from the on-chain registry.
 *
 * TODO: Implement using WrappersRegistry from @zama-fhe/sdk.
 * In the provider, the registry is available via sdk.registry.
 *
 * @example
 * ```ts
 * const pairs = await fetchRegistryPairs(sdk.registry, { page: 0, pageSize: 20 });
 * ```
 *
 * @param registry - WrappersRegistry instance from ZamaSDK.
 * @param options - Pagination options.
 * @returns Paginated list of registry entries.
 */
export async function fetchRegistryPairs(
  registry: WrappersRegistryLike,
  options: { page?: number; pageSize?: number; metadata?: boolean } = {}
): Promise<RegistryEntry[]> {
  const { page = 0, pageSize = 20, metadata = true } = options;
  if (!registry) return [];

  const result = await registry.listPairs({ page, pageSize, metadata });
  return result.pairs.map((pair) => ({
    tokenAddress: pair.tokenAddress as Address,
    confidentialTokenAddress: pair.confidentialTokenAddress as Address,
    isValid: pair.isValid ?? true,
    name: pair.name ?? "",
    symbol: pair.symbol ?? "",
    decimals: pair.decimals ?? 18,
    totalSupply: pair.totalSupply ?? 0n,
  }));
}

/**
 * Look up the confidential wrapper for a given ERC-20 address.
 *
 * @param registry - WrappersRegistry instance.
 * @param tokenAddress - The underlying ERC-20 address.
 * @returns The confidential wrapper address, or null if not found.
 */
export async function lookupWrapper(
  registry: WrappersRegistryLike,
  tokenAddress: Address
): Promise<Address | null> {
  if (!registry) return null;
  const result = await registry.getConfidentialToken(tokenAddress);
  return (result?.confidentialTokenAddress as Address) ?? null;
}

/**
 * Reverse lookup: find the underlying ERC-20 for a confidential wrapper.
 *
 * @param registry - WrappersRegistry instance.
 * @param confidentialAddress - The confidential wrapper address.
 * @returns The underlying ERC-20 address, or null if not found.
 */
export async function lookupUnderlying(
  registry: WrappersRegistryLike,
  confidentialAddress: Address
): Promise<Address | null> {
  if (!registry) return null;
  const result = await registry.getUnderlyingToken(confidentialAddress);
  return (result?.tokenAddress as Address) ?? null;
}
