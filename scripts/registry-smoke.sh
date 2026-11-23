#!/usr/bin/env bash
# Installs every registry item into scratch hosts with non-default aliases (like real hosts):
# a Vite + TanStack Router app with src/, and a Next.js App Router app without src/. Each is
# typechecked and built. Needs network access.
# Set REGISTRY_URL (base ending in /r) to test a deployed registry instead.
# Set SMOKE_HOSTS to "vite" or "next" to run one host.
set -euo pipefail
ROOT=$(cd "$(dirname "$0")/.." && pwd)
WORK=$ROOT/.tmp/registry-smoke
PORT=${SMOKE_PORT:-4318}
HOSTS=${SMOKE_HOSTS:-vite next}
ITEMS="@cdlab/shell-layout @cdlab/shell-menus @cdlab/shell-search @cdlab/shell-intro @cdlab/shell-collection"

REGISTRY=${REGISTRY_URL:-}
REGISTRY=${REGISTRY%/}
# shadcn reads REGISTRY_URL as its own default registry; keep it away from the CLI.
unset REGISTRY_URL

cd "$ROOT"
if [ -n "$REGISTRY" ]; then
  echo "registry smoke: testing $REGISTRY"
else
  bun run registry:build >/dev/null
  bun -e "Bun.serve({ port: $PORT, fetch: r => new Response(Bun.file('$ROOT/public' + new URL(r.url).pathname)) })" &
  SERVER=$!
  trap 'kill $SERVER' EXIT
  REGISTRY=http://localhost:$PORT/r
fi

# components.json with non-default aliases. $1: rsc, $2: the Tailwind stylesheet.
components_json() {
  cat > components.json <<JSON
{
  "\$schema": "https://ui.shadcn.com/schema.json",
  "style": "base-nova",
  "rsc": $1,
  "tsx": true,
  "tailwind": { "config": "", "css": "$2", "baseColor": "neutral", "cssVariables": true, "prefix": "" },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/shared/components",
    "utils": "@/shared/lib/utils",
    "ui": "@/shared/components/ui",
    "lib": "@/shared/lib",
    "hooks": "@/shared/hooks"
  },
  "registries": { "@cdlab": "$REGISTRY/{name}.json" }
}
JSON
}

# $1: where the shell landed.
check_rewrites() {
  echo "== ui imports rewritten to host aliases:"
  grep -rh '^import .*@/shared' "$1" | sort -u
  if grep -rq '@/components/ui\|@/lib/utils' "$1"; then
    echo "unrewritten shadcn imports left in $1" >&2
    exit 1
  fi
}

vite_host() {
rm -rf "$WORK/vite" && mkdir -p "$WORK/vite/src"
cd "$WORK/vite"
cat > package.json <<'JSON'
{ "name": "smoke", "type": "module", "private": true }
JSON
components_json false src/index.css
cat > tsconfig.json <<'JSON'
{
  "compilerOptions": {
    "target": "es2023",
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "types": ["vite/client", "bun"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "verbatimModuleSyntax": true,
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "skipLibCheck": true,
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"]
}
JSON
cat > vite.config.ts <<'TS'
import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": resolve(import.meta.dirname, "src") } },
});
TS
cat > index.html <<'HTML'
<!doctype html><html><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>
HTML
# .tmp/ is git-ignored, which Tailwind skips unless told.
printf '@import "tailwindcss";\n@source ".";\n' > src/index.css

bun add react react-dom @tanstack/react-router >/dev/null
bun add -d vite @vitejs/plugin-react tailwindcss @tailwindcss/vite @types/react @types/react-dom @types/bun "typescript@npm:typescript@7" >/dev/null
bunx shadcn add -y @cdlab/shell-router-tanstack $ITEMS

cat > src/main.tsx <<'TSX'
import { createRootRoute, createRouter, Outlet, RouterProvider } from "@tanstack/react-router";
import { Gauge } from "lucide-react";
import { createRoot } from "react-dom/client";
import { shellLabelsZh } from "@/shell/core/labels";
import { BatchBar } from "@/shell/collection/batch-bar";
import { CollectionTable } from "@/shell/collection/collection-table";
import { FeatureIntro } from "@/shell/intro/feature-intro";
import { AppShell } from "@/shell/layout/app-shell";
import { PageHeader } from "@/shell/layout/page-header";
import { PanelFrame, PanelRow, PanelSection } from "@/shell/layout/panel";
import { DisplayMenu, FilterMenu, HeaderSearch } from "@/shell/menus/menus";
import { SearchDialog } from "@/shell/search/search-dialog";
import "./index.css";

function Panel() {
  return <PanelFrame title="Home"><PanelSection label="L"><PanelRow href="/?q=1" active>Row</PanelRow></PanelSection></PanelFrame>;
}

const spaces = [{ key: "home", href: "/", label: "Home", icon: Gauge, exact: true }];

const root = createRootRoute({
  component: () => (
    <AppShell spaces={spaces} panels={{ home: Panel }} homeHref="/" logo="A" logoLabel="App" labels={shellLabelsZh} onSearch={() => {}}>
      <SearchDialog open={false} onOpenChange={() => {}} spaces={spaces} />
      <PageHeader
        title="Home"
        tools={<><FilterMenu count={0} onReset={() => {}}>x</FilterMenu><HeaderSearch value="" onChange={() => {}} placeholder="Search" /></>}
        actions={<DisplayMenu>y</DisplayMenu>}
      />
      <FeatureIntro icon={Gauge} label="L" title="T" description="D" action={null} art={null} />
      <CollectionTable columns={[{ key: "name", header: "Name", cell: (r: { id: string }) => r.id }]} rows={[{ id: "a" }]} getRowId={r => r.id} />
      <BatchBar count={1} onClear={() => {}}>z</BatchBar>
      <Outlet />
    </AppShell>
  ),
});
createRoot(document.getElementById("root")!).render(<RouterProvider router={createRouter({ routeTree: root })} />);
TSX

check_rewrites src/shell
bunx tsc --noEmit -p tsconfig.json
bunx vite build >/dev/null
echo "registry smoke (vite): OK"
}

next_host() {
rm -rf "$WORK/next" && mkdir -p "$WORK/next/app/items"
cd "$WORK/next"
cat > package.json <<'JSON'
{ "name": "smoke-next", "private": true, "scripts": { "build": "next build", "start": "next start" } }
JSON
components_json true app/globals.css
cat > tsconfig.json <<'JSON'
{
  "compilerOptions": {
    "target": "es2023",
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "noEmit": true,
    "skipLibCheck": true,
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
JSON
echo 'export default { plugins: { "@tailwindcss/postcss": {} } };' > postcss.config.mjs
printf '@import "tailwindcss";\n@source "../app";\n@source "../shell";\n@source "../shared";\n' > app/globals.css

bun add next react react-dom >/dev/null
bun add -d typescript tailwindcss @tailwindcss/postcss @types/react @types/react-dom @types/node >/dev/null
bunx shadcn add -y @cdlab/shell-router-next $ITEMS

# A Server Component layout: reads the prefs cookie, passes server-safe labels.
cat > app/layout.tsx <<'TSX'
import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { shellLabelsZh } from "@/shell/core/labels";
import { readShellPrefs } from "@/shell/core/prefs";
import { Shell } from "./shell";
import "./globals.css";

export default async function RootLayout({ children }: { children: ReactNode }) {
  const prefs = readShellPrefs((await cookies()).toString());
  return (
    <html lang="en">
      <body>
        <Shell prefs={prefs} labels={shellLabelsZh}>{children}</Shell>
      </body>
    </html>
  );
}
TSX
cat > app/shell.tsx <<'TSX'
"use client";

import { Boxes, Gauge } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import type { ShellLabels } from "@/shell/core/labels";
import type { ShellPrefs } from "@/shell/core/prefs";
import { AppShell } from "@/shell/layout/app-shell";
import { PanelFrame, PanelRow, PanelSection } from "@/shell/layout/panel";
import { useShellPathname } from "@/shell/router";
import { SearchDialog } from "@/shell/search/search-dialog";

const spaces = [
  { key: "home", href: "/", label: "Home", icon: Gauge, exact: true },
  { key: "items", href: "/items", label: "Items", icon: Boxes },
];

function ItemsPanel() {
  const pathname = useShellPathname();
  return (
    <PanelFrame title="Items">
      <PanelSection label="Views">
        <PanelRow href="/items" active={pathname === "/items"}>All items</PanelRow>
        <PanelRow href="/items/archived" active={pathname === "/items/archived"}>Archived</PanelRow>
      </PanelSection>
    </PanelFrame>
  );
}

export function Shell({ prefs, labels, children }: { prefs: ShellPrefs; labels: ShellLabels; children: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  return (
    <AppShell
      spaces={spaces}
      panels={{ items: ItemsPanel }}
      homeHref="/"
      logo="A"
      logoLabel="App"
      labels={labels}
      prefs={prefs}
      onSearch={() => setSearchOpen(true)}
    >
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} spaces={spaces} />
      {children}
    </AppShell>
  );
}
TSX
cat > app/pages.tsx <<'TSX'
"use client";

import { Gauge } from "lucide-react";
import { BatchBar } from "@/shell/collection/batch-bar";
import { CollectionTable } from "@/shell/collection/collection-table";
import { FeatureIntro } from "@/shell/intro/feature-intro";
import { PageBody } from "@/shell/layout/page-body";
import { PageHeader } from "@/shell/layout/page-header";
import { DisplayMenu, FilterMenu, HeaderSearch } from "@/shell/menus/menus";

export function Home() {
  return (
    <>
      <PageHeader title="Home" />
      <FeatureIntro icon={Gauge} label="L" title="T" description="D" action={null} art={null} />
    </>
  );
}

export function Items({ title }: { title: string }) {
  return (
    <>
      <PageHeader
        title={title}
        tools={<><FilterMenu count={0} onReset={() => {}}>x</FilterMenu><HeaderSearch value="" onChange={() => {}} placeholder="Search" /></>}
        actions={<DisplayMenu>y</DisplayMenu>}
      />
      <PageBody>
        <CollectionTable columns={[{ key: "name", header: "Name", cell: (r: { id: string }) => r.id }]} rows={[{ id: "a" }]} getRowId={r => r.id} />
        <BatchBar count={0} onClear={() => {}}>z</BatchBar>
      </PageBody>
    </>
  );
}
TSX
cat > app/page.tsx <<'TSX'
import { Home } from "./pages";

export default function Page() {
  return <Home />;
}
TSX
cat > app/items/page.tsx <<'TSX'
import { Items } from "../pages";

export default function Page() {
  return <Items title="All items" />;
}
TSX
mkdir -p app/items/archived
cat > app/items/archived/page.tsx <<'TSX'
import { Items } from "../../pages";

export default function Page() {
  return <Items title="Archived" />;
}
TSX

if [ -d src ]; then
  echo "shadcn created src/ in a host without one" >&2
  exit 1
fi
check_rewrites shell
bunx next build
bunx tsc --noEmit -p tsconfig.json
echo "registry smoke (next): OK"
}

for host in $HOSTS; do
  "${host}_host"
done
