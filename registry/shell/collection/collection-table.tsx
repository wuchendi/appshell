import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import type { ShellColumn } from "@/shell/collection/columns";
import { cn } from "cn";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from "@/components/ui/context-menu";
import { ACTIONS_WIDTH, gridTemplate, ROW_INTERACTIVE, visibleColumns } from "@/shell/collection/columns";
import { useShellLabels } from "@/shell/core/labels";
import { useIsMobile } from "@/shell/core/use-is-mobile";
import { SHELL_ROW_ATTR, useRowNavigation } from "@/shell/core/use-row-navigation";

export interface CollectionTableProps<T> {
  /** The first column is the primary (name) column. */
  columns: ShellColumn<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  hiddenColumns?: string[];
  sort?: { key: string; direction?: "asc" | "desc"; onSort: (key: string) => void };
  selection?: {
    selected: ReadonlySet<string>;
    onToggle: (id: string, on: boolean) => void;
    onToggleAll: (on: boolean) => void;
  } | undefined;
  /** Opens a row on click (outside its own controls) or Enter. */
  onOpen?: ((row: T) => void) | undefined;
  /** Right-click menu entries for a row. */
  rowMenu?: ((row: T) => ReactNode) | undefined;
  /** Trailing cell, revealed on hover or focus (e.g. icon buttons and a "more" menu). */
  rowActions?: ((row: T) => ReactNode) | undefined;
  actionsWidth?: string;
  getRowClassName?: ((row: T) => string | undefined) | undefined;
  /** Accessible name of the table. */
  label?: string;
  /** Sticky offset of the column header (below the page header by default). */
  headerClassName?: string;
}

const ALIGN_END = "flex justify-end text-right";

/**
 * A column list: a sticky header (select all, sortable columns) over 36px rows. Rows open on
 * click or Enter, take J/K, offer a right-click menu and reveal their actions on hover. Narrow
 * screens keep the primary and `core` columns.
 */
export function CollectionTable<T>({
  columns,
  rows,
  getRowId,
  hiddenColumns = [],
  sort,
  selection,
  onOpen,
  rowMenu,
  rowActions,
  actionsWidth = ACTIONS_WIDTH,
  getRowClassName,
  label,
  headerClassName = "top-12",
}: CollectionTableProps<T>) {
  const labels = useShellLabels();
  const narrow = useIsMobile();
  const listRef = useRef<HTMLDivElement>(null);
  useRowNavigation(listRef);

  const shown = visibleColumns(columns, hiddenColumns, narrow);
  const template = gridTemplate(shown, {
    selectable: !!selection,
    actions: rowActions ? actionsWidth : null,
  });
  const ids = rows.map(getRowId);
  const allSelected = !!selection && ids.length > 0 && ids.every(id => selection.selected.has(id));

  function openFromClick(row: T, e: MouseEvent) {
    if (!onOpen || (e.target as HTMLElement).closest(ROW_INTERACTIVE))
      return;
    onOpen(row);
  }
  function openOnEnter(row: T, e: KeyboardEvent) {
    if (onOpen && e.key === "Enter" && e.target === e.currentTarget) {
      e.preventDefault();
      onOpen(row);
    }
  }

  return (
    <div role="table" aria-label={label} ref={listRef} className="flex flex-col gap-px">
      <div
        role="row"
        style={{ gridTemplateColumns: template }}
        className={cn("sticky z-10 grid h-9 items-center gap-3 border-b bg-background px-2 text-xs text-muted-foreground", headerClassName)}
      >
        {selection && (
          <span className="flex">
            <Checkbox checked={allSelected} onCheckedChange={v => selection.onToggleAll(v === true)} aria-label={labels.selectAll} />
          </span>
        )}
        {shown.map((c) => {
          const active = !!sort && !!c.sortKey && sort.key === c.sortKey;
          const Arrow = sort?.direction === "asc"
            ? ArrowUp
            : ArrowDown;
          return (
            <span
              key={c.key}
              role="columnheader"
              aria-sort={active
                ? (sort?.direction === "asc"
                    ? "ascending"
                    : "descending")
                : undefined}
              className={cn("min-w-0 truncate", c.align === "end" && ALIGN_END)}
            >
              {c.sortKey && sort
                ? (
                    <button
                      type="button"
                      onClick={() => sort.onSort(c.sortKey!)}
                      className={cn("inline-flex items-center gap-0.5 hover:text-foreground", active && "text-foreground")}
                    >
                      {c.header}
                      {active && <Arrow className="size-3" />}
                    </button>
                  )
                : c.header}
            </span>
          );
        })}
        {rowActions && <span />}
      </div>
      {rows.map((row) => {
        const id = getRowId(row);
        const selected = !!selection?.selected.has(id);
        const element = (
          <div
            key={id}
            role="row"
            tabIndex={0}
            {...{ [SHELL_ROW_ATTR]: "" }}
            data-selected={selected || undefined}
            style={{ gridTemplateColumns: template }}
            onClick={e => openFromClick(row, e)}
            onKeyDown={e => openOnEnter(row, e)}
            className={cn(
              "group grid h-9 min-w-0 items-center gap-3 rounded-md px-2 text-[13px] outline-none transition-colors hover:bg-secondary/50 focus-visible:bg-secondary/60 focus-visible:ring-2 focus-visible:ring-ring/50 data-selected:bg-secondary/70",
              onOpen && "cursor-pointer",
              getRowClassName?.(row),
            )}
          >
            {selection && (
              <span className="flex">
                <Checkbox
                  checked={selected}
                  onCheckedChange={v => selection.onToggle(id, v === true)}
                  aria-label={id}
                  className={cn("transition-opacity", !selected && "pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100 pointer-fine:focus-visible:opacity-100")}
                />
              </span>
            )}
            {shown.map(c => (
              <span key={c.key} role="cell" className={cn("min-w-0", c.align === "end" && ALIGN_END)}>
                {c.cell(row)}
              </span>
            ))}
            {rowActions && (
              <span className="flex justify-end opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 has-[[aria-expanded=true]]:opacity-100">
                {rowActions(row)}
              </span>
            )}
          </div>
        );
        if (!rowMenu)
          return element;
        return (
          <ContextMenu key={id}>
            <ContextMenuTrigger render={element} />
            <ContextMenuContent className="w-auto min-w-40">{rowMenu(row)}</ContextMenuContent>
          </ContextMenu>
        );
      })}
    </div>
  );
}
