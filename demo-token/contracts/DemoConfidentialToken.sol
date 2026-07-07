/* SPDX-License-Identifier: MIT */
pragma solidity ^0.8.28;

/**
 * @file DemoConfidentialToken.sol
 * @description Standalone ERC-7984 confidential token used ONLY to demonstrate the
 * ZARP app's "decrypt any ERC-7984 token outside the registry" flow. It is a plain
 * confidential token (NOT a wrapper) with a permissionless, trivially-encrypted mint
 * so a tester can give their own wallet a decryptable balance in a single call, then
 * paste this contract address into the app's Decrypt page.
 *
 * IMPORTANT: do NOT register this in the on-chain WrappersRegistry and do NOT add it
 * to the frontend's CUSTOM_PAIRS. Its whole purpose is to be *outside* the registry.
 */

import { ERC7984 } from "@openzeppelin/confidential-contracts/token/ERC7984/ERC7984.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { FHE, euint64 } from "@fhevm/solidity/lib/FHE.sol";

/**
 * @title DemoConfidentialToken
 * @notice Minimal ERC-7984 (6 decimals) with an open mint for testnet demos.
 * @dev Inherits ERC7984 for the encrypted-token primitives and balance ACL, and
 * ZamaEthereumConfig for the FHEVM coprocessor / KMS / ACL addresses (resolved from
 * block.chainid). Balances are decryptable by their holder because the ERC7984 base
 * grants the holder ACL on every balance update.
 */
contract DemoConfidentialToken is ERC7984, ZamaEthereumConfig {
    /* ERC7984 constructor: name, symbol, contractURI. */
    constructor()
        ERC7984(
            "ZARP Demo Confidential",
            "zDEMO",
            "https://zarp-protocol.vercel.app/demo-token.json"
        )
    {}

    /**
     * @notice Mint `amount` base units of confidential balance to the caller.
     * @dev Permissionless ON PURPOSE (testnet demo token, no real value) so judges can
     * self-mint. `amount` is a plaintext uint64 trivially encrypted on-chain via
     * FHE.asEuint64 — no client-side encrypted input needed. The ERC7984 base assigns
     * the holder ACL on the resulting balance, which is what makes it user-decryptable.
     * At 6 decimals, pass 5_000_000 for 5.00 zDEMO.
     * @param amount Base-unit amount to mint (6 decimals).
     * @return minted Encrypted amount actually credited.
     */
    function mint(uint64 amount) external returns (euint64 minted) {
        minted = _mint(msg.sender, FHE.asEuint64(amount));
    }

    /**
     * @notice Mint `amount` base units of confidential balance to `to`.
     * @dev Same trivially-encrypted, permissionless mint as {mint}, but credits an
     * arbitrary recipient — handy when minting from a deploy script to a demo wallet.
     * @param to Recipient of the minted balance.
     * @param amount Base-unit amount to mint (6 decimals).
     * @return minted Encrypted amount actually credited.
     */
    function mintTo(address to, uint64 amount) external returns (euint64 minted) {
        minted = _mint(to, FHE.asEuint64(amount));
    }
}
