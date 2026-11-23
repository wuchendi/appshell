import { Boxes, ExternalLink, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ContextMenuItem } from "@/components/ui/context-menu";
import { DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";
import { BatchBar, BatchBarSeparator } from "@/shell/collection/batch-bar";
import { CollectionTable } from "@/shell/collection/collection-table";
import type { ShellColumn } from "@/shell/collection/columns";
import { ColumnsSection } from "@/shell/collection/columns-section";
import { FeatureIntro, IntroArtArrow, IntroArtCard } from "@/shell/intro/feature-intro";
import { IconButton } from "@/shell/layout/icon-button";
import { PageHeader } from "@/shell/layout/page-header";
import {
  Chips,
  DisplayMenu,
  FilterMenu,
  HeaderSearch,
  MenuSection,
  ResetButton,
} from "@/shell/menus/menus";
import type { Item, ItemStatus } from "./data";
import { ITEMS, STATUSES } from "./data";
import { useDemoStore } from "./store";

export function OverviewPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Overview" />
      <p className="text-sm text-muted-foreground">
        The shell around this page comes from the registry: rail, content card, resizable space
        panels, one-row headers and the list menus. Try Cmd/Ctrl+K, Cmd/Ctrl+B and C.
      </p>
    </div>
  );
}

const COLUMNS: ShellColumn<Item>[] = [
  {
    key: "name",
    header: "Name",
    sortKey: "name",
    cell: i => <span className="truncate font-medium">{i.name}</span>,
  },
  {
    key: "status",
    header: "Status",
    width: "6rem",
    core: true,
    cell: i => <span className="text-xs text-muted-foreground">{i.status}</span>,
  },
  {
    key: "owner",
    header: "Owner",
    width: "6rem",
    cell: i => <span className="text-xs text-muted-foreground">{i.owner}</span>,
  },
  {
    key: "updated",
    header: "Updated",
    align: "end",
    sortKey: "updated",
    cell: i => <span className="text-xs text-muted-foreground tabular-nums">{i.updated}</span>,
  },
];

function toggled(prev: Set<string>, id: string, on: boolean): Set<string> {
  const next = new Set(prev);
  if (on) next.add(id);
  else next.delete(id);
  return next;
}

export function ItemsPage() {
  const { status, setStatus, query, setQuery } = useDemoStore();
  const [hidden, setHidden] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState("updated");
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [opened, setOpened] = useState<string | null>(null);
  const rows = ITEMS.filter(
    i =>
      (status === "all" || i.status === status) &&
      i.name.toLowerCase().includes(query.toLowerCase()),
  );
  const sorted = [...rows].sort((a, b) =>
    sortKey === "name" ? a.name.localeCompare(b.name) : b.updated.localeCompare(a.updated),
  );
  const count = status === "all" ? 0 : 1;
  return (
    <div className="space-y-4">
      <PageHeader
        title={status === "all" ? "All items" : status}
        menu={
          <DropdownMenuRadioGroup
            value={status}
            onValueChange={v => setStatus(v as ItemStatus | "all")}
          >
            {(["all", ...STATUSES] as const).map(s => (
              <DropdownMenuRadioItem key={s} value={s}>
                {s}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        }
        tools={
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
        }
        actions={
          <>
            <DisplayMenu>
              <ColumnsSection
                columns={COLUMNS}
                hidden={hidden}
                onToggle={key =>
                  setHidden(h => (h.includes(key) ? h.filter(k => k !== key) : [...h, key]))
                }
              />
            </DisplayMenu>
            <IconButton label="New item" icon={Plus} />
          </>
        }
      />
      {rows.length === 0 ? (
        <FeatureIntro
          icon={Boxes}
          label="Items"
          title="Nothing here yet"
          description="Items you create show up in this list; the panel on the left narrows it by status."
          action={
            <Button>
              <Plus />
              New item
            </Button>
          }
          art={
            <>
              <IntroArtCard>Spring campaign</IntroArtCard>
              <IntroArtArrow />
              <IntroArtCard>Active · updated today</IntroArtCard>
            </>
          }
        />
      ) : (
        <CollectionTable
          label="Items"
          columns={COLUMNS}
          rows={sorted}
          getRowId={i => i.id}
          hiddenColumns={hidden}
          sort={{ key: sortKey, onSort: setSortKey }}
          selection={{
            selected,
            onToggle: (id, on) => setSelected(prev => toggled(prev, id, on)),
            onToggleAll: on => setSelected(on ? new Set(sorted.map(i => i.id)) : new Set()),
          }}
          onOpen={i => setOpened(i.name)}
          rowMenu={i => <ContextMenuItem onClick={() => setOpened(i.name)}>Open</ContextMenuItem>}
          rowActions={i => (
            <IconButton label="Open" icon={ExternalLink} onClick={() => setOpened(i.name)} />
          )}
        />
      )}
      {opened && <p className="text-xs text-muted-foreground">{`Opened: ${opened}`}</p>}
      {selected.size > 0 && (
        <BatchBar count={selected.size} onClear={() => setSelected(new Set())}>
          <Button variant="ghost" size="xs">
            Archive
          </Button>
          <BatchBarSeparator />
          <Button variant="ghost" size="xs" className="text-destructive hover:text-destructive">
            Delete
          </Button>
        </BatchBar>
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
