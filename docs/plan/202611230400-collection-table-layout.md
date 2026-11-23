# CollectionTable layout: clipped cells, taller rows, wide tables

## Status: completed

- **createdAt**: 2026-11-23
- **approvedAt**: 2026-11-23
- **relatedTask**: collection-table-layout
- **source**: azctl `docs/appshell-requirements.md` (R6–R8)

## Context

azctl's wider lists exposed three layout gaps in `CollectionTable` v0.3.0: cells paint over their
neighbours, two-line cells overflow 36px rows, and tables wider than their container either break
their row backgrounds (fill mode) or stretch their parent card and clip the pager (normal mode).
Released as v0.3.1; hosts need no changes.

## Design

- **R6**: cells `overflow-hidden` with a 4px padding / negative-margin inset for focus rings;
  string and number cells are wrapped in a truncating span.
- **R7**: rows `min-h-9 py-1`; skeleton rows stay `h-9`.
- **R8**: `tableMinWidth(tracks)` sums each track's minimum (`minmax(a,…)` → a, lengths as is,
  `fr`/`auto` → 0) plus gaps and padding; the header row and the row group use it as
  `min-width`. Rows live in a Base UI scroll area (both scrollbars from the host's `ScrollBar`);
  the header sits outside it in an `overflow-hidden` strip whose `scrollLeft` follows the rows —
  static above the rows in fill mode, `sticky top-12` otherwise, so vertical sticking survives.
  The table root has `contain: inline-size`, so it never widens its parent. The actions cell is
  `sticky right-0` with `bg-inherit`; row state backgrounds become opaque `color-mix` values.

## Tasks

1. Column helpers (`gridTracks`, `trackMinimum`, `tableMinWidth`) + unit tests.
2. Table: cells, rows, scroll area, synced header, sticky actions.
3. Demo: 10 columns with a long value and a two-line cell; a card table on the overview.
4. Playwright against the R6–R8 acceptance; docs; v0.3.1.

## Verification

- `bun run check`: lint, typecheck, 27 unit tests (track minimums, `tableMinWidth`), builds.
- Playwright on the demo build, all pass. R6: an 80-character e-mail in a 6.5rem track ends with
  an ellipsis and stops before the next column. R7: two-line rows grow (43.5px) with the hover
  background over the whole row; with that column hidden rows are 36px. R8 fill (843px visible,
  1360px table): the header follows sideways and spans the scroll width, its border spans the
  visible width, selected and hovered rows reach the right edge after scrolling, the pager does
  not move, the pinned actions are reachable without scrolling. R8 card (non-fill, grid with a
  side card): the card does not grow, the table scrolls sideways inside it with no vertical
  scroll, the pager is fully visible, the header sticks right under the page header when the
  page scrolls. Regressions: fill vertical scrolling, J/K, server paging, mobile pager. No
  console errors.
