import { useRouterState } from "@tanstack/react-router";
import { Archive, CircleCheck, CirclePause, List, SlidersHorizontal, Users } from "lucide-react";
import { PanelFrame, PanelRow, PanelSection } from "@/shell/layout/panel";
import { ITEMS, STATUSES } from "./data";
import { useDemoStore } from "./store";

const ICONS = { active: CircleCheck, paused: CirclePause, archived: Archive };

export function ItemsPanel() {
  const { status, setStatus } = useDemoStore();
  return (
    <PanelFrame title="Items">
      <PanelSection label="Views">
        <PanelRow to="/items" icon={List} count={ITEMS.length} active={status === "all"} onClick={() => setStatus("all")}>
          All items
        </PanelRow>
        {STATUSES.map(s => (
          <PanelRow
            key={s}
            to="/items"
            icon={ICONS[s]}
            count={ITEMS.filter(i => i.status === s).length}
            active={status === s}
            onClick={() => setStatus(s)}
          >
            {s[0]!.toUpperCase() + s.slice(1)}
          </PanelRow>
        ))}
      </PanelSection>
    </PanelFrame>
  );
}

export function SettingsPanel() {
  const pathname = useRouterState({
    select: s => s.location.pathname,
  });
  return (
    <PanelFrame title="Settings">
      <PanelSection label="Account">
        <PanelRow to="/settings" icon={SlidersHorizontal} active={pathname === "/settings"}>General</PanelRow>
      </PanelSection>
      <PanelSection label="Workspace">
        <PanelRow to="/settings/members" icon={Users} active={pathname === "/settings/members"}>Members</PanelRow>
      </PanelSection>
    </PanelFrame>
  );
}
