"use client";

/**
 * @file hooks/useFaucet.ts
 * @description Custom hook for the Sepolia cTokenMock faucet per-token.
 * Uses wagmi's useWriteContract and usePublicClient for the mint transaction.
 */

import { useState, useCallback, useEffect } from "react";
import { useAccount, useWriteContract, usePublicClient } from "wagmi";
import type { Address, Hex } from "viem";
import { FAUCET_ABI, getFaucetAmount } from "@/lib/faucet";

/*************** Hook Return Type ***************/

interface UseFaucetReturn {
  /** Request tokens from the faucet for this tokenAddress. */
  request: () => Promise<Hex>;
  /** Timestamp (ms) of the last successful request, if any. */
  lastRequest: number | null;
  /** Whether the user is eligible to request tokens. */
  canRequest: boolean;
  /** Active transaction hash. */
  tx: Hex | undefined;
  /** Whether the transaction is pending. */
  isLoading: boolean;
  /** Error message. */
  error: string | undefined;
  /** Force refetch lastRequest from localStorage. */
  refetchCooldown: () => void;
}

/*************** Constants ***************/

const COOLDOWN_24H = 24 * 60 * 60 * 1000;

/*************** Helper Functions ***************/

const getStorageKey = (wallet: string, token: string) => 
  `zarp_faucet_last_request_${wallet.toLowerCase()}_${token.toLowerCase()}`;

/*************** Hook Implementation ***************/

/**
 * Interact with the Sepolia cTokenMock faucet for a specific token address.
 *
 * @param tokenAddress - The address of the mock token.
 * @returns Faucet state, eligibility status, and request function.
 */
export function useFaucet(tokenAddress: Address): UseFaucetReturn {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  const [lastRequest, setLastRequest] = useState<number | null>(null);
  const [tx, setTx] = useState<Hex | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const refetchCooldown = useCallback(() => {
    if (typeof window === "undefined" || !address || !tokenAddress) return;
    const key = getStorageKey(address, tokenAddress);
    const val = localStorage.getItem(key);
    if (val) {
      setLastRequest(parseInt(val, 10));
    } else {
      setLastRequest(null);
    }
  }, [address, tokenAddress]);

  useEffect(() => {
    refetchCooldown();
  }, [refetchCooldown]);

  const now = Date.now();
  const timeElapsed = lastRequest ? now - lastRequest : null;
  const canRequest = !lastRequest || (timeElapsed !== null && timeElapsed >= COOLDOWN_24H);

  const request = useCallback(async () => {
    if (!address) {
      const err = "Wallet not connected";
      setError(err);
      throw new Error(err);
    }
    if (!canRequest) {
      const err = "Faucet is on cooldown";
      setError(err);
      throw new Error(err);
    }

    setIsLoading(true);
    setError(undefined);
    setTx(undefined);

    try {
      const amount = getFaucetAmount();
      const hash = await writeContractAsync({
        address: tokenAddress,
        abi: FAUCET_ABI,
        functionName: "mint",
        args: [address, amount],
      });

      setTx(hash);

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }

      // Save timestamp of successful request
      const timestamp = Date.now();
      localStorage.setItem(getStorageKey(address, tokenAddress), timestamp.toString());
      setLastRequest(timestamp);

      return hash;
    } catch (err) {
      const errMsg = (err as Error).message || "Transaction failed";
      setError(errMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [address, tokenAddress, canRequest, writeContractAsync, publicClient]);

  return {
    request,
    lastRequest,
    canRequest,
    tx,
    isLoading,
    error,
    refetchCooldown,
  };
}
