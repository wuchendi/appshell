import { Outlet, useNavigate } from "@tanstack/react-router";
import { Boxes, Gauge, Languages, Settings } from "lucide-react";
import { useCallback, useState } from "react";
import { shellLabelsEn, shellLabelsZh } from "@/shell/core/labels";
import { AppShell } from "@/shell/layout/app-shell";
import { IconButton } from "@/shell/layout/icon-button";
import type { ShellSearchResult } from "@/shell/search/search-dialog";
import { SearchDialog } from "@/shell/search/search-dialog";
import { ITEMS } from "./data";
import { ItemsPanel, SettingsPanel } from "./panels";
import { useDemoStore } from "./store";

const SPACES = [
  {
    key: "overview",
    href: "/",
    label: "Overview",
    icon: Gauge,
    exact: true,
  },
  {
    key: "items",
    href: "/items",
    label: "Items",
    icon: Boxes,
  },
  {
    key: "settings",
    href: "/settings",
    label: "Settings",
    icon: Settings,
    footer: true,
  },
];

export function Shell() {
  const navigate = useNavigate();
  const { lang, setLang, setQuery } = useDemoStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const search = useCallback(
    async (q: string): Promise<ShellSearchResult[]> => {
      // Slow enough to show the pending state; "error" shows the failed state.
      await new Promise(resolve => setTimeout(resolve, 400));
      if (q === "error") throw new Error("demo search failure");
      return ITEMS.filter(i => i.name.toLowerCase().includes(q.toLowerCase())).map(i => ({
        id: i.id,
        label: i.name,
        detail: i.owner,
        icon: Boxes,
        onSelect: () => {
          setQuery(i.name);
          void navigate({ to: "/items" });
        },
      }));
    },
    [navigate, setQuery],
  );
  return (
    <AppShell
      spaces={SPACES}
      panels={{ items: ItemsPanel, settings: SettingsPanel }}
      homeHref="/"
      logo={<span className="text-xs font-bold">AS</span>}
      logoLabel="appshell"
      labels={lang === "zh" ? shellLabelsZh : shellLabelsEn}
      account={
        <IconButton
          label={lang === "zh" ? "English" : "中文"}
          icon={Languages}
          side="right"
          onClick={() => setLang(lang === "zh" ? "en" : "zh")}
        />
      }
      newAction={{
        label: "New item",
        onSelect: () => void navigate({ to: "/items" }),
      }}
      onSearch={() => setSearchOpen(true)}
    >
      <SearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        spaces={SPACES}
        search={search}
        resultsLabel="Items"
      />
      <Outlet />
    </AppShell>
  );
}
