# AGENTS.md

Guidance for coding agents working in this repository. `CLAUDE.md` imports this file.

## What this is

A dashboard app shell (rail, content card, space panels, page header, list menus, search dialog,
intro) shipped as a [shadcn registry](https://ui.shadcn.com/docs/registry) under `@cdlab`.
Hosts copy the sources in with `shadcn add` and own them. No npm package, no server; `apps/*`
exist only for development and the demo. Layout and conventions follow `bkhq/filemanager`.

```text
registry/shell/   the product (same `@/shell/...` layout as in a host)
  core/           labels, spaces, panel state + prefs cookie, keys, typing guard, row navigation, mobile hook
  router/         adapters (tanstack.tsx, next.tsx); each installs as `@/shell/router`
  layout/         AppShell, Rail, PageHeader, IconButton, panel parts, NavigationProgress
  menus/          Filter / Display menus, chips, header search
  search/         Cmd/Ctrl+K dialog
  intro/          FeatureIntro
  collection/     CollectionTable, BatchBar, ColumnsSection, column helpers
registry.json     items, files, dependencies
apps/shell-web    demo app (Vite + React + TanStack Router)
docs/             plan/, task/, changelog.md
```

## Commands

Use the Bun version in `.bun-version`.

```bash
bun install
bun run check            # lint + typecheck + unit tests (coverage) + registry and demo builds — the gate
bun run lint:fix           # biome check --write (format + organize imports + safe fixes)
bun run registry:smoke   # installs every item into a scratch app with non-default aliases (needs network)
bun run --cwd apps/shell-web dev    # in tmux, never in the foreground
```

## Rules for shipped code (`registry/shell/**`)

- **Imports**: only declared dependencies and `@/shell/...`; shadcn UI as `@/components/ui/*`
  (rewritten on install). Import `cn` from the `cn` package.
- **Naming**: exported types carry the `Shell` prefix (React `*Props` exempt; enforced by Biome `useNamingConvention`).
- **Strings**: every visible string comes from `ShellLabels` (`core/labels.ts`, en and zh). Add a
  key to both languages.
- **Routing**: only through `@/shell/router` (`ShellLink`, `useShellPathname`, `useShellNavigate`,
  `useShellNavigating`); hrefs are plain strings. Both adapters implement the same exports.
- **Server rendering**: hosts may render on a server (Next.js). Files with hooks, context or
  components start with `"use client"`; plain modules (labels, prefs, spaces, helpers) stay
  importable from Server Components. Nothing reads `window`/`document`/storage during render;
  persisted UI state goes through the prefs cookie.
- **Files**: a new shipped file goes into its item in `registry.json` (`registry:smoke` catches a
  miss); new npm dependencies go into the item and the demo's `package.json`.
- **exactOptionalPropertyTypes** is on: optional props a host may pass as `undefined` are typed
  `| undefined`.
- Keep surfaces small and stable — hosts diff their copy on every upgrade.

## Tests

`bun:test` next to the source for pure modules (happy-dom preloaded); `.tsx` components are left
out of unit coverage and checked through the demo and `registry:smoke`.

## Workflow

PMA: tasks in `docs/task/`, plans in `docs/plan/`, decisions and pitfalls in `docs/changelog.md`.
Code, comments, docs and commit messages in English.

Releases: tag a commit that is not yet on `main` and push both at once
(`git push origin main vX.Y.Z`). GitHub Pages keeps the first deployment of a commit, so a tag
added to a commit `main` already deployed never reaches `/r/`.
