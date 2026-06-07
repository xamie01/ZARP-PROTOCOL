import { create } from "zustand";

interface WalletStore {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export const useWalletStore = create<WalletStore>((set) => ({
  address: null,
  isConnected: false,
  isConnecting: false,
  connect: async () => {
    set({ isConnecting: true });
    // Simulate wallet connection
    await new Promise((r) => setTimeout(r, 800));
    const mockAddress = "0x" + Array.from({ length: 40 }, () =>
      "0123456789abcdef"[Math.floor(Math.random() * 16)]
    ).join("");
    set({
      address: mockAddress,
      isConnected: true,
      isConnecting: false,
    });
  },
  disconnect: () => {
    set({ address: null, isConnected: false, isConnecting: false });
  },
}));
