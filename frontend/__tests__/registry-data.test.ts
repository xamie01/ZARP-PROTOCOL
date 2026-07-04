/**
 * @file __tests__/registry-data.test.ts
 * @description Unit tests for lib/registry-data.ts — pair data integrity,
 * address verification, and helper functions.
 */
import { describe, it, expect } from "vitest";
import {
  SEPOLIA_PAIRS,
  MAINNET_PAIRS,
  CUSTOM_PAIRS,
  ALL_STATIC_PAIRS,
  WRAPPER_PAIRS,
  REGISTRY_ADDRESSES,
  SEPOLIA_CHAIN_ID,
  MAINNET_CHAIN_ID,
  getStaticPairs,
  getFaucetAmountForDecimals,
  FAUCET_HUMAN_AMOUNT,
  explorerUrl,
  type WrapperPairConfig,
} from "@/lib/registry-data";

/* ─────────── Pair count integrity ─────────── */

describe("pair counts", () => {
  it("has exactly 8 Sepolia pairs (7 mock + 1 non-mock)", () => {
    expect(SEPOLIA_PAIRS).toHaveLength(8);
  });

  it("has exactly 7 Mainnet pairs", () => {
    expect(MAINNET_PAIRS).toHaveLength(7);
  });

  it("CUSTOM_PAIRS starts empty", () => {
    expect(CUSTOM_PAIRS).toHaveLength(0);
  });

  it("ALL_STATIC_PAIRS = Sepolia + Mainnet + Custom", () => {
    expect(ALL_STATIC_PAIRS).toHaveLength(
      SEPOLIA_PAIRS.length + MAINNET_PAIRS.length + CUSTOM_PAIRS.length
    );
  });

  it("WRAPPER_PAIRS is the Sepolia set", () => {
    expect(WRAPPER_PAIRS).toBe(SEPOLIA_PAIRS);
  });
});

/* ─────────── Address format validation ─────────── */

describe("address format", () => {
  const allPairs = [...SEPOLIA_PAIRS, ...MAINNET_PAIRS];

  it("all ERC-20 addresses are valid 0x-prefixed, 42-char hex", () => {
    for (const pair of allPairs) {
      expect(pair.erc20.address).toMatch(/^0x[0-9a-fA-F]{40}$/);
    }
  });

  it("all ERC-7984 addresses are valid 0x-prefixed, 42-char hex", () => {
    for (const pair of allPairs) {
      expect(pair.erc7984.address).toMatch(/^0x[0-9a-fA-F]{40}$/);
    }
  });

  it("no duplicate ERC-7984 addresses within the same chain", () => {
    const sepoliaAddrs = SEPOLIA_PAIRS.map((p) => p.erc7984.address.toLowerCase());
    expect(new Set(sepoliaAddrs).size).toBe(sepoliaAddrs.length);

    const mainnetAddrs = MAINNET_PAIRS.map((p) => p.erc7984.address.toLowerCase());
    expect(new Set(mainnetAddrs).size).toBe(mainnetAddrs.length);
  });

  it("no duplicate ERC-20 addresses within the same chain", () => {
    const sepoliaAddrs = SEPOLIA_PAIRS.map((p) => p.erc20.address.toLowerCase());
    expect(new Set(sepoliaAddrs).size).toBe(sepoliaAddrs.length);

    const mainnetAddrs = MAINNET_PAIRS.map((p) => p.erc20.address.toLowerCase());
    expect(new Set(mainnetAddrs).size).toBe(mainnetAddrs.length);
  });
});

/* ─────────── Chain ID correctness ─────────── */

describe("chain IDs", () => {
  it("all Sepolia pairs carry SEPOLIA_CHAIN_ID", () => {
    for (const pair of SEPOLIA_PAIRS) {
      expect(pair.chainId).toBe(SEPOLIA_CHAIN_ID);
    }
  });

  it("all Mainnet pairs carry MAINNET_CHAIN_ID", () => {
    for (const pair of MAINNET_PAIRS) {
      expect(pair.chainId).toBe(MAINNET_CHAIN_ID);
    }
  });
});

/* ─────────── 8th Sepolia pair (non-mock ctGBP) ─────────── */

describe("8th Sepolia pair — non-mock ctGBP", () => {
  const ctGBP = SEPOLIA_PAIRS.find((p) => p.erc7984.symbol === "ctGBP");

  it("exists in the Sepolia pairs", () => {
    expect(ctGBP).toBeDefined();
  });

  it("has the correct ERC-20 address", () => {
    expect(ctGBP!.erc20.address).toBe("0xf6Ef9ADB61A48E29E36bc873070A46A3D2667ff3");
  });

  it("has the correct ERC-7984 address", () => {
    expect(ctGBP!.erc7984.address).toBe("0x167DC962808B32CFFFc7e14B5018c0bE06A3A208");
  });

  it("has tGBP as the underlying symbol (not tGBPMock)", () => {
    expect(ctGBP!.erc20.symbol).toBe("tGBP");
  });

  it("has 18 decimals on both sides", () => {
    expect(ctGBP!.erc20.decimals).toBe(18);
    expect(ctGBP!.erc7984.decimals).toBe(18);
  });
});

/* ─────────── Mock vs non-mock classification ─────────── */

describe("mock token naming", () => {
  it("exactly 7 Sepolia tokens end with 'Mock'", () => {
    const mocks = SEPOLIA_PAIRS.filter((p) => p.erc20.symbol.endsWith("Mock"));
    expect(mocks).toHaveLength(7);
  });

  it("exactly 1 Sepolia token does NOT end with 'Mock'", () => {
    const nonMock = SEPOLIA_PAIRS.filter((p) => !p.erc20.symbol.endsWith("Mock"));
    expect(nonMock).toHaveLength(1);
    expect(nonMock[0].erc20.symbol).toBe("tGBP");
  });
});

/* ─────────── Registry addresses ─────────── */

describe("registry contract addresses", () => {
  it("Sepolia registry address is present and valid", () => {
    expect(REGISTRY_ADDRESSES[SEPOLIA_CHAIN_ID]).toMatch(/^0x[0-9a-fA-F]{40}$/);
  });

  it("Mainnet registry address is present and valid", () => {
    expect(REGISTRY_ADDRESSES[MAINNET_CHAIN_ID]).toMatch(/^0x[0-9a-fA-F]{40}$/);
  });

  it("Sepolia registry matches known address", () => {
    expect(REGISTRY_ADDRESSES[SEPOLIA_CHAIN_ID]).toBe(
      "0x2f0750Bbb0A246059d80e94c454586a7F27a128e"
    );
  });

  it("Mainnet registry matches known address", () => {
    expect(REGISTRY_ADDRESSES[MAINNET_CHAIN_ID]).toBe(
      "0xeb5015fF021DB115aCe010f23F55C2591059bBA0"
    );
  });
});

/* ─────────── getStaticPairs ─────────── */

describe("getStaticPairs", () => {
  it("returns Sepolia pairs for SEPOLIA_CHAIN_ID", () => {
    const result = getStaticPairs(SEPOLIA_CHAIN_ID);
    expect(result).toHaveLength(SEPOLIA_PAIRS.length);
    result.forEach((p: WrapperPairConfig) => expect(p.chainId).toBe(SEPOLIA_CHAIN_ID));
  });

  it("returns Mainnet pairs for MAINNET_CHAIN_ID", () => {
    const result = getStaticPairs(MAINNET_CHAIN_ID);
    expect(result).toHaveLength(MAINNET_PAIRS.length);
    result.forEach((p: WrapperPairConfig) => expect(p.chainId).toBe(MAINNET_CHAIN_ID));
  });

  it("returns empty for unknown chain", () => {
    expect(getStaticPairs(999999)).toHaveLength(0);
  });
});

/* ─────────── getFaucetAmountForDecimals ─────────── */

describe("getFaucetAmountForDecimals", () => {
  it("returns 1000 * 10^18 for 18 decimals", () => {
    expect(getFaucetAmountForDecimals(18)).toBe(FAUCET_HUMAN_AMOUNT * 10n ** 18n);
  });

  it("returns 1000 * 10^6 for 6 decimals", () => {
    expect(getFaucetAmountForDecimals(6)).toBe(FAUCET_HUMAN_AMOUNT * 10n ** 6n);
  });

  it("returns 1000 * 10^0 = 1000 for 0 decimals", () => {
    expect(getFaucetAmountForDecimals(0)).toBe(FAUCET_HUMAN_AMOUNT);
  });

  it("scales correctly for 8 decimals (like WBTC)", () => {
    expect(getFaucetAmountForDecimals(8)).toBe(1000n * 10n ** 8n);
  });
});

/* ─────────── explorerUrl ─────────── */

describe("explorerUrl", () => {
  const addr = "0x1234567890abcdef1234567890abcdef12345678";

  it("builds Sepolia address URL", () => {
    expect(explorerUrl(SEPOLIA_CHAIN_ID, "address", addr)).toBe(
      `https://sepolia.etherscan.io/address/${addr}`
    );
  });

  it("builds Mainnet tx URL", () => {
    const txHash = "0xabc123";
    expect(explorerUrl(MAINNET_CHAIN_ID, "tx", txHash)).toBe(
      `https://etherscan.io/tx/${txHash}`
    );
  });

  it("defaults to Sepolia for unknown chain", () => {
    expect(explorerUrl(999999, "address", addr)).toBe(
      `https://sepolia.etherscan.io/address/${addr}`
    );
  });
});
