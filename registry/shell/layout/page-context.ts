import type { LucideIcon } from "lucide-react";
import { createContext } from "react";

/** What `<AppShell>` tells every page header: the space icon and whether a panel can be brought back. */
export const ShellPageContext = createContext<{ icon?: LucideIcon; hasPanel: boolean }>({
  hasPanel: false,
});

/** The gutter the header and the page body below it share. */
export const PAGE_GUTTER = "px-4 md:px-6";
