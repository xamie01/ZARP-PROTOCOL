"use client";

/**
 * @file hooks/useDecrypt.ts
 * @description Full EIP-712 user-decryption flow hook.
 *
 * Lifecycle:
 *   1. idle       - waiting for user to select a token
 *   2. signing    - wallet EIP-712 signature prompt (useAllow)
 *   3. submitting - credentials sent to the Zama relayer
 *   4. polling    - relayer is decrypting the ciphertext
 *   5. success    - decrypted plaintext balance is available
 *   6. error      - a step failed (with diagnostics)
 *
 * Uses @zama-fhe/react-sdk hooks (useAllow, useIsAllowed, useZamaSDK)
 * and the SDK's ReadonlyToken.balanceOf() which internally handles
 * the relayer submission and polling phases.
 *
 * Error mapping via matchZamaError covers:
 *   - User rejects signature        (SIGNING_REJECTED)
 *   - No ciphertext / never shielded (NO_CIPHERTEXT)
 *   - Relayer request failed         (RELAYER_REQUEST_FAILED)
 *   - Decryption failed server-side  (DECRYPTION_FAILED)
 *   - Session / keypair expired      (KEYPAIR_EXPIRED, SESSION_EXPIRED)
 *   - ACL denied                     (TRANSACTION_REVERTED / catch-all)
 */

import { useState, useCallback, useRef } from "react";
import type { Address, Hex } from "viem";

import {
  useAllow,
  useIsAllowed,
  useZamaSDK,
  matchZamaError,
} from "@zama-fhe/react-sdk";

/*************** Step Types ***************/

export type DecryptStep =
  | "idle"
  | "signing"
  | "submitting"
  | "polling"
  | "success"
  | "error";

/*************** Hook Return Type ***************/

export interface UseDecryptReturn {
  /** Trigger the full decrypt flow for a confidential token. */
  decrypt: (tokenAddress: Address) => Promise<void>;
  /** Decrypted plaintext balance (populated on success). */
  decryptedValue: bigint | null;
  /** Current step in the decrypt lifecycle. */
  step: DecryptStep;
  /** Whether any async work is in progress. */
  isLoading: boolean;
  /** Human-readable error message (populated on error). */
  error: string | null;
  /** The token address currently being decrypted. */
  tokenAddress: Address | null;
  /** Whether the session is already pre-authorized. */
  isAuthorized: boolean;
  /** Reset all state back to idle. */
  reset: () => void;
}

/*************** Constants ***************/

const RELAYER_TIMEOUT_MS = 30_000;

/*************** Hook Implementation ***************/

/**
 * Manage the full EIP-712 user-decryption lifecycle.
 *
 * Pattern: useAllow once per session -> useIsAllowed check ->
 * sdk.createReadonlyToken(addr).balanceOf() for the actual decrypt.
 *
 * Map NoCiphertextError to a clear diagnostic ("shield tokens first"),
 * never to "0". See: references/zama-sdk-errors.md
 *
 * @returns Decrypt lifecycle state and control functions.
 */
export function useDecrypt(): UseDecryptReturn {
  const [step, setStep] = useState<DecryptStep>("idle");
  const [tokenAddress, setTokenAddress] = useState<Address | null>(null);
  const [decryptedValue, setDecryptedValue] = useState<bigint | null>(null);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const sdk = useZamaSDK();
  const { mutateAsync: allow } = useAllow();
  const { data: isAllowed = false } = useIsAllowed({
    contractAddresses: [tokenAddress || "0x0000000000000000000000000000000000000000"],
  });

  const isAuthorized = !!isAllowed;

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setStep("idle");
    setTokenAddress(null);
    setDecryptedValue(null);
    setError(null);
  }, []);

  const handleError = useCallback((err: unknown) => {
    const msg = matchZamaError(err, {
      SIGNING_REJECTED: () => "Signature rejected - approve the EIP-712 prompt in your wallet to continue.",
      NO_CIPHERTEXT: () => "No confidential balance found - shield tokens first to create an encrypted balance.",
      RELAYER_REQUEST_FAILED: (e) => `Relayer request failed: ${e.message}. Check your network connection.`,
      DECRYPTION_FAILED: () => "Decryption failed on the server. The ciphertext may be invalid or the ACL may deny access.",
      KEYPAIR_EXPIRED: () => "FHE keypair expired - a fresh signature is required. Please try again.",
      SIGNING_FAILED: () => "Wallet signing failed unexpectedly. Please try again.",
      INSUFFICIENT_CONFIDENTIAL_BALANCE: () => "No encrypted balance exists for this token.",
      _: () => {
        const errMsg = (err as Error)?.message || "Unknown error";
        if (errMsg.includes("FHE worker") || errMsg.includes("Worker") || errMsg.includes("WASM")) {
          return "FHE engine is still loading. Please wait a moment and try again.";
        }
        if (errMsg.includes("timeout") || errMsg.includes("Timeout")) {
          return "Relayer timed out after 30 seconds. Please retry.";
        }
        if (errMsg.includes("ACL") || errMsg.includes("SenderNotAllowed")) {
          return "Access denied - your wallet is not authorized to decrypt this balance.";
        }
        return `Decryption failed: ${errMsg}`;
      },
    });
    setError(msg ?? "An unknown error occurred.");
    setStep("error");
  }, []);

  const decrypt = useCallback(async (addr: Address) => {
    /* Reset previous state */
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setTokenAddress(addr);
    setDecryptedValue(null);
    setError(null);

    /* Step 1: Signing - EIP-712 wallet prompt */
    setStep("signing");

    try {
      /* Small delay to let the FHE WASM worker finish bootstrapping */
      await new Promise(r => setTimeout(r, 150));
      /* Query the SDK directly to avoid stale closure from useIsAllowed */
      const currentlyAllowed = await sdk.credentials.isAllowed([addr]).catch(() => false);
      if (!currentlyAllowed) {
        await allow([addr]);
      }
    } catch (err) {
      handleError(err);
      return;
    }

    if (controller.signal.aborted) return;

    /* Step 2: Submitting - send to relayer */
    setStep("submitting");

    try {
      const token = sdk.createReadonlyToken(addr);

      if (controller.signal.aborted) return;

      /* Step 3: Polling - relayer is decrypting */
      setStep("polling");

      /* Race between balanceOf and a 30s timeout */
      const timeoutPromise = new Promise<never>((_, reject) => {
        const timer = setTimeout(
          () => reject(new Error("Relayer timeout: decryption took longer than 30 seconds.")),
          RELAYER_TIMEOUT_MS
        );
        controller.signal.addEventListener("abort", () => clearTimeout(timer));
      });

      const balance = await Promise.race([
        token.balanceOf(),
        timeoutPromise,
      ]);

      if (controller.signal.aborted) return;

      /* Step 4: Success */
      setDecryptedValue(balance);
      setStep("success");
    } catch (err) {
      if (!controller.signal.aborted) {
        handleError(err);
      }
    }
  }, [allow, isAllowed, sdk, handleError]);

  const isLoading = step === "signing" || step === "submitting" || step === "polling";

  return {
    decrypt,
    decryptedValue,
    step,
    isLoading,
    error,
    tokenAddress,
    isAuthorized,
    reset,
  };
}
