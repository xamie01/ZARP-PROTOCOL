# ZARP Demo Confidential Token

A tiny, standalone **ERC-7984** confidential token used to demonstrate the ZARP app's
**"decrypt any ERC-7984 token _outside_ the registry"** flow.

Every confidential balance you can easily obtain on Sepolia (the faucet cTokenMocks) lives
in a wrapper that is **already registered** in the on-chain Wrappers Registry — so pasting
one of those addresses doesn't prove the out-of-registry path. This token fixes that: it is
a plain confidential token (not a wrapper), it is **not** registered on-chain, and it has an
open `mint`, so you can give your own wallet a decryptable balance and paste the address into
the app's Decrypt page.

> This is an **isolated** Hardhat project, deliberately separate from `../frontend`. The FHEVM
> toolchain pins `@zama-fhe/relayer-sdk@0.4.1` exact, which conflicts with the frontend's
> `@zama-fhe/sdk@^3`; keeping separate `node_modules` avoids the clash.

## What it is

- `contracts/DemoConfidentialToken.sol` — `ERC7984` (OpenZeppelin confidential-contracts) +
  `ZamaEthereumConfig`, FHEVM **v0.11**. 6 decimals (ERC-7984 max, to fit `euint64`).
- Permissionless `mint(uint64 amount)` (to caller) and `mintTo(address,uint64)` — the amount
  is a plaintext `uint64` trivially encrypted on-chain via `FHE.asEuint64`, so no client-side
  encrypted input is needed. The ERC7984 base grants the balance holder ACL, which is exactly
  what makes the balance user-decryptable in the app.

The mint is intentionally open — this is a testnet demo token with no value.

## Prerequisites

- **Node 20+** and a Sepolia wallet with some test ETH for gas.
- A private key and RPC URL.

## Setup

```bash
cd demo-token
npm install
cp .env.example .env      # then fill PRIVATE_KEY and RPC_URL (ETHERSCAN_API_KEY optional)
npm run compile
```

If `npm install` errors on `@zama-fhe/relayer-sdk` versions, run
`rm -rf node_modules package-lock.json && npm install` (the `overrides` pin `0.4.1`).

## Deploy + mint (one command)

```bash
npm run deploy:sepolia
```

This deploys the token, **mints 5.00 zDEMO to the deployer wallet**, writes
`deployments/sepolia/DemoConfidentialToken.json`, and (if `ETHERSCAN_API_KEY` is set) verifies.
It prints the token address at the end — copy it.

## Use it in the app

1. Open the ZARP app → **Decrypt** page.
2. Connect the **same wallet** you deployed/minted with (that's who holds the balance).
3. Paste the printed token address into **"Decrypt any ERC-7984 token"** → **Decrypt**.
4. Sign the EIP-712 prompt → the decrypted balance (**5.00**) appears. The app reads this
   token's `decimals()` on-chain, so the magnitude is correct even though it's not a
   registry token.

Do **not** add this address to the frontend's `CUSTOM_PAIRS` and do **not** register it in the
WrappersRegistry — being outside the registry is the whole point.

## Mint to another wallet (optional)

To give a second demo wallet a balance without redeploying:

```bash
# in .env: TOKEN_ADDRESS=0x<deployed>, MINT_TO=0x<recipient>, MINT_AMOUNT=5000000
npm run mint:sepolia
```

`MINT_AMOUNT` is base units at 6 decimals (`5000000` = 5.00). Then connect `MINT_TO` in the
app and decrypt as above.

## Verify FHEVM compatibility (optional)

```bash
npx hardhat fhevm check-fhevm-compatibility --network sepolia --address <TOKEN_ADDRESS>
```

## How this maps to the bounty

This satisfies the demo requirement to **"decrypt an arbitrary ERC-7984 token outside the
registry"**: a confidential token the registry doesn't list, where the connected wallet holds
a balance, decrypted client-side via the EIP-712 user-decryption flow. Deploy scripts are
included per the submission's "any deployment scripts" clause.
