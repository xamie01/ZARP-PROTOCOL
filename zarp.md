# ZARP Protocol — Pre-Submission Checklist

**Deadline:** July 7, 2026, 23:59 AOE (Zama Developer Program, Bounty Track — Confidential Wrapper Registry App)
**Today:** July 2, 2026 — 5 days left
**Source of truth:** https://forms.zama.org/developer-program-mainnet-season3-bounty-track

Work top to bottom. Sections 1–2 are the only things that affect whether the app is *correct and safe*; everything after that is about how well it scores.

## Corrections after reading the official form directly

- **Requirements, verbatim from the form:** (1) a functioning dApp — code base + working demo deployed on a website, (2) a 3-minute real-person video pitch (AI-generated video/voice will not be considered), (3) a thread or article published on X introducing the project. That third item — **the X thread/article — was missing from earlier guidance in this thread.** It's now in Section 7 below.
- **Testnet vs. mainnet:** the form's own wording is "surfaces every ERC-20 ↔ ERC-7984 wrapper pair **on testnet**" — the literal requirement is Sepolia coverage, not explicitly both networks. Your mainnet support is a bonus that exceeds the stated bar, not something you were missing — no action needed, just don't stress if mainnet polish takes a back seat to Sepolia this week.
- **Wrapper addresses — verified, not just recommended:** I pulled Zama's official Sepolia and Mainnet Wrappers Registry address pages (linked from the form) and diffed every address in `lib/registry-data.ts` against them by hand. All 7 Sepolia mock pairs and all 7 Mainnet pairs are byte-for-byte correct, including the registry contract address on both chains. This closes out the "manually verify addresses" item from before — with one gap found, below.

---

## 1. Critical — fix before anything else

- [x] **Fix floating-point amount parsing bug**
  File: `app/wrap/page.tsx`, line ~91
  Replace `BigInt(Math.floor(parseFloat(state.amount) * 10 ** decimals))` with viem's `parseUnits(state.amount, decimals)` (already a dependency). This is the one confirmed correctness bug — verified it produces wrong values on real inputs (e.g. `1.1` → off by 128 wei).

- [x] **Harden the relayer proxy**
  File: `app/api/relayer/[...path]/route.ts`
  Currently a fully open, unauthenticated proxy that attaches your billed mainnet `RELAYER_API_KEY` to any request hitting the route, from any origin. Add:
  - Origin/Referer check — reject anything not from your own deployed domain
  - Basic per-IP rate limiting (in-memory token bucket is fine for a bounty submission)

---

## 2. Code quality / production-readiness cleanup

- [x] **Remove error-hiding build flags**
  File: `next.config.mjs` — delete `typescript: { ignoreBuildErrors: true }` and `eslint: { ignoreDuringBuilds: true }`. Confirmed these currently hide zero real errors (`tsc --noEmit` and `next lint` both pass clean) — but they're a red flag to reviewers and a landmine for future edits.

- [x] **Upgrade Next.js** (Note: `next@14.2.29` is already the latest 14.2.x release; vulnerabilities are in deep peer dependencies like `ws` that cannot be updated without breaking peer configs.)

- [x] **Delete stray root-level `package-lock.json`**
  Empty file at repo root with `"name": "ZARP-PROTOCOOL"` (typo), no matching `package.json`. Leftover from running `npm` in the wrong directory — delete it.

- [x] **Clean up placeholder values in `useDecrypt.ts`**
  `signature` / `relayerJobId` are hardcoded strings (`"eip712_session_cached"`, etc.) instead of real SDK return values. The actual decrypted balance is genuine — just wire these to real values or remove them if unused downstream.

- [x] **Remove dead code**
  Files: `lib/faucet.ts`, `lib/registry-data.ts` — `getFaucetAddress()`, `buildMintConfig()`, `KNOWN_TOKEN_PAIRS`, `CTOKEN_MOCKS`, and the `@deprecated FAUCET_AMOUNT` export are all unused outside their own definition files (confirmed via grep). Trim, or add a comment explaining why they're kept.

- [x] **Gitignore the `.claude/` tooling folder**
  It's committed to the repo currently — not sensitive, just noise for a judge browsing the tree.

---

## 3. UX polish

- [x] **Add a loading fallback in `FhevmProvider`**
  Currently renders `null` for the entire app until `mounted && signer && relayer` are all ready — blank white screen on first load while WASM/IndexedDB spin up. Add a minimal spinner/skeleton.

---

## 4. Testing (time-permitting)

- [ ] Add a handful of unit tests — no test framework is configured at all right now, and "coverage" is a named judging criterion. Highest-value targets:
  - `formatTokenAmount` (`lib/utils.ts`)
  - `getFaucetAmountForDecimals` (`lib/faucet.ts`)
  - The on-chain/static merge logic in `useRegistry.ts` / `useChainPairs.ts`

---

## 5. Manual verification (can't be done from code alone)

- [ ] **Live end-to-end test on both networks:** connect → switch network → browse registry → claim faucet (Sepolia) → wrap → decrypt → unwrap. Do this on Sepolia *and* Mainnet before recording the video — this is the actual proof of "coverage," not just the code existing.
- [x] **Wrapper contract addresses — verified against official Zama docs.** All 7 Sepolia mock pairs, all 7 Mainnet pairs, and both registry contract addresses in `lib/registry-data.ts` match Zama's official address pages exactly. No corrections needed here.
- [x] **Add the missing 8th Sepolia pair: non-mock `ctGBP`.** Zama's Sepolia docs list an 8th wrapper your `SEPOLIA_PAIRS` array doesn't have — a non-mock "Confidential tGBP" with a **restricted-mint** underlying (not claimable via the public faucet, unlike your other 7 pairs):
  ```ts
  {
    erc20:   { address: "0xf6Ef9ADB61A48E29E36bc873070A46A3D2667ff3", symbol: "tGBP",  decimals: 18 },
    erc7984: { address: "0x167DC962808B32CFFFc7e14B5018c0bE06A3A208", symbol: "ctGBP", decimals: 18 },
    chainId: SEPOLIA_CHAIN_ID,
  },
  ```
  Your architecture reads the on-chain registry first (`useListPairs`), so this pair may already surface live even without this — but the static fallback should still include it, since "surfaces every pair" is the bounty's literal wording and this is the one pair currently absent from your source. If you add it, also note in the UI/README that its underlying token has **restricted minting** (can't be claimed from your faucet like the other 7), so a user clicking wrap on it isn't left confused when the faucet doesn't work for it.

---

## 6. README edits

- [x] **Add "Live Demo & Video" section** (draft already written — insert after the intro bullets, before `## Architecture`):
  ```markdown
  🔗 **Live app:** [ADD_VERCEL_URL_HERE]
  🎥 **Video walkthrough (~3 min):** [ADD_VIDEO_URL_HERE]
  ```
- [x] **Add a "How this satisfies the bounty" section** — explicitly map your 4 features (registry browse / wrap+unwrap / EIP-712 decrypt / Sepolia faucet) to the bounty's own wording, so a judge doesn't have to infer the match.
- [x] **Fix the License section** — README currently says "Open source. See repository for details," but no `LICENSE` file exists in the repo. Add an actual `LICENSE` file (MIT is the common default) and update the line to reference it correctly.
- [ ] **Add screenshots or a short GIF** of the registry, wrap, and decrypt pages. A UX-judged submission with zero visuals in the README undersells itself.
- [x] **Make setup instructions impossible to misread** — first line under "Getting Started" should be `cd frontend`, since everything lives one level below repo root and that's already caused one stray artifact (the orphan lockfile).

---

## 7. Submission deliverables (outside the codebase) — per the official form

- [ ] **Deploy to Vercel** — root directory setting = `frontend`. Set env vars (`RELAYER_API_KEY`, etc.) for mainnet decrypt to work live. *(Form requirement: "working demo deployed on a website.")*
- [ ] **Test the live link yourself in a fresh incognito tab**, no wallet pre-connected — that's the exact state a judge will be in.
- [ ] **Record the video walkthrough** — exactly what the form asks for: **3 minutes, real person only** ("AI-generated video or voice will not be considered"). Cover: problem → registry browse → faucet → wrap → decrypt → unwrap.
- [ ] **Publish a thread or article on X introducing the project.** This is a separate, explicit form requirement, not optional — write a short thread (5–8 posts is typical) covering: the registry-fragmentation problem, what ZARP does about it, a screenshot or clip of the app, and the live demo link. Post before the July 7 deadline so it can be linked in your submission.
- [ ] **Fill out the submission form itself** at the link above with: code base link, live demo link, video link, X thread/article link.

---

## Suggested order given 5 days left

1. Day 1: Section 1 (critical fixes) + Section 2 (cleanup)
2. Day 2: Section 3 (UX) + start Section 6 (README)
3. Day 3: Deploy to Vercel, do Section 5 (manual live testing on both networks)
4. Day 4: Record video, finish README, Section 4 (tests) if time allows
5. Day 5: Buffer — fresh-eyes pass on the live link, submit early rather than at the deadline
