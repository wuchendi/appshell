# Changelog

## Unreleased

- The space panel folds and unfolds with a 200ms width transition; it stays mounted (collapsed to
  0) while folded, and dragging it below its minimum folds it too.

## 2026-11-22 — v0.2.0

- `shell-collection`: `CollectionTable`, `BatchBar`, `ColumnsSection`, `ShellColumn` and the
  pure column helpers (`visibleColumns`, `gridTemplate`, `hideableColumns`).
- `ShellLabels` gains `selectedCount`, `selectAll`, `deselectAll`, `clearSelection`, `columns`;
  hosts that build their own labels must add them.

## 2026-11-22

- Namespace and package scope are `@cdlab` (items `@cdlab/shell-*`); the repository and Pages stay
  under `wuchendi`.

- Initial registry: shell-core, shell-layout, shell-menus, shell-search, shell-intro, ported from
  tinylink and decoupled (props instead of app state, `ShellLabels` instead of i18next).
- Pitfall: `react-refresh/only-export-components` fails `.tsx` files that also export constants or
  contexts; keep those in `.ts` files (`core/keys.ts`, `layout/page-context.ts`, `core/labels.ts`).
