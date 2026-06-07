export interface TokenPair {
  id: number;
  erc20Symbol: string;
  erc20Address: string;
  erc7984Symbol: string;
  erc7984Address: string;
  chain: "Sepolia" | "Mainnet";
}

export const TOKEN_PAIRS: TokenPair[] = [
  {
    id: 1,
    erc20Symbol: "USDCMock",
    erc20Address: "0x9b5Cd1...8aDFfF",
    erc7984Symbol: "cUSDCMock",
    erc7984Address: "0x7c5BF4...223639",
    chain: "Sepolia",
  },
  {
    id: 2,
    erc20Symbol: "USDTMock",
    erc20Address: "0xa7dA08...e8e9b0",
    erc7984Symbol: "cUSDTMock",
    erc7984Address: "0x4E7B06...554491",
    chain: "Sepolia",
  },
  {
    id: 3,
    erc20Symbol: "WETHMock",
    erc20Address: "0xff5473...9A5f3F",
    erc7984Symbol: "cWETHMock",
    erc7984Address: "0x462086...d83158",
    chain: "Sepolia",
  },
  {
    id: 4,
    erc20Symbol: "BRONMock",
    erc20Address: "0xFf021f...DEb25E",
    erc7984Symbol: "cBRONMock",
    erc7984Address: "0xaa5612...F9C891",
    chain: "Sepolia",
  },
  {
    id: 5,
    erc20Symbol: "ZAMAMock",
    erc20Address: "0x75355a...a0BF57",
    erc7984Symbol: "cZAMAMock",
    erc7984Address: "0xf2D628...8FfbFB",
    chain: "Sepolia",
  },
  {
    id: 6,
    erc20Symbol: "tGBPMock",
    erc20Address: "0x93c931...111442",
    erc7984Symbol: "ctGBPMock",
    erc7984Address: "0xfCE5c7...a2F7CC",
    chain: "Sepolia",
  },
  {
    id: 7,
    erc20Symbol: "XAUtMock",
    erc20Address: "0x24377A...3dd940",
    erc7984Symbol: "cXAUtMock",
    erc7984Address: "0xe4FcF8...0a60C7",
    chain: "Sepolia",
  },
  {
    id: 8,
    erc20Symbol: "tGBP",
    erc20Address: "0xf6Ef9A...667ff3",
    erc7984Symbol: "ctGBP",
    erc7984Address: "0x167DC9...A3A208",
    chain: "Sepolia",
  },
];

export const CONFIDENTIAL_TOKENS = TOKEN_PAIRS.map((p) => ({
  symbol: p.erc7984Symbol,
  address: p.erc7984Address,
  chain: p.chain,
}));

export const ERC20_TOKENS = TOKEN_PAIRS.map((p) => ({
  symbol: p.erc20Symbol,
  address: p.erc20Address,
  chain: p.chain,
}));
