import { useRouterState } from "@tanstack/react-router";
import {
  Archive,
  CircleCheck,
  CirclePause,
  List,
  Server,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import type { ShellDotTone } from "@/shell/layout/panel";
import { PanelFrame, PanelRow, PanelSection } from "@/shell/layout/panel";
import { ITEMS, STATUSES } from "./data";
import { useDemoStore } from "./store";

const ICONS = { active: CircleCheck, paused: CirclePause, archived: Archive };

const TONES: ShellDotTone[] = ["success", "info", "progress", "warning", "danger", "muted"];

export function ItemsPanel() {
  const { status, setStatus } = useDemoStore();
  const pathname = useRouterState({
    select: s => s.location.pathname,
  });
  return (
    <PanelFrame title="Items">
      <PanelSection label="Views">
        <PanelRow
          href="/items"
          icon={List}
          count={ITEMS.length}
          active={pathname === "/items" && status === "all"}
          onClick={() => setStatus("all")}
        >
          All items
        </PanelRow>
        {STATUSES.map(s => (
          <PanelRow
            key={s}
            href="/items"
            icon={ICONS[s]}
            count={ITEMS.filter(i => i.status === s).length}
            active={pathname === "/items" && status === s}
            onClick={() => setStatus(s)}
          >
            {s[0]!.toUpperCase() + s.slice(1)}
          </PanelRow>
        ))}
      </PanelSection>
      <PanelSection label="Examples">
        <PanelRow href="/items/server" icon={Server} active={pathname === "/items/server"}>
          Server paged
        </PanelRow>
      </PanelSection>
      <PanelSection label="Tones">
        <PanelRow inset>All tones</PanelRow>
        {TONES.map(tone => (
          <PanelRow key={tone} dot={tone}>
            {tone}
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
        <PanelRow href="/settings" icon={SlidersHorizontal} active={pathname === "/settings"}>
          General
        </PanelRow>
      </PanelSection>
      <PanelSection label="Workspace">
        <PanelRow href="/settings/members" icon={Users} active={pathname === "/settings/members"}>
          Members
        </PanelRow>
      </PanelSection>
    </PanelFrame>
  );
}
