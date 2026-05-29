/**
 * @file lib/faucet.ts
 * @description Faucet contract ABI, address, and helpers for the
 * Sepolia cTokenMock faucet.
 */

import type { Address } from "viem";
import { FAUCET_CONTRACT_ADDRESS, FAUCET_AMOUNT } from "@/lib/registry-data";

/*************** Faucet Contract ABI ***************/

/**
 * Minimal ABI for the cTokenMock faucet contract.
 *
 * TODO: Replace with the actual deployed faucet contract ABI.
 * The mint function should accept a recipient address and amount.
 */
export const FAUCET_ABI = [
  {
    name: "mint",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "name",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
  {
    name: "symbol",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
] as const;

/*************** Faucet Helpers ***************/

/**
 * Get the faucet contract address.
 *
 * TODO: Replace with actual deployed address once available.
 */
export function getFaucetAddress(): Address {
  return FAUCET_CONTRACT_ADDRESS;
}

/**
 * Get the default mint amount for the faucet.
 */
export function getFaucetAmount(): bigint {
  return FAUCET_AMOUNT;
}

/**
 * Build the mint transaction config for wagmi's useWriteContract.
 *
 * @param recipientAddress - The address to mint tokens to.
 * @param amount - Amount to mint (defaults to FAUCET_AMOUNT).
 * @returns Config object for useWriteContract.
 */
export function buildMintConfig(
  tokenAddress: Address,
  recipientAddress: Address,
  amount: bigint = FAUCET_AMOUNT
) {
  return {
    address: tokenAddress,
    abi: FAUCET_ABI,
    functionName: "mint" as const,
    args: [recipientAddress, amount] as const,
  };
}
