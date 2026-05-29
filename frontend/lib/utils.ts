/**
 * @file lib/utils.ts
 * @description Utility functions including the shadcn/ui `cn` class merger.
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind CSS classes with conflict resolution. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Truncate an Ethereum address for display.
 * @param address - Full 0x-prefixed address.
 * @param chars - Number of characters to show on each side. Default 4.
 * @returns Truncated address like "0x1234...abcd".
 */
export function truncateAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Format a bigint token amount to a human-readable string.
 * @param amount - Raw bigint amount.
 * @param decimals - Token decimals. Default 18.
 * @returns Formatted string like "1,000.50".
 */
export function formatTokenAmount(amount: bigint, decimals = 18): string {
  const divisor = 10n ** BigInt(decimals);
  const whole = amount / divisor;
  const remainder = amount % divisor;
  const fractional = remainder.toString().padStart(decimals, "0").slice(0, 4);
  const wholeStr = whole.toLocaleString("en-US");
  return fractional === "0000" ? wholeStr : `${wholeStr}.${fractional}`;
}
