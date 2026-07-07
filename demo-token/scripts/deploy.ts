/**
 * @file deploy.ts
 * @description Deploys DemoConfidentialToken, mints a starter balance to the deployer
 * so there is an immediate decryptable balance, records the address + ABI, and
 * (optionally) verifies on Etherscan. Path A pattern (standalone script).
 *
 * After this runs, connect the DEPLOYER wallet in the ZARP app, open the Decrypt page,
 * and paste the printed token address — it is not in the registry, proving the
 * "decrypt any ERC-7984 outside the registry" flow.
 */

import { ethers, network, artifacts, run } from "hardhat";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const CONTRACT_NAME = "DemoConfidentialToken";
/* 6 decimals → 5_000_000 base units = 5.00 zDEMO. */
const MINT_AMOUNT = 5_000_000n;
const OUT_ROOT = resolve(__dirname, "..", "deployments");

async function main() {
  console.log(`[deploy] network=${network.name} chainId=${network.config.chainId}`);
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`[deploy] deployer=${deployer.address} balance=${ethers.formatEther(balance)} ETH`);
  if (balance === 0n && network.name !== "hardhat") {
    throw new Error("Deployer balance is 0; fund the account with Sepolia ETH before deploying");
  }

  const factory = await ethers.getContractFactory(CONTRACT_NAME);
  const contract = await factory.deploy();
  const tx = contract.deploymentTransaction();
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log(`[deploy] ${CONTRACT_NAME} -> ${address}`);

  /* Mint a starter balance to the deployer so there is something to decrypt. */
  console.log(`[deploy] minting ${MINT_AMOUNT} base units (${Number(MINT_AMOUNT) / 1e6} zDEMO) to deployer`);
  const mintTx = await contract.mint(MINT_AMOUNT);
  await mintTx.wait();
  console.log(`[deploy] mint tx=${mintTx.hash}`);

  const artifact = await artifacts.readArtifact(CONTRACT_NAME);
  const record = {
    contractName: CONTRACT_NAME,
    address,
    chainId: Number(network.config.chainId ?? 0),
    network: network.name,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    transactionHash: tx?.hash ?? null,
    abi: artifact.abi,
  };
  const outDir = join(OUT_ROOT, network.name);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, `${CONTRACT_NAME}.json`), JSON.stringify(record, null, 2));
  console.log(`[deploy] wrote ${outDir}/${CONTRACT_NAME}.json`);

  console.log(`\n[deploy] DONE. Paste this address into the app's Decrypt page (connect ${deployer.address}):`);
  console.log(`[deploy]   ${address}\n`);

  const etherscanKey = process.env.ETHERSCAN_API_KEY?.trim();
  if (network.name === "sepolia" && etherscanKey) {
    console.log(`[deploy] waiting 30s for Etherscan indexing before verify`);
    await new Promise((r) => setTimeout(r, 30_000));
    try {
      await run("verify:verify", { address, constructorArguments: [] });
      console.log(`[deploy] verified on Etherscan`);
    } catch (err: unknown) {
      console.log(`[deploy] verify skipped: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
