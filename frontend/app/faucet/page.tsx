"use client";

import { useState } from "react";
import { Wallet, AlertTriangle, Clock, Copy } from "lucide-react";
import { useAccount, useSwitchChain } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import ScrollReveal from "@/components/ScrollReveal";
import { useFaucet } from "@/hooks/useFaucet";
import { WRAPPER_PAIRS, SEPOLIA_CHAIN_ID } from "@/lib/registry-data";
import type { Address } from "viem";

const ERC20_TOKENS = WRAPPER_PAIRS.filter((p) => p.erc20.symbol.endsWith("Mock")).map((p) => ({
  symbol: p.erc20.symbol,
  address: p.erc20.address as Address,
  decimals: p.erc20.decimals,
}));

interface RequestRecord {
  id: string;
  symbol: string;
  amount: string;
  status: "pending" | "sent" | "failed";
}

function TokenFaucetButton({
  tokenIdx,
  selectedToken,
  isConnected,
  openConnectModal,
  onRequest,
  onStatusChange,
}: {
  tokenIdx: number;
  selectedToken: number | null;
  isConnected: boolean;
  openConnectModal: (() => void) | undefined;
  onRequest: (record: RequestRecord) => void;
  onStatusChange: (id: string, status: "sent" | "failed") => void;
}) {
  const token = ERC20_TOKENS[tokenIdx];
  const { request, isLoading, canRequest } = useFaucet(token.address, token.decimals);

  const handleRequest = async () => {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }
    const id = Math.random().toString(36).substring(7);
    onRequest({ id, symbol: token.symbol, amount: "1,000", status: "pending" });
    try {
      await request();
      onStatusChange(id, "sent");
    } catch {
      onStatusChange(id, "failed");
    }
  };

  if (selectedToken !== tokenIdx) return null;
  return (
    <button
      onClick={handleRequest}
      disabled={isConnected && !canRequest}
      className={`w-full py-3 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 mt-4 ${
        isConnected && !canRequest
          ? "bg-[#F3F4F5] text-[#878D95] cursor-not-allowed"
          : "btn-yellow"
      }`}
    >
      {isLoading && (
        <span className="w-4 h-4 border-2 border-[#FFD100] border-t-transparent rounded-full animate-spin-loader" />
      )}
      {!isConnected ? "Connect Wallet" : isLoading ? "Requesting..." : "Request Tokens"}
    </button>
  );
}

export default function FaucetPage() {
  const [selectedToken, setSelectedToken] = useState<number | null>(null);
  const [requestHistory, setRequestHistory] = useState<RequestRecord[]>([]);
  const { address, isConnected, chainId } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { switchChain } = useSwitchChain();

  const wrongNetwork = isConnected && chainId !== SEPOLIA_CHAIN_ID;

  const handleRequest = (record: RequestRecord) => {
    setRequestHistory((prev) => [record, ...prev].slice(0, 5));
  };

  const handleStatusChange = (id: string, status: "sent" | "failed") => {
    setRequestHistory((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  };

  return (
    <div className="min-h-screen pt-16">
      {/* Header */}
      <div className="text-center px-6 pt-28 pb-8">
        <span className="text-xs font-medium text-[#FFD100] uppercase tracking-[0.1em]">
          TESTNET FAUCET
        </span>
        <h1 className="text-[40px] font-semibold text-[#1A1D20] tracking-tight mt-2">
          Token Faucet
        </h1>
        <p className="text-base text-[#656B73] mt-3 max-w-[520px] mx-auto leading-relaxed">
          Request testnet tokens to try out the ZARP Protocol. Free tokens for Sepolia testnet.
        </p>
        <div className="mt-4 flex justify-center">
          <span className="inline-flex items-center bg-[#00B4D8] text-white text-xs font-medium px-4 py-1.5 rounded-full">
            Sepolia Testnet
          </span>
        </div>
      </div>

      <div className="max-w-[480px] mx-auto px-6 pb-20">
        <ScrollReveal>
          <div className="bg-white border border-[#E5E7E9] rounded-xl shadow-sm overflow-hidden">
            {/* Testnet Banner */}
            <div className="px-6 py-3 bg-[rgba(0,180,216,0.08)] border-b border-[rgba(0,180,216,0.15)] flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-[#00B4D8] flex-shrink-0" />
              <p className="text-sm text-[#00B4D8]">
                These are testnet tokens with no real value. For development and testing only.
              </p>
            </div>

            {/* Wrong-network guard */}
            {wrongNetwork && (
              <div className="px-6 py-3 bg-[rgba(243,156,18,0.08)] border-b border-[rgba(243,156,18,0.2)] flex items-center justify-between gap-3">
                <p className="text-sm text-[#B9770E] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  The faucet is Sepolia-only. Switch networks to continue.
                </p>
                <button
                  onClick={() => switchChain({ chainId: SEPOLIA_CHAIN_ID })}
                  className="shrink-0 rounded-lg border border-[#B9770E] px-3 py-1 text-xs font-semibold text-[#B9770E] hover:bg-[#B9770E] hover:text-white transition-colors"
                >
                  Switch to Sepolia
                </button>
              </div>
            )}

            {/* Wallet Status */}
            {!isConnected ? (
              <div className="px-6 py-8 border-b border-[#F3F4F5] text-center">
                <Wallet className="w-12 h-12 text-[#CDD0D4] mx-auto" strokeWidth={1.5} />
                <h3 className="text-xl font-semibold text-[#4D535A] mt-4">Wallet Disconnected</h3>
                <p className="text-sm text-[#A7ACB3] mt-1">Connect your wallet to request tokens</p>
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
              <label className="text-xs text-[#A7ACB3] uppercase tracking-wider">Select Token</label>
              <div className="grid grid-cols-2 gap-3 mt-3">
                {ERC20_TOKENS.map((token, i) => (
                  <button
                    key={token.symbol}
                    onClick={() => setSelectedToken(i)}
                    className={`flex flex-col items-center p-4 rounded-lg border text-center transition-all ${
                      selectedToken === i
                        ? "border-[#FFD100] border-l-[3px] bg-[rgba(255,209,0,0.04)]"
                        : "border-[#E5E7E9] bg-[#FAFBFC] hover:border-[#FFD100]/50"
                    }`}
                  >
                    <span className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FFD100] to-[#FFD100]/60 flex items-center justify-center text-[11px] font-bold text-black">
                      {token.symbol[0]}
                    </span>
                    <span className="text-sm font-medium text-[#1A1D20] mt-2">{token.symbol}</span>
                    <span className="text-[10px] text-[#A7ACB3]">ERC-20</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Request Action */}
            <div className="px-6 py-5 border-t border-[#F3F4F5]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#A7ACB3]">You will receive</span>
                <span className="text-base font-semibold text-[#1A1D20]">
                  1,000 {selectedToken !== null ? ERC20_TOKENS[selectedToken].symbol : "---"}
                </span>
              </div>
              <p className="text-xs text-[#A7ACB3] mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Limited to 1 request per token per 24 hours.
              </p>
              {selectedToken !== null && !wrongNetwork ? (
                <TokenFaucetButton
                  tokenIdx={selectedToken}
                  selectedToken={selectedToken}
                  isConnected={isConnected}
                  openConnectModal={openConnectModal}
                  onRequest={handleRequest}
                  onStatusChange={handleStatusChange}
                />
              ) : (
                <button
                  disabled
                  className="w-full py-3 rounded-lg text-sm font-semibold bg-[#F3F4F5] text-[#878D95] cursor-not-allowed mt-4"
                >
                  {!isConnected ? "Connect Wallet" : wrongNetwork ? "Switch to Sepolia" : "Select Token"}
                </button>
              )}
            </div>

            {/* Transaction History */}
            {requestHistory.length > 0 && (
              <div className="px-6 py-5 border-t border-[#F3F4F5]">
                <h4 className="text-lg font-semibold text-[#1A1D20] mb-3">Recent Requests</h4>
                <div className="flex flex-col gap-2">
                  {requestHistory.map((record) => (
                    <div key={record.id} className="flex items-center justify-between px-3 py-2.5 bg-[#FAFBFC] rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-gradient-to-br from-[#FFD100] to-[#FFD100]/60 flex items-center justify-center text-[8px] font-bold text-black">
                          {record.symbol[0]}
                        </span>
                        <span className="text-sm text-[#4D535A]">{record.symbol}</span>
                      </div>
                      <span className="font-mono text-xs text-[#656B73]">
                        {record.amount} {record.symbol}
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          record.status === "sent"
                            ? "bg-[#2ECC71]/10 text-[#2ECC71]"
                            : record.status === "pending"
                            ? "bg-[#F39C12]/10 text-[#F39C12]"
                            : "bg-[#E74C3C]/10 text-[#E74C3C]"
                        }`}
                      >
                        {record.status === "sent" ? "Sent" : record.status === "pending" ? "Pending" : "Failed"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* Available Tokens */}
        <div className="mt-12">
          <ScrollReveal>
            <div className="mb-6">
              <span className="text-xs font-medium text-[#FFD100] uppercase tracking-[0.1em]">AVAILABLE TOKENS</span>
              <h2 className="text-[32px] font-semibold text-[#1A1D20] tracking-tight mt-2">Faucet Tokens</h2>
              <p className="text-base text-[#656B73] mt-2">All tokens available through the Sepolia testnet faucet.</p>
            </div>
          </ScrollReveal>
          <ScrollReveal>
            <div className="card-default p-0 overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="bg-[#F3F4F5]">
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#A7ACB3] uppercase tracking-wider rounded-tl-xl">Token</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#A7ACB3] uppercase tracking-wider">Symbol</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#A7ACB3] uppercase tracking-wider">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#A7ACB3] uppercase tracking-wider rounded-tr-xl">Contract Address</th>
                  </tr>
                </thead>
                <tbody>
                  {ERC20_TOKENS.map((token) => (
                    <tr key={token.symbol} className="border-b border-[#F3F4F5] hover:bg-[rgba(255,209,0,0.04)] transition-colors">
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2 text-sm text-[#1A1D20]">
                          <span className="w-5 h-5 rounded-full bg-gradient-to-br from-[#FFD100] to-[#FFD100]/60 flex items-center justify-center text-[8px] font-bold text-black">
                            {token.symbol[0]}
                          </span>
                          {token.symbol}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-[#656B73]">{token.symbol}</td>
                      <td className="px-4 py-3">
                        <span className="bg-[#F3F4F5] text-[#4D535A] text-xs font-medium px-2.5 py-0.5 rounded-full">ERC-20</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-[#656B73]">
                        <span className="flex items-center relative">
                          {token.address.slice(0, 10)}...{token.address.slice(-6)}
                          <button
                            onClick={() => navigator.clipboard.writeText(token.address)}
                            className="text-[#A7ACB3] hover:text-[#FFD100] transition-colors ml-1"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
