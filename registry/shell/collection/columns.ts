import type { ReactNode } from "react";

/** One column of a `CollectionTable`. The first column is the primary (name) column. */
export interface ShellColumn<T> {
  key: string;
  header: ReactNode;
  /** CSS grid track. Primary defaults to `minmax(14rem,1fr)`, the others to `6.5rem`. */
  width?: string;
  align?: "start" | "end";
  /** Clicking the header sorts by this key. */
  sortKey?: string;
  /** Kept on narrow screens. */
  core?: boolean;
  /** Offered as a switch in the display menu (defaults to true; never for the primary column). */
  hideable?: boolean;
  cell: (row: T) => ReactNode;
}

const PRIMARY_WIDTH = "minmax(14rem,1fr)";
const DEFAULT_WIDTH = "6.5rem";
export const SELECT_WIDTH = "1rem";
export const ACTIONS_WIDTH = "5.25rem";

/** The columns to show: the primary always, the rest unless hidden; only core ones when narrow. */
export function visibleColumns<T>(
  columns: readonly ShellColumn<T>[],
  hidden: readonly string[],
  narrow: boolean,
): ShellColumn<T>[] {
  return columns.filter((c, i) => i === 0 || (narrow ? !!c.core : !hidden.includes(c.key)));
}

/** The grid template shared by the header and every row. */
export function gridTemplate<T>(
  columns: readonly ShellColumn<T>[],
  { selectable, actions }: { selectable: boolean; actions: string | null },
): string {
  const tracks: string[] = [];
  if (selectable) tracks.push(SELECT_WIDTH);
  columns.forEach((c, i) => {
    tracks.push(c.width ?? (i === 0 ? PRIMARY_WIDTH : DEFAULT_WIDTH));
  });
  if (actions) tracks.push(actions);
  return tracks.join(" ");
}

/** Columns a user can show or hide. */
export function hideableColumns<T>(columns: readonly ShellColumn<T>[]): ShellColumn<T>[] {
  return columns.filter((c, i) => i > 0 && c.hideable !== false);
}

/** Elements inside a row that handle their own clicks (and so do not open the row). */
export const ROW_INTERACTIVE =
  'a, button, input, label, [role="checkbox"], [role="menuitem"], [data-slot="popover-content"]';
