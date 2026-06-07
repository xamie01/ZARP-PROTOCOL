# ZARP Protocol — Technical Specification

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19.0.0 | UI framework |
| react-dom | ^19.0.0 | DOM renderer |
| react-router-dom | ^7.0.0 | Client-side routing (5 pages) |
| three | ^0.170.0 | 3D Shield Sphere (raw Three.js — lightweight scene, single mesh) |
| @fontsource-variable/geist | ^1.0.0 | Primary typeface (variable weight 400–600) |
| @fontsource-variable/geist-mono | ^1.0.0 | Monospace typeface for blockchain addresses/hashes |
| lucide-react | ^0.460.0 | Icon library (shield, lock, wallet, copy, arrows, chevrons, etc.) |
| lenis | ^1.1.0 | Smooth scroll with inertia |
| zustand | ^5.0.0 | Lightweight global state (wallet, toast, transactions) |
| web3 | ^4.0.0 | Web3 wallet connection, EIP-712 signing, contract interaction |
| @web3modal/ethereum | ^5.0.0 | WalletConnect modal for multi-wallet support |
| react-countup | ^6.5.0 | Animated number counters for statistics |

**Dev dependencies:** TypeScript, Vite, Tailwind CSS, ESLint — bootstrapped by the build tool template.

---

## Component Inventory

### Layout (shared across all pages)

| Component | Source | Notes |
|-----------|--------|-------|
| Header | Custom | Scroll-aware: transparent → frosted glass on scroll > 50px. Mobile: hamburger → slide-in panel. |
| Footer | Custom | 5-column link grid + newsletter input. Fade-in on scroll. |
| PageTransitionWrapper | Custom | Orchestrates exit/enter fades between route changes. Wraps all page content. |

### Sections (page-specific, used once)

| Page | Sections |
|------|----------|
| Homepage | Hero, Features, TokenPairsPreview, HowItWorks, TechnicalOverview |
| Registry | PageHeader, SearchAndFilter, TokenPairsTable |
| Wrap | PageHeader, WrapWidget, HowItWorksWrap |
| Decrypt | PageHeader, DecryptWidget, HowDecryptionWorks |
| Faucet | PageHeader, FaucetWidget, AvailableTokensInfo |

### Reusable Components

| Component | Used By | Notes |
|-----------|---------|-------|
| SectionTitle | All pages (×10+) | Eyebrow + H2 + optional description. Extracted into shared component. |
| ShieldSphere | Homepage Hero | Standalone Three.js canvas. Imperative animation loop via refs. |
| ScrollReveal | All sections | IntersectionObserver wrapper. Adds CSS class on threshold 0.15. One-shot (no reverse). |
| StaggerContainer | Features, Tables, Token lists, Steps | Adds staggered delays to children. CSS-only via `nth-child` or inline style. |
| NumberCounter | Registry stats, TokenPairsPreview stats | Counts up from 0 on viewport entry. Uses react-countup. |
| WalletStatus | WrapWidget, DecryptWidget, FaucetWidget | Disconnected (prompt) / Connected (address + indicator) states. |
| TokenBadge | TokenPairsTable, WrapWidget, DecryptWidget, FaucetWidget | Pill badge. Variants: ERC-20 (grey), ERC-7984 (purple), Network (cyan/green). |
| ChainBadge | TokenPairsTable, Registry stats | Network indicator pill. Cyan=Sepolia, Green=Mainnet. |
| CopyButton | TokenPairsTable, Registry, CodeBlock, AvailableTokensInfo | Copies text to clipboard. Shows "Copied!" tooltip (1.5s) via local state. |
| SearchInput | Registry | Input + magnifying glass icon + clear (X) button. Debounced onChange (200ms). |
| SelectDropdown | Registry (chain filter), WrapWidget (token) | Custom dropdown (not native `<select>`). Card-style menu with scroll. |
| ToastNotification | Global | Stack container (bottom-right) + individual toast items. Auto-dismiss 5s. |
| LoadingSpinner | Buttons, async states | Yellow border spinner. Size variants: 16px (inline), 24px (standalone). |
| SkeletonLoader | Async data loading | Shimmer gradient sweep (CSS animation). Applied to table rows/cards. |
| WalletModal | Header | Wallet selection modal (MetaMask, WalletConnect, Coinbase). Appears on "Connect Wallet". |

### Hooks

| Hook | Purpose |
|------|---------|
| useWallet | Web3 connection state (address, chain, connect/disconnect/sign). Returns normalized wallet object. |
| useToast | Global toast queue (add/success/error/info). Consumed by ToastNotification component. |
| useScrollReveal | Registers an element with IntersectionObserver. Returns ref + visibility boolean. |
| useMousePosition | Normalized mouse coords (-1 to 1) with configurable lerp factor. Drives sphere parallax. |
| useTransaction | Wraps a blockchain transaction: pending → confirming → success/error. Integrates with toast notifications. |

---

## Animation Implementation

| # | Animation | Library / Approach | Implementation | Complexity |
|---|-----------|-------------------|----------------|------------|
| 1 | **Shield Sphere** | raw Three.js | Imperative `requestAnimationFrame` loop. `IcosahedronGeometry(1.2, 2)` + `MeshBasicMaterial` wireframe. Mouse parallax via lerp(0.05) on mesh.position. Auto-rotation 0.002 rad/frame. Pixel ratio capped at 2. Mobile: radius 0.9, oscillation替代 mouse. | 🔒 High |
| 2 | **Hero entrance sequence** | CSS transitions | Choreographed keyframe sequence (sphere 0ms → ZARP 200ms → Protocol 350ms → subtitle 500ms → CTAs 650ms → scroll indicator 1200ms). Pure CSS with staggered `animation-delay`. | Medium |
| 3 | **Scroll-triggered reveals** | IntersectionObserver + CSS | `useScrollReveal` hook adds `.revealed` class. CSS: `opacity: 0 → 1`, `translateY(30px) → 0`, 500ms ease-out. One-shot, threshold 0.15. | Low |
| 4 | **Staggered children** | CSS `transition-delay` | Parent sets `--stagger` custom property. Children use `transition-delay: calc(var(--index) * 100ms)`. No JS animation library needed. | Low |
| 5 | **Timeline step reveals** | IntersectionObserver + CSS | Horizontal slide-in (±30px per side). Dot scales from 0 with spring easing. Vertical line grows via `scaleY(0→1)`, transform-origin top. | Medium |
| 6 | **Code typewriter** | CSS transition-delay | Lines reveal sequentially (80ms stagger, first 8 lines only). Remaining lines appear together after pause. CSS-only via `transition-delay` on each `<li>` or `<div>`. | Low |
| 7 | **Number counters** | react-countup | `<CountUp end={value} duration={1.5} />`. Triggered once on IntersectionObserver entry. | Low |
| 8 | **Page transitions** | react-router-dom + CSS | Exit: opacity 1→0 (200ms). 100ms pause. Enter: opacity 0→1 + translateY(10px→0) (300ms). Coordinated via PageTransitionWrapper. | Medium |
| 9 | **Header scroll transition** | Scroll listener + CSS | Toggle class on scroll > 50px. CSS transitions background + backdrop-filter + border (300ms). | Low |
| 10 | **Toast slide-in/out** | CSS keyframes | Enter: `translateX(100%) → 0` (400ms ease). Exit: opacity→0 + `translateX(100%)` (300ms). Auto-dismiss timer managed by Zustand. | Low |
| 11 | **Mobile menu slide-in** | CSS transition | Panel: `translateX(100%) → 0` (300ms ease). Backdrop: opacity 0→0.5 (200ms). | Low |
| 12 | **Button hover / card hover** | CSS transitions | Background color, shadow, `translateY(-2px)`. 300ms ease. Pure Tailwind. | Low |
| 13 | **Direction toggle flip** | CSS transition | `rotate(180deg)` on click, 300ms ease. State toggle in WrapWidget. | Low |
| 14 | **Step 3 pulse glow** | CSS keyframes | `box-shadow` pulse from `0 0 0 0 rgba(255,209,0,0.4)` to `0 0 0 12px rgba(255,209,0,0)`, 2s infinite. | Low |
| 15 | **Scroll indicator bounce** | CSS keyframes | `translateY(0→8px→0)`, 2s ease infinite. | Low |
| 16 | **Noise texture overlay** | CSS background | Fixed-position div with repeating noise PNG/SVG at 3% opacity. `pointer-events: none`. | Low |
| 17 | **Wallet modal** | CSS transitions | Fade-in + scale(0.95→1) on backdrop and modal card. 200ms ease-out. | Low |
| 18 | **Skeleton shimmer** | CSS animation | `background: linear-gradient(90deg, grey100 25%, grey200 50%, grey100 75%)` with `background-size: 200% 100%`. Animate `background-position` 1.5s linear infinite. | Low |

**Rationale:** No GSAP, Framer Motion, or R3F is needed. The single 3D element is a raw Three.js scene (lightweight, imperative). All other animations are declarative CSS transitions/keyframes triggered by IntersectionObserver or React state. This keeps the bundle lean and avoids framework overhead for simple effects.

---

## State & Logic

### Wallet State (Zustand)

Single store holds: `address` | `chainId` | `isConnected` | `provider` | `connect()` | `disconnect()` | `signEIP712()`.

**Why Zustand:** Web3 state is global and accessed from header, 3 widget pages, and toast notifications. Zustand avoids prop drilling through page hierarchies. The `useWallet` hook wraps web3.js + @web3modal/ethereum for multi-wallet support (MetaMask, WalletConnect, Coinbase).

### Toast System (Zustand)

Global queue: `toasts[]` | `addToast()` | `removeToast()` | `success()` | `error()` | `info()`.

Transaction flow (wrap/unshield/faucet) pushes toast states sequentially: pending → confirming → success/error. Auto-dismiss 5s. The `useTransaction` hook orchestrates the blockchain call and maps each phase to a toast update.

### Transaction Flow Hook

`useTransaction` encapsulates: submit TX → watch for confirmation → handle receipt/failure. It returns `{ status, hash, error }` and auto-triggers toast notifications at each phase. Used by WrapWidget (shield/unshield) and FaucetWidget.

### Registry Filtering

Local React state (no global store): `searchQuery` + `selectedChain`. Derived filtered list computed on render with `useMemo`. Search matches: ERC-20 symbol, ERC-7984 symbol, both addresses (case-insensitive). Chain filter: exact match on "chain" field. Debounced 200ms on search input.

### Page Transition Orchestration

PageTransitionWrapper intercepts route changes: sets `exiting` flag → waits for exit animation (200ms) → calls `navigate()` → triggers enter animation (300ms). Uses React state + `setTimeout` to coordinate the 3-phase sequence (exit → pause → enter). Scroll resets to top on enter completion.

### Smooth Scroll

Lenis initialized at app root. All anchor links and programmatic scrolls route through Lenis. Destroyed/recreated on page transitions to reset scroll position.

---

## Other Key Decisions

**Raw Three.js over R3F:** The Shield Sphere is a single `IcosahedronGeometry` mesh with `MeshBasicMaterial` (no lighting, no scene graph complexity). R3F adds ~40KB+ bundle overhead for declarative abstractions that would be entirely unused. The scene is managed imperatively via `useRef` + `useEffect` with a cleanup function disposing geometry/material/renderer on unmount.

**No shadcn/ui:** The design is entirely bespoke (custom cards, custom select dropdowns, custom tabs). No standard form patterns or data tables from shadcn apply. All components are custom-built with Tailwind to match the design token system.

**Routing strategy:** 5 routes (`/`, `/registry`, `/wrap`, `/decrypt`, `/faucet`) handled by React Router with `BrowserRouter`. PageTransitionWrapper wraps the router outlet to coordinate exit/enter animations on every navigation.

**Token data:** Hardcoded in a shared constants file (8 token pairs with addresses). No backend API — the registry table displays static data with client-side search/filter.
