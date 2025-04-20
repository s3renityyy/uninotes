import { create } from "zustand";

export interface PageRoute {
  section: string;
  type: string;
  title: string;
}

interface RoutesState {
  routes: PageRoute[];
  setRoutes: (routes: PageRoute[]) => void;
  fetchRoutes: () => Promise<void>;
}

export const useRoutesStore = create<RoutesState>((set) => ({
  routes: [],
  setRoutes: (routes) => set({ routes }),
  fetchRoutes: async () => {
    const res = await fetch("/api/links");
    const data = await res.json();
    set({ routes: data });
  },
}));
