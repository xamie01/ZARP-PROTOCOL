"use client";

/**
 * @file components/NetworkBanner.tsx
 * @description Network-mismatch guard. Renders a warning banner when the
 * connected wallet is on a chain the app does not support (anything other than
 * Ethereum mainnet or Sepolia), with a one-click switch to Sepolia. Renders
 * nothing when disconnected or already on a supported chain.
 */

import { AlertTriangle } from "lucide-react";
import { useAccount, useSwitchChain } from "wagmi";
import {
  SEPOLIA_CHAIN_ID,
  MAINNET_CHAIN_ID,
  CHAIN_NAMES,
} from "@/lib/registry-data";

/** Chains the app can read/act on. */
const SUPPORTED_CHAIN_IDS: number[] = [SEPOLIA_CHAIN_ID, MAINNET_CHAIN_ID];

/**
 * Warn and offer to switch when the wallet is on an unsupported network.
 *
 * @returns The banner, or null when connected to a supported chain / disconnected.
 */
export default function NetworkBanner() {
  const { isConnected, chainId } = useAccount();
  const { switchChain, isPending } = useSwitchChain();

  if (!isConnected || (chainId !== undefined && SUPPORTED_CHAIN_IDS.includes(chainId))) {
    return null;
  }

  const supportedNames = SUPPORTED_CHAIN_IDS.map((id) => CHAIN_NAMES[id]).join(" or ");

  return (
    <div className="px-6 py-3 bg-[rgba(243,156,18,0.08)] border-b border-[rgba(243,156,18,0.2)] flex items-center justify-between gap-3">
      <p className="text-sm text-[#B9770E] flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        Unsupported network. Switch to {supportedNames} to continue.
      </p>
      <button
        onClick={() => switchChain({ chainId: SEPOLIA_CHAIN_ID })}
        disabled={isPending}
        className="shrink-0 rounded-lg border border-[#B9770E] px-3 py-1 text-xs font-semibold text-[#B9770E] hover:bg-[#B9770E] hover:text-white transition-colors disabled:opacity-50"
      >
        {isPending ? "Switching…" : "Switch to Sepolia"}
      </button>
    </div>
  );
}
