# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

ZARP Protocol is a **frontend-only** dApp for the Zama Confidential Wrappers Registry. It lets a wallet browse official ERC-20 ↔ ERC-7984 confidential wrapper pairs, wrap/unwrap (shield/unshield) between them, and decrypt confidential balances via the EIP-712 user-decryption flow — on Sepolia and Ethereum mainnet. There are **no smart contracts in this repo**; all on-chain contracts (the WrappersRegistry, tokens, faucet) are external and read/called through the Zama SDK and wagmi.

The FHEVM rules in the parent `../.claude/CLAUDE.md` apply because this project uses `@zama-fhe/sdk@^3` and `@zama-fhe/react-sdk@^3` (the new high-level Token API — **not** the low-level Solidity/relayer primitives). Consult its skill references for SDK behavior.

## Commands

All commands run from `frontend/` (the app is not at repo root):

```bash
cd frontend
npm install          # postinstall auto-runs scripts/patch-zama-sdk.js (see below)
npm run dev          # http://localhost:3000
npm run build        # production build
npm start            # serve production build
npm run lint         # next lint (eslint)
npm test             # vitest run (one-shot)
npm run test:watch   # vitest watch mode
npx vitest run __tests__/utils.test.ts    # single test file
```

- **Node 22+ is required** (`@zama-fhe/sdk` declares `engines.node >= 22`).
- **First run on Sepolia needs zero env config** — public RPC + keyless Sepolia relayer defaults are baked in. Copy `.env.example` → `.env.local` only for mainnet or production RPC/WalletConnect keys.
- Tests use vitest + jsdom + Testing Library. The `@` alias maps to `frontend/` root (mirrors `tsconfig` paths). Tests live in `__tests__/` and currently cover pure logic only (`utils.ts`, `registry-data.ts`) — no component/hook rendering tests.

## Critical non-obvious constraints

- **`scripts/patch-zama-sdk.js` runs on every `npm install`.** `@zama-fhe/react-sdk` ships a wagmi v3 import (`watchConnection`) but this project pins wagmi v2; the postinstall rewrites the built file to `watchAccount`. If SDK wagmi behavior breaks after a reinstall or SDK bump, check this patch still matches the shipped `dist/wagmi/index.js`.
- **`package.json` `overrides` pins `@zama-fhe/relayer-sdk` to exactly `0.4.1`.** The new SDK is a superset built on this transitive dep. If install fails on relayer-sdk versions, `rm -rf node_modules package-lock.json && npm install`.
- **COOP/COEP headers are mandatory** (`next.config.mjs`): `Cross-Origin-Opener-Policy: same-origin` + `Cross-Origin-Embedder-Policy: credentialless`. The FHE WASM needs `SharedArrayBuffer`; `credentialless` (not `require-corp`) is chosen specifically so RainbowKit/WalletConnect keeps working. If encryption/WASM init fails, a host stripping these headers is the first suspect.
- **The Zama SDK cannot run during SSR.** `RelayerWeb` opens a Web Worker + IndexedDB at construction. `providers/FhevmProvider.tsx` is `"use client"` and gates construction behind a `mounted` flag (renders an "Initializing FHE Environment" loader until `useEffect` fires). Never import `lib/fhevm.ts` or construct SDK objects at module level in a Server Component.

## Architecture

Everything is a Next.js 14 App Router client-side flow. Data path:

```
FhevmProvider (providers/FhevmProvider.tsx)
  WagmiProvider → QueryClientProvider → ZamaProvider → RainbowKitProvider
   • wagmi: mainnet + sepolia, each with a `fallback` transport (configured RPC → public backups)
   • ZamaProvider: RelayerWeb + WagmiSigner + indexedDBStorage + KEYPAIR_TTL/SESSION_TTL
   • ZamaProvider MUST be inside QueryClientProvider (every Zama hook is TanStack Query based)
   • WagmiSigner auto-revokes the FHE session on account change / disconnect
```

- **Feature routes** (`app/registry`, `app/wrap`, `app/decrypt`, `app/faucet`) are thin `page.tsx` clients that consume hooks. Shared UI is in `components/` (`Navigation`, `Footer`, `ShieldSphere` (three.js), scroll/reveal animation helpers using gsap).
- **Hooks (`hooks/`) hold all logic:**
  - `useChainPairs.ts` — the **source-of-truth resolver**. On-chain registry (`useListPairs`) is primary; `getStaticPairs()` from `lib/registry-data.ts` merges in as fallback/extension. On address collision, **on-chain wins**. Filters to the connected chain.
  - `useWrap.ts` — shield/unshield lifecycle over `useShield`/`useUnshield`/`useResumeUnshield`. Tracks a `WrapPhase` state machine (approving → wrapping → complete, or unwrapping → finalizing → complete). Unshield is a resumable two-phase op (`useResumeUnshield` finalizes an interrupted unwrap by tx hash).
  - `useDecrypt.ts` — full EIP-712 user-decryption lifecycle (`idle → signing → submitting → polling → success/error`). Pattern: `useAllow` once per session → `sdk.createReadonlyToken(addr).balanceOf()` does the actual decrypt. 30s relayer timeout via `Promise.race`; abortable via `AbortController`.
  - `useRegistry.ts` (browse/search), `useFaucet.ts` (Sepolia `cTokenMock` mint).
- **`lib/registry-data.ts`** — single config module: chain ids, registry contract addresses, static `SEPOLIA_PAIRS`/`MAINNET_PAIRS`, `CUSTOM_PAIRS` (the local extension point), RPC URLs, faucet address. **Adding a pair the on-chain registry doesn't list = append to `CUSTOM_PAIRS`.** Registry addresses: Sepolia `0x2f0750Bbb0A246059d80e94c454586a7F27a128e`, Mainnet `0xeb5015fF021DB115aCe010f23F55C2591059bBA0`.
- **`lib/fhevm.ts`** — relayer URL resolution + TTLs. Sepolia uses the open keyless relayer; mainnet routes through the proxy when `NEXT_PUBLIC_RELAYER_PROXY_URL` is set.

### Relayer proxy (the one server-side piece)

`app/api/relayer/[...path]/route.ts` is the **only** non-client code. It keeps the mainnet relayer API key server-side: the browser SDK points at `/api/relayer`, the route injects `x-api-key`, forwards `zama-sdk-version`/`zama-sdk-name`, and **strips `content-encoding`/`content-length`** from the upstream response (Node fetch already decoded the body — forwarding those headers causes `ERR_CONTENT_DECODING_FAILED` in the browser). First path segment is the chainId. Hardened with origin/referer host-matching and per-IP token-bucket rate limiting (60 req/min). Sepolia works without a key; mainnet returns 503 if `RELAYER_API_KEY` is unset.

### Error handling convention

All SDK-facing async flows use `matchZamaError(err, { CODE: () => msg, _: () => fallback })` to map SDK error classes to user-facing strings. Decrypt/allow paths include a **retry loop** (up to 10× / 500ms) that swallows transient "worker not initialized" / WASM-loading errors — the FHE Web Worker may not be ready immediately after mount.

## Confidentiality invariant

Balances are decrypted **client-side only**, after the user's own EIP-712 signature. No plaintext balance is ever logged, emitted, or sent to the app backend. Preserve this when touching decrypt flows. Distinguish "never shielded" (zero handle — use `isZeroHandle`) from "zero balance"; never surface a missing ciphertext as `0`.
