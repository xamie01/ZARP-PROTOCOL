"use client";

import { useState } from "react";
import { Wallet, Lock, Check, RefreshCw, MousePointer, PenLine, Eye } from "lucide-react";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import ScrollReveal from "@/components/ScrollReveal";
import { useDecrypt } from "@/hooks/useDecrypt";
import { WRAPPER_PAIRS } from "@/lib/registry-data";

const CONFIDENTIAL_TOKENS = WRAPPER_PAIRS.map((p) => ({
  symbol: p.erc7984.symbol,
  address: p.erc7984.address,
}));

function formatBalance(val: bigint, decimals = 18) {
  const divisor = 10n ** BigInt(decimals);
  const whole = val / divisor;
  const frac = val % divisor;
  const fracStr = frac.toString().padStart(decimals, "0").slice(0, 2);
  return `${whole}.${fracStr}`;
}

export default function DecryptPage() {
  const [selectedToken, setSelectedToken] = useState<number | null>(null);
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { decrypt, decryptedValue, step, isLoading, error, reset } = useDecrypt();

  const handleDecrypt = async () => {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }
    if (selectedToken === null) return;
    const token = CONFIDENTIAL_TOKENS[selectedToken];
    await decrypt(token.address as `0x${string}`);
  };

  const handleSelect = (i: number) => {
    setSelectedToken(i);
    reset();
  };

  return (
    <div className="min-h-screen pt-16">
      {/* Header */}
      <div className="text-center px-6 pt-28 pb-8">
        <span className="text-xs font-medium text-[#FFD100] uppercase tracking-[0.1em]">
          BALANCE DECRYPTION
        </span>
        <h1 className="text-[40px] font-semibold text-[#1A1D20] tracking-tight mt-2">
          Decrypt Balance
        </h1>
        <p className="text-base text-[#656B73] mt-3 max-w-[520px] mx-auto leading-relaxed">
          Reveal your confidential token balance using EIP-712 signatures. Your balance stays private to you.
        </p>
      </div>

      <div className="max-w-[480px] mx-auto px-6 pb-20">
        <ScrollReveal>
          <div className="bg-white border border-[#E5E7E9] rounded-xl shadow-sm overflow-hidden">
            {/* Wallet Status */}
            {!isConnected ? (
              <div className="px-6 py-8 border-b border-[#F3F4F5] text-center">
                <Wallet className="w-12 h-12 text-[#CDD0D4] mx-auto" strokeWidth={1.5} />
                <h3 className="text-xl font-semibold text-[#4D535A] mt-4">Wallet Disconnected</h3>
                <p className="text-sm text-[#A7ACB3] mt-1">
                  Connect your wallet to decrypt confidential balances
                </p>
                <button onClick={openConnectModal} className="btn-primary mt-4 w-full">
                  Connect Wallet
                </button>
              </div>
            ) : (
              <div className="px-6 py-4 border-b border-[#F3F4F5] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-[#4D535A]" />
                  <span className="font-mono text-xs text-[#4D535A]">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#2ECC71]" />
                  <span className="text-xs text-[#A7ACB3]">Connected</span>
                </div>
              </div>
            )}

            {/* Info Banner */}
            <div className="px-6 py-3 bg-[rgba(0,180,216,0.08)] border-b border-[rgba(0,180,216,0.15)] flex items-center gap-3">
              <Lock className="w-4 h-4 text-[#00B4D8] flex-shrink-0" />
              <p className="text-sm text-[#00B4D8]">
                You will sign a message with your wallet. No transaction fee required.
              </p>
            </div>

            {/* Token Selection */}
            <div className="px-6 py-5">
              <label className="text-xs text-[#A7ACB3] uppercase tracking-wider">
                Select Confidential Token
              </label>
              <div className="flex flex-col gap-2 mt-3">
                {CONFIDENTIAL_TOKENS.map((token, i) => (
                  <button
                    key={token.symbol}
                    onClick={() => handleSelect(i)}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg border text-left transition-all ${
                      selectedToken === i
                        ? "border-[#FFD100] border-l-[3px] bg-[rgba(255,209,0,0.04)]"
                        : "border-[#E5E7E9] bg-[#FAFBFC] hover:border-[#FFD100]/50 hover:bg-[rgba(255,209,0,0.02)]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5D5FEF] to-[#5D5FEF]/60 flex items-center justify-center text-[11px] font-bold text-white">
                        {token.symbol[1] || token.symbol[0]}
                      </span>
                      <div>
                        <span className="text-sm font-medium text-[#1A1D20]">{token.symbol}</span>
                        <span className="ml-2 bg-[rgba(93,95,239,0.15)] text-[#5D5FEF] text-[10px] font-medium px-2 py-0.5 rounded-full">
                          Confidential
                        </span>
                      </div>
                    </div>
                    {selectedToken === i && <Check className="w-4 h-4 text-[#2ECC71]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Decrypt Action */}
            <div className="px-6 py-5 border-t border-[#F3F4F5]">
              <button
                onClick={handleDecrypt}
                disabled={isConnected && selectedToken === null}
                className={`w-full py-3 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                  isConnected && selectedToken === null
                    ? "bg-[#F3F4F5] text-[#878D95] cursor-not-allowed"
                    : "btn-yellow"
                }`}
              >
                {isLoading && (
                  <span className="w-4 h-4 border-2 border-[#FFD100] border-t-transparent rounded-full animate-spin-loader" />
                )}
                {isLoading
                  ? step === "signing"
                    ? "Sign in wallet..."
                    : step === "polling"
                    ? "Decrypting..."
                    : "Submitting..."
                  : !isConnected
                  ? "Connect Wallet"
                  : "Decrypt Balance"}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="px-6 py-4 bg-[rgba(231,76,60,0.08)] border-t border-[rgba(231,76,60,0.15)]">
                <p className="text-sm text-[#E74C3C]">{error}</p>
              </div>
            )}

            {/* Result Display */}
            {decryptedValue !== null && selectedToken !== null && (
              <div className="px-6 py-6 bg-[#FAFBFC] border-t border-[#F3F4F5]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-gradient-to-br from-[#5D5FEF] to-[#5D5FEF]/60 flex items-center justify-center text-[9px] font-bold text-white">
                    {CONFIDENTIAL_TOKENS[selectedToken]?.symbol[1] || CONFIDENTIAL_TOKENS[selectedToken]?.symbol[0]}
                  </span>
                  <span className="text-lg font-semibold text-[#1A1D20]">
                    {CONFIDENTIAL_TOKENS[selectedToken]?.symbol}
                  </span>
                </div>
                <p className="text-display-s text-[#1A1D20] mt-2">
                  {formatBalance(decryptedValue)}
                </p>
                <p className="text-xs text-[#A7ACB3] mt-1">Decrypted Balance</p>
                <div className="flex items-center gap-2 mt-3 text-[#A7ACB3]">
                  <Lock className="w-3.5 h-3.5" />
                  <span className="text-xs">Encrypted on-chain</span>
                </div>
                <button
                  onClick={handleDecrypt}
                  className="text-xs font-medium text-[#FFD100] mt-3 flex items-center gap-1 hover:underline"
                >
                  <RefreshCw className="w-3 h-3" /> Refresh
                </button>
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* How Decryption Works */}
        <div className="mt-16">
          <ScrollReveal>
            <div className="text-center mb-10">
              <span className="text-xs font-medium text-[#FFD100] uppercase tracking-[0.1em]">HOW IT WORKS</span>
              <h2 className="text-[32px] font-semibold text-[#1A1D20] tracking-tight mt-2">
                Decryption Process
              </h2>
            </div>
          </ScrollReveal>
          <div className="flex flex-col md:flex-row gap-6 md:gap-4 items-center justify-center">
            {[
              {
                icon: MousePointer,
                bg: "bg-[#FFD100]",
                title: "Select Token",
                desc: "Choose a confidential token to decrypt.",
              },
              {
                icon: PenLine,
                bg: "bg-[#5D5FEF]",
                title: "Authorize",
                desc: "Sign a one-time EIP-712 message with your wallet. No gas fees.",
              },
              {
                icon: Eye,
                bg: "bg-[#00B4D8]",
                title: "View Balance",
                desc: "Your encrypted balance is decrypted client-side. Only you see it.",
              },
            ].map((s, i) => (
              <ScrollReveal key={s.title} delay={i * 150}>
                <div className="flex flex-col items-center text-center max-w-[200px]">
                  <div className={`w-12 h-12 rounded-full ${s.bg} flex items-center justify-center text-white`}>
                    <s.icon className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <h4 className="text-lg font-semibold text-[#1A1D20] mt-4">{s.title}</h4>
                  <p className="text-sm text-[#656B73] mt-1 leading-relaxed">{s.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
