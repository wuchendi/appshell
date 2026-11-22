#!/usr/bin/env bash
# Installs every registry item into a scratch app with non-default aliases
# (like a real host), then typechecks and builds it. Needs network access.
# Set REGISTRY_URL (base ending in /r) to test a deployed registry instead.
set -euo pipefail
ROOT=$(cd "$(dirname "$0")/.." && pwd)
WORK=$ROOT/.tmp/registry-smoke
PORT=${SMOKE_PORT:-4318}

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
rm -rf "$WORK" && mkdir -p "$WORK/src"

cd "$WORK"
cat > package.json <<'JSON'
{ "name": "smoke", "type": "module", "private": true }
JSON
cat > components.json <<JSON
{
  "\$schema": "https://ui.shadcn.com/schema.json",
  "style": "base-nova",
  "rsc": false,
  "tsx": true,
  "tailwind": { "config": "", "css": "src/index.css", "baseColor": "neutral", "cssVariables": true, "prefix": "" },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/shared/components",
    "utils": "@/shared/lib/utils",
    "ui": "@/shared/components/ui",
    "lib": "@/shared/lib",
    "hooks": "@/shared/hooks"
  },
  "registries": { "@wuchendi": "$REGISTRY/{name}.json" }
}
JSON
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
echo '@import "tailwindcss";' > src/index.css

bun add react react-dom @tanstack/react-router >/dev/null
bun add -d vite @vitejs/plugin-react tailwindcss @tailwindcss/vite @types/react @types/react-dom @types/bun "typescript@npm:typescript@7" >/dev/null
bunx shadcn add -y @wuchendi/shell-layout @wuchendi/shell-menus @wuchendi/shell-search @wuchendi/shell-intro

cat > src/main.tsx <<'TSX'
import { createRootRoute, createRouter, Outlet, RouterProvider } from "@tanstack/react-router";
import { Gauge } from "lucide-react";
import { createRoot } from "react-dom/client";
import { shellLabelsZh } from "@/shell/core/labels";
import { FeatureIntro } from "@/shell/intro/feature-intro";
import { AppShell } from "@/shell/layout/app-shell";
import { PageHeader } from "@/shell/layout/page-header";
import { DisplayMenu, FilterMenu, HeaderSearch } from "@/shell/menus/menus";
import { SearchDialog } from "@/shell/search/search-dialog";
import "./index.css";

const spaces = [{ key: "home", href: "/", label: "Home", icon: Gauge, exact: true }];

const root = createRootRoute({
  component: () => (
    <AppShell spaces={spaces} homeHref="/" logo="A" logoLabel="App" labels={shellLabelsZh} onSearch={() => {}}>
      <SearchDialog open={false} onOpenChange={() => {}} spaces={spaces} />
      <PageHeader
        title="Home"
        tools={<><FilterMenu count={0} onReset={() => {}}>x</FilterMenu><HeaderSearch value="" onChange={() => {}} placeholder="Search" /></>}
        actions={<DisplayMenu>y</DisplayMenu>}
      />
      <FeatureIntro icon={Gauge} label="L" title="T" description="D" action={null} art={null} />
      <Outlet />
    </AppShell>
  ),
});
createRoot(document.getElementById("root")!).render(<RouterProvider router={createRouter({ routeTree: root })} />);
TSX

echo "== ui imports rewritten to host aliases:"
grep -rh '^import .*@/shared' src/shell | sort -u
if grep -rq '@/components/ui\|@/lib/utils' src/shell; then
  echo "unrewritten shadcn imports left in src/shell" >&2
  exit 1
fi
bunx tsc --noEmit -p tsconfig.json
bunx vite build >/dev/null
echo "registry smoke: OK"
