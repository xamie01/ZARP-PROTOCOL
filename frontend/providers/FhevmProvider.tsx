"use client";

/**
 * @file providers/FhevmProvider.tsx
 * @description Root provider tree for the Confidential Wrapper Registry App.
 * Nests: WagmiProvider -> QueryClientProvider -> ZamaProvider.
 *
 * IMPORTANT: This file MUST be "use client". The Zama SDK opens a Web Worker
 * and IndexedDB at construction, both of which crash during SSR prerender.
 * See: references/zama-sdk-react.md (Next.js SSR / App Router)
 */

import React, { type ReactNode, useState, useEffect, useMemo } from "react";
import { WagmiProvider, http, fallback } from "wagmi";
import { sepolia, mainnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RainbowKitProvider,
  getDefaultConfig,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

import {
  SEPOLIA_RPC_URL,
  MAINNET_RPC_URL,
  WALLETCONNECT_PROJECT_ID,
  REGISTRY_ADDRESSES,
  SEPOLIA_CHAIN_ID,
  MAINNET_CHAIN_ID,
} from "@/lib/registry-data";

import { ZamaProvider, RelayerWeb, indexedDBStorage } from "@zama-fhe/react-sdk";
import { WagmiSigner } from "@zama-fhe/react-sdk/wagmi";
import { SepoliaConfig, MainnetConfig } from "@zama-fhe/sdk";
import { KEYPAIR_TTL, SESSION_TTL, relayerUrlFor } from "@/lib/fhevm";

/*************** Wagmi Configuration ***************/

/**
 * Wagmi config using RainbowKit's getDefaultConfig for standard wallet connectors.
 * Registers both Ethereum mainnet and Sepolia. Each chain uses a `fallback`
 * transport: the configured RPC first, then public backups, so a single
 * throttled endpoint does not take the app down under load.
 */
const wagmiConfig = getDefaultConfig({
  appName: "ZARP Registry",
  projectId: WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: fallback([
      http(MAINNET_RPC_URL),
      http("https://eth.llamarpc.com"),
      http("https://cloudflare-eth.com"),
    ]),
    [sepolia.id]: fallback([
      http(SEPOLIA_RPC_URL),
      http("https://rpc.sepolia.org"),
      http("https://1rpc.io/sepolia"),
    ]),
  },
  ssr: true,
});

/*************** Query Client ***************/

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, /* 1 minute */
      retry: 2,
    },
  },
});

/*************** Provider Component ***************/

interface FhevmProviderProps {
  children: ReactNode;
}

/**
 * Root provider for the Confidential Wrapper Registry App.
 *
 * Provider nesting order (required):
 *   WagmiProvider -> QueryClientProvider -> ZamaProvider -> RainbowKitProvider
 *
 * ZamaProvider must be inside QueryClientProvider because every Zama hook
 * is built on TanStack Query.
 *
 * WagmiSigner auto-revokes the FHE session on account change or disconnect.
 */
export function FhevmProvider({ children }: FhevmProviderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const signer = useMemo(() => {
    if (!mounted) return null;
    return new WagmiSigner({ config: wagmiConfig });
  }, [mounted]);

  const relayer = useMemo(() => {
    if (!mounted || !signer) return null;
    return new RelayerWeb({
      getChainId: () => signer.getChainId(),
      transports: {
        [SEPOLIA_CHAIN_ID]: {
          ...SepoliaConfig,
          relayerUrl: relayerUrlFor(SEPOLIA_CHAIN_ID),
          network: SEPOLIA_RPC_URL,
        },
        [MAINNET_CHAIN_ID]: {
          ...MainnetConfig,
          relayerUrl: relayerUrlFor(MAINNET_CHAIN_ID),
          network: MAINNET_RPC_URL,
        },
      },
    });
  }, [mounted, signer]);

  const registryAddresses = useMemo(
    () => ({
      [SEPOLIA_CHAIN_ID]: REGISTRY_ADDRESSES[SEPOLIA_CHAIN_ID],
      [MAINNET_CHAIN_ID]: REGISTRY_ADDRESSES[MAINNET_CHAIN_ID],
    }),
    []
  );

  if (!mounted || !signer || !relayer) {
    return null;
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ZamaProvider
          relayer={relayer}
          signer={signer}
          storage={indexedDBStorage}
          keypairTTL={KEYPAIR_TTL}
          sessionTTL={SESSION_TTL}
          registryAddresses={registryAddresses}
        >
          <RainbowKitProvider>{children}</RainbowKitProvider>
        </ZamaProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
