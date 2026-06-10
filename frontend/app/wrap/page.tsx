"use client";

import { useState } from "react";
import { Wallet, Shield, Lock, ArrowUpDown, ChevronDown } from "lucide-react";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import ScrollReveal from "@/components/ScrollReveal";
import { useWrap } from "@/hooks/useWrap";
import { WRAPPER_PAIRS } from "@/lib/registry-data";

const ERC20_TOKENS = WRAPPER_PAIRS.map((p) => ({
  symbol: p.erc20.symbol,
  address: p.erc20.address,
  decimals: p.erc20.decimals,
  tokenAddress: p.erc20.address,
  confidentialTokenAddress: p.erc7984.address,
  chainId: p.chainId,
}));

const CONFIDENTIAL_TOKENS = WRAPPER_PAIRS.map((p) => ({
  symbol: p.erc7984.symbol,
  address: p.erc7984.address,
  decimals: p.erc7984.decimals,
  tokenAddress: p.erc20.address,
  confidentialTokenAddress: p.erc7984.address,
  chainId: p.chainId,
}));

export default function WrapPage() {
  const [activeTab, setActiveTab] = useState<"shield" | "unshield">("shield");
  const [tokenDropdownOpen, setTokenDropdownOpen] = useState(false);
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const {
    state,
    shield,
    unshield,
    setMode,
    setAmount,
    selectPair,
    formattedErc20Balance,
    formattedConfidentialBalance,
    isLoading,
  } = useWrap();

  const currentTokens = activeTab === "shield" ? ERC20_TOKENS : CONFIDENTIAL_TOKENS;
  const outputTokens = activeTab === "shield" ? CONFIDENTIAL_TOKENS : ERC20_TOKENS;
  const selectedIdx = state.selectedPair
    ? currentTokens.findIndex(
        (t) =>
          t.tokenAddress === state.selectedPair?.tokenAddress &&
          t.confidentialTokenAddress === state.selectedPair?.confidentialTokenAddress
      )
    : -1;
  const selectedTokenData = selectedIdx >= 0 ? currentTokens[selectedIdx] : null;
  const outputTokenData = selectedIdx >= 0 ? outputTokens[selectedIdx] : null;

  const handleTabChange = (tab: "shield" | "unshield") => {
    setActiveTab(tab);
    setMode(tab);
    selectPair(null as any);
  };

  const handleTokenSelect = (i: number) => {
    const token = currentTokens[i];
    selectPair({
      tokenAddress: token.tokenAddress as `0x${string}`,
      confidentialTokenAddress: token.confidentialTokenAddress as `0x${string}`,
      symbol: token.symbol,
      decimals: token.decimals,
      chainId: token.chainId,
    } as any);
    setTokenDropdownOpen(false);
  };

  const handleAction = async () => {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }
    if (!state.selectedPair || !state.amount) return;
    const amt = BigInt(Math.floor(parseFloat(state.amount) * 10 ** (state.selectedPair.decimals ?? 18)));
    if (activeTab === "shield") {
      await shield(amt);
    } else {
      await unshield(amt);
    }
  };

  const getButtonState = () => {
    if (!isConnected) return { text: "Connect Wallet", disabled: false };
    if (!state.selectedPair) return { text: "Select Token", disabled: true };
    if (!state.amount) return { text: "Enter Amount", disabled: true };
    if (isLoading)
      return {
        text: activeTab === "shield" ? "Shielding..." : "Unshielding...",
        disabled: true,
      };
    return {
      text: activeTab === "shield" ? "Shield Tokens" : "Unshield Tokens",
      disabled: false,
    };
  };

  const buttonState = getButtonState();
  const balance = activeTab === "shield" ? formattedErc20Balance : formattedConfidentialBalance;

  return (
    <div className="min-h-screen pt-16">
      {/* Header */}
      <div className="text-center px-6 pt-28 pb-8">
        <span className="text-xs font-medium text-[#FFD100] uppercase tracking-[0.1em]">
          SHIELD & UNSHIELD
        </span>
        <h1 className="text-[40px] font-semibold text-[#1A1D20] tracking-tight mt-2">
          Wrap Tokens
        </h1>
        <p className="text-base text-[#656B73] mt-3 max-w-[520px] mx-auto leading-relaxed">
          Convert public ERC-20 tokens to confidential ERC-7984 tokens (shield)
          or withdraw back to public (unshield).
        </p>
      </div>

      <div className="max-w-[480px] mx-auto px-6 pb-20">
        <ScrollReveal>
          <div className="bg-white border border-[#E5E7E9] rounded-xl shadow-sm overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-[#E5E7E9]">
              {(["shield", "unshield"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`flex-1 py-4 text-sm font-medium text-center transition-colors relative ${
                    activeTab === tab
                      ? "text-[#1A1D20] font-semibold"
                      : "text-[#A7ACB3] hover:text-[#4D535A]"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#FFD100] rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Wallet Status */}
            {!isConnected ? (
              <div className="px-6 py-8 border-b border-[#F3F4F5] text-center">
                <Wallet className="w-12 h-12 text-[#CDD0D4] mx-auto" strokeWidth={1.5} />
                <h3 className="text-xl font-semibold text-[#4D535A] mt-4">
                  Wallet Disconnected
                </h3>
                <p className="text-sm text-[#A7ACB3] mt-1">
                  Connect your wallet to shield or unshield tokens
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

            {/* Token Selection */}
            <div className="px-6 py-5">
              <label className="text-xs text-[#A7ACB3] uppercase tracking-wider">
                {activeTab === "shield" ? "From (Public)" : "From (Confidential)"}
              </label>
              <div className="relative mt-2">
                <button
                  onClick={() => setTokenDropdownOpen(!tokenDropdownOpen)}
                  className="w-full h-12 px-4 border-[1.5px] border-[#CDD0D4] rounded-lg bg-white text-left flex items-center justify-between focus:border-[#FFD100] outline-none transition-all hover:border-[#A7ACB3]"
                >
                  {selectedTokenData ? (
                    <span className="flex items-center gap-2 text-sm font-medium text-[#1A1D20]">
                      <span className="w-6 h-6 rounded-full bg-gradient-to-br from-[#FFD100] to-[#FFD100]/60 flex items-center justify-center text-[10px] font-bold text-black">
                        {selectedTokenData.symbol[0]}
                      </span>
                      {selectedTokenData.symbol}
                    </span>
                  ) : (
                    <span className="text-sm text-[#878D95]">Select token</span>
                  )}
                  <ChevronDown className="w-4 h-4 text-[#A7ACB3]" />
                </button>
                {tokenDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setTokenDropdownOpen(false)} />
                    <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-[#E5E7E9] rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto py-1">
                      {currentTokens.map((token, i) => (
                        <button
                          key={token.symbol}
                          onClick={() => handleTokenSelect(i)}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#F3F4F5] transition-colors flex items-center gap-2"
                        >
                          <span className="w-6 h-6 rounded-full bg-gradient-to-br from-[#FFD100] to-[#FFD100]/60 flex items-center justify-center text-[10px] font-bold text-black flex-shrink-0">
                            {token.symbol[0]}
                          </span>
                          <span className="text-[#1A1D20] font-medium">{token.symbol}</span>
                          <span className="text-[#A7ACB3] font-mono text-xs ml-auto">
                            {token.address.slice(0, 10)}...
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Amount Input */}
              <div className="relative mt-3">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0.0"
                  value={state.amount}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d*\.?\d*$/.test(val)) setAmount(val);
                  }}
                  className="w-full h-12 px-4 border-[1.5px] border-[#CDD0D4] rounded-lg bg-white text-[#1A1D20] text-base focus:border-[#FFD100] focus:shadow-[0_0_0_3px_rgba(255,209,0,0.2)] outline-none transition-all pr-16"
                />
                <button
                  onClick={() => setAmount(balance)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#FFD100] hover:underline"
                >
                  MAX
                </button>
              </div>
              <p className="text-xs text-[#A7ACB3] mt-1.5">Balance: {balance}</p>
            </div>

            {/* Direction Toggle */}
            <div className="flex justify-center -my-3 relative z-10">
              <button
                onClick={() => handleTabChange(activeTab === "shield" ? "unshield" : "shield")}
                className="w-10 h-10 rounded-full bg-white border-[1.5px] border-black flex items-center justify-center shadow-md hover:border-[#FFD100] hover:shadow-lg transition-all"
              >
                <ArrowUpDown className="w-5 h-5 text-[#4D535A]" />
              </button>
            </div>

            {/* Output Section */}
            <div className="px-6 py-5 bg-[#FAFBFC] border-t border-[#F3F4F5]">
              <label className={`text-xs uppercase tracking-wider ${activeTab === "shield" ? "text-[#5D5FEF]" : "text-[#A7ACB3]"}`}>
                {activeTab === "shield" ? "To (Confidential)" : "To (Public)"}
              </label>
              <div className="mt-2 flex items-center gap-3">
                {outputTokenData ? (
                  <>
                    <span className="w-6 h-6 rounded-full bg-gradient-to-br from-[#FFD100] to-[#FFD100]/60 flex items-center justify-center text-[10px] font-bold text-black">
                      {outputTokenData.symbol[0]}
                    </span>
                    <span className="text-lg font-semibold text-[#1A1D20]">{outputTokenData.symbol}</span>
                    {activeTab === "shield" && (
                      <span className="bg-[rgba(93,95,239,0.15)] text-[#5D5FEF] text-xs font-medium px-2.5 py-0.5 rounded-full">
                        Confidential
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-sm text-[#878D95]">—</span>
                )}
              </div>
              <p className="text-2xl font-semibold text-[#1A1D20] mt-2">{state.amount || "0.0"}</p>
              <p className="text-xs text-[#A7ACB3] mt-1">1:1 wrapping ratio</p>
            </div>

            {/* Error */}
            {state.error && (
              <div className="px-6 py-3 bg-[rgba(231,76,60,0.08)] border-t border-[rgba(231,76,60,0.15)]">
                <p className="text-sm text-[#E74C3C]">{state.error}</p>
              </div>
            )}

            {/* Action Button */}
            <div className="px-6 py-5 border-t border-[#F3F4F5]">
              <button
                onClick={handleAction}
                disabled={buttonState.disabled}
                className={`w-full py-3 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                  buttonState.disabled
                    ? "bg-[#F3F4F5] text-[#878D95] cursor-not-allowed"
                    : "btn-yellow"
                }`}
              >
                {isLoading && (
                  <span className="w-4 h-4 border-2 border-[#FFD100] border-t-transparent rounded-full animate-spin-loader" />
                )}
                {buttonState.text}
              </button>
              {activeTab === "unshield" && (
                <p className="text-xs text-[#A7ACB3] mt-3 text-center flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3" />
                  Two-phase withdrawal: The SDK handles both phases automatically.
                </p>
              )}
            </div>
          </div>
        </ScrollReveal>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <ScrollReveal delay={100}>
            <div className="card-default flex flex-col">
              <Shield className="w-6 h-6 text-[#FFD100]" strokeWidth={2} />
              <h4 className="text-lg font-semibold text-[#1A1D20] mt-3">Shield</h4>
              <p className="text-sm text-[#656B73] mt-1 leading-relaxed">
                Approve the wrapper, then deposit your ERC-20 tokens. They become encrypted (confidential).
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <div className="card-default flex flex-col">
              <Lock className="w-6 h-6 text-[#5D5FEF]" strokeWidth={2} />
              <h4 className="text-lg font-semibold text-[#1A1D20] mt-3">Unshield</h4>
              <p className="text-sm text-[#656B73] mt-1 leading-relaxed">
                Two-phase withdrawal. The SDK handles both phases automatically.
              </p>
            </div>
          </ScrollReveal>
        </div>

        {/* How It Works Steps */}
        <div className="mt-16">
          <ScrollReveal>
            <div className="text-center mb-8">
              <span className="text-xs font-medium text-[#FFD100] uppercase tracking-[0.1em]">HOW IT WORKS</span>
              <h2 className="text-[32px] font-semibold text-[#1A1D20] tracking-tight mt-2">Wrapping Process</h2>
            </div>
          </ScrollReveal>
          <div className="flex flex-col gap-6">
            {[
              {
                num: "01",
                title: "Approve the Wrapper",
                desc: "Grant the wrapper contract permission to move your ERC-20 tokens. This is a standard ERC-20 approval transaction.",
              },
              {
                num: "02",
                title: "Deposit Your Tokens",
                desc: "Send your ERC-20 tokens to the wrapper contract. The contract mints an equivalent amount of confidential ERC-7984 tokens to your address.",
              },
              {
                num: "03",
                title: "Your Balances Are Encrypted",
                desc: "Your confidential token balances are now encrypted on-chain. Only you can decrypt and view them using your wallet signature.",
              },
            ].map((step, i) => (
              <ScrollReveal key={step.num} delay={i * 100}>
                <div className="flex gap-4 items-start">
                  <span className="text-2xl font-semibold text-[#FFD100] w-10 flex-shrink-0">{step.num}</span>
                  <div>
                    <h4 className="text-lg font-semibold text-[#1A1D20]">{step.title}</h4>
                    <p className="text-base text-[#656B73] mt-1 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
