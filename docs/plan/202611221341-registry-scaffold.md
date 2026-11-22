# Registry scaffold: shell from tinylink

## Status: completed

- **createdAt**: 2026-11-22
- **approvedAt**: 2026-11-22
- **relatedTask**: 202611221341-registry-scaffold

## Context

The dashboard chrome built in tinylink (PLAN-032 – PLAN-034) is generic. It ships here as a shadcn
registry, structured like `bkhq/filemanager`, and tinylink moves to installing it.

Decisions (user, 2026-11-22): repository `wuchendi/appshell` (Pages: `wuchendi.github.io/appshell`), registry namespace and package scope `@cdlab`; labels are
passed in (`ShellLabels`, en/zh shipped) instead of i18next; tinylink will install from the
registry. The generic column table is a later phase.

## As built

- Items: shell-core, shell-layout (with `--canvas` cssVars and progress keyframes), shell-menus,
  shell-search, shell-intro.
- Decoupled from tinylink: AppShell takes spaces, panels, logo, account, `newAction`, `onSearch`,
  banner and labels as props; SearchDialog takes the host's `search` function; row navigation
  uses `data-shell-row`.
- Demo app `apps/shell-web` (three spaces, two panels, list page with the menus, search,
  language switch). CI: `check` + `registry:smoke`; Pages: registry (`/next/r`, `/v*/r`,
  `/r`) and the demo (`/demo`).

## Verification

- `bun run check` passes; `bun run registry:smoke` passes against the local build.
- Demo screenshots (Playwright 1.64.1): list page, dark Cmd/Ctrl+K, settings, mobile sheet.

## Next

1. Generic column table (`shell-collection`): columns, sticky header, sorting, hidden columns,
   selection with the floating bulk bar, row menu.
2. tinylink installs from the registry and drops its copies.
