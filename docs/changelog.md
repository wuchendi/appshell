# Changelog

## 2026-11-23 — Registry workflow: release deploys

- Pitfall: `actions/deploy-pages` deploys under the commit SHA (`pages_build_version`) and Pages
  keeps the first deployment of a commit. A release tag pushed after main had deployed the same
  commit reported success but changed nothing, so `/r/` stayed on the previous release (v0.3.1
  and v0.4.0 were hit). The Pages API rejects a version that is not a commit SHA (404), so the
  workflow cannot work around it. Releases now push the commit and its tag together
  (`git push origin main vX.Y.Z`); the main run then already sees the tag.
- The deployed `/r/` smoke test runs the latest tag's `registry-smoke.sh`; main's script asked the
  previous release for items it does not have.

## 2026-11-23 — v0.4.0

Next.js support (App Router, server rendered) next to TanStack Router. Breaking, no compatibility
layer (product phase).

- **Breaking**: routing goes through `@/shell/router`, installed by exactly one of the new items
  `shell-router-tanstack` / `shell-router-next` (`ShellLink`, `useShellPathname`,
  `useShellNavigate`, `useShellNavigating`). `shell-layout` and `shell-search` no longer depend on
  `@tanstack/react-router`.
- **Breaking**: `PanelRow` / `PanelAllRow` take `href` (a full app path, query included) instead
  of `to`; `params` and `search` are gone.
- **Breaking**: the panel state lives in the `appshell` cookie (`0`/`1`, optionally `:<width %>`)
  instead of localStorage, so a server render matches the client. `AppShell` takes
  `prefs={readShellPrefs(cookies)}`; without it the shell reads `document.cookie`. New pure
  `core/prefs.ts` (`readShellPrefs`, `shellPrefsCookie`, `SHELL_PREFS_COOKIE`). Earlier
  localStorage values are ignored.
- **Breaking**: `useShellPanelStore` (zustand) is replaced by `useShellPanel()` over a context that
  `AppShell` provides; `shell-core` no longer depends on `zustand`. `layoutId` is removed.
- **Breaking**: `useShellLabels` moved to `core/labels-context.ts` (`ShellLabelsContext`);
  `core/labels.ts` is plain data a Server Component can import.
- Every file with hooks, context or components starts with `"use client"`.
- `useIsMobile` uses `useSyncExternalStore` (false on the server). Below `md` the inline panel is
  hidden by CSS too, so a server render on a phone shows the page full width before hydration.
- Install targets are `shell/...`: shadcn puts them under `src/` only when the host has one.
- `registry:smoke` also installs into a Next.js App Router host without `src/` (`rsc: true`),
  typechecks and runs `next build`; `next` is a root dev dependency so `bun run check`
  typechecks the Next adapter.
- Pitfalls: rrp server-renders a panel from its own `defaultSize` and treats a `0` in the group's
  `defaultLayout` as missing, so the folded state is `defaultSize={0}` on the panel. rrp puts
  `className` on an inner element; hiding the panel needs a selector on the group
  (`[&>#panel]`). Next's `cookies().toString()` URL-encodes values (`%3A`). Next and TanStack
  link props reject an explicit `undefined` under `exactOptionalPropertyTypes`, hence the casts in
  the adapters. Tailwind v4 skips git-ignored paths, so the scratch hosts under `.tmp/` declare
  `@source`.

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
