/**
 * @file lib/wrap.ts
 * @description Wrap (shield) and unwrap (unshield) contract call helpers.
 * Uses the new @zama-fhe/sdk Token API for ERC-7984 operations.
 */

import type { Address, Hex } from "viem";

/*************** Shield Helpers ***************/

/**
 * Shield (wrap) public ERC-20 tokens into confidential ERC-7984 tokens.
 *
 * TODO: Implement using token.shield(amount, options) from @zama-fhe/sdk.
 * The Token instance is created via sdk.createToken(tokenAddress, wrapperAddress?).
 *
 * @example
 * ```ts
 * const token = sdk.createToken("0xERC20", "0xWrapper");
 * const { txHash } = await token.shield(1000n, {
 *   approvalStrategy: "exact",
 *   onApprovalSubmitted: (hash) => console.log("Approval:", hash),
 *   onShieldSubmitted: (hash) => console.log("Shield:", hash),
 * });
 * ```
 *
 * Shield validates the public ERC-20 balance BEFORE submitting.
 * Throws InsufficientERC20BalanceError if balance is too low.
 *
 * @param token - Token instance from ZamaSDK.
 * @param amount - Amount to shield (in token base units).
 * @param callbacks - Progress callbacks.
 * @returns Transaction hash of the shield operation.
 */
export async function shieldTokens(
  token: any,
  amount: bigint,
  callbacks?: {
    onApprovalSubmitted?: (txHash: Hex) => void;
    onShieldSubmitted?: (txHash: Hex) => void;
  }
): Promise<Hex> {
  if (!token) throw new Error("Token instance is not initialized");
  const { txHash } = await token.shield(amount, {
    approvalStrategy: "exact",
    onApprovalSubmitted: callbacks?.onApprovalSubmitted,
    onShieldSubmitted: callbacks?.onShieldSubmitted,
  });
  return txHash;
}

/*************** Unshield Helpers ***************/

/**
 * Unshield (unwrap) confidential ERC-7984 tokens back to public ERC-20.
 *
 * @param token - Token instance from ZamaSDK.
 * @param amount - Amount to unshield (in token base units).
 * @param callbacks - Progress callbacks for each phase.
 * @returns Transaction hash of the finalize operation.
 */
export async function unshieldTokens(
  token: any,
  amount: bigint,
  callbacks?: {
    onUnwrapSubmitted?: (txHash: Hex) => void;
    onFinalizing?: () => void;
    onFinalizeSubmitted?: (txHash: Hex) => void;
  }
): Promise<Hex> {
  if (!token) throw new Error("Token instance is not initialized");
  const { txHash } = await token.unshield(amount, {
    onUnwrapSubmitted: callbacks?.onUnwrapSubmitted,
    onFinalizing: callbacks?.onFinalizing,
    onFinalizeSubmitted: callbacks?.onFinalizeSubmitted,
  });
  return txHash;
}

/*************** Resume Helpers ***************/

/**
 * Resume an interrupted unshield operation.
 *
 * @param token - Token instance from ZamaSDK.
 * @param unwrapTxHash - The phase 1 transaction hash.
 * @returns Transaction hash of the resumed finalize.
 */
export async function resumeUnshield(
  token: any,
  unwrapTxHash: Hex
): Promise<Hex> {
  if (!token) throw new Error("Token instance is not initialized");
  const { txHash } = await token.resumeUnshield(unwrapTxHash);
  return txHash;
}

/**
 * Get the wrapper address for a token from the registry.
 *
 * @param registry - WrappersRegistry instance.
 * @param tokenAddress - ERC-20 token address.
 * @returns Wrapper address or null.
 */
export async function resolveWrapper(
  registry: any,
  tokenAddress: Address
): Promise<Address | null> {
  if (!registry) return null;
  const result = await registry.getConfidentialToken(tokenAddress);
  return (result?.confidentialTokenAddress as Address) ?? null;
}
