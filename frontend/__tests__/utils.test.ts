/**
 * @file __tests__/utils.test.ts
 * @description Unit tests for lib/utils.ts utility functions.
 */
import { describe, it, expect } from "vitest";
import { formatTokenAmount, truncateAddress } from "@/lib/utils";

/* ─────────── formatTokenAmount ─────────── */

describe("formatTokenAmount", () => {
  it("formats zero correctly", () => {
    expect(formatTokenAmount(0n)).toBe("0");
  });

  it("formats whole token amounts (18 decimals)", () => {
    // 1 token = 1 * 10^18
    const oneToken = 10n ** 18n;
    expect(formatTokenAmount(oneToken, 18)).toBe("1");
  });

  it("formats large whole amounts with commas", () => {
    // 1,000,000 tokens
    const amount = 1_000_000n * 10n ** 18n;
    expect(formatTokenAmount(amount, 18)).toBe("1,000,000");
  });

  it("formats fractional amounts with up to 4 decimal places", () => {
    // 1.5 tokens = 1.5 * 10^18
    const amount = 15n * 10n ** 17n; // 1.5e18
    const result = formatTokenAmount(amount, 18);
    expect(result).toBe("1.5000");
  });

  it("formats USDC-style 6-decimal tokens", () => {
    // 100 USDC = 100 * 10^6
    const amount = 100n * 10n ** 6n;
    expect(formatTokenAmount(amount, 6)).toBe("100");
  });

  it("formats fractional 6-decimal tokens", () => {
    // 1.23 USDC = 1_230_000
    const amount = 1_230_000n;
    expect(formatTokenAmount(amount, 6)).toBe("1.2300");
  });

  it("handles very small amounts (sub-penny)", () => {
    // 0.0001 tokens (18 dec) = 10^14
    const amount = 10n ** 14n;
    expect(formatTokenAmount(amount, 18)).toBe("0.0001");
  });

  it("handles amounts smaller than 4 displayed decimals", () => {
    // 1 wei (smallest unit, 18 dec) = 1n
    // Whole = 0, remainder = 1, padded to 18 chars, first 4 = "0000"
    const result = formatTokenAmount(1n, 18);
    expect(result).toBe("0");
  });

  it("uses 18 decimals as default", () => {
    const oneToken = 10n ** 18n;
    expect(formatTokenAmount(oneToken)).toBe("1");
  });

  it("handles maximum safe amounts", () => {
    // 1 billion tokens with 18 decimals
    const amount = 1_000_000_000n * 10n ** 18n;
    const result = formatTokenAmount(amount, 18);
    expect(result).toBe("1,000,000,000");
  });
});

/* ─────────── truncateAddress ─────────── */

describe("truncateAddress", () => {
  const addr = "0x1234567890abcdef1234567890abcdef12345678";

  it("truncates with default 4 chars", () => {
    expect(truncateAddress(addr)).toBe("0x1234...5678");
  });

  it("truncates with custom char count", () => {
    expect(truncateAddress(addr, 6)).toBe("0x123456...345678");
  });

  it("returns empty string for empty input", () => {
    expect(truncateAddress("")).toBe("");
  });

  it("returns empty string for undefined-like input", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(truncateAddress(undefined as any)).toBe("");
  });
});
