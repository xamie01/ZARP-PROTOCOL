import { useState } from "react";
import {
  Wallet,
  AlertTriangle,
  Clock,
  Copy,
} from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { useWalletStore } from "@/hooks/useWalletStore";
import { useToastStore } from "@/hooks/useToastStore";
import { ERC20_TOKENS } from "@/data/tokens";

interface RequestRecord {
  id: string;
  symbol: string;
  amount: string;
  status: "pending" | "sent" | "failed";
  timestamp: Date;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="text-[#A7ACB3] hover:text-[#FFD100] transition-colors ml-1"
    >
      <Copy className="w-3.5 h-3.5" />
      {copied && (
        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-[#FFD100] text-black text-[10px] font-medium px-2 py-0.5 rounded">
          Copied!
        </span>
      )}
    </button>
  );
}

export default function Faucet() {
  const [selectedToken, setSelectedToken] = useState<number | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestHistory, setRequestHistory] = useState<RequestRecord[]>([]);
  const { isConnected, address, connect } = useWalletStore();
  const { success, error } = useToastStore();

  const handleRequest = async () => {
    if (!isConnected) {
      connect();
      return;
    }
    if (selectedToken === null) return;

    setIsRequesting(true);
    const record: RequestRecord = {
      id: Math.random().toString(36).substring(7),
      symbol: ERC20_TOKENS[selectedToken].symbol,
      amount: "1,000",
      status: "pending",
      timestamp: new Date(),
    };
    setRequestHistory((prev) => [record, ...prev].slice(0, 5));

    try {
      await new Promise((r) => setTimeout(r, 2500));
      setRequestHistory((prev) =>
        prev.map((r) => (r.id === record.id ? { ...r, status: "sent" as const } : r))
      );
      success(
        "Tokens Sent!",
        `1,000 ${ERC20_TOKENS[selectedToken].symbol} sent to your wallet`
      );
    } catch {
      setRequestHistory((prev) =>
        prev.map((r) => (r.id === record.id ? { ...r, status: "failed" as const } : r))
      );
      error("Request failed", "Please try again later");
    } finally {
      setIsRequesting(false);
    }
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
          Request testnet tokens to try out the ZARP Protocol. Free tokens for
          Sepolia testnet.
        </p>
        <div className="mt-4 flex justify-center">
          <span className="inline-flex items-center bg-[#00B4D8] text-white text-xs font-medium px-4 py-1.5 rounded-full">
            Sepolia Testnet
          </span>
        </div>
      </div>

      <div className="max-w-[480px] mx-auto px-6 pb-20">
        {/* Faucet Card */}
        <ScrollReveal>
          <div className="bg-white border border-[#E5E7E9] rounded-xl shadow-sm overflow-hidden">
            {/* Testnet Banner */}
            <div className="px-6 py-3 bg-[rgba(0,180,216,0.08)] border-b border-[rgba(0,180,216,0.15)] flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-[#00B4D8] flex-shrink-0" />
              <p className="text-sm text-[#00B4D8]">
                These are testnet tokens with no real value. For development and
                testing only.
              </p>
            </div>

            {/* Wallet Status */}
            {!isConnected ? (
              <div className="px-6 py-8 border-b border-[#F3F4F5] text-center">
                <Wallet className="w-12 h-12 text-[#CDD0D4] mx-auto" strokeWidth={1.5} />
                <h3 className="text-xl font-semibold text-[#4D535A] mt-4">
                  Wallet Disconnected
                </h3>
                <p className="text-sm text-[#A7ACB3] mt-1">
                  Connect your wallet to request tokens
                </p>
                <button onClick={connect} className="btn-primary mt-4 w-full">
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
                Select Token
              </label>
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
                    <span className="text-sm font-medium text-[#1A1D20] mt-2">
                      {token.symbol}
                    </span>
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
                  1,000{" "}
                  {selectedToken !== null
                    ? ERC20_TOKENS[selectedToken].symbol
                    : "---"}
                </span>
              </div>
              <p className="text-xs text-[#A7ACB3] mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Limited to 1 request per token per 24 hours.
              </p>
              <button
                onClick={handleRequest}
                disabled={isConnected && selectedToken === null}
                className={`w-full py-3 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 mt-4 ${
                  isConnected && selectedToken === null
                    ? "bg-[#F3F4F5] text-[#878D95] cursor-not-allowed"
                    : "btn-yellow"
                }`}
              >
                {isRequesting && (
                  <span className="w-4 h-4 border-2 border-[#FFD100] border-t-transparent rounded-full animate-spin-loader" />
                )}
                {!isConnected
                  ? "Connect Wallet"
                  : isRequesting
                  ? "Requesting..."
                  : "Request Tokens"}
              </button>
            </div>

            {/* Transaction History */}
            {requestHistory.length > 0 && (
              <div className="px-6 py-5 border-t border-[#F3F4F5]">
                <h4 className="text-lg font-semibold text-[#1A1D20] mb-3">
                  Recent Requests
                </h4>
                <div className="flex flex-col gap-2">
                  {requestHistory.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between px-3 py-2.5 bg-[#FAFBFC] rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-gradient-to-br from-[#FFD100] to-[#FFD100]/60 flex items-center justify-center text-[8px] font-bold text-black">
                          {record.symbol[0]}
                        </span>
                        <span className="text-sm text-[#4D535A]">
                          {record.symbol}
                        </span>
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
                        {record.status === "sent"
                          ? "Sent"
                          : record.status === "pending"
                          ? "Pending"
                          : "Failed"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* Available Tokens Info */}
        <div className="mt-12">
          <ScrollReveal>
            <div className="mb-6">
              <span className="text-xs font-medium text-[#FFD100] uppercase tracking-[0.1em]">
                AVAILABLE TOKENS
              </span>
              <h2 className="text-[32px] font-semibold text-[#1A1D20] tracking-tight mt-2">
                Faucet Tokens
              </h2>
              <p className="text-base text-[#656B73] mt-2">
                All tokens available through the Sepolia testnet faucet.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="card-default p-0 overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="bg-[#F3F4F5]">
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#A7ACB3] uppercase tracking-wider rounded-tl-xl">
                      Token
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#A7ACB3] uppercase tracking-wider">
                      Symbol
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#A7ACB3] uppercase tracking-wider">
                      Type
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#A7ACB3] uppercase tracking-wider rounded-tr-xl">
                      Contract Address
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ERC20_TOKENS.map((token) => (
                    <tr
                      key={token.symbol}
                      className="border-b border-[#F3F4F5] hover:bg-[rgba(255,209,0,0.04)] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2 text-sm text-[#1A1D20]">
                          <span className="w-5 h-5 rounded-full bg-gradient-to-br from-[#FFD100] to-[#FFD100]/60 flex items-center justify-center text-[8px] font-bold text-black">
                            {token.symbol[0]}
                          </span>
                          {token.symbol.replace("Mock", " Mock")}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-[#656B73]">
                        {token.symbol}
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-[#F3F4F5] text-[#4D535A] text-xs font-medium px-2.5 py-0.5 rounded-full">
                          ERC-20
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-[#656B73]">
                        <span className="flex items-center relative">
                          {token.address}
                          <CopyButton text={token.address} />
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
