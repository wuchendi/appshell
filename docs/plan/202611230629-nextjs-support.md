# Next.js support: router adapters, RSC and SSR-safe state (v0.4.0)

## Status: completed

- **createdAt**: 2026-11-23
- **approvedAt**: 2026-11-23
- **relatedTask**: nextjs-support

## Context

The shell only runs on a client-rendered TanStack Router app. In Next.js (App Router or Pages
Router) it fails on five counts:

1. **Router lock-in**: `app-shell.tsx`, `rail.tsx`, `panel.tsx`, `navigation-progress.tsx` and
   `search-dialog.tsx` import `@tanstack/react-router` (`useRouterState`, `Link`, `useNavigate`).
   `PanelRow` exposes TanStack types in its contract (`params`, `search`).
2. **No RSC boundary**: no shipped file has `"use client"`. `core/labels.ts` mixes plain label
   data with `createContext`, so a Server Component cannot even import `shellLabelsZh`.
3. **SSR crash**: `app-shell.tsx` passes `localStorage` during render (`useDefaultLayout`).
4. **Hydration mismatch**: the panel open state (zustand `persist`, localStorage) and the panel
   width (localStorage) are unknown to the server, so a folded or resized panel renders
   differently on server and client. `useIsMobile` is a `useState(false)` + effect.
   Also, a module-level zustand store would be shared across requests on a server.
5. **Install path**: every target is `~/src/shell/...`. In a Next app without `src/`, `@/*` maps
   to `./*` and `@/shell/...` does not resolve. `registry:smoke` only covers Vite with `src/`.

Not a problem: `core/keys.ts` reads `navigator` at module level, but `MOD_KEY` is only rendered in
tooltip contents, which never render on the server. `document`/`window` uses in menus, row
navigation and the shell's key handler all sit in effects.

Checked facts: shadcn resolves a target without `~/` to `src/<target>` when the project has a
`src/` directory and to `<target>` otherwise (`@shadcn/registry` `resolveFilePath`). Next.js
latest is 16.4.6; `next/link` exports `useLinkStatus` and an `onNavigate` prop.

Product phase: no compatibility shims, no deprecated aliases, old API and docs are removed.

## Design

### 1. Router adapter by file swap

Shipped code imports routing only from `@/shell/router`. Two new registry items each install that
same file; a host installs exactly one:

- `shell-router-tanstack` (deps: `@tanstack/react-router`)
- `shell-router-next` (deps: `next`)

```ts
// @/shell/router — the contract both adapters implement
export function ShellLink(props: ShellLinkProps): ReactElement; // href + anchor attributes
export function useShellPathname(): string;
export function useShellNavigate(): (href: string) => void;
export function useShellNavigating(): boolean; // drives NavigationProgress
```

- TanStack: `Link to={href}`, `useRouterState` for pathname and `isLoading`, `useNavigate`.
- Next: `next/link`, `usePathname`, `useRouter().push`. Next has no global pending state, so the
  adapter keeps a tiny pending counter: each `ShellLink` renders a child reading `useLinkStatus`
  and reports to it; `navigate` runs `router.push` in `startTransition` and reports `isPending`.
  The bar therefore covers navigations started by the shell (rail, panel rows, search, host code
  using `ShellLink` / `useShellNavigate`), not raw `next/link` elsewhere in the host.

Why file swap over a runtime provider: zero indirection, only one router dependency installed,
fully typed, and it is how shadcn hosts already own code. `shell-layout` and `shell-search` do not
depend on either adapter item (shadcn cannot express "one of"); a missing adapter fails the host's
typecheck at the import of `@/shell/router`, and the docs say to install one.

API changes (breaking):
- `PanelRow` / `PanelAllRow`: `to` → `href`; `params` and `search` are removed (the host builds
  the full href string).
- `ShellSpace.href` stays a string; the casts to `LinkProps["to"]` move into the TanStack adapter.

### 2. RSC boundary

- `"use client"` on every shipped `.tsx` and on `.ts` files with hooks or context
  (`use-row-navigation`, `use-is-mobile`, `page-fill`, `page-context`, `use-collection-page`, the
  new label context and panel state). shadcn strips the directive for hosts with `rsc: false`.
- Split `core/labels.ts`: `labels.ts` keeps `ShellLabels`, `shellLabelsEn`, `shellLabelsZh` (no
  directive, importable on the server); `labels-context.tsx` holds `ShellLabelsProvider` /
  `useShellLabels` (`"use client"`).
- `AppShell` props include components and functions (`spaces[].icon`, `panels`, `onSearch`,
  `newAction`), which cannot cross a server → client boundary. Hosts render `AppShell` from their
  own client component; the docs show the App Router layout pattern.

### 3. SSR-safe persisted state: one cookie

Replace localStorage (zustand `persist` + `useDefaultLayout`) with one cookie the server can read:

- `core/prefs.ts` (pure, unit-tested): `ShellPrefs = { panelOpen: boolean; panelSize?: number }`
  (width in percent), `SHELL_PREFS_COOKIE` (`appshell`, value `0`/`1` plus optional `:<size>`),
  `readShellPrefs(cookies)` over a `Cookie` header, `document.cookie` or Next's
  `cookies().toString()` (URL-encoded `%3A` accepted), and `shellPrefsCookie(prefs)`. Invalid or
  missing input yields defaults.
- `AppShell` gains `prefs?: ShellPrefs | undefined`. Next layouts read `cookies()` on the server
  and pass `readShellPrefs(...)`; without the prop the shell reads `document.cookie` when it
  exists (SPA hosts), else defaults. Changes write the cookie (`path=/`, one year, `SameSite=Lax`).
- Panel state moves from a global zustand store to React state in `AppShell` exposed through a
  `ShellPanelContext` (`open`, `toggle`, `setOpen`), consumed by `Rail` and `PageHeader`. This
  removes cross-request state on the server and the `zustand` dependency of `shell-core`
  (`panel-store.ts` and its test are deleted, replaced by a prefs test).
- The panel's own `defaultSize` carries the initial state (`0` while folded, else the saved
  `<size>%` or `240px`); rrp server-renders from it, and treats a `0` in the group's
  `defaultLayout` as missing, so no group `defaultLayout` is used. Opening resizes to the saved
  width. `onLayoutChanged` writes the width; `useDefaultLayout` and `layoutId` are removed.

### 4. Mobile breakpoint

`useIsMobile` becomes `useSyncExternalStore` over `matchMedia` with a server snapshot of `false`:
no hydration error. The group also hides the inline panel below `md` by CSS
(`max-md:[&>#panel]:hidden!`, the handle `max-md:hidden`), so a phone's server paint shows the
page full width: the page panel is the only growing flex item left.

### 5. Install targets

All targets drop `~/src/` and become `shell/...`, so shadcn places them in `src/shell/` or
`shell/` according to the host, matching where `@/*` points.

### 6. Verification surface

- `registry:smoke` runs two scratch hosts: the existing Vite one (+ `shell-router-tanstack`) and
  a Next App Router one without `src/` (+ `shell-router-next`, `rsc: true`), each installed,
  typechecked and built (`next build`). The Next host's root layout reads the cookie and renders a
  client `Shell` wrapper with one space and panel.
- No second demo app. The demo (`apps/shell-web`) switches to the TanStack adapter and `href`.

## Tasks

1. `core/prefs.ts` + tests (RED → GREEN): parse/serialize, defaults on garbage, layout round trip.
2. Router contract + `shell-router-tanstack` / `shell-router-next`; port rail, panel, search,
   app-shell, navigation progress; `PanelRow` / `PanelAllRow` `href`.
3. Labels split, `"use client"` directives, panel context replacing the store, cookie-backed
   prefs in `AppShell`, `useIsMobile` on `useSyncExternalStore`.
4. `registry.json`: new items, targets, drop `zustand` from `shell-core`; demo updates.
5. `registry:smoke` Next variant.
6. Browser check (Playwright) on the built Next smoke host: no hydration warnings with the panel
   folded and resized (cookie set), fold/resize persists across reload, rail/panel/search
   navigation and the progress bar work, mobile sheet works. Same regressions on the Vite demo.
7. Docs (README install steps per router, Next layout example), changelog, v0.4.0.

## Verification

- `bun run check`: lint, typecheck (incl. the Next adapter against `next` 16.4.6), 32 unit tests
  (prefs: defaults, other cookies, name suffix, malformed values, URL-encoded value, round trip),
  100% line coverage of the pure modules, registry and demo builds.
- `bun run registry:smoke`: Vite host (TanStack adapter) and Next host (App Router, no `src/`,
  `rsc: true`, server layout reading `cookies()`) install, typecheck and build.
- Playwright on the Next smoke host (`next start`), 26/26: server HTML without JS renders the
  panel folded (`appshell=0`), at 30% (`1:30`) and at 240px (no cookie); no console errors or
  hydration warnings in any of these after hydration; Ctrl+B / header toggle persist to the
  cookie and survive reload; unfolding after a folded reload restores the saved width; dragging
  saves the width; rail, panel row and search navigation with `aria-current`; the current rail
  entry folds; the progress bar shows for a delayed shell-link navigation and clears; at 390px
  the inline panel is absent and the sheet closes after navigating. Without JS at 390px the page
  spans the full width.
- Playwright on the Vite demo build: fold/unfold persists, link and action panel rows, rail,
  search go-to and results, hrefs without stray `?`/`#`, no console errors.

## Risks

- **Next progress coverage**: raw `next/link` in host pages does not drive the bar. Hosts that
  want it use `ShellLink`.
- **Breaking for existing hosts** (tinylink, azctl): `PanelRow` props, new adapter item, removed
  `layoutId` and `useShellPanelStore`, label import paths. Stored localStorage prefs are dropped
  (first load after upgrade uses defaults). Intended — no compatibility layer.
- `useLinkStatus` must render inside the `Link`; the adapter places a hidden reporter child there.

## Alternatives

- **Runtime router provider** (`<ShellRouterProvider adapter={...}>`): one shipped file set for
  both routers, but adds a provider, a hook indirection on every render and keeps both router
  types in the contract. Rejected for the file swap above.
- **`dynamic(..., { ssr: false })` in Next**: skips items 3–4 but loses SSR of the whole shell
  (blank first paint, worse LCP). Rejected per the request for full support.
- **Next progress bar = always off**: simpler adapter (`useShellNavigating() => false`), relying
  on `loading.tsx`. Kept as the fallback if the `useLinkStatus` reporter proves fragile.
- **A second demo app (`apps/shell-next`)**: better manual testing, but duplicates the demo pages
  and doubles maintenance. The smoke host covers build + hydration checks instead.

## Annotations

- 2026-11-23 user: product phase, no backward compatibility; old interfaces and docs are removed.
  Full support (router, RSC, SSR state, install paths) wanted.
- 2026-11-23 user: zustand's SSR pattern (per-request store) was weighed against React state +
  context; context chosen (one boolean + a layout, three consumers, drops the dependency).
