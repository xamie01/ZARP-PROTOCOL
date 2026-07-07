/**
 * @file mint.ts
 * @description Mints additional confidential balance from an already-deployed
 * DemoConfidentialToken. Reads TOKEN_ADDRESS (required), MINT_TO (defaults to the
 * signer), and MINT_AMOUNT (defaults to 5_000_000 = 5.00 zDEMO) from the environment.
 *
 * Use this to give a second demo wallet a decryptable balance without redeploying.
 */

import { ethers, network } from "hardhat";
import { isAddress } from "ethers";

const CONTRACT_NAME = "DemoConfidentialToken";
const DEFAULT_AMOUNT = 5_000_000n; /* 5.00 zDEMO at 6 decimals */

async function main() {
  const tokenAddress = process.env.TOKEN_ADDRESS?.trim();
  if (!tokenAddress || !isAddress(tokenAddress)) {
    throw new Error("Set TOKEN_ADDRESS in .env to the deployed DemoConfidentialToken address");
  }

  const amount = process.env.MINT_AMOUNT?.trim()
    ? BigInt(process.env.MINT_AMOUNT.trim())
    : DEFAULT_AMOUNT;

  const [signer] = await ethers.getSigners();
  const to = process.env.MINT_TO?.trim() || signer.address;
  if (!isAddress(to)) {
    throw new Error(`MINT_TO is not a valid address: ${to}`);
  }

  console.log(`[mint] network=${network.name} token=${tokenAddress}`);
  console.log(`[mint] minting ${amount} base units (${Number(amount) / 1e6} zDEMO) to ${to}`);

  const token = await ethers.getContractAt(CONTRACT_NAME, tokenAddress);
  /* mintTo(address,uint64) credits an arbitrary recipient; the base grants that
   * recipient ACL on their balance so THEY can user-decrypt it in the app. */
  const tx = await token.mintTo(to, amount);
  await tx.wait();
  console.log(`[mint] done tx=${tx.hash}`);
  console.log(`[mint] connect ${to} in the app and paste ${tokenAddress} into Decrypt`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
