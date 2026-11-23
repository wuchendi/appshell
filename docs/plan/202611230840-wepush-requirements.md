# wepush requirements: rail fold, portaled row clicks, a11y and polish (v0.4.1)

## Status: completed

- **createdAt**: 2026-11-23
- **approvedAt**: 2026-11-23
- **relatedTask**: wepush-requirements
- **source**: projects `docs/appshell-requirements.md` (R1–R8), reviewed against v0.4.0

## Context

wepush (projects monorepo, Next.js 16 App Router, shadcn UI in the workspace package `@cdlab/ui`)
is the first Next.js host. Every item was checked against the code at `9254258`:

- **R1 confirmed** — `layout/rail.tsx`: on the desktop rail a click on an active entry
  (`isActivePath`, prefix match) always `preventDefault()`s and toggles the panel, whether or not
  the space has a panel. A panel-less current space flips the cookie and never navigates; a click on
  a space entry from one of its detail pages folds instead of going back.
- **R2 confirmed** — `collection-table.tsx` `openFromClick` only checks `closest(ROW_INTERACTIVE)`.
  React events bubble through portals, so clicks in a portaled menu (separator, label, padding) or a
  confirm dialog opened from `rowActions` reach the row's `onClick` and open the row.
- **R3 confirmed** — the row checkbox is `aria-label={id}`.
- **R4 confirmed** — the bare `C` (app-shell), `/` (HeaderSearch) and J/K (useRowNavigation)
  handlers only check `isTypingTarget`: no `isComposing`, no modal check.
- **R5 confirmed** — SearchDialog shows `CommandEmpty` while debouncing/pending; `.catch(() => {})`
  keeps the previous results on error.
- **R6 confirmed** — `ColumnsSection` falls back to `key` for a non-string `header`.
- **R7 confirmed** — the page's top padding (`pt-4 md:pt-5`, app-shell) and the header's
  `-mt-4 md:-mt-5` (page-header) are duplicated literals; the horizontal side already shares
  `PAGE_GUTTER`.
- **R8 measured** with a scratch host and the deployed v0.4.0 registry:
  - without `--overwrite`, identical files are skipped; every differing file — UI component or
    shell file — gets a `y/N` prompt (default No), **even with `-y`**;
  - with stdin closed the run stops at the first prompt and writes nothing;
  - `--overwrite` overwrites everything, including a host's edited UI files;
  - `import { cn } from "cn"` is the npm package and is never rewritten.
  The monorepo alias rewrite (`ui: "@cdlab/ui/components"`) is not covered by the smoke yet.

Product phase: breaking changes allowed, no shims.

## Proposal

Behavior is tested through small pure helpers (bun:test), the repo's convention; components are
checked in the demo and with Playwright.

### R1 rail click

Pure `railClick({ active, exact, hasPanel, mobile })` in `core/spaces.ts` →
`"fold" | "navigate"`. Desktop: fold only when the space has a panel **and** the path is exactly
`space.href`; below it (a detail page) the entry navigates to `space.href`. Panel-less spaces always
navigate. Mobile sheet keeps navigating. `AppShell` passes the set of keys with a panel in
`railProps`. README "Spaces" bullet documents it.

Decision (proposed default, host-visible): detail page → navigate, not fold — the rail reads as
"go to this area".

### R2 portaled clicks

`openFromClick` returns unless `e.currentTarget.contains(e.target)`; `ROW_INTERACTIVE` drops
`[data-slot="popover-content"]`. Extract `isOwnClick(currentTarget, target)` into `columns.ts` with a
test (a node portaled to `document.body` vs a cell). `openOnEnter` already requires
`target === currentTarget`.

### R3 row checkbox name

`ShellLabels.selectRow` (`"Select {name}"` / `"选择 {name}"`), `CollectionTable`
`getRowLabel?: ((row: T) => string) | undefined`; fallback: the primary column's cell when it is a
string or number, else the id. Pure `rowLabel(...)` in `columns.ts` + test. Breaking for hosts with
their own `ShellLabels`.

### R4 bare-key guard

`isBareKeyBlocked(e)` in `core/is-typing.ts`: `e.isComposing`, `isTypingTarget(e.target)`, or the
target inside `[role="dialog"][aria-modal="true"], [role="alertdialog"]`. Used by `C`, `/` and J/K.
Tests with happy-dom elements. Cmd/Ctrl shortcuts (B, K) stay as they are.

### R5 search pending and errors

`pending` state from the query change until the request settles; while pending the list shows
`labels.loading` instead of `CommandEmpty`. A non-abort rejection clears the results and shows a
new `labels.searchFailed` ("Search failed." / "搜索失败。"). Checked in the demo with Playwright
(slow and failing search via a demo toggle is not added; a delayed promise in the existing demo
search is enough).

### R6 column label

`ShellColumn.label?: string | undefined`; pure `columnLabel(c)` = `label` → string `header` → `key`
in `columns.ts` + test; `ColumnsSection` uses it.

### R7 page top

`page-context.ts` exports `PAGE_TOP = "pt-4 md:pt-5"` and `PAGE_TOP_BLEED = "-mt-4 md:-mt-5"`
(and `PAGE_GUTTER_BLEED = "-mx-4 md:-mx-6"` next to `PAGE_GUTTER`), used by app-shell and
page-header, so both sides change together.

### R8 monorepo docs and overwrite behavior

- README "Install": monorepo note (the app's `components.json` maps `ui`/`utils` to the workspace
  package; shell imports of `@/components/ui/*` are rewritten to it; `cn` is an npm package and is
  not rewritten).
- README "Upgrade": run `shadcn add` interactively and answer per file (yes for `shell/**`, no for
  edited UI files), or commit first, run with `--overwrite`, and restore the UI package paths
  (`git checkout -- packages/ui`). Never in CI without a terminal: it stops at the first prompt.
- `registry:smoke`: after the install, append a marker to one UI file and re-run `shadcn add` with
  `yes n |`; assert the marker survives and the run reports skipped files. A full monorepo scratch
  host (workspace UI package) is left out — see Alternatives.

## Scope

core (`spaces.ts`, `is-typing.ts`, `labels.ts` + tests), layout (`rail.tsx`, `app-shell.tsx`,
`page-header.tsx`, `page-context.ts`), menus (`menus.tsx`), collection (`columns.ts`,
`collection-table.tsx`, `columns-section.tsx` + tests), search (`search-dialog.tsx`), demo, README,
smoke script, changelog. Released as **v0.4.1** (user decision, despite two new `ShellLabels` keys and the rail
behavior change), pushed together with its tag.

## Verification

- `bun run check`: lint, typecheck, 45 unit tests (new: `railEntryFolds`, `isBareKeyBlocked`,
  `opensRow`, `rowLabel`, `columnLabel`, written failing first), 100% line coverage of the pure
  modules, builds.
- `bun run registry:smoke`: both hosts; the Vite host re-adds `shell-menus` over an edited
  `popover.tsx` with "no" answers and the edit survives (16 files skipped).
- Playwright on the demo build, 19/19: R1 Overview click keeps the cookie and Items' panel open,
  Items folds/unfolds on `/items`, the detail page's rail click returns to `/items`; R3 checkbox
  "Select Spring campaign"; R2 clicks on the confirm dialog body, Cancel and backdrop keep the list,
  a plain cell opens the row; R4 `C` inside the modal and with `isComposing` does nothing, works
  otherwise; R5 "Loading" while pending, "Nothing found." after, "Search failed." for a rejected
  search, results again afterwards; R6 icon-header column listed as "ID"; no console errors.

## Risks

- R1 changes what a click on the current space does from a detail page (navigate instead of fold).
- R4: a host dialog without `aria-modal` (non-modal) still lets `C` fire — intended, focus is not
  trapped there.
- Hosts with custom `ShellLabels` must add `selectRow` and `searchFailed` (typecheck catches it).

## Alternatives

- R1 fold also from detail pages (today's behavior minus the panel-less bug): fewer surprises for
  existing hosts, but the rail stops being a way back to a space's index.
- R8 monorepo scratch host in the smoke (workspace with `packages/ui` + an app): proves the alias
  rewrite end to end, but doubles smoke time and needs shadcn's monorepo setup; wepush's own
  install is the first real check. Can be added later if a rewrite bug shows up.
- R5 without an error label (only clearing results): one key less, but a failed search would look
  like "Nothing found."

## Annotations

- 2026-11-23 user: release as v0.4.1; proceed. R1 (detail page navigates) and R5 (error label)
  use the proposed defaults.
