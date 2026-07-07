/**
 * @file __tests__/registry-merge.test.ts
 * @description Unit tests for lib/registry-merge.ts — the pure isValid-overlay
 * and dedup logic shared by useChainPairs (selectors) and useRegistry (browse).
 */
import { describe, it, expect } from "vitest";
import {
  pairKey,
  normalizeOnchainItem,
  normalizeStaticPair,
  mergeForSelectors,
  mergeForBrowse,
  type NormalizedPair,
  type StaticPairInput,
} from "@/lib/registry-merge";

const SEPOLIA = 11155111;
const MAINNET = 1;
const chainName = (id: number) => (id === MAINNET ? "Mainnet" : "Sepolia");

/* ─────────── Test fixtures ─────────── */

/** A static pair on Sepolia. */
function staticPair(confidential: string, chainId = SEPOLIA): StaticPairInput {
  return {
    erc20: { address: `0xERC20${confidential}`, symbol: "FOO", decimals: 18, name: "Foo" },
    erc7984: { address: confidential, symbol: "cFOO", decimals: 18 },
    chainId,
  };
}

/** A raw on-chain SDK item. */
function onchainItem(confidential: string, isValid: boolean, chainId = SEPOLIA) {
  return {
    tokenAddress: `0xERC20${confidential}`,
    confidentialTokenAddress: confidential,
    isValid,
    chainId,
    underlying: { symbol: "FOO", decimals: 18, name: "Foo" },
  };
}

/* ─────────── pairKey ─────────── */

describe("pairKey", () => {
  it("is chain-scoped and case-insensitive on the address", () => {
    expect(pairKey(SEPOLIA, "0xABCdef")).toBe(pairKey(SEPOLIA, "0xabcDEF"));
  });

  it("differs across chains for the same address", () => {
    expect(pairKey(SEPOLIA, "0xabc")).not.toBe(pairKey(MAINNET, "0xabc"));
  });
});

/* ─────────── normalization ─────────── */

describe("normalizeOnchainItem", () => {
  it("maps SDK fields and preserves isValid=false", () => {
    const p = normalizeOnchainItem(onchainItem("0xC1", false), SEPOLIA, chainName);
    expect(p.isValid).toBe(false);
    expect(p.source).toBe("registry");
    expect(p.erc7984.address).toBe("0xC1");
    expect(p.erc20.name).toBe("Foo");
  });

  it("defaults isValid to true when the SDK omits it", () => {
    const item = { confidentialTokenAddress: "0xC2", tokenAddress: "0xU2" };
    const p = normalizeOnchainItem(item, SEPOLIA, chainName);
    expect(p.isValid).toBe(true);
  });

  it("derives a confidential symbol when absent", () => {
    const p = normalizeOnchainItem(onchainItem("0xC3", true), SEPOLIA, chainName);
    expect(p.erc7984.symbol).toBe("cFOO");
  });
});

describe("normalizeStaticPair", () => {
  it("marks static pairs valid and tagged as static", () => {
    const p = normalizeStaticPair(staticPair("0xC4"), chainName);
    expect(p.isValid).toBe(true);
    expect(p.source).toBe("static");
  });
});

/* ─────────── mergeForSelectors (Wrap/Decrypt) ─────────── */

describe("mergeForSelectors", () => {
  it("drops on-chain pairs the registry marked invalid", () => {
    const onchain = [normalizeOnchainItem(onchainItem("0xC1", false), SEPOLIA, chainName)];
    const result = mergeForSelectors(onchain, [], SEPOLIA);
    expect(result).toHaveLength(0);
  });

  it("keeps valid on-chain pairs", () => {
    const onchain = [normalizeOnchainItem(onchainItem("0xC1", true), SEPOLIA, chainName)];
    const result = mergeForSelectors(onchain, [], SEPOLIA);
    expect(result).toHaveLength(1);
    expect(result[0].source).toBe("registry");
  });

  it("suppresses a static pair that the registry revoked", () => {
    /* Same confidential address appears both statically and on-chain-as-revoked. */
    const addr = "0xCRevoked";
    const onchain = [normalizeOnchainItem(onchainItem(addr, false), SEPOLIA, chainName)];
    const statics = [normalizeStaticPair(staticPair(addr), chainName)];
    const result = mergeForSelectors(onchain, statics, SEPOLIA);
    expect(result).toHaveLength(0);
  });

  it("includes a static pair the registry never returned", () => {
    const statics = [normalizeStaticPair(staticPair("0xConlyStatic"), chainName)];
    const result = mergeForSelectors([], statics, SEPOLIA);
    expect(result).toHaveLength(1);
    expect(result[0].source).toBe("static");
  });

  it("does not duplicate a pair present both on-chain (valid) and statically", () => {
    const addr = "0xCshared";
    const onchain = [normalizeOnchainItem(onchainItem(addr, true), SEPOLIA, chainName)];
    const statics = [normalizeStaticPair(staticPair(addr), chainName)];
    const result = mergeForSelectors(onchain, statics, SEPOLIA);
    expect(result).toHaveLength(1);
    /* On-chain wins on collision. */
    expect(result[0].source).toBe("registry");
  });

  it("filters on-chain pairs to the requested chain", () => {
    const onchain = [normalizeOnchainItem(onchainItem("0xCm", true, MAINNET), MAINNET, chainName)];
    const result = mergeForSelectors(onchain, [], SEPOLIA);
    expect(result).toHaveLength(0);
  });
});

/* ─────────── mergeForBrowse (Registry table) ─────────── */

describe("mergeForBrowse", () => {
  it("keeps the static base stable and valid by default", () => {
    const statics = [
      normalizeStaticPair(staticPair("0xC1"), chainName),
      normalizeStaticPair(staticPair("0xC2", MAINNET), chainName),
    ];
    const result = mergeForBrowse([], statics);
    expect(result).toHaveLength(2);
    expect(result.every((p) => p.isValid)).toBe(true);
  });

  it("overlays an on-chain revocation onto a static pair (kept but invalid)", () => {
    const addr = "0xCrevoked";
    const onchain = [normalizeOnchainItem(onchainItem(addr, false), SEPOLIA, chainName)];
    const statics = [normalizeStaticPair(staticPair(addr), chainName)];
    const result = mergeForBrowse(onchain, statics);
    /* Not dropped — still shown so it can be badged. */
    expect(result).toHaveLength(1);
    expect(result[0].isValid).toBe(false);
  });

  it("appends genuinely-new on-chain pairs, including invalid ones", () => {
    const statics = [normalizeStaticPair(staticPair("0xCstatic"), chainName)];
    const onchain = [normalizeOnchainItem(onchainItem("0xCnew", false), SEPOLIA, chainName)];
    const result = mergeForBrowse(onchain, statics);
    expect(result).toHaveLength(2);
    const added = result.find((p) => p.erc7984.address === "0xCnew");
    expect(added?.isValid).toBe(false);
  });

  it("does not duplicate a pair present in both sources", () => {
    const addr = "0xCshared";
    const statics = [normalizeStaticPair(staticPair(addr), chainName)];
    const onchain = [normalizeOnchainItem(onchainItem(addr, true), SEPOLIA, chainName)];
    const result = mergeForBrowse(onchain, statics);
    expect(result).toHaveLength(1);
  });

  it("skips malformed on-chain items with no confidential address", () => {
    const onchain: NormalizedPair[] = [
      normalizeOnchainItem({ confidentialTokenAddress: "" }, SEPOLIA, chainName),
    ];
    const result = mergeForBrowse(onchain, []);
    expect(result).toHaveLength(0);
  });
});
