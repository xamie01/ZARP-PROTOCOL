"use client";

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
    case "idle": return 0;
    case "signing": return 1;
    case "submitting": return 2;
    case "polling": return 3;
    case "success": return 4;
    case "error": return -1;
    default: return 0;
  }
}

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
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#CDD0D4] bg-[#F8F9FA] p-12 text-center">
        <Lock className="mb-4 h-12 w-12 text-[#A7ACB3]" />
        <p className="text-sm font-semibold text-[#1A1D20]">Wallet not connected</p>
        <p className="mt-1 text-xs text-[#656B73]">Connect your wallet to decrypt confidential balances</p>
      </div>
    );
  }

  return (
    <div id="decrypt-flow" className="animate-fade-in mx-auto max-w-lg space-y-6">
      {/* Step Progress Indicator */}
      <div className="rounded-xl border border-[#E5E7E9] bg-[#F8F9FA] p-4">
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
                      isComplete ? "bg-[#2ECC71]/60" : "bg-[#E5E7E9]"
                    )}
                  />
                )}
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full border text-xs font-bold transition-all duration-500",
                      isActive
                        ? "border-[#FFD100] bg-[#FFD100] text-black animate-pulse"
                        : isComplete
                        ? "border-[#2ECC71]/40 bg-[#2ECC71]/10 text-[#2ECC71]"
                        : "border-[#E5E7E9] bg-white text-[#A7ACB3]"
                    )}
                  >
                    {isComplete ? <CheckCircle2 className="h-4 w-4" /> : cfg.icon}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-medium transition-colors",
                      isActive ? "text-black" : isComplete ? "text-[#2ECC71]" : "text-[#A7ACB3]"
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
            <ShieldCheck className="h-5 w-5 text-[#FFD100]" />
            <h3 className="text-sm font-bold text-[#1A1D20]">
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
                  "w-full rounded-xl border border-[#E5E7E9] bg-white p-4 text-left transition-all duration-200",
                  "hover:border-[#FFD100]/60 hover:bg-[#FFD100]/5",
                  "disabled:opacity-40 disabled:cursor-not-allowed"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-[#FFD100] border border-black/10 font-bold text-xs">
                      <Lock className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-[#1A1D20]">{pair.name}</span>
                      <span className="ml-2 rounded bg-[#5D5FEF]/10 px-1.5 py-0.5 font-mono text-[10px] font-medium text-[#5D5FEF]">
                        c{pair.symbol.replace("Mock", "")}
                      </span>
                      <p className="mt-0.5 font-mono text-[10px] text-[#A7ACB3]">
                        {truncateAddress(pair.confidentialTokenAddress, 6)}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-[#A7ACB3]" />
                </div>
              </button>
            ))}
          </div>

          {isAuthorized && (
            <div className="flex items-center justify-center gap-1.5 rounded-lg bg-[#2ECC71]/5 border border-[#2ECC71]/20 px-3 py-2 text-xs text-[#2ECC71] font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Session pre-authorized — decryptions will be silent
            </div>
          )}
        </div>
      )}

      {/* Step 2: Signing */}
      {step === "signing" && (
        <div className="flex flex-col items-center gap-5 rounded-2xl border border-[#FFD100]/30 bg-[#FFD100]/5 p-8">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-2 border-[#FFD100]/40 bg-[#FFD100]/10 flex items-center justify-center">
              <Fingerprint className="h-8 w-8 text-black" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-black flex items-center justify-center">
              <Loader2 className="h-3 w-3 text-[#FFD100] animate-spin" />
            </div>
          </div>
          <div className="text-center space-y-1.5">
            <p className="text-sm font-bold text-[#1A1D20]">Sign EIP-712 Request</p>
            <p className="text-xs text-[#656B73] max-w-xs">
              Approve the typed data signature in your wallet.
              This authorizes the SDK to decrypt your confidential balance.
            </p>
          </div>
          {activePair && (
            <div className="flex items-center gap-2 rounded-lg border border-[#E5E7E9] bg-white px-3 py-1.5 text-xs text-[#4D535A] font-mono">
              <Lock className="h-3 w-3 text-[#FFD100]" />
              c{activePair.symbol.replace("Mock", "")}
              <span className="text-[#CDD0D4]">•</span>
              {truncateAddress(activePair.confidentialTokenAddress, 6)}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Submitting */}
      {step === "submitting" && (
        <div className="flex flex-col items-center gap-5 rounded-2xl border border-[#00B4D8]/20 bg-[#00B4D8]/5 p-8">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-2 border-[#00B4D8]/30 bg-[#00B4D8]/10 flex items-center justify-center">
              <Radio className="h-8 w-8 text-[#00B4D8]" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-black flex items-center justify-center">
              <Loader2 className="h-3 w-3 text-[#FFD100] animate-spin" />
            </div>
          </div>
          <div className="text-center space-y-1.5">
            <p className="text-sm font-bold text-[#1A1D20]">Submitting to Relayer</p>
            <p className="text-xs text-[#656B73] max-w-xs">
              Sending your signed credentials and encrypted handle to the Zama relayer network.
            </p>
          </div>
          {signature && (
            <div className="flex items-center gap-1.5 text-[10px] text-[#2ECC71] font-medium">
              <CheckCircle2 className="h-3 w-3" />
              Signature acquired
            </div>
          )}
        </div>
      )}

      {/* Step 4: Polling */}
      {step === "polling" && (
        <div className="flex flex-col items-center gap-5 rounded-2xl border border-[#5D5FEF]/20 bg-[#5D5FEF]/5 p-8">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-2 border-[#5D5FEF]/30 bg-[#5D5FEF]/10 flex items-center justify-center animate-pulse">
              <Eye className="h-8 w-8 text-[#5D5FEF]" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-black flex items-center justify-center">
              <Loader2 className="h-3 w-3 text-[#FFD100] animate-spin" />
            </div>
          </div>
          <div className="text-center space-y-1.5">
            <p className="text-sm font-bold text-[#1A1D20]">Decrypting Balance</p>
            <p className="text-xs text-[#656B73] max-w-xs">
              The Zama KMS is computing the plaintext from your encrypted balance.
              This typically takes 5–15 seconds.
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-[#FFD100]"
                style={{ animation: `pulse 1.5s ease-in-out ${i * 0.3}s infinite` }}
              />
            ))}
          </div>
          {relayerJobId && (
            <div className="text-[10px] text-[#A7ACB3] font-mono">Job: {relayerJobId}</div>
          )}
        </div>
      )}

      {/* Step 5: Success */}
      {step === "success" && decryptedValue !== null && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#2ECC71]/20 bg-[#2ECC71]/5 p-8 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#2ECC71]/30 bg-[#2ECC71]/10">
              <Unlock className="h-8 w-8 text-[#2ECC71]" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-[#2ECC71] mb-2">
                Decrypted Balance
              </p>
              <p className="text-4xl font-bold tracking-tight text-[#1A1D20]">
                {formatTokenAmount(decryptedValue, activePair?.decimals)}
              </p>
              {activePair && (
                <p className="mt-1 text-sm font-medium text-[#656B73]">
                  c{activePair.symbol.replace("Mock", "")}
                </p>
              )}
            </div>
            {tokenAddress && (
              <p className="font-mono text-[10px] text-[#A7ACB3]">
                Token: {truncateAddress(tokenAddress, 8)}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={reset}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-[#E5E7E9] bg-white py-3 text-xs font-semibold text-[#4D535A] transition-all hover:bg-[#F3F4F5] hover:border-[#CDD0D4]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Decrypt Another
            </button>
            <button
              onClick={() => selectedToken && handleDecrypt(selectedToken)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-black py-3 text-xs font-semibold text-[#FFD100] transition-all hover:bg-[#FFD100] hover:text-black"
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
          <div className="rounded-2xl border border-[#E74C3C]/20 bg-[#E74C3C]/5 p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E74C3C]/10 border border-[#E74C3C]/20">
                <AlertCircle className="h-5 w-5 text-[#E74C3C]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-[#E74C3C]">Decryption Failed</p>
                <p className="mt-1 text-xs text-[#656B73] leading-relaxed">{error}</p>
              </div>
            </div>
            {activePair && (
              <div className="rounded-lg border border-[#E5E7E9] bg-[#F8F9FA] px-3 py-2 text-[10px] text-[#A7ACB3] font-mono">
                Token: c{activePair.symbol.replace("Mock", "")} ({truncateAddress(activePair.confidentialTokenAddress, 6)})
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={reset}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-[#E5E7E9] bg-white py-3 text-xs font-semibold text-[#4D535A] transition-all hover:bg-[#F3F4F5]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Go Back
            </button>
            <button
              onClick={handleRetry}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#E74C3C]/10 border border-[#E74C3C]/20 py-3 text-xs font-semibold text-[#E74C3C] transition-all hover:bg-[#E74C3C]/20"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Authorization Status Footer */}
      <div className="text-center">
        <div
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-medium",
            isAuthorized
              ? "border-[#2ECC71]/20 bg-[#2ECC71]/5 text-[#2ECC71]"
              : "border-[#E5E7E9] bg-[#F8F9FA] text-[#A7ACB3]"
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
