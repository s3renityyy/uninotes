import { create } from "zustand";

interface AdminState {
  isAdmin: boolean | null;
  checkAdmin: () => Promise<void>;
}

export const useAdminStore = create<AdminState>((set) => ({
  isAdmin: null,
  checkAdmin: async () => {
    try {
      const res = await fetch("/api/admin/me", {
        credentials: "include",
      });

      if (res.ok) {
        set({ isAdmin: true });
      } else {
        set({ isAdmin: false });
      }
    } catch {
      set({ isAdmin: false });
    }
  },
}));
