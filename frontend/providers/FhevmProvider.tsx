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

import React, { type ReactNode } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RainbowKitProvider,
  getDefaultConfig,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

import {
  SEPOLIA_RPC_URL,
  WALLETCONNECT_PROJECT_ID,
  TARGET_CHAIN,
} from "@/lib/registry-data";

import { ZamaProvider, RelayerWeb, indexedDBStorage } from "@zama-fhe/react-sdk";
import { WagmiSigner } from "@zama-fhe/react-sdk/wagmi";
import { SepoliaConfig } from "@zama-fhe/sdk";
import { KEYPAIR_TTL, SESSION_TTL } from "@/lib/fhevm";

/*************** Wagmi Configuration ***************/

/**
 * Wagmi config using RainbowKit's getDefaultConfig for standard wallet connectors.
 * Uses a CORS-friendly public RPC for Sepolia reads.
 */
const wagmiConfig = getDefaultConfig({
  appName: "ZARP Registry",
  projectId: WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(SEPOLIA_RPC_URL),
  },
});

/*************** Zama SDK Objects ***************/

const signer = new WagmiSigner({ config: wagmiConfig });

const relayer = new RelayerWeb({
  getChainId: () => signer.getChainId(),
  transports: {
    [SepoliaConfig.chainId]: {
      ...SepoliaConfig,
      network: SEPOLIA_RPC_URL,
      // For Sepolia testnet, relayer is open (no API key needed).
      // For production/mainnet, point relayerUrl at your backend proxy.
    },
  },
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
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ZamaProvider
          relayer={relayer}
          signer={signer}
          storage={indexedDBStorage}
          keypairTTL={KEYPAIR_TTL}
          sessionTTL={SESSION_TTL}
        >
          <RainbowKitProvider>{children}</RainbowKitProvider>
        </ZamaProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
