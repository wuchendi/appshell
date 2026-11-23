# Changelog

## 2026-11-23 — v0.3.1

Requested by azctl (`docs/appshell-requirements.md`, R6–R8). No host changes needed.

- `CollectionTable` cells clip; string and number cells end with an ellipsis. A 4px inset keeps
  focus rings of controls inside a cell visible.
- Rows are at least 36px and grow with multi-line cells (`min-h-9 py-1`).
- Wide tables: the header row and the rows get `min-width` = the sum of the track minimums
  (`tableMinWidth`), the rows scroll sideways inside their own scroll area (horizontal scrollbar
  from the host's `ScrollBar`), and the header sits outside it, following `scrollLeft` — static in
  fill mode, `sticky top-12` otherwise, so it still sticks while the page scrolls. The table root
  has `contain: inline-size` and never widens its parent; the pager keeps the visible width.
- The actions cell is pinned to the right edge (`sticky right-0`, `bg-inherit`); row hover,
  focus and selection backgrounds are opaque `color-mix` values so it covers what scrolls under.
- New pure helpers `gridTracks`, `trackMinimum`, `tableMinWidth`. `shell-collection` now lists
  `@base-ui/react` as a dependency.
- Pitfall: `overflow-x` on an ancestor disables `position: sticky` for vertical scrolling, hence
  the header outside the scroller. A `w-max` table would size the primary column to its longest
  value; the summed track minimums avoid that.

## 2026-11-23 — v0.3.0

Requested by azctl (`docs/appshell-requirements.md`, R1–R5).

- `PageBody` (shell-layout): `<PageBody fill>` makes a page fill the card; the shell switches by
  CSS `:has([data-shell-fill])`, so nothing remounts. Per page, not per space.
- `CollectionTable`: scrolls on its own inside a fill body (header at `top-0`, `top-12`
  elsewhere); `renderSubRow`, `loading`, `empty`. **Breaking**: `headerClassName` no longer sets
  the sticky offset, it only adds classes.
- `CollectionPager`, `useCollectionPage` and the pure `paginate` / `pageCount` / `clampPage`
  (client and server paging, page-size menu, "selected / total"). `BatchBar` floats over a fill
  body.
- `PanelRow`: dot tones `info` and `progress` (pulsing); `inset` reserves the marker slot.
- **Breaking**: `shell-layout` no longer injects `--canvas` / `--color-canvas`; the shell paints
  `var(--shell-canvas, var(--color-muted))`. Hosts that want the old canvas set `--shell-canvas`.
- **Breaking**: `ShellLabels` gains `pagerTotal`, `pagerSelected`, `pagerPage`, `pageSize`,
  `firstPage`, `previousPage`, `nextPage`, `lastPage`.
- `shell-collection` now also needs `dropdown-menu` and `scroll-area`.
- Pitfall: Base UI menu radio items keep the menu open; pass `closeOnClick` for pick-one menus.
- Fix: a space panel that mounts after the shell (navigating from a space without one, or a space
  that appears later) crashed with "Panel constraints not found"; it now lines up with the stored
  open state on its first resize.

## 2026-11-23 — v0.2.1

- The space panel folds and unfolds with a 200ms width transition; it stays mounted (collapsed to
  0) while folded, and dragging it below its minimum folds it too.
- Tooling: Biome replaces ESLint (`bun run lint` / `bun run lint:fix`). The `Shell` prefix rule now
  covers every type in `registry/shell` (the one internal type became `ShellPanelState`);
  `collection-table.tsx` opts out of `useSemanticElements` / `useFocusableInteractive` because it
  is a div-based ARIA grid.
- Pitfall: `react-refresh/only-export-components` is Biome's `useComponentExportOnlyModules`.

## 2026-11-22 — v0.2.0

- `shell-collection`: `CollectionTable`, `BatchBar`, `ColumnsSection`, `ShellColumn` and the
  pure column helpers (`visibleColumns`, `gridTemplate`, `hideableColumns`).
- `ShellLabels` gains `selectedCount`, `selectAll`, `deselectAll`, `clearSelection`, `columns`;
  hosts that build their own labels must add them.

## 2026-11-22 — v0.1.0

- Namespace and package scope are `@cdlab` (items `@cdlab/shell-*`); the repository and Pages stay
  under `wuchendi`.

- Initial registry: shell-core, shell-layout, shell-menus, shell-search, shell-intro, ported from
  tinylink and decoupled (props instead of app state, `ShellLabels` instead of i18next).
- Pitfall: `react-refresh/only-export-components` fails `.tsx` files that also export constants or
  contexts; keep those in `.ts` files (`core/keys.ts`, `layout/page-context.ts`, `core/labels.ts`).
