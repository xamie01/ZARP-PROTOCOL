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

import { SepoliaConfig, isZeroHandle as sdkIsZeroHandle } from "@zama-fhe/sdk";
import { SEPOLIA_RPC_URL } from "@/lib/registry-data";

/*************** SDK Configuration ***************/

/**
 * Sepolia transport configuration for RelayerWeb.
 *
 * In production, replace relayerUrl with a backend proxy URL
 * and never expose the API key on the client.
 * See: references/zama-sdk-auth-storage.md (Backend proxy pattern)
 */
export const sepoliaTransportConfig = {
  [SepoliaConfig.chainId]: {
    ...SepoliaConfig,
    network: SEPOLIA_RPC_URL,
    /* TODO: Replace with your backend proxy URL for production.
     * For Sepolia testnet, the relayer is open (no API key needed).
     * For mainnet, use: relayerUrl: "/api/relayer/1" */
  },
} as const;

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
