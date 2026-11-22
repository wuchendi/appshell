import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PanelState {
  /** Whether the space panel is shown beside the page. Persisted. */
  open: boolean;
  toggle: () => void;
  setOpen: (open: boolean) => void;
}

export const useShellPanelStore = create<PanelState>()(
  persist(
    set => ({
      open: true,
      toggle: () => set(s => ({ open: !s.open })),
      setOpen: open => set({ open }),
    }),
    { name: "appshell-panel-open" },
  ),
);
