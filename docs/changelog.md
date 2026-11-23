# Changelog

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
