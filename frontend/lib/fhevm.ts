/**
 * @file lib/fhevm.ts
 * @description Zama SDK initialization config and ACL helpers.
 * Provides the RelayerWeb, signer, and storage configuration for the
 * new @zama-fhe/sdk@^3 / @zama-fhe/react-sdk@^3 Token API.
 *
 * IMPORTANT: This file is imported only from "use client" components.
 * Never import at module level in a Server Component -- RelayerWeb opens
 * a Web Worker and IndexedDB at construction, both of which crash during SSR.
 */

import { SepoliaConfig, MainnetConfig, isZeroHandle as sdkIsZeroHandle } from "@zama-fhe/sdk";
import { MAINNET_CHAIN_ID } from "@/lib/registry-data";

/*************** Relayer URL Resolution ***************/

/**
 * Resolve the relayer URL for a chain.
 *
 * Sepolia's relayer is open (no API key), so the SDK's bundled Sepolia relayer
 * URL is used directly. Mainnet's relayer requires an API key, which MUST stay
 * server-side: when NEXT_PUBLIC_RELAYER_PROXY_URL is set, mainnet routes through
 * that backend proxy (see app/api/relayer/[chain]/route.ts). The browser never
 * sees the key.
 *
 * @param chainId - Target chain id.
 * @returns The relayer URL to use for that chain.
 */
export function relayerUrlFor(chainId: number): string {
  if (chainId === MAINNET_CHAIN_ID) {
    /* Mainnet: prefer the backend proxy; fall back to the bundled URL (which
     * will 401 without a key, surfaced as a clear relayer error). */
    const proxy = process.env.NEXT_PUBLIC_RELAYER_PROXY_URL;
    if (proxy) return `${proxy.replace(/\/$/, "")}/${MAINNET_CHAIN_ID}`;
    return MainnetConfig.relayerUrl;
  }
  /* Sepolia: open relayer; allow an explicit override for self-hosted setups. */
  return process.env.NEXT_PUBLIC_ZAMA_RELAYER_URL || SepoliaConfig.relayerUrl;
}

/**
 * Default keypair TTL in seconds (30 days).
 * The SDK default is 2_592_000. Min 1, max 31_536_000 (365 days).
 * Setting to 0 is rejected at construction.
 */
export const KEYPAIR_TTL = 2_592_000;

/**
 * Default session TTL in seconds (30 days).
 * Use 0 for high-security mode (sign every op).
 * Use "infinite" for persistent sessions.
 */
export const SESSION_TTL = 2_592_000;

/*************** ACL Helpers ***************/

/**
 * Check if a handle is the zero handle (no encrypted balance exists).
 * Use this to distinguish "never shielded" from "zero balance".
 *
 * @param handle - Hex-encoded handle from confidentialBalanceOf.
 * @returns true if the handle is all zeros.
 */
export function isZeroHandle(handle: string): boolean {
  return sdkIsZeroHandle(handle);
}
