/**
 * @file lib/registry.ts
 * @description Registry contract call helpers for querying the on-chain
 * WrappersRegistry. Uses the new @zama-fhe/sdk WrappersRegistry class.
 */

import type { Address } from "viem";
import type { RegistryEntry } from "@/types";

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
  registry: any,
  options: { page?: number; pageSize?: number; metadata?: boolean } = {}
): Promise<RegistryEntry[]> {
  const { page = 0, pageSize = 20, metadata = true } = options;
  if (!registry) return [];

  const result = await registry.listPairs({ page, pageSize, metadata });
  return result.pairs.map((pair: any) => ({
    tokenAddress: pair.tokenAddress as Address,
    confidentialTokenAddress: pair.confidentialTokenAddress as Address,
    isValid: pair.isValid,
    name: pair.name,
    symbol: pair.symbol,
    decimals: pair.decimals,
    totalSupply: pair.totalSupply,
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
  registry: any,
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
  registry: any,
  confidentialAddress: Address
): Promise<Address | null> {
  if (!registry) return null;
  const result = await registry.getUnderlyingToken(confidentialAddress);
  return (result?.tokenAddress as Address) ?? null;
}
