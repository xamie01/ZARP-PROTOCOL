/**
 * @file lib/registry-data.ts
 * @description Static constants and local-config layer for the ZARP Wrapper
 * Registry app. The on-chain Wrappers Registry is the PRIMARY source of truth
 * (read via @zama-fhe/react-sdk `useListPairs`); the pairs declared here are a
 * local fallback / extension layer for both Sepolia and Ethereum mainnet.
 *
 * To add a custom or dev-only pair, append to CUSTOM_PAIRS (see README).
 */

import type { Address } from "viem";
import { sepolia, mainnet } from "wagmi/chains";

/*************** Chain Configuration ***************/

/** Chain IDs supported by the app. */
export const SEPOLIA_CHAIN_ID = sepolia.id; /* 11155111 */
export const MAINNET_CHAIN_ID = mainnet.id; /* 1 */

/** Default target chain (used for testnet-only features like the faucet). */
export const TARGET_CHAIN = sepolia;
export const TARGET_CHAIN_ID = sepolia.id;

/** Human-readable chain names keyed by chain id. */
export const CHAIN_NAMES: Record<number, string> = {
  [MAINNET_CHAIN_ID]: "Mainnet",
  [SEPOLIA_CHAIN_ID]: "Sepolia",
};

/** Block-explorer base URLs keyed by chain id. */
export const EXPLORER_URLS: Record<number, string> = {
  [MAINNET_CHAIN_ID]: "https://etherscan.io",
  [SEPOLIA_CHAIN_ID]: "https://sepolia.etherscan.io",
};

/**
 * Build a block-explorer URL for an address or tx on a given chain.
 *
 * @param chainId - Target chain id.
 * @param kind - "address" or "tx".
 * @param value - The address or tx hash.
 * @returns Fully-qualified explorer URL (defaults to Sepolia if chain unknown).
 */
export function explorerUrl(chainId: number, kind: "address" | "tx", value: string): string {
  const base = EXPLORER_URLS[chainId] ?? EXPLORER_URLS[SEPOLIA_CHAIN_ID];
  return `${base}/${kind}/${value}`;
}

/*************** Zama Official Registry Addresses ***************/

/**
 * On-chain WrappersRegistry contract address per chain.
 * Source: Zama Protocol docs (Registry contract).
 */
export const REGISTRY_ADDRESSES: Record<number, Address> = {
  [SEPOLIA_CHAIN_ID]: "0x2f0750Bbb0A246059d80e94c454586a7F27a128e" as Address,
  [MAINNET_CHAIN_ID]: "0xeb5015fF021DB115aCe010f23F55C2591059bBA0" as Address,
};

/*************** Pair Types ***************/

/** A single ERC-20 <-> ERC-7984 wrapper pair with display metadata. */
export interface WrapperPairConfig {
  erc20: { address: string; symbol: string; decimals: number };
  erc7984: { address: string; symbol: string; decimals: number };
  chainId: number;
}

/*************** Sepolia Pairs (official cTokenMocks) ***************/

/**
 * Official Sepolia cTokenMock wrapper pairs.
 * These are the test tokens claimable from the faucet.
 */
export const SEPOLIA_PAIRS: WrapperPairConfig[] = [
  {
    erc20: { address: "0x9b5Cd13b8eFbB58Dc25A05CF411D8056058aDFfF", symbol: "USDCMock", decimals: 6 },
    erc7984: { address: "0x7c5BF43B851c1dff1a4feE8dB225b87f2C223639", symbol: "cUSDCMock", decimals: 6 },
    chainId: SEPOLIA_CHAIN_ID,
  },
  {
    erc20: { address: "0xa7dA08FafDC9097Cc0E7D4f113A61e31d7e8e9b0", symbol: "USDTMock", decimals: 6 },
    erc7984: { address: "0x4E7B06D78965594eB5EF5414c357ca21E1554491", symbol: "cUSDTMock", decimals: 6 },
    chainId: SEPOLIA_CHAIN_ID,
  },
  {
    erc20: { address: "0xff54739b16576FA5402F211D0b938469Ab9A5f3F", symbol: "WETHMock", decimals: 18 },
    erc7984: { address: "0x46208622DA27d91db4f0393733C8BA082ed83158", symbol: "cWETHMock", decimals: 18 },
    chainId: SEPOLIA_CHAIN_ID,
  },
  {
    erc20: { address: "0xFf021fB13cA64e5354c62c954b949a88cfDEb25E", symbol: "BRONMock", decimals: 18 },
    erc7984: { address: "0xaa5612FA27c927a0c7961f5AEFEE5ba3A0F9C891", symbol: "cBRONMock", decimals: 18 },
    chainId: SEPOLIA_CHAIN_ID,
  },
  {
    erc20: { address: "0x75355a85c6FB9df5f0C80FF54e8747EEe9a0BF57", symbol: "ZAMAMock", decimals: 18 },
    erc7984: { address: "0xf2D628d2598aF4eAF94CB76a437Ff86CA78FfbFB", symbol: "cZAMAMock", decimals: 18 },
    chainId: SEPOLIA_CHAIN_ID,
  },
  {
    erc20: { address: "0x93c931278A2aad1916783F952f94276eA5111442", symbol: "tGBPMock", decimals: 18 },
    erc7984: { address: "0xfCE5c7069c5525eF6c8C2b2E35A745bA20a2F7CC", symbol: "ctGBPMock", decimals: 18 },
    chainId: SEPOLIA_CHAIN_ID,
  },
  {
    erc20: { address: "0x24377AE4AA0C45ecEe71225007f17c5D423dd940", symbol: "XAUtMock", decimals: 18 },
    erc7984: { address: "0xe4FcF848739845BC81Dee1d5352cf3844F0a60C7", symbol: "cXAUtMock", decimals: 18 },
    chainId: SEPOLIA_CHAIN_ID,
  },
];

/*************** Mainnet Pairs (official wrappers) ***************/

/**
 * Official Ethereum mainnet wrapper pairs.
 *
 * All 7 wrapper addresses sourced from the Zama Protocol docs (official deployment):
 * https://docs.zama.org/protocol/erc-7984/deployed-contracts#ethereum
 *
 * Underlying ERC-20 addresses are the canonical mainnet tokens.
 */
export const MAINNET_PAIRS: WrapperPairConfig[] = [
  {
    erc20: { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", symbol: "USDC", decimals: 6 },
    erc7984: { address: "0xe978F22157048E5DB8E5d07971376e86671672B2", symbol: "cUSDC", decimals: 6 },
    chainId: MAINNET_CHAIN_ID,
  },
  {
    erc20: { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", symbol: "USDT", decimals: 6 },
    erc7984: { address: "0xAe0207C757Aa2B4019Ad96edD0092ddc63EF0c50", symbol: "cUSDT", decimals: 6 },
    chainId: MAINNET_CHAIN_ID,
  },
  {
    erc20: { address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", symbol: "WETH", decimals: 18 },
    erc7984: { address: "0xda9396b82634Ea99243cE51258B6A5Ae512D4893", symbol: "cWETH", decimals: 18 },
    chainId: MAINNET_CHAIN_ID,
  },
  {
    erc20: { address: "0xBA2C598E11eD093079cC324FCa5BbbA99F616E83", symbol: "BRON", decimals: 18 },
    erc7984: { address: "0x85dE671c3bec1aDeD752c3Cea943521181C826bc", symbol: "cBRON", decimals: 18 },
    chainId: MAINNET_CHAIN_ID,
  },
  {
    erc20: { address: "0xA12CC123ba206d4031D1c7f6223D1C2Ec249f4f3", symbol: "ZAMA", decimals: 18 },
    erc7984: { address: "0x80CB147Fd86dC6dEe3Eee7e4Cee33d1397d98071", symbol: "cZAMA", decimals: 18 },
    chainId: MAINNET_CHAIN_ID,
  },
  {
    erc20: { address: "0x27f6c8289550fce67f6b50bed1f519966afe5287", symbol: "tGBP", decimals: 18 },
    erc7984: { address: "0xa873750ccBafD5ec7Dd13bfD5237d7129832eDD9", symbol: "ctGBP", decimals: 18 },
    chainId: MAINNET_CHAIN_ID,
  },
  {
    erc20: { address: "0x68749665FF8D2d112Fa859AA293F07A622782F38", symbol: "XAUt", decimals: 6 },
    erc7984: { address: "0x73cc9aF9d6BEFdb3c3fAf8a5E8c05Cb95FdaEEf1", symbol: "cXAUt", decimals: 6 },
    chainId: MAINNET_CHAIN_ID,
  },
];

/*************** Local Config Extension Point ***************/

/**
 * Custom or dev-only pairs declared locally. These are MERGED with the
 * on-chain registry pairs at runtime. Add an entry here to surface a pair the
 * registry does not (yet) list. See README "Adding a new pair".
 *
 * @example
 * export const CUSTOM_PAIRS: WrapperPairConfig[] = [
 *   {
 *     erc20:   { address: "0xUnderlying...", symbol: "FOO",  decimals: 18 },
 *     erc7984: { address: "0xWrapper...",    symbol: "cFOO", decimals: 18 },
 *     chainId: 11155111,
 *   },
 * ];
 */
export const CUSTOM_PAIRS: WrapperPairConfig[] = [];

/*************** Derived / Aggregate Exports ***************/

/** All statically-declared pairs across every chain, plus custom pairs. */
export const ALL_STATIC_PAIRS: WrapperPairConfig[] = [
  ...SEPOLIA_PAIRS,
  ...MAINNET_PAIRS,
  ...CUSTOM_PAIRS,
];

/**
 * Return the static fallback pairs for a given chain (registry pairs + custom).
 *
 * @param chainId - Chain id to filter by.
 * @returns Static pairs declared for that chain.
 */
export function getStaticPairs(chainId: number): WrapperPairConfig[] {
  return ALL_STATIC_PAIRS.filter((p) => p.chainId === chainId);
}

/**
 * Backwards-compatible alias: the original Sepolia-only export.
 * Existing pages import WRAPPER_PAIRS; keep it pointing at the Sepolia set.
 */
export const WRAPPER_PAIRS = SEPOLIA_PAIRS;

/** Sepolia cTokenMocks claimable from the faucet (faucet is Sepolia-only). */
export const CTOKEN_MOCKS = SEPOLIA_PAIRS.map((p) => ({
  address: p.erc20.address,
  symbol: p.erc20.symbol,
  decimals: p.erc20.decimals,
}));

/** Known token pairs mapped to the app's TokenPair-ish shape (Sepolia). */
export const KNOWN_TOKEN_PAIRS = SEPOLIA_PAIRS.map((pair) => ({
  name: pair.erc20.symbol.replace("Mock", ""),
  symbol: pair.erc20.symbol,
  tokenAddress: pair.erc20.address as Address,
  confidentialTokenAddress: pair.erc7984.address as Address,
  decimals: pair.erc20.decimals,
  chainId: pair.chainId,
  isValid: true,
}));

/*************** Contract Addresses ***************/

/** cTokenMock faucet default target (USDCMock on Sepolia). */
export const FAUCET_CONTRACT_ADDRESS: Address =
  "0x9b5Cd13b8eFbB58Dc25A05CF411D8056058aDFfF" as Address;

/** Amount of human-readable tokens dispensed per faucet request. */
export const FAUCET_HUMAN_AMOUNT = 1000n;

/** @deprecated Use getFaucetAmountForDecimals instead. */
export const FAUCET_AMOUNT = 1000000n;

/**
 * Compute the faucet mint amount in base units for a given token decimals.
 * Always mints 1,000 human-readable tokens.
 */
export function getFaucetAmountForDecimals(decimals: number): bigint {
  return FAUCET_HUMAN_AMOUNT * (10n ** BigInt(decimals));
}

/** Default token decimals. */
export const DEFAULT_DECIMALS = 18;

/*************** RPC Configuration ***************/

/** Public Sepolia RPC endpoint (override via NEXT_PUBLIC_SEPOLIA_RPC). */
export const SEPOLIA_RPC_URL =
  process.env.NEXT_PUBLIC_SEPOLIA_RPC || "https://ethereum-sepolia-rpc.publicnode.com";

/** Public mainnet RPC endpoint (override via NEXT_PUBLIC_MAINNET_RPC). */
export const MAINNET_RPC_URL =
  process.env.NEXT_PUBLIC_MAINNET_RPC || "https://ethereum-rpc.publicnode.com";

/** RPC endpoint keyed by chain id. */
export const RPC_URLS: Record<number, string> = {
  [SEPOLIA_CHAIN_ID]: SEPOLIA_RPC_URL,
  [MAINNET_CHAIN_ID]: MAINNET_RPC_URL,
};

/** WalletConnect project ID (override via NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID). */
export const WALLETCONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";
