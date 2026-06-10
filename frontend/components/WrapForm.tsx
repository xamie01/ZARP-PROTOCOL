"use client";

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
    if (state.mode === "shield") {
      if (erc20Balance !== undefined) setAmount(formattedErc20Balance.replace(/,/g, ""));
    } else {
      if (isAllowed && confidentialBalance !== undefined)
        setAmount(formattedConfidentialBalance.replace(/,/g, ""));
    }
  };

  const activePairDetails = KNOWN_TOKEN_PAIRS.find(
    (p) => p.tokenAddress === state.selectedPair?.tokenAddress
  );

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#CDD0D4] bg-[#F8F9FA] p-12 text-center">
        <Coins className="mb-4 h-12 w-12 text-[#A7ACB3]" />
        <p className="text-sm font-semibold text-[#1A1D20]">Wallet not connected</p>
        <p className="mt-1 text-xs text-[#656B73]">Connect your wallet to shield or unshield tokens</p>
      </div>
    );
  }

  return (
    <div id="wrap-form" className="animate-fade-in mx-auto max-w-lg space-y-6">
      {/* Mode Tabs */}
      <div className="flex rounded-xl border border-[#E5E7E9] bg-[#F3F4F5] p-1">
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
                ? "bg-black text-white shadow-sm"
                : "text-[#4D535A] hover:text-black disabled:opacity-40"
            )}
          >
            {mode === "shield" ? "Shield (Wrap)" : "Unshield (Unwrap)"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Token Selector */}
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[#A7ACB3]">
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
                    ? "border-[#FFD100] bg-[#FFD100]/5 shadow-[0_0_0_1px_rgba(255,209,0,0.3)]"
                    : "border-[#E5E7E9] bg-white hover:border-[#CDD0D4] hover:bg-[#F8F9FA] disabled:opacity-40"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#1A1D20]">{pair.name}</span>
                    <span className="rounded bg-[#FFD100]/15 px-2 py-0.5 font-mono text-[10px] font-medium text-black">
                      {pair.symbol}
                    </span>
                    <ArrowRight className="h-3 w-3 text-[#A7ACB3]" />
                    <span className="rounded bg-[#5D5FEF]/10 px-2 py-0.5 font-mono text-[10px] font-medium text-[#5D5FEF]">
                      c{pair.symbol.replace("Mock", "")}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-[#A7ACB3]">
                    {truncateAddress(pair.tokenAddress)}
                  </span>
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
              className="text-xs font-medium uppercase tracking-wider text-[#A7ACB3]"
            >
              Amount
            </label>
            {state.selectedPair && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#A7ACB3]">
                  {state.mode === "shield" ? "ERC-20 Bal:" : "cToken Bal:"}
                </span>
                <span className="font-mono font-medium text-[#1A1D20]">
                  {state.mode === "shield" ? (
                    formattedErc20Balance
                  ) : isAllowed ? (
                    formattedConfidentialBalance
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] text-[#A7ACB3]">
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
                    className="font-bold text-[#FFD100] hover:text-black transition-colors"
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
                "w-full rounded-xl border border-[#E5E7E9] bg-white px-4 py-3.5 pr-20",
                "text-lg font-mono font-semibold text-[#1A1D20] placeholder:text-[#CDD0D4]",
                "transition-all focus:border-[#FFD100] focus:outline-none focus:ring-2 focus:ring-[#FFD100]/20",
                "disabled:opacity-40 disabled:cursor-not-allowed"
              )}
            />
            {state.selectedPair && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-sm font-bold text-[#4D535A]">
                {state.mode === "shield"
                  ? activePairDetails?.symbol
                  : `c${activePairDetails?.symbol.replace("Mock", "")}`}
              </span>
            )}
          </div>
        </div>

        {/* Confidential Decryption Status */}
        {state.selectedPair && (
          <div className="rounded-xl border border-[#E5E7E9] bg-[#F8F9FA] px-4 py-3 flex items-center justify-between transition-colors">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#A7ACB3]">Decryption Session:</span>
              {!isAllowed ? (
                <span className="flex items-center gap-1 text-[11px] text-amber-600 font-medium bg-amber-50 border border-amber-200 rounded px-2 py-0.5">
                  <Lock className="h-3 w-3" /> Locked
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] text-[#2ECC71] font-medium bg-[#2ECC71]/10 border border-[#2ECC71]/20 rounded px-2 py-0.5">
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
                  "rounded-lg border border-black bg-white px-3 py-1 text-xs font-semibold text-black transition-colors",
                  "hover:bg-black hover:text-white",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {decryptLoading ? "Authorizing..." : "Decrypt Balance"}
              </button>
            )}
          </div>
        )}

        {/* Decrypt Error */}
        {decryptError && (
          <div className="rounded-xl border border-[#E74C3C]/20 bg-[#E74C3C]/5 p-3 text-xs text-[#E74C3C] flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Decryption failed:</span> {decryptError}
            </div>
          </div>
        )}

        {/* Transaction Step Indicators */}
        {state.phase !== "idle" && state.phase !== "error" && (
          <div className="rounded-xl border border-[#E5E7E9] bg-white p-4 space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold text-[#A7ACB3] border-b border-[#F3F4F5] pb-2">
              <span>Transaction Progress</span>
              <span className="capitalize text-black">{state.phase}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {state.mode === "shield" ? (
                <>
                  <div className="flex items-start gap-2.5">
                    <div
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300",
                        state.phase === "approving"
                          ? "bg-[#FFD100] text-black animate-pulse"
                          : state.phase === "wrapping" || state.phase === "complete"
                          ? "bg-[#2ECC71]/15 text-[#2ECC71] border border-[#2ECC71]/30"
                          : "bg-[#F3F4F5] text-[#A7ACB3]"
                      )}
                    >
                      {state.phase === "wrapping" || state.phase === "complete" ? "✓" : "1"}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#1A1D20]">1. Approve ERC-20</p>
                      <p className="text-[10px] text-[#656B73] mt-0.5">Authorize wrapper</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300",
                        state.phase === "wrapping"
                          ? "bg-[#FFD100] text-black animate-pulse"
                          : state.phase === "complete"
                          ? "bg-[#2ECC71]/15 text-[#2ECC71] border border-[#2ECC71]/30"
                          : "bg-[#F3F4F5] text-[#A7ACB3]"
                      )}
                    >
                      {state.phase === "complete" ? "✓" : "2"}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#1A1D20]">2. Shield (Wrap)</p>
                      <p className="text-[10px] text-[#656B73] mt-0.5">Encrypt on-chain</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2.5">
                    <div
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300",
                        state.phase === "unwrapping"
                          ? "bg-[#FFD100] text-black animate-pulse"
                          : state.phase === "finalizing" || state.phase === "complete"
                          ? "bg-[#2ECC71]/15 text-[#2ECC71] border border-[#2ECC71]/30"
                          : "bg-[#F3F4F5] text-[#A7ACB3]"
                      )}
                    >
                      {state.phase === "finalizing" || state.phase === "complete" ? "✓" : "1"}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#1A1D20]">1. Unwrap Request</p>
                      <p className="text-[10px] text-[#656B73] mt-0.5">Initiate withdrawal</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300",
                        state.phase === "finalizing"
                          ? "bg-[#FFD100] text-black animate-pulse"
                          : state.phase === "complete"
                          ? "bg-[#2ECC71]/15 text-[#2ECC71] border border-[#2ECC71]/30"
                          : "bg-[#F3F4F5] text-[#A7ACB3]"
                      )}
                    >
                      {state.phase === "complete" ? "✓" : "2"}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#1A1D20]">2. Finalize</p>
                      <p className="text-[10px] text-[#656B73] mt-0.5">Reclaim public tokens</p>
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
            "btn-yellow w-full py-4 text-sm font-semibold",
            "disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:bg-[#FFD100] disabled:hover:text-black"
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
        <div className="flex items-center justify-between rounded-xl border border-[#E5E7E9] bg-[#F8F9FA] px-4 py-3.5 text-xs text-[#656B73]">
          <div className="flex items-center gap-1.5 font-mono">
            <span>Tx Hash:</span>
            <span>{truncateAddress(state.txHash, 8)}</span>
          </div>
          <a
            href={`https://sepolia.etherscan.io/tx/${state.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[#5D5FEF] hover:text-black transition-colors font-semibold"
          >
            <span>View Etherscan</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}

      {/* Error Banner */}
      {state.phase === "error" && state.error && (
        <div className="rounded-xl border border-[#E74C3C]/20 bg-[#E74C3C]/5 p-4 text-sm text-[#E74C3C] flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block mb-0.5">Operation failed</span>
            <p className="text-[#656B73] text-xs">{state.error}</p>
            <button
              onClick={reset}
              className="mt-3 text-xs font-semibold text-[#E74C3C] underline hover:text-black block"
            >
              Reset & Try again
            </button>
          </div>
        </div>
      )}

      {/* Success Banner */}
      {state.phase === "complete" && (
        <div className="rounded-xl border border-[#2ECC71]/20 bg-[#2ECC71]/5 p-4 text-sm text-[#2ECC71] flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block mb-0.5">Transaction Successful</span>
            <p className="text-[#656B73] text-xs">Your transaction has been processed on-chain.</p>
            <button
              onClick={reset}
              className="mt-3 text-xs font-semibold text-[#2ECC71] underline hover:text-black block"
            >
              Start new operation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
