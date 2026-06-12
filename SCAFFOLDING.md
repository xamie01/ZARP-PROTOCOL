# Scaffolding ZARP from scratch + deploying to Vercel

A step-by-step guide to rebuild this dApp from an empty folder and ship it live.
It targets the exact stack this repo uses: **Next.js 14 (App Router) · TypeScript
· Tailwind · wagmi v2 + RainbowKit · `@zama-fhe/sdk@^3` / `@zama-fhe/react-sdk@^3`**.

Estimated time: ~30–45 min to a live Sepolia URL.

---

## 0. Prerequisites

- **Node.js 22+** (`node -v` → v22.x). The Zama SDK requires it.
- **Git** + a **GitHub** account.
- A browser wallet (**MetaMask**) and some **Sepolia test ETH** for gas
  (`https://www.alchemy.com/faucets/ethereum-sepolia`).
- A **Vercel** account (free) for deployment.

---

## 1. Create the Next.js app

```bash
npx create-next-app@14 zarp-frontend \
  --typescript --tailwind --app --eslint --src-dir=false --import-alias "@/*"
cd zarp-frontend
```

Choose the App Router. This gives you `app/`, `tailwind.config.ts`, `tsconfig.json`
with the `@/*` alias, and ESLint.

---

## 2. Install dependencies

```bash
# Web3 + wallet
npm i wagmi viem @tanstack/react-query @rainbow-me/rainbowkit

# Zama FHE SDK (new Token API + React hooks)
npm i @zama-fhe/sdk @zama-fhe/react-sdk

# UI bits used by this project
npm i lucide-react three react-countup class-variance-authority clsx tailwind-merge
npm i -D @types/three
```

### 2a. Pin the relayer SDK (required)

`@zama-fhe/sdk` and the FHEVM toolchain disagree on the transitive
`@zama-fhe/relayer-sdk` version. Pin it in `package.json`:

```jsonc
{
  "engines": { "node": ">=22" },
  "overrides": {
    "@zama-fhe/relayer-sdk": "0.4.1"
  },
  "scripts": {
    "postinstall": "node scripts/patch-zama-sdk.js"
  }
}
```

Then reinstall clean:

```bash
rm -rf node_modules package-lock.json && npm install
```

### 2b. Wagmi v2 compatibility patch

`@zama-fhe/react-sdk` imports a wagmi v3 action that doesn't exist in v2. Add
`scripts/patch-zama-sdk.js` (copy it from this repo — it swaps `watchConnection`
for `watchAccount` in the installed SDK). The `postinstall` hook above runs it
automatically after every install.

---

## 3. COOP/COEP headers (FHE WASM requirement)

The FHE WASM needs `SharedArrayBuffer`, which requires cross-origin isolation.
Create `next.config.mjs`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "Cross-Origin-Opener-Policy",   value: "same-origin" },
        { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
      ],
    }];
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false, net: false, tls: false,
      "pino-pretty": false,
      "@react-native-async-storage/async-storage": false,
    };
    return config;
  },
};
export default nextConfig;
```

> Use `credentialless` (not `require-corp`) so RainbowKit/WalletConnect keep working.

---

## 4. Static config & local-config layer

Create `lib/registry-data.ts` with: the two chain ids, the on-chain registry
addresses (Sepolia `0x2f0750…128e`, mainnet `0xeb5015…bBA0`), the Sepolia
cTokenMock pairs, the mainnet wrapper pairs, a `CUSTOM_PAIRS: WrapperPairConfig[] = []`
extension point, RPC URLs, and `explorerUrl()`. (Copy this file from the repo — it
is the single source for addresses and the documented place to add pairs.)

---

## 5. Relayer URL resolution

Create `lib/fhevm.ts`. Key idea: Sepolia's relayer is open; mainnet's needs a
server-side key, so mainnet routes through a proxy path:

```ts
import { SepoliaConfig, MainnetConfig } from "@zama-fhe/sdk";
import { MAINNET_CHAIN_ID } from "@/lib/registry-data";

export const KEYPAIR_TTL = 2_592_000;
export const SESSION_TTL = 2_592_000;

export function relayerUrlFor(chainId: number): string {
  if (chainId === MAINNET_CHAIN_ID) {
    const proxy = process.env.NEXT_PUBLIC_RELAYER_PROXY_URL;
    return proxy ? `${proxy.replace(/\/$/, "")}/${MAINNET_CHAIN_ID}` : MainnetConfig.relayerUrl;
  }
  return process.env.NEXT_PUBLIC_ZAMA_RELAYER_URL || SepoliaConfig.relayerUrl;
}
```

---

## 6. The relayer proxy route (keeps the mainnet key server-side)

Create `app/api/relayer/[...path]/route.ts` (copy from repo). It:
1. reads the chain id from the first path segment,
2. attaches `x-api-key: process.env.RELAYER_API_KEY` server-side,
3. forwards `zama-sdk-version` / `zama-sdk-name`,
4. strips `content-encoding` / `content-length` from the response.

This is why the browser never sees the key.

---

## 7. Provider tree

Create `providers/FhevmProvider.tsx` (copy from repo). Nesting order matters:

```
WagmiProvider → QueryClientProvider → ZamaProvider → RainbowKitProvider
```

Highlights: register **both** `mainnet` and `sepolia` with `fallback()` RPC
transports; build `RelayerWeb` with a transport per chain using `relayerUrlFor`;
pass `registryAddresses` to `ZamaProvider`; gate construction behind a `mounted`
flag so the Web Worker / IndexedDB never run during SSR. Wrap `app/layout.tsx`'s
body in `<FhevmProvider>`.

---

## 8. Hooks

Copy these from the repo (each is small and self-contained):

| Hook | Does |
|---|---|
| `hooks/useChainPairs.ts` | On-chain pairs (`useListPairs`) first, static/custom fallback, filtered to the connected chain. The source every page reads. |
| `hooks/useRegistry.ts` | Registry browse: search + chain filter. |
| `hooks/useWrap.ts` | `useShield` / `useUnshield` + balances. |
| `hooks/useDecrypt.ts` | EIP-712 `useAllow` → `ReadonlyToken.balanceOf()`. |
| `hooks/useFaucet.ts` | `mint(address,uint256)` via wagmi `useWriteContract`, 24h cooldown in localStorage. |

---

## 9. Pages

Build the four routes under `app/`:

- `app/registry/page.tsx` — table from `useRegistry`, copy/explorer actions.
- `app/wrap/page.tsx` — token list from `useChainPairs`, shield/unshield form.
- `app/decrypt/page.tsx` — registry picker **and** a paste-an-address input.
- `app/faucet/page.tsx` — Sepolia-only, with a "switch network" guard.

(Copy the JSX from the repo, or build your own UI against the same hooks.)

---

## 10. Environment + run locally

```bash
cp .env.example .env.local   # all blank is fine for Sepolia
npm run dev                  # http://localhost:3000
```

Connect MetaMask on Sepolia → Faucet → claim → Wrap → Decrypt. Build check:

```bash
npm run build
```

---

## 11. Push to GitHub

```bash
git init
git add .
git commit -m "ZARP confidential wrapper registry dApp"
gh repo create zarp-protocol --public --source=. --push
# or: create the repo on github.com and `git remote add origin … && git push -u origin main`
```

---

## 12. Deploy to Vercel

You can use the dashboard or the CLI.

### Option A — Dashboard (recommended first time)

1. Go to **vercel.com → Add New → Project**, import your GitHub repo.
2. **Root Directory:** if your Next app lives in `frontend/` (as in this repo),
   click **Edit** next to Root Directory and set it to **`frontend`**. *(Skip if
   the app is at the repo root.)*
3. **Framework Preset:** Next.js (auto-detected).
4. **Build & Output:** leave defaults — Build `npm run build`, Install `npm install`
   (the `postinstall` patch runs automatically).
5. **Node version:** Project Settings → **Node.js Version → 22.x** (Vercel also
   honors `engines.node` in `package.json`).
6. **Environment Variables** (Project Settings → Environment Variables):

   | Name | Value | Notes |
   |---|---|---|
   | `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | your id | optional but recommended |
   | `NEXT_PUBLIC_SEPOLIA_RPC` | keyed RPC URL | recommended for load |
   | `NEXT_PUBLIC_MAINNET_RPC` | keyed RPC URL | for mainnet |
   | `NEXT_PUBLIC_RELAYER_PROXY_URL` | `/api/relayer` | enables mainnet decrypt |
   | `RELAYER_API_KEY` | mainnet key | **no** `NEXT_PUBLIC_` prefix; Sepolia doesn't need it |

7. **Deploy.** You get a `https://<project>.vercel.app` URL.

### Option B — CLI

```bash
npm i -g vercel
vercel            # first run links the project; set Root Directory to "frontend" when asked
vercel env add RELAYER_API_KEY production      # repeat for each var
vercel --prod     # production deploy
```

### Post-deploy checklist

- [ ] Open the live URL; confirm the page loads and the wallet connects.
- [ ] DevTools → Network → response headers show `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: credentialless` (Vercel preserves `headers()`).
- [ ] On **Sepolia**: Faucet → Wrap → Decrypt all succeed.
- [ ] For **mainnet** decrypt: `RELAYER_API_KEY` + `NEXT_PUBLIC_RELAYER_PROXY_URL=/api/relayer` are set; hitting `/api/relayer/1/...` no longer returns 503.
- [ ] Put the live URL in the README.

---

## Notes & gotchas

- **Root Directory** is the #1 monorepo deploy mistake — if the Next app is in
  `frontend/`, Vercel must be told, or the build can't find `package.json`.
- **Never** expose `RELAYER_API_KEY` via `NEXT_PUBLIC_` — it would ship in the
  browser bundle. Sponsored relayer txs are billed, so a leak costs money.
- COOP/COEP must survive at the edge. Vercel keeps `next.config.mjs` `headers()`;
  if you front it with another CDN, re-assert them there.
- Use **keyed RPCs** (Alchemy/Infura) in production. The public defaults will
  rate-limit under real traffic; each chain already uses a `fallback()` chain of
  backups, but a keyed primary is what gives you headroom.
