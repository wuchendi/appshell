# appshell

A dashboard app shell — icon rail, one rounded content card, resizable space panels, one-row page
headers, list header menus, a Cmd/Ctrl+K search dialog and first-run intros — shipped as a
[shadcn registry](https://ui.shadcn.com/docs/registry) under the `@cdlab` namespace. Host apps
copy the code in with `shadcn add` and own it from then on. There is no npm package.

Stack: React 19, shadcn/ui on Base UI (`base-nova`), Tailwind v4. Routing through an adapter for
TanStack Router or Next.js (App Router, server rendered).

Demo: <https://wuchendi.github.io/appshell/demo/>

## Install

Add the registry to the host's `components.json`:

```json
{ "registries": { "@cdlab": "https://wuchendi.github.io/appshell/r/{name}.json" } }
```

`/r/` is the latest release; `/v{version}/r/` pins one and `/next/r/` tracks `main`.

```bash
bunx shadcn add @cdlab/shell-router-tanstack   # or @cdlab/shell-router-next — install exactly one
bunx shadcn add @cdlab/shell-layout   # AppShell, rail, panels, PageHeader (pulls in shell-core)
bunx shadcn add @cdlab/shell-menus    # Filter / Display menus, chips, header search
bunx shadcn add @cdlab/shell-search   # Cmd/Ctrl+K dialog
bunx shadcn add @cdlab/shell-intro    # first-run intro page
bunx shadcn add @cdlab/shell-collection  # column table, batch bar, column switches
```

Files land in `shell/**` — under `src/` when the host has one — and import each other as
`@/shell/...`, so `@/*` must point at that root (`./src/*` or `./*`). Both router items install
`shell/router.tsx`; `shell-layout` and `shell-search` import it and fail to compile without one.
`shell-layout` adds the progress-bar keyframes to the host stylesheet.

The canvas behind the rail and the content card is `var(--shell-canvas, var(--color-muted))`. Set
`--shell-canvas` in the host theme (light and dark, however the host switches them) to pick
another color:

```css
:root { --shell-canvas: oklch(0.965 0 0); }
.dark { --shell-canvas: oklch(0.11 0 0); }
```

| Item | What it is |
| --- | --- |
| `shell-core` | Labels (en / zh) and their context, `ShellSpace` and path matching, the panel state context and its prefs cookie, the typing guard for bare-key shortcuts, J/K row navigation, the mobile hook, the fill-page context |
| `shell-router-tanstack` / `shell-router-next` | `@/shell/router`: `ShellLink`, `useShellPathname`, `useShellNavigate`, `useShellNavigating` |
| `shell-layout` | `<AppShell>`, `Rail`, `PageHeader`, `PageBody`, `IconButton`, `PanelFrame` / `PanelSection` / `PanelRow` / `PanelAllRow`, `NavigationProgress` |
| `shell-menus` | `FilterMenu`, `DisplayMenu`, `MenuSection`, `MenuRow`, `MenuSwitch`, `Chips`, `ChipCount`, `ResetButton`, `HeaderSearch` |
| `shell-search` | `SearchDialog` over the host's own search function plus a "Go to" list of the spaces |
| `shell-intro` | `FeatureIntro`, `IntroArtCard`, `IntroArtArrow` |
| `shell-collection` | `CollectionTable` (sticky header, sortable columns, select all, 36px rows that open on click / Enter, J/K, right-click menu, hover actions, narrow `core` columns, sub-rows, loading and empty states, inner scrolling in fill pages), `CollectionPager` and `useCollectionPage`, `BatchBar`, `ColumnsSection`; `ShellColumn` |

## Use

```tsx
import { Boxes, Gauge, Settings } from "lucide-react";
import { shellLabelsZh } from "@/shell/core/labels";
import { AppShell } from "@/shell/layout/app-shell";
import { PageHeader } from "@/shell/layout/page-header";
import { PanelFrame, PanelRow, PanelSection } from "@/shell/layout/panel";

const spaces = [
  { key: "overview", href: "/", label: "Overview", icon: Gauge, exact: true },
  { key: "items", href: "/items", label: "Items", icon: Boxes },
  { key: "settings", href: "/settings", label: "Settings", icon: Settings, footer: true },
];

function ItemsPanel() {
  return (
    <PanelFrame title="Items">
      <PanelSection label="Views">
        <PanelRow href="/items" icon={Boxes} active>All items</PanelRow>
      </PanelSection>
    </PanelFrame>
  );
}

// TanStack Router: the root route's component.
export function Shell() {
  return (
    <AppShell
      spaces={spaces}
      panels={{ items: ItemsPanel }}
      homeHref="/"
      logo={<Logo />}
      logoLabel="My app"
      account={<AccountMenu />}
      labels={shellLabelsZh}
      newAction={{ label: "New item", onSelect: openCreate }}
      onSearch={() => setSearchOpen(true)}
    >
      <Outlet />
    </AppShell>
  );
}

// Every page starts with the one-row header.
<PageHeader title="Items" tools={<FilterMenu … />} actions={<DisplayMenu …>…</DisplayMenu>} />;
```

Next.js (App Router): `AppShell` takes components and functions, so render it from a client
component, and read the prefs cookie in the server layout so the first render matches the client:

```tsx
// app/layout.tsx (Server Component)
import { cookies } from "next/headers";
import { shellLabelsZh } from "@/shell/core/labels";
import { readShellPrefs } from "@/shell/core/prefs";
import { Shell } from "./shell"; // "use client": the <AppShell> above, plus `prefs` and `labels` props

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const prefs = readShellPrefs((await cookies()).toString());
  return (
    <html lang="zh">
      <body>
        <Shell prefs={prefs} labels={shellLabelsZh}>{children}</Shell>
      </body>
    </html>
  );
}
```

Reading cookies makes the routes under that layout dynamic. Every shipped component is a client
component; `@/shell/core/labels`, `prefs`, `spaces` and the collection helpers are plain modules a
Server Component can import.

- **Spaces** are the rail entries. A space with a component in `panels` gets a panel beside its
  pages; folding never remounts the page. Whether the panel is open and its width (one for every
  space) live in the `appshell` cookie (`readShellPrefs` / `shellPrefsCookie`); without a `prefs`
  prop the shell reads `document.cookie`. `useShellPanel()` gives the open state and its setters.
- **Shortcuts**: Cmd/Ctrl+B folds the panel, Cmd/Ctrl+K calls `onSearch`, a bare `C` runs
  `newAction`. Clicking the current rail entry or the panel edge folds the panel too.
- **Labels**: every visible string comes from `labels` (`ShellLabels`). `shellLabelsEn` and
  `shellLabelsZh` ship with the shell; hosts on i18n build the object from their translations.
- **Rows**: give list rows `data-shell-row` and `tabIndex={0}`, then `useRowNavigation(listRef)`
  for J/K.
- **Fill pages**: by default the whole page scrolls under the pinned header. A list page that
  should keep its column header and pager on screen renders `<PageBody fill>` as a direct child
  of its root, after `<PageHeader>`: the body takes the remaining height and a `CollectionTable`
  in it scrolls on its own (or use your own `ScrollArea` with `min-h-0 flex-1`). Content taller
  than the window still scrolls with the page. It is per page, so a detail page in the same space
  keeps the normal layout.
- **Tables**: describe columns as `ShellColumn<T>` (the first is the primary column; `width` is a
  grid track; `sortKey` makes the header sort; `core` keeps it on narrow screens) and render
  `<CollectionTable>`; put `<ColumnsSection>` in the display menu and `<BatchBar>` after the list.
  `renderSubRow={row => node | null}` adds a full-width block under a row (you own the expanded
  state; J/K skips it), `loading` shows skeleton rows and `empty` replaces the rows. Cells clip
  (plain text and numbers end with an ellipsis), rows grow past 36px for multi-line cells, and a
  table wider than its container scrolls sideways inside itself — the header follows, the actions
  stay pinned to the right edge, and the table never widens its parent card.
- **Paging**: client mode — sort and filter first, then
  `const { rows, pager } = useCollectionPage(sorted)` and render `<CollectionTable rows={rows}>`
  followed by `<CollectionPager {...pager} selected={n} />`. Server mode — pass `page`, `pageSize`,
  `total`, `onPageChange` (and `onPageSizeChange`) to `<CollectionPager>` yourself and give the
  table the current page. "Select all" works on the rows the table has, i.e. the current page.
- **Panels**: `PanelRow` takes `href` (a full app path, query included), `icon` or `dot`
  (`success`, `info`, `progress` (pulsing), `warning`, `danger`, `muted`); `inset` keeps a row
  without either aligned with the others.
- **Routing**: shell links and navigation go through `@/shell/router`. On Next.js the progress
  bar follows navigations started by the shell — rail, panel rows, search — and by host code
  using `ShellLink` / `useShellNavigate`; plain `next/link` elsewhere does not drive it.
- **Search**: render `<SearchDialog>` yourself (open state from `onSearch`) and pass
  `search={(query, signal) => Promise<ShellSearchResult[]>}`.

Items are copied source, so upgrading a host means re-running `shadcn add` and reviewing the diff.

## Develop

```bash
bun install
bun run check            # lint + typecheck + unit tests with coverage + registry and demo builds
bun run registry:smoke   # shadcn add every item into a Vite and a Next.js scratch host, typecheck + build (needs network)
bun run --cwd apps/shell-web dev
```

| Path | |
| --- | --- |
| `registry/shell/**` | the shipped sources (same `@/shell/...` layout as in a host) |
| `registry.json` | registry items, their files and dependencies |
| `apps/shell-web` | the demo app; `@/shell/*` aliases into `registry/shell`, `@/shell/router` to the TanStack adapter |

## License

MIT
