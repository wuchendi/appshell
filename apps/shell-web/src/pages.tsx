import type { ItemStatus } from "./data";
import { Boxes, Plus } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";
import { SHELL_ROW_ATTR, useRowNavigation } from "@/shell/core/use-row-navigation";
import { FeatureIntro, IntroArtArrow, IntroArtCard } from "@/shell/intro/feature-intro";
import { IconButton } from "@/shell/layout/icon-button";
import { PageHeader } from "@/shell/layout/page-header";
import { Chips, DisplayMenu, FilterMenu, HeaderSearch, MenuSection, ResetButton } from "@/shell/menus/menus";
import { ITEMS, STATUSES } from "./data";
import { useDemoStore } from "./store";

export function OverviewPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Overview" />
      <p className="text-sm text-muted-foreground">
        The shell around this page comes from the registry: rail, content card, resizable space panels, one-row headers and the list menus.
        Try Cmd/Ctrl+K, Cmd/Ctrl+B and C.
      </p>
    </div>
  );
}

export function ItemsPage() {
  const { status, setStatus, query, setQuery } = useDemoStore();
  const listRef = useRef<HTMLDivElement>(null);
  useRowNavigation(listRef);
  const rows = ITEMS.filter(i => (status === "all" || i.status === status) && i.name.toLowerCase().includes(query.toLowerCase()));
  const count = status === "all"
    ? 0
    : 1;
  return (
    <div className="space-y-4">
      <PageHeader
        title={status === "all"
          ? "All items"
          : status}
        menu={(
          <DropdownMenuRadioGroup value={status} onValueChange={v => setStatus(v as ItemStatus | "all")}>
            {(["all", ...STATUSES] as const).map(s => (
              <DropdownMenuRadioItem key={s} value={s}>{s}</DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        )}
        tools={(
          <>
            <FilterMenu count={count} onReset={() => setStatus("all")}>
              <MenuSection label="Status">
                <Chips
                  value={[status]}
                  options={(["all", ...STATUSES] as const).map(s => ({ value: s, label: s }))}
                  onChange={next => setStatus(next[0] ?? "all")}
                />
              </MenuSection>
            </FilterMenu>
            {(count > 0 || query) && (
              <ResetButton
                onClick={() => {
                  setStatus("all");
                  setQuery("");
                }}
              />
            )}
            <HeaderSearch value={query} onChange={setQuery} placeholder="Search items…" />
          </>
        )}
        actions={(
          <>
            <DisplayMenu>
              <MenuSection label="Layout"><span className="text-xs text-muted-foreground">List</span></MenuSection>
            </DisplayMenu>
            <IconButton label="New item" icon={Plus} />
          </>
        )}
      />
      {rows.length === 0
        ? (
            <FeatureIntro
              icon={Boxes}
              label="Items"
              title="Nothing here yet"
              description="Items you create show up in this list; the panel on the left narrows it by status."
              action={(
                <Button>
                  <Plus />
                  New item
                </Button>
              )}
              art={(
                <>
                  <IntroArtCard>Spring campaign</IntroArtCard>
                  <IntroArtArrow />
                  <IntroArtCard>Active · updated today</IntroArtCard>
                </>
              )}
            />
          )
        : (
            <div ref={listRef} className="flex flex-col gap-px">
              {rows.map(i => (
                <div
                  key={i.id}
                  {...{ [SHELL_ROW_ATTR]: "" }}
                  tabIndex={0}
                  className="grid h-9 grid-cols-[minmax(0,1fr)_6rem_6rem_6.5rem] items-center gap-3 rounded-md px-2 text-[13px] outline-none hover:bg-secondary/50 focus-visible:bg-secondary/60 focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <span className="truncate font-medium">{i.name}</span>
                  <span className="text-xs text-muted-foreground">{i.status}</span>
                  <span className="text-xs text-muted-foreground">{i.owner}</span>
                  <span className="text-right text-xs text-muted-foreground tabular-nums">{i.updated}</span>
                </div>
              ))}
            </div>
          )}
    </div>
  );
}

export function SettingsPage({ title }: { title: string }) {
  return (
    <div className="space-y-4">
      <PageHeader title={title} />
      <p className="text-sm text-muted-foreground">A form page uses the same one-row header.</p>
    </div>
  );
}
