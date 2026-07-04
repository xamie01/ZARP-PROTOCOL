/**
 * @file lib/faucet.ts
 * @description Faucet contract ABI, address, and helpers for the
 * Sepolia cTokenMock faucet.
 */

import { getFaucetAmountForDecimals } from "@/lib/registry-data";

/*************** Faucet Contract ABI ***************/

/**
 * Minimal ABI for the official Sepolia cTokenMock ERC-20s.
 *
 * Verified on-chain: every official mock (USDCMock, USDTMock, WETHMock,
 * BRONMock, ZAMAMock, tGBPMock, XAUtMock) exposes an open, permissionless
 * `mint(address,uint256)` (selector 0x40c10f19, ~52k gas), so any connected
 * wallet can self-mint test tokens. No owner/role gating.
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
 * Get the mint amount for the faucet.
 * Always returns 1,000 tokens in base units for the specified decimals (defaults to 18).
 */
export function getFaucetAmount(decimals: number = 18): bigint {
  return getFaucetAmountForDecimals(decimals);
}
