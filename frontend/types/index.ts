/**
 * @file types/index.ts
 * @description Shared TypeScript types for the Confidential Wrapper Registry App.
 */

import type { Address, Hex } from "viem";

/*************** Registry Types ***************/

/** A pair of ERC-20 and its confidential ERC-7984 wrapper from the on-chain registry. */
export interface TokenPair {
  /** The underlying public ERC-20 token address. */
  tokenAddress: Address;
  /** The confidential ERC-7984 wrapper address. */
  confidentialTokenAddress: Address;
  /** Whether the wrapper is valid (registered and verified). */
  isValid: boolean;
  /** Token decimals (optional, defaults to 18 when absent). */
  decimals?: number;
}

/** Extended pair with optional on-chain metadata. */
export interface RegistryEntry extends TokenPair {
  /** Public ERC-20 token name. */
  name?: string;
  /** Public ERC-20 token symbol. */
  symbol?: string;
  /** Token decimals. */
  decimals?: number;
  /** Total supply of the underlying ERC-20 (public). */
  totalSupply?: bigint;
}

/*************** Wrap / Unwrap Types ***************/

/** Current state of a wrap or unwrap operation. */
export type WrapPhase =
  | "idle"
  | "approving"
  | "wrapping"
  | "unwrapping"
  | "finalizing"
  | "complete"
  | "error";

/** State object for the wrap/unwrap form. */
export interface WrapState {
  /** Current operation phase. */
  phase: WrapPhase;
  /** Active tab: shield or unshield. */
  mode: "shield" | "unshield";
  /** Amount entered by the user. */
  amount: string;
  /** Selected token pair. */
  selectedPair: TokenPair | null;
  /** Transaction hash (approval, wrap, or finalize). */
  txHash?: Hex;
  /** Error message if phase is "error". */
  error?: string;
}

/*************** Decrypt Types ***************/

/** Current state of the EIP-712 decryption flow. */
export type DecryptPhase =
  | "idle"
  | "authorizing"
  | "decrypting"
  | "complete"
  | "error";

/** State object for the decrypt flow. */
export interface DecryptState {
  /** Current decryption phase. */
  phase: DecryptPhase;
  /** Contract address to decrypt from. */
  contractAddress?: Address;
  /** Token address for balance decryption. */
  tokenAddress?: Address;
  /** Decrypted balance value (bigint as string for serialization). */
  decryptedBalance?: string;
  /** Error message if phase is "error". */
  error?: string;
}

/** A handle-contract pair for userDecrypt calls. */
export interface DecryptHandle {
  handle: Hex;
  contractAddress: Address;
}

/*************** Faucet Types ***************/

/** State object for the faucet panel. */
export interface FaucetState {
  /** Whether a mint transaction is in progress. */
  isMinting: boolean;
  /** Last mint transaction hash. */
  txHash?: Hex;
  /** Error message. */
  error?: string;
  /** Minted amount. */
  amount?: string;
}

/*************** Navigation Types ***************/

/** Navigation route definition. */
export interface NavRoute {
  /** Display label. */
  label: string;
  /** Route path. */
  href: string;
  /** Description for tooltip or subtitle. */
  description: string;
}

/*************** Common Types ***************/

/** Status of a contract interaction. */
export type TxStatus = "idle" | "pending" | "success" | "error";

/** Generic async operation result. */
export interface AsyncResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}
