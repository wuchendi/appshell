import { describe, expect, it } from "bun:test";
import { useShellPanelStore } from "@/shell/core/panel-store";

describe("panel store", () => {
  it("toggles and sets the panel", () => {
    useShellPanelStore.getState().setOpen(true);
    useShellPanelStore.getState().toggle();
    expect(useShellPanelStore.getState().open).toBe(false);
    useShellPanelStore.getState().setOpen(true);
    expect(useShellPanelStore.getState().open).toBe(true);
  });
});
