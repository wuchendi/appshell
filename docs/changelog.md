# Changelog

## 2026-11-25 — v0.4.2

Requested by Posera (posewear-next `docs/appshell-feedback.md`, items 1–6): Next.js 16 with
next-intl `/[locale]/…` routes, prerendered as static HTML.

- **TanStack router adapter**: `useShellPathname` reads the router's `resolvedLocation` (falling
  back to `location` before the first load). `location` names a pending navigation's target at
  once, while the host's `<Outlet>` keeps the old page until the new route's code split chunk,
  `beforeLoad` or `loader` settles, so the rail highlight and the space panel switched ahead of the
  page on a slow navigation (seen in bks). They now switch with it, as the Next.js adapter's
  `usePathname` already did. The demo routes are synchronous and never showed it.
- **SearchDialog** (1): a result's `detail` carries `data-slot="command-shortcut"`, which hides
  `CommandItem`'s check icon; its `ml-auto` had split the free space and left the detail mid-row.
- **SearchDialog** (2): `ShellSearchResult.media` (a node, `size-8`) replaces `icon` for
  thumbnails and avatars.
- **PanelRow** (3): `count` takes a node too; a number still hides at 0.
- **AppShell** (4): `prefs="client"` for statically prerendered hosts renders the defaults, then
  applies the cookie in a layout effect after hydration, without the fold animation. The fold
  animation became a layout effect too and waits out a pending restore, so React's StrictMode
  re-run of the first effects does not slide the panel. Omitted `prefs` still reads the cookie
  while rendering (client-only hosts).
- **Docs** (5): locale-prefixed routes need no shell change: the Next adapter takes `Link`,
  `usePathname` and `useRouter` from the host's next-intl `createNavigation()` module (README).
- **Lint** (6): `registry/shell` passes Biome's recommended preset with the `react` and `next`
  domains. Test files drop `!`, `collection-table.tsx` documents its ARIA roles on grid `div`s
  with file-level suppressions, and appshell's own config no longer turns `noNonNullAssertion`
  off and lints the `next` domain.
- Not breaking: `media`, `count` and `prefs` only widen their types.
- **Style**: the formatter follows the hosts (posewear-next, projects): single quotes, semicolons
  as needed, Biome's default 80-column width and arrow parentheses. Every shipped file is
  reformatted once; a host on the same style can now take the registry files as they are, and
  README samples follow too.

## 2026-11-23 — v0.4.1

Requested by wepush (projects `docs/appshell-requirements.md`, R1–R8), the first Next.js host.

- **Rail** (R1): an entry folds/unfolds the panel only when its space has a panel and its `href`
  is the current page; from a detail page it navigates back to `href`, and a space without a panel
  always navigates. Before, any click on the current entry toggled the (possibly invisible) panel
  and wrote the cookie. New pure `railEntryFolds`; `Rail` takes `hasPanel`.
- **CollectionTable** (R2): a row opens only on clicks inside its own DOM, so menus and dialogs
  portaled from `rowActions` / `renderSubRow` no longer open it (React bubbles their clicks through
  the portal). New pure `opensRow`; `ROW_INTERACTIVE` is internal and drops the popover selector.
- **CollectionTable** (R3): row checkboxes are named "Select {name}" from the new `getRowLabel`,
  else a text primary cell, else the id (pure `rowLabel`).
- **Shortcuts** (R4): bare `C`, `/` and J/K skip IME composition and focus inside a modal dialog
  (`[role=dialog][aria-modal=true]`, `[role=alertdialog]`), via the new `isBareKeyBlocked`.
- **SearchDialog** (R5): shows `labels.loading` while a search is pending instead of "Nothing
  found"; a rejected search clears the results and shows `labels.searchFailed`; results of an
  aborted search are dropped.
- **Columns** (R6): `ShellColumn.label` names a column with a non-text `header` in the display menu
  (pure `columnLabel`).
- **PageHeader** (R7): `PAGE_TOP` / `PAGE_TOP_BLEED` / `PAGE_GUTTER_BLEED` in `page-context.ts`
  keep the page padding and the sticky header's negative margins in one place.
- **Docs** (R8): README notes on monorepo hosts (workspace UI package, `cn` never rewritten) and an
  Upgrade section on shadcn's overwrite prompts. `registry:smoke` re-adds an item over an edited UI
  component and checks the edit survives.
- **Breaking** for hosts with their own `ShellLabels`: add `selectRow` and `searchFailed`.
- Measured (R8): without `--overwrite`, `shadcn add` skips identical files and prompts (default
  no) for every differing file, shell or UI, even with `-y`; with no terminal it stops at the first
  prompt and writes nothing; `--overwrite` replaces edited UI components too.

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
