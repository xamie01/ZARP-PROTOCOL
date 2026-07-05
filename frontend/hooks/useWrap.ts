"use client";

/**
 * @file hooks/useWrap.ts
 * @description Custom hook for shield (wrap) and unshield (unwrap) operations.
 * Wraps useShield, useUnshield, and useResumeUnshield from @zama-fhe/react-sdk.
 */

import { useState, useCallback } from "react";
import type { Hex } from "viem";
import type { WrapState, TokenPair, WrapPhase } from "@/types";
import { useAccount, useReadContract } from "wagmi";
import { formatTokenAmount } from "@/lib/utils";

import {
  useShield,
  useUnshield,
  useResumeUnshield,
  useAllow,
  useIsAllowed,
  useConfidentialBalance,
  matchZamaError,
  useZamaSDK,
} from "@zama-fhe/react-sdk";
import type { Address } from "viem";

/*************** Constants ***************/

const erc20Abi = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "balance", type: "uint256" }],
  },
] as const;

/*************** Hook Return Type ***************/

interface UseWrapReturn {
  /** Current wrap/unwrap state. */
  state: WrapState;
  /** Execute a shield (wrap) operation. */
  shield: (amount: bigint) => Promise<void>;
  /** Execute an unshield (unwrap) operation. */
  unshield: (amount: bigint) => Promise<void>;
  /** Resume an interrupted unshield. */
  resume: (unwrapTxHash: Hex) => Promise<void>;
  /** Set the active mode (shield or unshield). */
  setMode: (mode: "shield" | "unshield") => void;
  /** Update the amount input. */
  setAmount: (amount: string) => void;
  /** Select a token pair. */
  selectPair: (pair: TokenPair | null) => void;
  /** Reset state to idle. */
  reset: () => void;
  /** Underlying ERC-20 token balance. */
  erc20Balance: bigint | undefined;
  /** Formatted underlying ERC-20 token balance. */
  formattedErc20Balance: string;
  /** Confidential wrapper token balance. */
  confidentialBalance: bigint | undefined;
  /** Formatted confidential wrapper token balance. */
  formattedConfidentialBalance: string;
  /** Whether the user has EIP-712 decryption authorized. */
  isAllowed: boolean;
  /** Whether the manual decryption is in progress. */
  decryptLoading: boolean;
  /** Error message during manual decryption. */
  decryptError: string | undefined;
  /** Triggers the EIP-712 wallet prompt to decrypt the confidential balance. */
  decryptConfidentialBalance: () => Promise<void>;
  /** Whether a wrap/unwrap transaction or step is in progress. */
  isLoading: boolean;
}

/*************** Initial State ***************/

const initialState: WrapState = {
  phase: "idle",
  mode: "shield",
  amount: "",
  selectedPair: null,
};

/*************** Hook Implementation ***************/

/**
 * Manage shield/unshield operations and balances for a selected token pair.
 *
 * @returns Wrap state, balances, and mutation functions.
 */
export function useWrap(): UseWrapReturn {
  const [state, setState] = useState<WrapState>(initialState);
  const { address: userAddress } = useAccount();
  const sdk = useZamaSDK();

  const tokenAddress = (state.selectedPair?.tokenAddress || "0x0000000000000000000000000000000000000000") as Address;
  const wrapperAddress = state.selectedPair?.confidentialTokenAddress as Address | undefined;

  /* Fetch ERC-20 balance */
  const { data: erc20Balance, refetch: refetchErc20 } = useReadContract({
    address: tokenAddress !== "0x0000000000000000000000000000000000000000" ? tokenAddress : undefined,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress && !!state.selectedPair && tokenAddress !== "0x0000000000000000000000000000000000000000",
      refetchInterval: 10_000,
      refetchOnMount: 'always' as const,
    },
  });

  /* Fetch decrypt credentials status */
  const { data: isAllowed = false, refetch: refetchIsAllowed } = useIsAllowed({
    contractAddresses: [wrapperAddress || "0x0000000000000000000000000000000000000000"],
  });

  /* Fetch confidential balance (enabled only when EIP-712 is authorized) */
  const { data: confidentialBalance, refetch: refetchConfidential } = useConfidentialBalance(
    { tokenAddress: wrapperAddress || "0x0000000000000000000000000000000000000000" },
    { enabled: !!isAllowed && !!wrapperAddress }
  );

  const { mutateAsync: allow } = useAllow();
  const [decryptLoading, setDecryptLoading] = useState(false);
  const [decryptError, setDecryptError] = useState<string | undefined>();

  const decryptConfidentialBalance = useCallback(async () => {
    if (!wrapperAddress) return;
    setDecryptLoading(true);
    setDecryptError(undefined);
    try {
      /* Retry loop to wait for FHE worker/WASM readiness */
      let retries = 10;
      while (retries > 0) {
        try {
          await sdk.credentials.isAllowed([wrapperAddress]);
          break; // Success!
        } catch (err) {
          const errMsg = (err as Error)?.message || "";
          if (
            errMsg.includes("worker") ||
            errMsg.includes("Worker") ||
            errMsg.includes("WASM") ||
            errMsg.includes("not initialized")
          ) {
            retries--;
            await new Promise(r => setTimeout(r, 500)); // wait 500ms and retry
          } else {
            throw err;
          }
        }
      }

      if (retries === 0) {
        throw new Error("FHE engine is still loading. Please wait a moment and try again.");
      }

      await allow([wrapperAddress]);
      await refetchIsAllowed();
      await refetchConfidential();
    } catch (err) {
      const msg = matchZamaError(err, {
        SIGNING_REJECTED: () => "Decryption cancelled in wallet.",
        _: () => (err as Error).message || "Decryption failed.",
      });
      setDecryptError(msg);
    } finally {
      setDecryptLoading(false);
    }
  }, [sdk, allow, wrapperAddress, refetchIsAllowed, refetchConfidential]);

  const { mutateAsync: shieldMutation } = useShield({
    tokenAddress: wrapperAddress || "0x0000000000000000000000000000000000000000",
    wrapperAddress,
  });

  const { mutateAsync: unshieldMutation } = useUnshield({
    tokenAddress: wrapperAddress || "0x0000000000000000000000000000000000000000",
    wrapperAddress,
  });

  const { mutateAsync: resumeMutation } = useResumeUnshield({
    tokenAddress: wrapperAddress || "0x0000000000000000000000000000000000000000",
    wrapperAddress,
  });

  const updatePhase = useCallback((phase: WrapPhase, txHash?: Hex, error?: string) => {
    setState((prev) => ({ ...prev, phase, txHash, error }));
  }, []);

  const shield = useCallback(async (amount: bigint) => {
    if (!state.selectedPair) return;

    try {
      /* Preflight balance check */
      if (erc20Balance !== undefined && amount > erc20Balance) {
        throw new Error("INSUFFICIENT_ERC20_BALANCE");
      }

      updatePhase("approving");

      await shieldMutation({
        amount,
        approvalStrategy: "exact",
        onApprovalSubmitted: (hash) => updatePhase("wrapping", hash),
        onShieldSubmitted: (hash) => updatePhase("complete", hash),
      });

      /* Refetch balances after wrapping */
      await refetchErc20();
      await refetchConfidential();
    } catch (err) {
      const msg = matchZamaError(err, {
        SIGNING_REJECTED: () => "Transaction cancelled in wallet",
        INSUFFICIENT_ERC20_BALANCE: () => "Insufficient ERC-20 balance",
        APPROVAL_FAILED: () => "ERC-20 approval failed",
        TRANSACTION_REVERTED: (e) => `Shield failed: ${e.message}`,
        _: () => {
          const errMsg = (err as Error).message;
          if (errMsg === "INSUFFICIENT_ERC20_BALANCE") return "Insufficient ERC-20 balance";
          return errMsg || "Shielding failed";
        },
      });
      updatePhase("error", undefined, msg);
    }
  }, [state.selectedPair, erc20Balance, shieldMutation, updatePhase, refetchErc20, refetchConfidential]);

  const unshield = useCallback(async (amount: bigint) => {
    if (!state.selectedPair) return;

    try {
      /* Preflight balance check */
      if (confidentialBalance !== undefined && amount > confidentialBalance) {
        throw new Error("INSUFFICIENT_CONFIDENTIAL_BALANCE");
      }

      updatePhase("unwrapping");

      await unshieldMutation({
        amount,
        skipBalanceCheck: true,
        onUnwrapSubmitted: (hash) => updatePhase("unwrapping", hash),
        onFinalizing: () => updatePhase("finalizing"),
        onFinalizeSubmitted: (hash) => updatePhase("complete", hash),
      });

      /* Refetch balances after unwrapping */
      await refetchErc20();
      await refetchConfidential();
    } catch (err) {
      const msg = matchZamaError(err, {
        SIGNING_REJECTED: () => "Transaction cancelled in wallet",
        INSUFFICIENT_CONFIDENTIAL_BALANCE: () => "Insufficient confidential balance",
        DECRYPTION_FAILED: () => "Decryption failed - check your authorization signature",
        TRANSACTION_REVERTED: (e) => `Unshield failed: ${e.message}`,
        _: () => {
          const errMsg = (err as Error).message;
          if (errMsg === "INSUFFICIENT_CONFIDENTIAL_BALANCE") return "Insufficient confidential balance";
          return errMsg || "Unshielding failed";
        },
      });
      updatePhase("error", undefined, msg);
    }
  }, [state.selectedPair, confidentialBalance, unshieldMutation, updatePhase, refetchErc20, refetchConfidential]);

  const resume = useCallback(async (unwrapTxHash: Hex) => {
    try {
      updatePhase("finalizing");

      await resumeMutation({
        unwrapTxHash,
        onFinalizing: () => updatePhase("finalizing"),
        onFinalizeSubmitted: (hash) => updatePhase("complete", hash),
      });

      /* Refetch balances after resuming */
      await refetchErc20();
      await refetchConfidential();
    } catch (err) {
      const msg = matchZamaError(err, {
        SIGNING_REJECTED: () => "Transaction cancelled in wallet",
        DECRYPTION_FAILED: () => "Decryption failed - check your authorization signature",
        TRANSACTION_REVERTED: (e) => `Resume failed: ${e.message}`,
        _: () => (err as Error).message || "Resuming failed",
      });
      updatePhase("error", undefined, msg);
    }
  }, [resumeMutation, updatePhase, refetchErc20, refetchConfidential]);

  const setMode = useCallback((mode: "shield" | "unshield") => {
    setState((prev) => ({ ...prev, mode, phase: "idle", error: undefined }));
  }, []);

  const setAmount = useCallback((amount: string) => {
    setState((prev) => ({ ...prev, amount }));
  }, []);

  const selectPair = useCallback((pair: TokenPair | null) => {
    setState((prev) => ({ ...prev, selectedPair: pair, phase: "idle", error: undefined }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  const decimals = state.selectedPair?.decimals ?? 18;

  const formattedErc20Balance = erc20Balance !== undefined && state.selectedPair
    ? formatTokenAmount(erc20Balance, decimals)
    : "0";

  const formattedConfidentialBalance = confidentialBalance !== undefined && state.selectedPair
    ? formatTokenAmount(confidentialBalance, decimals)
    : "0";

  const isLoading = state.phase !== "idle" && state.phase !== "complete" && state.phase !== "error";

  return {
    state,
    shield,
    unshield,
    resume,
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
  };
}
