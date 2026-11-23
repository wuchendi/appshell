import { create } from "zustand";
import type { ItemStatus } from "./data";

interface DemoState {
  lang: "en" | "zh";
  status: ItemStatus | "all";
  query: string;
  setLang: (lang: "en" | "zh") => void;
  setStatus: (status: ItemStatus | "all") => void;
  setQuery: (query: string) => void;
}

/** Demo-only state shared by the panel and the page. */
export const useDemoStore = create<DemoState>()(set => ({
  lang: "en",
  status: "all",
  query: "",
  setLang: lang => set({ lang }),
  setStatus: status => set({ status }),
  setQuery: query => set({ query }),
}));
