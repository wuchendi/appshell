import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ShellPanelState {
  /** Whether the space panel is shown beside the page. Persisted. */
  open: boolean;
  toggle: () => void;
  setOpen: (open: boolean) => void;
}

export const useShellPanelStore = create<ShellPanelState>()(
  persist(
    set => ({
      open: true,
      toggle: () => set(s => ({ open: !s.open })),
      setOpen: open => set({ open }),
    }),
    { name: "appshell-panel-open" },
  ),
);
