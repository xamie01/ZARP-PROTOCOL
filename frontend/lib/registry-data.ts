/**
 * @file lib/registry-data.ts
 * @description Static constants for the Confidential Wrapper Registry App.
 * Contains contract addresses, chain configuration, and known token pairs
 * for Sepolia testnet.
 */

import type { Address } from "viem";
import { sepolia } from "wagmi/chains";

/*************** Chain Configuration ***************/

/** The target chain for this app. */
export const TARGET_CHAIN = sepolia;

/** The target chain ID. */
export const TARGET_CHAIN_ID = sepolia.id;

/*************** Contract Addresses ***************/

/** cTokenMock faucet contract address on Sepolia (default target: USDCMock). */
export const FAUCET_CONTRACT_ADDRESS: Address =
  "0x9b5Cd13b8eFbB58Dc25A05CF411D8056058aDFfF" as Address;

/** Amount of tokens dispensed per faucet request (in token decimals). */
export const FAUCET_AMOUNT = 1000000n;

/** Default token decimals. */
export const DEFAULT_DECIMALS = 18;

/*************** Zama Official Registry Constants ***************/

export const REGISTRY_ADDRESSES = {
  sepolia: "0x2f0750Bbb0A246059d80e94c454586a7F27a128e",
  mainnet: "0xeb5015fF021DB115aCe010f23F55C2591059bBA0"
};

export const WRAPPER_PAIRS = [
  {
    erc20: { address: "0x9b5Cd13b8eFbB58Dc25A05CF411D8056058aDFfF", symbol: "USDCMock", decimals: 6 },
    erc7984: { address: "0x7c5BF43B851c1dff1a4feE8dB225b87f2C223639", symbol: "cUSDCMock", decimals: 6 },
    chainId: 11155111
  },
  {
    erc20: { address: "0xa7dA08FafDC9097Cc0E7D4f113A61e31d7e8e9b0", symbol: "USDTMock", decimals: 6 },
    erc7984: { address: "0x4E7B06D78965594eB5EF5414c357ca21E1554491", symbol: "cUSDTMock", decimals: 6 },
    chainId: 11155111
  },
  {
    erc20: { address: "0xff54739b16576FA5402F211D0b938469Ab9A5f3F", symbol: "WETHMock", decimals: 18 },
    erc7984: { address: "0x46208622DA27d91db4f0393733C8BA082ed83158", symbol: "cWETHMock", decimals: 18 },
    chainId: 11155111
  },
  {
    erc20: { address: "0xFf021fB13cA64e5354c62c954b949a88cfDEb25E", symbol: "BRONMock", decimals: 18 },
    erc7984: { address: "0xaa5612FA27c927a0c7961f5AEFEE5ba3A0F9C891", symbol: "cBRONMock", decimals: 18 },
    chainId: 11155111
  },
  {
    erc20: { address: "0x75355a85c6FB9df5f0C80FF54e8747EEe9a0BF57", symbol: "ZAMAMock", decimals: 18 },
    erc7984: { address: "0xf2D628d2598aF4eAF94CB76a437Ff86CA78FfbFB", symbol: "cZAMAMock", decimals: 18 },
    chainId: 11155111
  },
  {
    erc20: { address: "0x93c931278A2aad1916783F952f94276eA5111442", symbol: "tGBPMock", decimals: 18 },
    erc7984: { address: "0xfCE5c7069c5525eF6c8C2b2E35A745bA20a2F7CC", symbol: "ctGBPMock", decimals: 18 },
    chainId: 11155111
  },
  {
    erc20: { address: "0x24377AE4AA0C45ecEe71225007f17c5D423dd940", symbol: "XAUtMock", decimals: 18 },
    erc7984: { address: "0xe4FcF848739845BC81Dee1d5352cf3844F0a60C7", symbol: "cXAUtMock", decimals: 18 },
    chainId: 11155111
  }
];

export const CTOKEN_MOCKS = [
  { address: "0x9b5Cd13b8eFbB58Dc25A05CF411D8056058aDFfF", symbol: "USDCMock", decimals: 6 },
  { address: "0xa7dA08FafDC9097Cc0E7D4f113A61e31d7e8e9b0", symbol: "USDTMock", decimals: 6 },
  { address: "0xff54739b16576FA5402F211D0b938469Ab9A5f3F", symbol: "WETHMock", decimals: 18 },
  { address: "0xFf021fB13cA64e5354c62c954b949a88cfDEb25E", symbol: "BRONMock", decimals: 18 },
  { address: "0x75355a85c6FB9df5f0C80FF54e8747EEe9a0BF57", symbol: "ZAMAMock", decimals: 18 },
  { address: "0x93c931278A2aad1916783F952f94276eA5111442", symbol: "tGBPMock", decimals: 18 },
  { address: "0x24377AE4AA0C45ecEe71225007f17c5D423dd940", symbol: "XAUtMock", decimals: 18 }
];

/*************** Known Token Pairs ***************/

/** Known token pairs mapped to standard types. */
export const KNOWN_TOKEN_PAIRS = WRAPPER_PAIRS.map((pair) => ({
  name: pair.erc20.symbol.replace("Mock", ""),
  symbol: pair.erc20.symbol,
  tokenAddress: pair.erc20.address as Address,
  confidentialTokenAddress: pair.erc7984.address as Address,
  decimals: pair.erc20.decimals,
  isValid: true,
}));

/*************** RPC Configuration ***************/

/** Public Sepolia RPC endpoint (CORS-friendly). */
export const SEPOLIA_RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";

/** WalletConnect project ID placeholder. */
export const WALLETCONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";
