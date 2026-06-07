import { create } from "zustand";

export interface ToastItem {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  description?: string;
}

interface ToastStore {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, "id">) => void;
  removeToast: (id: string) => void;
  success: (message: string, description?: string) => void;
  error: (message: string, description?: string) => void;
  info: (message: string, description?: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { ...toast, id: Math.random().toString(36).substring(7) },
      ],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  success: (message, description) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { id: Math.random().toString(36).substring(7), type: "success", message, description },
      ],
    })),
  error: (message, description) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { id: Math.random().toString(36).substring(7), type: "error", message, description },
      ],
    })),
  info: (message, description) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { id: Math.random().toString(36).substring(7), type: "info", message, description },
      ],
    })),
}));
