"use client";

/**
 * @file components/DecryptFlow.tsx
 * @description Step wizard UI for the full EIP-712 balance decryption flow.
 *
 * Steps:
 *   1. Select Token  - choose a confidential ERC-7984 token
 *   2. Sign Request  - wallet EIP-712 signature prompt
 *   3. Submit        - send credentials to the Zama relayer
 *   4. Decrypting    - relayer computes the plaintext
 *   5. Result        - display the decrypted balance
 */

import React, { useState } from "react";
import { useAccount } from "wagmi";
import { useDecrypt, type DecryptStep } from "@/hooks/useDecrypt";
import { cn, truncateAddress, formatTokenAmount } from "@/lib/utils";
import { KNOWN_TOKEN_PAIRS } from "@/lib/registry-data";
import type { Address } from "viem";
import {
  Lock,
  Unlock,
  ShieldCheck,
  Eye,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Fingerprint,
  Radio,
  Sparkles,
} from "lucide-react";

/*************** Step Configuration ***************/

interface StepConfig {
  label: string;
  description: string;
  icon: React.ReactNode;
}

const STEP_CONFIG: Record<string, StepConfig> = {
  select: {
    label: "Select Token",
    description: "Choose a confidential token",
    icon: <ShieldCheck className="h-4 w-4" />,
  },
  signing: {
    label: "Sign Request",
    description: "Approve EIP-712 signature",
    icon: <Fingerprint className="h-4 w-4" />,
  },
  submitting: {
    label: "Submit",
    description: "Send to Zama relayer",
    icon: <Radio className="h-4 w-4" />,
  },
  polling: {
    label: "Decrypting",
    description: "Computing plaintext",
    icon: <Eye className="h-4 w-4" />,
  },
  result: {
    label: "Result",
    description: "Balance revealed",
    icon: <Unlock className="h-4 w-4" />,
  },
};

const ORDERED_STEPS = ["select", "signing", "submitting", "polling", "result"];

function getActiveIndex(step: DecryptStep): number {
  switch (step) {
    case "idle":
      return 0;
    case "signing":
      return 1;
    case "submitting":
      return 2;
    case "polling":
      return 3;
    case "success":
      return 4;
    case "error":
      return -1;
    default:
      return 0;
  }
}

/*************** Decrypt Flow Component ***************/

export function DecryptFlow() {
  const { isConnected } = useAccount();
  const {
    decrypt,
    signature,
    relayerJobId,
    decryptedValue,
    step,
    isLoading,
    error,
    tokenAddress,
    isAuthorized,
    reset,
  } = useDecrypt();

  const [selectedToken, setSelectedToken] = useState<Address | null>(null);
  const activeIndex = getActiveIndex(step);

  const handleDecrypt = async (addr: Address) => {
    setSelectedToken(addr);
    await decrypt(addr);
  };

  const handleRetry = () => {
    if (selectedToken) {
      handleDecrypt(selectedToken);
    } else {
      reset();
    }
  };

  const activePair = KNOWN_TOKEN_PAIRS.find(
    (p) => p.confidentialTokenAddress.toLowerCase() === (tokenAddress || selectedToken || "").toLowerCase()
  );

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800/50 bg-slate-900/30 p-12 text-center">
        <Lock className="mb-4 h-12 w-12 text-slate-600 animate-pulse" />
        <p className="text-sm font-medium text-slate-300">Wallet Disconnected</p>
        <p className="mt-1 text-xs text-slate-500">
          Connect your wallet to decrypt confidential balances
        </p>
      </div>
    );
  }

  return (
    <div id="decrypt-flow" className="animate-fade-in mx-auto max-w-lg space-y-6">
      {/* Step Progress Indicator */}
      <div className="rounded-xl border border-slate-800/40 bg-slate-900/10 p-4">
        <div className="flex items-center justify-between">
          {ORDERED_STEPS.map((key, i) => {
            const cfg = STEP_CONFIG[key];
            const isActive = i === activeIndex;
            const isComplete = i < activeIndex;

            return (
              <React.Fragment key={key}>
                {i > 0 && (
                  <div
                    className={cn(
                      "mx-1 h-px flex-1 transition-all duration-500",
                      isComplete ? "bg-emerald-500/60" : "bg-slate-800/60"
                    )}
                  />
                )}
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full border text-xs font-bold transition-all duration-500",
                      isActive
                        ? "border-violet-500/60 bg-violet-500/15 text-violet-400 shadow-[0_0_12px_rgba(139,92,246,0.15)] animate-pulse"
                        : isComplete
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                        : "border-slate-800/60 bg-slate-900/30 text-slate-600"
                    )}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      cfg.icon
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-medium transition-colors",
                      isActive
                        ? "text-violet-300"
                        : isComplete
                        ? "text-emerald-400"
                        : "text-slate-600"
                    )}
                  >
                    {cfg.label}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step 1: Token Selection */}
      {step === "idle" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="h-5 w-5 text-violet-400" />
            <h3 className="text-sm font-bold text-slate-200">
              Select a confidential token to decrypt
            </h3>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {KNOWN_TOKEN_PAIRS.map((pair) => (
              <button
                key={pair.confidentialTokenAddress}
                onClick={() => handleDecrypt(pair.confidentialTokenAddress)}
                disabled={isLoading}
                className={cn(
                  "w-full rounded-xl border border-slate-800/50 bg-slate-900/20 p-4 text-left transition-all duration-200",
                  "hover:border-violet-500/30 hover:bg-violet-500/5 hover:shadow-[0_0_20px_rgba(139,92,246,0.03)]",
                  "disabled:opacity-40 disabled:cursor-not-allowed"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600/10 border border-violet-500/10 text-violet-400 font-bold text-xs">
                      <Lock className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-slate-200">
                        {pair.name}
                      </span>
                      <span className="ml-2 rounded bg-slate-800/60 px-1.5 py-0.5 font-mono text-[10px] font-medium text-cyan-400">
                        c{pair.symbol.replace("Mock", "")}
                      </span>
                      <p className="mt-0.5 font-mono text-[10px] text-slate-500">
                        {truncateAddress(pair.confidentialTokenAddress, 6)}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-600" />
                </div>
              </button>
            ))}
          </div>

          {isAuthorized && (
            <div className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 px-3 py-2 text-xs text-emerald-400 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Session pre-authorized — decryptions will be silent
            </div>
          )}
        </div>
      )}

      {/* Step 2: Signing */}
      {step === "signing" && (
        <div className="flex flex-col items-center gap-5 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-8">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-2 border-violet-500/30 bg-violet-500/10 flex items-center justify-center">
              <Fingerprint className="h-8 w-8 text-violet-400" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-violet-600 flex items-center justify-center">
              <Loader2 className="h-3 w-3 text-white animate-spin" />
            </div>
          </div>
          <div className="text-center space-y-1.5">
            <p className="text-sm font-bold text-slate-200">
              Sign EIP-712 Request
            </p>
            <p className="text-xs text-slate-400 max-w-xs">
              Approve the typed data signature in your wallet.
              This authorizes the SDK to decrypt your confidential balance.
            </p>
          </div>
          {activePair && (
            <div className="flex items-center gap-2 rounded-lg bg-slate-900/40 border border-slate-800/50 px-3 py-1.5 text-xs text-slate-400 font-mono">
              <Lock className="h-3 w-3 text-violet-400" />
              c{activePair.symbol.replace("Mock", "")}
              <span className="text-slate-600">•</span>
              {truncateAddress(activePair.confidentialTokenAddress, 6)}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Submitting */}
      {step === "submitting" && (
        <div className="flex flex-col items-center gap-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-8">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-2 border-cyan-500/30 bg-cyan-500/10 flex items-center justify-center">
              <Radio className="h-8 w-8 text-cyan-400" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-cyan-600 flex items-center justify-center">
              <Loader2 className="h-3 w-3 text-white animate-spin" />
            </div>
          </div>
          <div className="text-center space-y-1.5">
            <p className="text-sm font-bold text-slate-200">
              Submitting to Relayer
            </p>
            <p className="text-xs text-slate-400 max-w-xs">
              Sending your signed credentials and encrypted handle to the Zama relayer network.
            </p>
          </div>
          {signature && (
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
              <CheckCircle2 className="h-3 w-3" />
              Signature acquired
            </div>
          )}
        </div>
      )}

      {/* Step 4: Polling / Decrypting */}
      {step === "polling" && (
        <div className="flex flex-col items-center gap-5 rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/5 p-8">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-2 border-fuchsia-500/30 bg-fuchsia-500/10 flex items-center justify-center animate-pulse">
              <Eye className="h-8 w-8 text-fuchsia-400" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-fuchsia-600 flex items-center justify-center">
              <Loader2 className="h-3 w-3 text-white animate-spin" />
            </div>
          </div>
          <div className="text-center space-y-1.5">
            <p className="text-sm font-bold text-slate-200">
              Decrypting Balance
            </p>
            <p className="text-xs text-slate-400 max-w-xs">
              The Zama KMS is computing the plaintext from your encrypted balance.
              This typically takes 5-15 seconds.
            </p>
          </div>

          {/* Animated progress dots */}
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-fuchsia-400"
                style={{
                  animation: `pulse 1.5s ease-in-out ${i * 0.3}s infinite`,
                }}
              />
            ))}
          </div>

          {relayerJobId && (
            <div className="text-[10px] text-slate-500 font-mono">
              Job: {relayerJobId}
            </div>
          )}
        </div>
      )}

      {/* Step 5: Success - Decrypted Result */}
      {step === "success" && decryptedValue !== null && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-emerald-500/30 bg-emerald-500/10">
              <Unlock className="h-8 w-8 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-emerald-500 mb-2">
                Decrypted Balance
              </p>
              <p className="text-4xl font-bold tracking-tight text-slate-100">
                {formatTokenAmount(decryptedValue, activePair?.decimals)}
              </p>
              {activePair && (
                <p className="mt-1 text-sm font-medium text-slate-400">
                  c{activePair.symbol.replace("Mock", "")}
                </p>
              )}
            </div>
            {tokenAddress && (
              <p className="font-mono text-[10px] text-slate-500">
                Token: {truncateAddress(tokenAddress, 8)}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={reset}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-800/60 bg-slate-900/20 py-3 text-xs font-semibold text-slate-300 transition-all",
                "hover:bg-slate-900/40 hover:border-slate-700/50"
              )}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Decrypt Another
            </button>
            <button
              onClick={() => selectedToken && handleDecrypt(selectedToken)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-violet-600/15 border border-violet-500/25 py-3 text-xs font-semibold text-violet-300 transition-all",
                "hover:bg-violet-600/25 hover:border-violet-500/40"
              )}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Refresh Balance
            </button>
          </div>
        </div>
      )}

      {/* Error State */}
      {step === "error" && error && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-red-300">
                  Decryption Failed
                </p>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                  {error}
                </p>
              </div>
            </div>

            {activePair && (
              <div className="rounded-lg bg-red-500/5 border border-red-500/10 px-3 py-2 text-[10px] text-slate-500 font-mono">
                Token: c{activePair.symbol.replace("Mock", "")} ({truncateAddress(activePair.confidentialTokenAddress, 6)})
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={reset}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-800/60 bg-slate-900/20 py-3 text-xs font-semibold text-slate-300 transition-all",
                "hover:bg-slate-900/40 hover:border-slate-700/50"
              )}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Go Back
            </button>
            <button
              onClick={handleRetry}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-red-600/15 border border-red-500/25 py-3 text-xs font-semibold text-red-300 transition-all",
                "hover:bg-red-600/25 hover:border-red-500/40"
              )}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Footer Authorization Status */}
      <div className="text-center">
        <div
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-medium",
            isAuthorized
              ? "border-emerald-500/15 bg-emerald-500/5 text-emerald-400"
              : "border-slate-800/40 bg-slate-900/10 text-slate-500"
          )}
        >
          {isAuthorized ? (
            <>
              <Sparkles className="h-3 w-3" />
              EIP-712 session active — silent decryption enabled
            </>
          ) : (
            <>
              <Lock className="h-3 w-3" />
              First decrypt requires a wallet signature
            </>
          )}
        </div>
      </div>
    </div>
  );
}
