# azctl requirements: fill pages, paged tables, panel tones, host canvas

## Status: completed

- **createdAt**: 2026-11-23
- **approvedAt**: 2026-11-23
- **relatedTask**: azctl-requirements
- **source**: azctl `docs/appshell-requirements.md` (R1–R5)

## Context

azctl adopted the shell at v0.2.1 and is blocked on its list pages: every page scrolls as a whole,
and `CollectionTable` has no inner scroll, pager, sub-rows or loading/empty states. It also hit
two panel gaps and a stylesheet injection that only fits the default shadcn theme. bks has the
same `--canvas` clash. Released as v0.3.0 (breaking), together with the unreleased late-mounted
panel fix.

Decisions (user, 2026-11-23): the pager is a separate `CollectionPager` (not a table prop);
`--shell-canvas` falls back to `--color-muted`.

## Design

- **R1 fill pages**: `<PageBody fill>` (shell-layout) renders `div[data-shell-fill]`
  (`relative flex min-h-0 flex-1 flex-col`) and provides `ShellPageFillContext` (shell-core).
  The shell's page wrapper switches to a full-height flex column with CSS `:has([data-shell-fill])`
  — no state, no DOM change, so folding never remounts and scroll positions stay. `PageBody`
  must be the page root's direct child (or the page root itself). Taller content overflows into
  the shell's scroll area instead of being clipped.
- **R2 table**: in a fill body `CollectionTable` is its own `ScrollArea` with the header at
  `top-0`; elsewhere it stays at `top-12`. `headerClassName` only adds classes. New props
  `renderSubRow` (full-width row, no `data-shell-row`, so J/K skips it), `loading` (skeleton
  rows) and `empty`. Paging: pure `paginate` / `pageCount` / `clampPage`, a
  `useCollectionPage(rows)` hook for client mode, and `<CollectionPager>` (total or
  "selected / total", page-size menu, page X of Y, first/prev/next/last) that server mode feeds
  directly. `BatchBar` floats over a fill body (absolute) instead of sticking.
- **R3**: dot tones `info` and `progress` (pulsing).
- **R4**: `PanelRow inset` reserves the marker slot.
- **R5**: no cssVars injection; the shell paints `var(--shell-canvas, var(--color-muted))`.
  Keyframes stay injected.
- New labels: `pagerTotal`, `pagerSelected`, `pagerPage`, `pageSize`, `firstPage`,
  `previousPage`, `nextPage`, `lastPage`.

## Tasks

1. R5 + R3 + R4 → verify: demo panel shows six tones, aligned rows; canvas unchanged in demo.
2. R1 `PageBody` → verify: Playwright, fill list keeps header/pager visible; detail page scrolls;
   Cmd/Ctrl+B keeps the list scroll position.
3. R2 table + pager + hook + demo (500 rows client mode, server mode, sub-row) → verify: unit
   tests (slicing, boundaries, selected label) and Playwright against the acceptance list.
4. Docs (README, changelog), v0.3.0, tinylink sync.

## Verification

- `bun run check`: lint, typecheck, 23 unit tests (paging boundaries, slicing, selected label,
  `useCollectionPage`), coverage 95.8% lines; registry and demo builds.
- Playwright against the demo build, all pass: fill list keeps page header, column header and
  pager visible while only the rows scroll (desktop and 390px mobile); Cmd/Ctrl+B keeps the
  list's scroll position; 500 rows in pages of 50, next/last/first, page size 20; select all =
  current page ("50 of 500 selected"); sort before slicing; sub-row toggles and J skips it; open
  goes to a detail page that scrolls as a whole; server mode shows 8 skeleton rows, then replaces
  the page; a tall intro in a 380px window falls back to page scrolling; non-fill pages keep their
  padding. No console errors.
