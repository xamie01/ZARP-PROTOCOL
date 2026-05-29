"use client";

/**
 * @file components/WrapForm.tsx
 * @description Tabbed wrap (shield) / unwrap (unshield) form component.
 */

import React from "react";
import { useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";
import { useWrap } from "@/hooks/useWrap";
import { cn, truncateAddress } from "@/lib/utils";
import { KNOWN_TOKEN_PAIRS } from "@/lib/registry-data";
import { parseUnits } from "viem";
import {
  Lock,
  Unlock,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Coins,
  ArrowRight,
} from "lucide-react";

export function WrapForm() {
  const { isConnected } = useAccount();
  const searchParams = useSearchParams();
  const erc20Param = searchParams.get("erc20");
  const erc7984Param = searchParams.get("erc7984");

  const {
    state,
    shield,
    unshield,
    setMode,
    setAmount,
    selectPair,
    reset,
    erc20Balance,
    formattedErc20Balance,
    confidentialBalance,
    formattedConfidentialBalance,
    isAllowed,
    decryptLoading,
    decryptError,
    decryptConfidentialBalance,
    isLoading,
  } = useWrap();

  /* Pre-fill token selection from URL query parameters */
  React.useEffect(() => {
    if (erc20Param && erc7984Param) {
      const matched = KNOWN_TOKEN_PAIRS.find(
        (p) =>
          p.tokenAddress.toLowerCase() === erc20Param.toLowerCase() &&
          p.confidentialTokenAddress.toLowerCase() === erc7984Param.toLowerCase()
      );
      if (matched) {
        selectPair({
          tokenAddress: matched.tokenAddress,
          confidentialTokenAddress: matched.confidentialTokenAddress,
          isValid: matched.isValid,
          decimals: matched.decimals,
        });
      }
    }
  }, [erc20Param, erc7984Param, selectPair]);

  /* Pre-select the first token pair if none is selected and no URL params exist */
  React.useEffect(() => {
    if (!state.selectedPair && !erc20Param && KNOWN_TOKEN_PAIRS.length > 0) {
      const first = KNOWN_TOKEN_PAIRS[0];
      selectPair({
        tokenAddress: first.tokenAddress,
        confidentialTokenAddress: first.confidentialTokenAddress,
        isValid: first.isValid,
        decimals: first.decimals,
      });
    }
  }, [state.selectedPair, erc20Param, selectPair]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.amount || !state.selectedPair) return;

    /* Get current decimals for parsing */
    const matchedPair = KNOWN_TOKEN_PAIRS.find(
      (p) => p.tokenAddress === state.selectedPair?.tokenAddress
    );
    const decimals = matchedPair?.decimals ?? 18;
    const parsedAmount = parseUnits(state.amount || "0", decimals);

    if (state.mode === "shield") {
      await shield(parsedAmount);
    } else {
      await unshield(parsedAmount);
    }
  };

  const handleMax = () => {
    if (!state.selectedPair) return;

    const matchedPair = KNOWN_TOKEN_PAIRS.find(
      (p) => p.tokenAddress === state.selectedPair?.tokenAddress
    );
    const decimals = matchedPair?.decimals ?? 18;

    if (state.mode === "shield") {
      if (erc20Balance !== undefined) {
        setAmount(formattedErc20Balance.replace(/,/g, ""));
      }
    } else {
      if (isAllowed && confidentialBalance !== undefined) {
        setAmount(formattedConfidentialBalance.replace(/,/g, ""));
      }
    }
  };

  const activePairDetails = KNOWN_TOKEN_PAIRS.find(
    (p) => p.tokenAddress === state.selectedPair?.tokenAddress
  );

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800/50 bg-slate-900/30 p-12 text-center">
        <Coins className="mb-4 h-12 w-12 text-slate-600 animate-pulse" />
        <p className="text-sm font-medium text-slate-300">Wallet Disconnected</p>
        <p className="mt-1 text-xs text-slate-500">Connect your wallet to shield or unshield tokens</p>
      </div>
    );
  }

  return (
    <div id="wrap-form" className="animate-fade-in mx-auto max-w-lg space-y-6">
      {/* Mode Tabs */}
      <div className="flex rounded-xl border border-slate-800/50 bg-slate-900/30 p-1">
        {(["shield", "unshield"] as const).map((mode) => (
          <button
            key={mode}
            id={`wrap-tab-${mode}`}
            type="button"
            onClick={() => setMode(mode)}
            disabled={isLoading}
            className={cn(
              "flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200",
              state.mode === mode
                ? "bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-lg shadow-violet-500/20"
                : "text-slate-400 hover:text-slate-200 disabled:opacity-40"
            )}
          >
            {mode === "shield" ? "Shield (Wrap)" : "Unshield (Unwrap)"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Token Selector */}
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
            Select Token Pair
          </label>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {KNOWN_TOKEN_PAIRS.map((pair) => (
              <button
                key={pair.tokenAddress}
                type="button"
                disabled={isLoading}
                onClick={() =>
                  selectPair({
                    tokenAddress: pair.tokenAddress,
                    confidentialTokenAddress: pair.confidentialTokenAddress,
                    isValid: pair.isValid,
                    decimals: pair.decimals,
                  })
                }
                className={cn(
                  "w-full rounded-xl border p-3.5 text-left transition-all duration-200",
                  state.selectedPair?.tokenAddress === pair.tokenAddress
                    ? "border-violet-500/50 bg-violet-500/10 shadow-[0_0_12px_rgba(139,92,246,0.05)]"
                    : "border-slate-800/50 bg-slate-900/30 hover:border-slate-700/50 hover:bg-slate-900/50 disabled:opacity-40"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-200">
                      {pair.name}
                    </span>
                    <span className="rounded bg-slate-800/50 px-2 py-0.5 font-mono text-[10px] font-medium text-violet-400">
                      {pair.symbol}
                    </span>
                    <ArrowRight className="h-3 w-3 text-slate-600" />
                    <span className="rounded bg-slate-800/50 px-2 py-0.5 font-mono text-[10px] font-medium text-cyan-400">
                      c{pair.symbol.replace("Mock", "")}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs text-slate-500 block">
                      {truncateAddress(pair.tokenAddress)}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="wrap-amount"
              className="text-xs font-medium uppercase tracking-wider text-slate-500"
            >
              Amount
            </label>
            {state.selectedPair && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">
                  {state.mode === "shield" ? "ERC-20 Bal:" : "cToken Bal:"}
                </span>
                <span className="font-mono font-medium text-slate-300">
                  {state.mode === "shield" ? (
                    formattedErc20Balance
                  ) : isAllowed ? (
                    formattedConfidentialBalance
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Lock className="h-2.5 w-2.5" /> Encrypted
                    </span>
                  )}
                </span>
                {((state.mode === "shield" && erc20Balance !== undefined) ||
                  (state.mode === "unshield" && isAllowed && confidentialBalance !== undefined)) && (
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={handleMax}
                    className="font-bold text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    (Max)
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="relative">
            <input
              id="wrap-amount"
              type="text"
              inputMode="decimal"
              placeholder="0.0"
              value={state.amount}
              disabled={isLoading}
              onChange={(e) => setAmount(e.target.value)}
              className={cn(
                "w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3.5 pr-20",
                "text-lg font-mono font-semibold text-slate-100 placeholder:text-slate-700",
                "transition-all focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/10",
                "disabled:opacity-40 disabled:cursor-not-allowed"
              )}
            />
            {state.selectedPair && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-sm font-bold text-slate-400">
                {state.mode === "shield"
                  ? activePairDetails?.symbol
                  : `c${activePairDetails?.symbol.replace("Mock", "")}`}
              </span>
            )}
          </div>
        </div>

        {/* Confidential Decryption Status Card */}
        {state.selectedPair && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/20 px-4 py-3 flex items-center justify-between transition-colors">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Decryption Session:</span>
              {!isAllowed ? (
                <span className="flex items-center gap-1 text-[11px] text-amber-500 font-medium bg-amber-500/10 rounded px-2 py-0.5">
                  <Lock className="h-3 w-3" /> Locked
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium bg-emerald-400/10 rounded px-2 py-0.5">
                  <Unlock className="h-3 w-3" /> Unlocked
                </span>
              )}
            </div>
            {!isAllowed && (
              <button
                type="button"
                disabled={decryptLoading || isLoading}
                onClick={decryptConfidentialBalance}
                className={cn(
                  "rounded-lg bg-violet-600/20 hover:bg-violet-600/35 px-3 py-1 text-xs font-semibold text-violet-300 transition-colors border border-violet-500/20",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {decryptLoading ? "Authorizing..." : "Decrypt Balance"}
              </button>
            )}
          </div>
        )}

        {/* Decrypt Error Message */}
        {decryptError && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Decryption failed:</span> {decryptError}
            </div>
          </div>
        )}

        {/* Transaction Step Indicators */}
        {state.phase !== "idle" && state.phase !== "error" && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4 space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 border-b border-slate-800/80 pb-2">
              <span>Transaction Progress</span>
              <span className="capitalize text-violet-400">{state.phase}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {state.mode === "shield" ? (
                <>
                  {/* Step 1: Approve */}
                  <div className="flex items-start gap-2.5">
                    <div
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300",
                        state.phase === "approving"
                          ? "bg-violet-500/20 text-violet-400 border border-violet-500/40 animate-pulse"
                          : state.phase === "wrapping" || state.phase === "complete"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-slate-800 text-slate-600"
                      )}
                    >
                      {state.phase === "wrapping" || state.phase === "complete" ? "✓" : "1"}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-200">1. Approve ERC-20</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Authorize wrapper</p>
                    </div>
                  </div>

                  {/* Step 2: Shield */}
                  <div className="flex items-start gap-2.5">
                    <div
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300",
                        state.phase === "wrapping"
                          ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 animate-pulse"
                          : state.phase === "complete"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-slate-800 text-slate-600"
                      )}
                    >
                      {state.phase === "complete" ? "✓" : "2"}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-200">2. Shield (Wrap)</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Encrypt on-chain</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Step 1: Unwrap */}
                  <div className="flex items-start gap-2.5">
                    <div
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300",
                        state.phase === "unwrapping"
                          ? "bg-violet-500/20 text-violet-400 border border-violet-500/40 animate-pulse"
                          : state.phase === "finalizing" || state.phase === "complete"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-slate-800 text-slate-600"
                      )}
                    >
                      {state.phase === "finalizing" || state.phase === "complete" ? "✓" : "1"}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-200">1. Unwrap Request</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Initiate withdrawal</p>
                    </div>
                  </div>

                  {/* Step 2: Finalize */}
                  <div className="flex items-start gap-2.5">
                    <div
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300",
                        state.phase === "finalizing"
                          ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 animate-pulse"
                          : state.phase === "complete"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-slate-800 text-slate-600"
                      )}
                    >
                      {state.phase === "complete" ? "✓" : "2"}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-200">2. Finalize</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Reclaim public tokens</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          id="wrap-submit"
          type="submit"
          disabled={!state.selectedPair || !state.amount || isLoading}
          className={cn(
            "w-full rounded-xl py-4 text-sm font-semibold transition-all duration-200",
            "bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-lg shadow-violet-600/10",
            "hover:from-violet-500 hover:to-cyan-500 hover:shadow-violet-500/20 hover:scale-[1.01]",
            "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none"
          )}
        >
          {state.phase === "idle"
            ? state.mode === "shield"
              ? "Shield Tokens"
              : "Unshield Tokens"
            : state.phase === "approving"
            ? "Approving ERC-20..."
            : state.phase === "wrapping"
            ? "Shielding Tokens..."
            : state.phase === "unwrapping"
            ? "Unwrapping Tokens..."
            : state.phase === "finalizing"
            ? "Finalizing Withdrawal..."
            : state.phase === "complete"
            ? "Complete!"
            : "Error"}
        </button>
      </form>

      {/* Transaction Link */}
      {state.txHash && (
        <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/20 px-4 py-3.5 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 font-mono">
            <span>Tx Hash:</span>
            <span>{truncateAddress(state.txHash, 8)}</span>
          </div>
          <a
            href={`https://sepolia.etherscan.io/tx/${state.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-violet-400 hover:text-violet-300 transition-colors"
          >
            <span>View Etherscan</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}

      {/* Error Banner */}
      {state.phase === "error" && state.error && (
        <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-400 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block mb-0.5">Operation failed</span>
            <p className="text-slate-300 text-xs">{state.error}</p>
            <button
              onClick={reset}
              className="mt-3 text-xs font-semibold text-red-300 underline hover:text-red-200 block"
            >
              Reset & Try again
            </button>
          </div>
        </div>
      )}

      {/* Success Banner */}
      {state.phase === "complete" && (
        <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm text-emerald-400 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block mb-0.5">Transaction Successful</span>
            <p className="text-slate-300 text-xs">
              Your transaction has been processed on-chain.
            </p>
            <button
              onClick={reset}
              className="mt-3 text-xs font-semibold text-emerald-300 underline hover:text-emerald-200 block"
            >
              Start new operation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
