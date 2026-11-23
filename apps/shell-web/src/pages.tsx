import { useNavigate, useParams } from "@tanstack/react-router";
import { cn } from "cn";
import { Boxes, ChevronDown, ChevronUp, Hash, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ContextMenuItem } from "@/components/ui/context-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";
import { BatchBar, BatchBarSeparator } from "@/shell/collection/batch-bar";
import { CollectionPager } from "@/shell/collection/collection-pager";
import { CollectionTable } from "@/shell/collection/collection-table";
import type { ShellColumn } from "@/shell/collection/columns";
import { ColumnsSection } from "@/shell/collection/columns-section";
import { useCollectionPage } from "@/shell/collection/use-collection-page";
import { FeatureIntro, IntroArtArrow, IntroArtCard } from "@/shell/intro/feature-intro";
import { IconButton } from "@/shell/layout/icon-button";
import { PageBody } from "@/shell/layout/page-body";
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
import { fetchItemsPage, ITEMS, STATUSES } from "./data";
import { useDemoStore } from "./store";

export function OverviewPage() {
  const { rows, pager } = useCollectionPage(ITEMS, { pageSize: 10 });
  return (
    <div className="space-y-4">
      <PageHeader title="Overview" />
      <p className="text-sm text-muted-foreground">
        The shell around this page comes from the registry: rail, content card, resizable space
        panels, one-row headers and the list menus. Try Cmd/Ctrl+K, Cmd/Ctrl+B and C.
      </p>
      {/* A normal (non-fill) page: the table sits in a card inside a grid and scrolls sideways
          on its own, without widening the card. */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_14rem]">
        <section data-testid="recent-card" className="rounded-lg border">
          <h2 className="px-3 pt-3 pb-1 text-sm font-medium">Recent items</h2>
          <CollectionTable
            label="Recent items"
            columns={COLUMNS}
            rows={rows}
            getRowId={i => i.id}
          />
          <CollectionPager {...pager} />
        </section>
        <aside className="rounded-lg border p-3 text-sm text-muted-foreground">
          A side card in the same grid.
        </aside>
      </div>
      {Array.from({ length: 12 }, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static filler
        <p key={i} className="text-sm text-muted-foreground">
          {`Filler ${i + 1}: the page is long enough to scroll, so the table header sticks under the page header.`}
        </p>
      ))}
    </div>
  );
}

const muted = "text-xs text-muted-foreground";

const COLUMNS: ShellColumn<Item>[] = [
  {
    key: "name",
    header: "Name",
    sortKey: "name",
    cell: i => <span className="block truncate font-medium">{i.name}</span>,
  },
  {
    key: "status",
    header: "Status",
    width: "6rem",
    core: true,
    cell: i => <span className={muted}>{i.status}</span>,
  },
  { key: "owner", header: "Owner", width: "6rem", cell: i => i.owner },
  // A long value in a narrow track: plain text cells end with an ellipsis.
  { key: "email", header: "Email", cell: i => i.email },
  { key: "region", header: "Region", width: "7rem", cell: i => i.region },
  { key: "plan", header: "Plan", width: "5rem", cell: i => i.plan },
  {
    key: "source",
    header: "Source",
    width: "8rem",
    // Two lines: the row grows to fit.
    cell: i => (
      <span className="flex min-w-0 flex-col">
        <span className="truncate">{i.source}</span>
        <span className={cn(muted, "truncate")}>{`${i.imported} days ago`}</span>
      </span>
    ),
  },
  {
    key: "created",
    header: "Created",
    align: "end",
    cell: i => <span className={cn(muted, "tabular-nums")}>{i.created}</span>,
  },
  {
    key: "updated",
    header: "Updated",
    align: "end",
    sortKey: "updated",
    cell: i => <span className={cn(muted, "tabular-nums")}>{i.updated}</span>,
  },
  {
    key: "id",
    header: <Hash aria-label="ID" className="size-3.5" />,
    label: "ID",
    width: "4rem",
    align: "end",
    cell: i => `#${i.id}`,
  },
];

/** A row action whose confirm dialog renders inside the row (its clicks must not open the row). */
function DeleteAction({ item }: { item: Item }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <IconButton label="Delete" icon={Trash2} onClick={() => setOpen(true)} />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {item.name}?</DialogTitle>
            <DialogDescription>This is a demo; nothing is deleted.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <DialogClose render={<Button variant="destructive" />}>Delete</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function toggled(prev: Set<string>, id: string, on: boolean): Set<string> {
  const next = new Set(prev);
  if (on) next.add(id);
  else next.delete(id);
  return next;
}

function ItemDetails({ item }: { item: Item }) {
  return (
    <div className="grid grid-cols-3 gap-3 rounded-md border bg-muted/30 px-3 py-2 text-xs">
      <span>
        <span className="text-muted-foreground">Owner</span> {item.owner}
      </span>
      <span>
        <span className="text-muted-foreground">Status</span> {item.status}
      </span>
      <span>
        <span className="text-muted-foreground">Updated</span> {item.updated}
      </span>
    </div>
  );
}

export function ItemsPage() {
  const navigate = useNavigate();
  const { status, setStatus, query, setQuery } = useDemoStore();
  const [hidden, setHidden] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState("updated");
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const rows = ITEMS.filter(
    i =>
      (status === "all" || i.status === status) &&
      i.name.toLowerCase().includes(query.toLowerCase()),
  );
  // Sort first, then slice: the pager pages through the sorted list.
  const sorted = [...rows].sort((a, b) =>
    sortKey === "name" ? a.name.localeCompare(b.name) : b.updated.localeCompare(a.updated),
  );
  const { rows: page, pager } = useCollectionPage(sorted);
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
      <PageBody fill>
        {rows.length === 0 ? (
          <FeatureIntro
            icon={Boxes}
            label="Items"
            title="Nothing matches"
            description="No item matches the search and status filter. Clear them to see every item again; the panel on the left narrows the list by status."
            action={
              <Button
                onClick={() => {
                  setStatus("all");
                  setQuery("");
                }}
              >
                Clear filters
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
          <>
            <CollectionTable
              label="Items"
              columns={COLUMNS}
              rows={page}
              getRowId={i => i.id}
              getRowLabel={i => i.name}
              hiddenColumns={hidden}
              sort={{ key: sortKey, onSort: setSortKey }}
              selection={{
                selected,
                onToggle: (id, on) => setSelected(prev => toggled(prev, id, on)),
                // Select all covers the current page only.
                onToggleAll: on =>
                  setSelected(prev =>
                    page.reduce((next, i) => toggled(next, i.id, on), new Set(prev)),
                  ),
              }}
              onOpen={i => void navigate({ to: "/items/$id", params: { id: i.id } })}
              rowMenu={i => (
                <ContextMenuItem
                  onClick={() => setExpanded(prev => toggled(prev, i.id, !prev.has(i.id)))}
                >
                  {expanded.has(i.id) ? "Hide details" : "Show details"}
                </ContextMenuItem>
              )}
              rowActions={i => (
                <>
                  <IconButton
                    label={expanded.has(i.id) ? "Hide details" : "Show details"}
                    icon={expanded.has(i.id) ? ChevronUp : ChevronDown}
                    onClick={() => setExpanded(prev => toggled(prev, i.id, !prev.has(i.id)))}
                  />
                  <DeleteAction item={i} />
                </>
              )}
              renderSubRow={i => (expanded.has(i.id) ? <ItemDetails item={i} /> : null)}
            />
            <CollectionPager {...pager} selected={selected.size} />
          </>
        )}
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
      </PageBody>
    </div>
  );
}

export function ServerItemsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [data, setData] = useState<{ rows: Item[]; total: number } | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetchItemsPage(page, pageSize, controller.signal)
      .then(next => {
        setData(next);
        setLoading(false);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [page, pageSize]);
  return (
    <div className="space-y-4">
      <PageHeader title="Server paged" />
      <PageBody fill>
        <CollectionTable
          label="Server paged items"
          columns={COLUMNS}
          rows={data?.rows ?? []}
          getRowId={i => i.id}
          loading={loading}
          empty={<p className="px-2 py-6 text-sm text-muted-foreground">No items.</p>}
        />
        <CollectionPager
          page={page}
          pageSize={pageSize}
          total={data?.total ?? 0}
          onPageChange={setPage}
          onPageSizeChange={size => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </PageBody>
    </div>
  );
}

export function ItemDetailPage() {
  const { id } = useParams({ strict: false });
  const item = ITEMS.find(i => i.id === id);
  return (
    <div className="space-y-4">
      <PageHeader title={item?.name ?? "Not found"} />
      {item && (
        <div className="max-w-2xl space-y-4 text-sm text-muted-foreground">
          <ItemDetails item={item} />
          {Array.from({ length: 30 }, (_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static filler
            <p key={i}>
              {`Section ${i + 1}. A detail page in the same space as the list keeps the normal layout: the whole page scrolls under the pinned header.`}
            </p>
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
