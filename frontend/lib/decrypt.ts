/**
 * @file lib/decrypt.ts
 * @description EIP-712 signature and relayer decrypt helpers.
 * Uses the new @zama-fhe/sdk session-based decryption model.
 *
 * The new SDK flow:
 *   1. sdk.allow([contractAddresses]) -- one EIP-712 signature covers all
 *   2. sdk.userDecrypt([{ handle, contractAddress }]) -- silent after allow
 *   3. token.balanceOf() -- decrypts balance using cached session
 *
 * userDecrypt returns a bare Record<handle, value>.
 * publicDecrypt returns { clearValues: { [handle]: value } }.
 * These two shapes are NOT the same -- do not mix them.
 */

import type { Address, Hex } from "viem";
import type { DecryptHandle } from "@/types";
import { NoCiphertextError, ReadonlyToken } from "@zama-fhe/sdk";

/*************** Session Authorization ***************/

/**
 * Pre-authorize a set of contracts for decryption with a single EIP-712 signature.
 *
 * @param sdk - ZamaSDK instance.
 * @param contractAddresses - Array of contract addresses to authorize.
 */
export async function authorizeContracts(
  sdk: any,
  contractAddresses: Address[]
): Promise<void> {
  if (!sdk) throw new Error("SDK is not initialized");
  await sdk.allow(contractAddresses);
}

/*************** User Decryption ***************/

/**
 * Decrypt one or more FHE handles using the session credentials.
 *
 * @param sdk - ZamaSDK instance.
 * @param handles - Array of handle-contract pairs to decrypt.
 * @returns Record mapping handle hex to decrypted value.
 */
export async function decryptHandles(
  sdk: any,
  handles: DecryptHandle[]
): Promise<Record<Hex, bigint>> {
  if (!sdk) return {};
  const values = await sdk.userDecrypt(
    handles.map(h => ({ handle: h.handle, contractAddress: h.contractAddress }))
  );
  return values;
}

/*************** Balance Decryption ***************/

/**
 * Decrypt the confidential balance of a token for the connected wallet.
 *
 * @param token - Token or ReadonlyToken instance.
 * @returns Decrypted balance as bigint.
 */
export async function decryptBalance(token: any): Promise<bigint> {
  if (!token) throw new Error("Token instance is not initialized");
  try {
    return await token.balanceOf();
  } catch (error) {
    if (error instanceof NoCiphertextError) {
      return -1n; // Sentinel for "never shielded"
    }
    throw error;
  }
}

/**
 * Batch-authorize multiple tokens with a single signature.
 *
 * @param tokens - Array of ReadonlyToken instances.
 */
export async function batchAuthorizeTokens(tokens: any[]): Promise<void> {
  await ReadonlyToken.allow(...tokens);
}
