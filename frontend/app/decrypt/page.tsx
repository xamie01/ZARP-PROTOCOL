"use client";

import { useMemo, useState } from "react";
import { Wallet, Lock, Check, RefreshCw, MousePointer, PenLine, Eye } from "lucide-react";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { isAddress, type Address } from "viem";
import ScrollReveal from "@/components/ScrollReveal";
import { useDecrypt } from "@/hooks/useDecrypt";
import { useChainPairs } from "@/hooks/useChainPairs";

/** Default decimals assumed for arbitrary (non-registry) ERC-7984 tokens. */
const DEFAULT_ERC7984_DECIMALS = 18;

function formatBalance(val: bigint, decimals = 18) {
  const divisor = 10n ** BigInt(decimals);
  const whole = val / divisor;
  const frac = val % divisor;
  const fracStr = frac.toString().padStart(decimals, "0").slice(0, 2);
  return `${whole}.${fracStr}`;
}

export default function DecryptPage() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { pairs } = useChainPairs();
  const { decrypt, decryptedValue, step, isLoading, error, tokenAddress } = useDecrypt();

  /* Confidential tokens for the connected chain, from the registry. */
  const confidentialTokens = useMemo(
    () => pairs.map((p) => ({ symbol: p.erc7984.symbol, address: p.erc7984.address, decimals: p.erc7984.decimals })),
    [pairs]
  );

  const [selectedToken, setSelectedToken] = useState<number | null>(null);
  const [customAddress, setCustomAddress] = useState("");

  const customValid = isAddress(customAddress);
  /* Decimals for the result: known pair's decimals, else default for pasted token. */
  const activeDecimals =
    selectedToken !== null
      ? confidentialTokens[selectedToken]?.decimals ?? DEFAULT_ERC7984_DECIMALS
      : DEFAULT_ERC7984_DECIMALS;
  const activeSymbol =
    selectedToken !== null ? confidentialTokens[selectedToken]?.symbol : "Custom token";

  const decryptKnown = async (i: number) => {
    setSelectedToken(i);
    setCustomAddress("");
    await decrypt(confidentialTokens[i].address as Address);
  };

  const decryptCustom = async () => {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }
    if (!customValid) return;
    setSelectedToken(null);
    await decrypt(customAddress as Address);
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
          Reveal your confidential balance for any ERC-7984 token using EIP-712 signatures.
          Your balance stays private to you.
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

            {/* Paste any ERC-7984 address */}
            <div className="px-6 py-5 border-b border-[#F3F4F5]">
              <label className="text-xs text-[#A7ACB3] uppercase tracking-wider">
                Decrypt any ERC-7984 token
              </label>
              <div className="flex gap-2 mt-3">
                <input
                  type="text"
                  spellCheck={false}
                  placeholder="0x… confidential token address"
                  value={customAddress}
                  onChange={(e) => setCustomAddress(e.target.value.trim())}
                  className="flex-1 h-11 px-3 border-[1.5px] border-[#CDD0D4] rounded-lg bg-white text-[#1A1D20] font-mono text-xs focus:border-[#FFD100] focus:shadow-[0_0_0_3px_rgba(255,209,0,0.2)] outline-none transition-all"
                />
                <button
                  onClick={decryptCustom}
                  disabled={isConnected && (!customValid || isLoading)}
                  className={`px-4 rounded-lg text-sm font-semibold transition-all ${
                    isConnected && (!customValid || isLoading)
                      ? "bg-[#F3F4F5] text-[#878D95] cursor-not-allowed"
                      : "btn-yellow"
                  }`}
                >
                  Decrypt
                </button>
              </div>
              {customAddress.length > 0 && !customValid && (
                <p className="text-xs text-[#E74C3C] mt-1.5">Enter a valid 0x address.</p>
              )}
              <p className="text-[11px] text-[#A7ACB3] mt-1.5">
                Balances of non-registry tokens are shown assuming {DEFAULT_ERC7984_DECIMALS} decimals.
              </p>
            </div>

            {/* Registry Token Selection */}
            <div className="px-6 py-5">
              <label className="text-xs text-[#A7ACB3] uppercase tracking-wider">
                Or pick a registry token
              </label>
              <div className="flex flex-col gap-2 mt-3">
                {confidentialTokens.length === 0 && (
                  <p className="text-sm text-[#A7ACB3] py-4 text-center">
                    No registry tokens on this network. Paste an address above.
                  </p>
                )}
                {confidentialTokens.map((token, i) => (
                  <button
                    key={token.address}
                    onClick={() => decryptKnown(i)}
                    disabled={isLoading}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg border text-left transition-all disabled:opacity-50 ${
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

            {/* Loading state */}
            {isLoading && (
              <div className="px-6 py-4 border-t border-[#F3F4F5] flex items-center justify-center gap-2 text-sm text-[#4D535A]">
                <span className="w-4 h-4 border-2 border-[#FFD100] border-t-transparent rounded-full animate-spin-loader" />
                {step === "signing" ? "Sign in wallet..." : step === "polling" ? "Decrypting..." : "Submitting..."}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="px-6 py-4 bg-[rgba(231,76,60,0.08)] border-t border-[rgba(231,76,60,0.15)] flex flex-col gap-2">
                <p className="text-sm text-[#E74C3C]">{error}</p>
                {!isLoading && (
                  <button
                    onClick={() => {
                      if (selectedToken !== null) {
                        decryptKnown(selectedToken);
                      } else if (tokenAddress) {
                        decrypt(tokenAddress);
                      }
                    }}
                    className="self-start text-xs font-semibold bg-[#E74C3C] text-white hover:bg-[#C0392B] rounded px-3 py-1.5 transition-all"
                  >
                    Retry Decryption
                  </button>
                )}
              </div>
            )}

            {/* Result Display */}
            {decryptedValue !== null && (
              <div className="px-6 py-6 bg-[#FAFBFC] border-t border-[#F3F4F5]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-gradient-to-br from-[#5D5FEF] to-[#5D5FEF]/60 flex items-center justify-center text-[9px] font-bold text-white">
                    {(activeSymbol || "C")[1] || (activeSymbol || "C")[0]}
                  </span>
                  <span className="text-lg font-semibold text-[#1A1D20]">{activeSymbol}</span>
                </div>
                <p className="text-display-s text-[#1A1D20] mt-2">
                  {formatBalance(decryptedValue, activeDecimals)}
                </p>
                <p className="text-xs text-[#A7ACB3] mt-1">Decrypted Balance</p>
                {tokenAddress && (
                  <p className="font-mono text-[10px] text-[#A7ACB3] mt-2">
                    {tokenAddress.slice(0, 10)}...{tokenAddress.slice(-6)}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-3 text-[#A7ACB3]">
                  <Lock className="w-3.5 h-3.5" />
                  <span className="text-xs">Encrypted on-chain</span>
                </div>
                <button
                  onClick={() =>
                    selectedToken !== null
                      ? decryptKnown(selectedToken)
                      : tokenAddress && decrypt(tokenAddress)
                  }
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
              { icon: MousePointer, bg: "bg-[#FFD100]", title: "Select Token", desc: "Pick a registry token or paste any ERC-7984 address." },
              { icon: PenLine, bg: "bg-[#5D5FEF]", title: "Authorize", desc: "Sign a one-time EIP-712 message with your wallet. No gas fees." },
              { icon: Eye, bg: "bg-[#00B4D8]", title: "View Balance", desc: "Your encrypted balance is decrypted client-side. Only you see it." },
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
