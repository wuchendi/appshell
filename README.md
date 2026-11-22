# appshell

A dashboard app shell — icon rail, one rounded content card, resizable space panels, one-row page
headers, list header menus, a Cmd/Ctrl+K search dialog and first-run intros — shipped as a
[shadcn registry](https://ui.shadcn.com/docs/registry) under the `@cdlab` namespace. Host apps
copy the code in with `shadcn add` and own it from then on. There is no npm package and no
server: everything is React on the client.

Stack: React 19, TanStack Router, shadcn/ui on Base UI (`base-nova`), Tailwind v4, zustand.

Demo: <https://wuchendi.github.io/appshell/demo/>

## Install

Add the registry to the host's `components.json`:

```json
{ "registries": { "@cdlab": "https://wuchendi.github.io/appshell/r/{name}.json" } }
```

`/r/` is the latest release; `/v{version}/r/` pins one and `/next/r/` tracks `main`.

```bash
bunx shadcn add @cdlab/shell-layout   # AppShell, rail, panels, PageHeader (pulls in shell-core)
bunx shadcn add @cdlab/shell-menus    # Filter / Display menus, chips, header search
bunx shadcn add @cdlab/shell-search   # Cmd/Ctrl+K dialog
bunx shadcn add @cdlab/shell-intro    # first-run intro page
```

Files land in `src/shell/**` and import each other as `@/shell/...`, so the host needs the usual
`@/*` → `src/*` alias. `shell-layout` also adds a `--canvas` color (light and dark) and the
progress-bar keyframes to the host stylesheet.

| Item | What it is |
| --- | --- |
| `shell-core` | Labels (en / zh) and their provider, `ShellSpace` and path matching, the persisted panel state, the typing guard for bare-key shortcuts, J/K row navigation, the mobile hook |
| `shell-layout` | `<AppShell>`, `Rail`, `PageHeader`, `IconButton`, `PanelFrame` / `PanelSection` / `PanelRow` / `PanelAllRow`, `NavigationProgress` |
| `shell-menus` | `FilterMenu`, `DisplayMenu`, `MenuSection`, `MenuRow`, `MenuSwitch`, `Chips`, `ChipCount`, `ResetButton`, `HeaderSearch` |
| `shell-search` | `SearchDialog` over the host's own search function plus a "Go to" list of the spaces |
| `shell-intro` | `FeatureIntro`, `IntroArtCard`, `IntroArtArrow` |

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
        <PanelRow to="/items" icon={Boxes} active>All items</PanelRow>
      </PanelSection>
    </PanelFrame>
  );
}

// The root route's component.
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

- **Spaces** are the rail entries. A space with a component in `panels` gets a panel beside its
  pages; the panel width is saved once for every space and folding never remounts the page.
- **Shortcuts**: Cmd/Ctrl+B folds the panel, Cmd/Ctrl+K calls `onSearch`, a bare `C` runs
  `newAction`. Clicking the current rail entry or the panel edge folds the panel too.
- **Labels**: every visible string comes from `labels` (`ShellLabels`). `shellLabelsEn` and
  `shellLabelsZh` ship with the shell; hosts on i18n build the object from their translations.
- **Rows**: give list rows `data-shell-row` and `tabIndex={0}`, then `useRowNavigation(listRef)`
  for J/K.
- **Search**: render `<SearchDialog>` yourself (open state from `onSearch`) and pass
  `search={(query, signal) => Promise<ShellSearchResult[]>}`.

Items are copied source, so upgrading a host means re-running `shadcn add` and reviewing the diff.

## Develop

```bash
bun install
bun run check            # lint + typecheck + unit tests with coverage + registry and demo builds
bun run registry:smoke   # shadcn add every item into a scratch app, typecheck + build (needs network)
bun run --cwd apps/shell-web dev
```

| Path | |
| --- | --- |
| `registry/shell/**` | the shipped sources (same `@/shell/...` layout as in a host) |
| `registry.json` | registry items, their files and dependencies |
| `apps/shell-web` | the demo app; `@/shell/*` aliases into `registry/shell` |

## License

MIT
