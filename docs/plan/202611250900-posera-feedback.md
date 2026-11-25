# Posera feedback and the TanStack pathname (v0.4.2)

## Status: implemented, not released

- **createdAt**: 2026-11-25
- **approvedAt**: 2026-11-25
- **relatedTask**: posera-feedback
- **source**: posewear-next `docs/appshell-feedback.md` (items 1–6), reviewed against v0.4.1

## Context

Posera (Next.js 16 App Router, next-intl `/[locale]/…`, statically prerendered on Cloudflare
Pages) reported six items; each was confirmed against the code. Separately, bks showed the
TanStack adapter's `useShellPathname` reading `location`, which names a pending navigation's
target while the host's `<Outlet>` still renders the old page.

## Changes

1. **Search detail flush right**: the detail span carries `data-slot="command-shortcut"`, which
   hides `CommandItem`'s check icon (it shared the `ml-auto` space).
2. **Search media**: `ShellSearchResult.media?: ReactNode`, shown in the icon slot instead of
   `icon`; documented size `size-8`.
3. **Panel row count**: `count?: number | ReactNode`; a number keeps today's rendering (0 hidden).
4. **Static hosts**: `AppShell` `prefs="client"` renders the defaults, then applies the cookie
   after mount without the panel animation. Omitted `prefs` keeps reading the cookie during
   render (client-only hosts); passing an object keeps the server path.
5. **Locale-prefixed routes**: no shell change. README recipe: the Next adapter imports
   `Link` / `usePathname` / `useRouter` from the host's next-intl `createNavigation()` module.
6. **Biome recommended**: test files drop `!`; `collection-table.tsx` keeps ARIA roles on `div`s
   with a `biome-ignore` reason each; appshell's `biome.json` stops turning `noNonNullAssertion`
   off.
7. **TanStack pathname**: `useShellPathname` reads `resolvedLocation ?? location`.

## Verify

- `bun run check` passes; `biome lint` with the recommended preset (react + next domains) is
  clean over `registry/shell`.
- Unit tests for any new pure helper (none added: the changes live in `.tsx` components).
- Demo, Playwright against the dev server: `prefs="client"` restores a folded panel and a saved
  width with no fold animation, Cmd+B still animates afterwards; with a 1.5 s route loader the
  rail and panel stay on Items until the page settles; search details share one right edge;
  the v0.4.1 checks (`.tmp/pw/check-req.mjs`) still pass.
