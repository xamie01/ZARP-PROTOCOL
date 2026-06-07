"use client";

/**
 * @file components/FaucetPanel.tsx
 * @description Sepolia cTokenMock faucet panel dashboard for requesting test tokens.
 */

import React, { useState, useEffect } from "react";
import { useAccount, useReadContracts, useWriteContract, usePublicClient } from "wagmi";
import type { Address } from "viem";
import { useFaucet } from "@/hooks/useFaucet";
import { cn, truncateAddress, formatTokenAmount } from "@/lib/utils";
import { CTOKEN_MOCKS, FAUCET_AMOUNT } from "@/lib/registry-data";
import { FAUCET_ABI } from "@/lib/faucet";
import {
  Coins,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  Clock,
  Sparkles,
  Loader2,
} from "lucide-react";

/*************** Constants & ABIs ***************/

const erc20Abi = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "balance", type: "uint256" }],
  },
] as const;

const COOLDOWN_24H = 24 * 60 * 60 * 1000;

/*************** FaucetCard Component ***************/

interface FaucetCardProps {
  token: typeof CTOKEN_MOCKS[number];
  balance: string;
  cooldownTrigger: number;
  isSequencing: boolean;
  refetchBalances: () => void;
}

function FaucetCard({
  token,
  balance,
  cooldownTrigger,
  isSequencing,
  refetchBalances,
}: FaucetCardProps) {
  const {
    request,
    lastRequest,
    canRequest,
    tx,
    isLoading,
    error,
    refetchCooldown,
  } = useFaucet(token.address as Address);

  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  /* Force cooldown reload when the global trigger updates */
  useEffect(() => {
    refetchCooldown();
  }, [refetchCooldown, cooldownTrigger]);

  /* Track countdown timer in-memory */
  useEffect(() => {
    if (!lastRequest) {
      setTimeLeft(0);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const elapsed = now - lastRequest;
      const remaining = COOLDOWN_24H - elapsed;
      if (remaining <= 0) {
        setTimeLeft(0);
        refetchCooldown();
      } else {
        setTimeLeft(remaining);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [lastRequest, refetchCooldown]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(token.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRequest = async () => {
    try {
      await request();
      refetchBalances();
    } catch {
      // Handled inside hook error state
    }
  };

  const formatTimeLeft = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formattedFaucetAmount = (Number(FAUCET_AMOUNT) / 10 ** token.decimals).toLocaleString(
    undefined,
    { maximumFractionDigits: token.decimals }
  );

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl border transition-all duration-300",
        "border-slate-800/60 bg-slate-900/15 backdrop-blur-sm",
        "hover:border-violet-500/30 hover:bg-slate-900/25 hover:shadow-[0_0_30px_rgba(139,92,246,0.04)]"
      )}
    >
      {/* Decorative top colored bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-violet-600/40 via-fuchsia-600/30 to-cyan-600/40" />

      <div className="p-5 space-y-4">
        {/* Token Symbol and Copy Address */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600/10 text-violet-400 font-bold text-xs border border-violet-500/10">
              {token.symbol[0]}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">{token.symbol}</h4>
              <p className="text-[10px] text-slate-500">Decimals: {token.decimals}</p>
            </div>
          </div>
          <button
            onClick={handleCopy}
            title="Copy token address"
            className="rounded-lg border border-slate-800 bg-slate-900/40 p-1.5 text-slate-500 hover:text-slate-300 hover:border-slate-700 transition-all"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {/* Address and Balance display */}
        <div className="space-y-2 rounded-xl bg-slate-950/40 p-3.5 border border-slate-900/50">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Address:</span>
            <span className="font-mono text-slate-400">
              {truncateAddress(token.address, 6)}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] border-t border-slate-900/40 pt-2">
            <span className="text-slate-500">Your Balance:</span>
            <span className="font-mono font-semibold text-slate-300">
              {balance} {token.symbol}
            </span>
          </div>
        </div>

        {/* Cooldown Timer */}
        {timeLeft > 0 && (
          <div className="flex items-center justify-center gap-1.5 rounded-lg bg-amber-500/5 border border-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-500/90 font-mono">
            <Clock className="h-3.5 w-3.5 animate-pulse" />
            <span>Cooldown: {formatTimeLeft(timeLeft)}</span>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleRequest}
          disabled={!canRequest || isLoading || isSequencing}
          className={cn(
            "w-full rounded-xl py-2.5 text-xs font-bold transition-all duration-200",
            canRequest && !isSequencing
              ? "bg-violet-600/15 text-violet-300 border border-violet-500/25 hover:bg-violet-600/30 hover:border-violet-500/40"
              : "bg-slate-800/40 text-slate-500 border border-slate-800/60 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-1.5">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Minting...
            </span>
          ) : (
            `Request +${formattedFaucetAmount}`
          )}
        </button>
      </div>

      {/* Transaction & Error Status Footer */}
      {(tx || error) && (
        <div className="border-t border-slate-800/50 bg-slate-900/10 p-3 text-[11px]">
          {tx && (
            <div className="flex items-center justify-between text-emerald-400">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> Mapped!
              </span>
              <a
                href={`https://sepolia.etherscan.io/tx/${tx}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-0.5 hover:underline font-mono text-[10px] text-violet-400"
              >
                Explorer <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          )}
          {error && (
            <div className="text-red-400 flex items-start gap-1">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <p className="line-clamp-2 leading-snug">{error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/*************** FaucetPanel Dashboard Component ***************/

export function FaucetPanel() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  const [isSequencing, setIsSequencing] = useState(false);
  const [sequenceStatus, setSequenceStatus] = useState<string | null>(null);
  const [cooldownTrigger, setCooldownTrigger] = useState(0);

  /* Fetch user balances using multicall in one query */
  const { data: balancesData, refetch: refetchBalances } = useReadContracts({
    contracts: CTOKEN_MOCKS.map((token) => ({
      address: token.address as Address,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: address ? [address] : undefined,
    })),
    query: {
      enabled: !!address,
    },
  });

  const balances = CTOKEN_MOCKS.map((token, index) => {
    const rawBalance = balancesData?.[index]?.result as bigint | undefined;
    return rawBalance !== undefined
      ? formatTokenAmount(rawBalance, token.decimals)
      : "0";
  });

  /* Sequential faucet requests to prevent nonce conflicts */
  const handleRequestAll = async () => {
    if (!address) return;
    setIsSequencing(true);
    setSequenceStatus("Initializing sequence...");

    try {
      for (let i = 0; i < CTOKEN_MOCKS.length; i++) {
        const token = CTOKEN_MOCKS[i];
        const storageKey = `zarp_faucet_last_request_${address.toLowerCase()}_${token.address.toLowerCase()}`;
        const lastRequestVal = localStorage.getItem(storageKey);
        const lastRequestTime = lastRequestVal ? parseInt(lastRequestVal, 10) : 0;
        const now = Date.now();

        if (now - lastRequestTime < COOLDOWN_24H) {
          /* Token is on cooldown, skip */
          continue;
        }

        setSequenceStatus(`Minting ${token.symbol} (${i + 1}/${CTOKEN_MOCKS.length})...`);

        const amount = FAUCET_AMOUNT;
        const txHash = await writeContractAsync({
          address: token.address as Address,
          abi: FAUCET_ABI,
          functionName: "mint",
          args: [address, amount],
        });

        if (publicClient) {
          await publicClient.waitForTransactionReceipt({ hash: txHash });
        }

        localStorage.setItem(storageKey, Date.now().toString());
        setCooldownTrigger((prev) => prev + 1);
      }
      setSequenceStatus("All eligible tokens minted successfully!");
      refetchBalances();
    } catch (err) {
      setSequenceStatus(`Failed at mint step: ${(err as Error).message}`);
    } finally {
      setIsSequencing(false);
      setTimeout(() => setSequenceStatus(null), 5000);
    }
  };

  /* Count eligible tokens to show at Request All button */
  const [eligibleCount, setEligibleCount] = useState(0);

  useEffect(() => {
    if (!address) return;
    let count = 0;
    for (const token of CTOKEN_MOCKS) {
      const storageKey = `zarp_faucet_last_request_${address.toLowerCase()}_${token.address.toLowerCase()}`;
      const lastRequestVal = localStorage.getItem(storageKey);
      const lastRequestTime = lastRequestVal ? parseInt(lastRequestVal, 10) : 0;
      const now = Date.now();
      if (now - lastRequestTime >= COOLDOWN_24H) {
        count++;
      }
    }
    setEligibleCount(count);
  }, [address, cooldownTrigger]);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800/50 bg-slate-900/30 p-12 text-center">
        <Coins className="mb-4 h-12 w-12 text-slate-600 animate-pulse" />
        <p className="text-sm font-medium text-slate-300">Wallet Disconnected</p>
        <p className="mt-1 text-xs text-slate-500">Connect your wallet to use the testnet faucet dashboard</p>
      </div>
    );
  }

  return (
    <div id="faucet-panel" className="animate-fade-in space-y-6">
      {/* Dashboard Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-800/40 bg-slate-900/10 p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-600 shadow-md shadow-violet-500/10">
            <Coins className="h-5.5 w-5.5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Faucet Dashboard</h3>
            <p className="text-xs text-slate-500">
              Claim public mock ERC-20 tokens for wrapping test flows
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {sequenceStatus && (
            <div className="hidden lg:flex items-center gap-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 px-3 py-1.5 text-xs text-violet-300 font-medium">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>{sequenceStatus}</span>
            </div>
          )}
          <button
            onClick={handleRequestAll}
            disabled={isSequencing || eligibleCount === 0}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200",
              eligibleCount > 0 && !isSequencing
                ? "bg-gradient-to-r from-violet-600 to-cyan-600 text-white hover:from-violet-500 hover:to-cyan-500 hover:shadow-lg hover:shadow-violet-600/15 hover:scale-[1.01]"
                : "bg-slate-800/50 text-slate-500 border border-slate-800/80 cursor-not-allowed"
            )}
          >
            <Sparkles className="h-4.5 w-4.5" />
            <span>Request All {eligibleCount > 0 && `(${eligibleCount})`}</span>
          </button>
        </div>
      </div>

      {/* Mobile status banner */}
      {sequenceStatus && (
        <div className="lg:hidden flex items-center gap-2 rounded-xl bg-violet-500/10 border border-violet-500/20 p-3 text-xs text-violet-300 font-medium animate-pulse">
          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
          <span>{sequenceStatus}</span>
        </div>
      )}

      {/* Grid of Tokens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {CTOKEN_MOCKS.map((token, index) => (
          <FaucetCard
            key={token.address}
            token={token}
            balance={balances[index]}
            cooldownTrigger={cooldownTrigger}
            isSequencing={isSequencing}
            refetchBalances={refetchBalances}
          />
        ))}
      </div>

      <p className="text-center text-[10px] text-slate-600">
        Faucet rate limit: 24h per wallet per asset. Sepolia testnet only. Tokens hold no financial value.
      </p>
    </div>
  );
}
