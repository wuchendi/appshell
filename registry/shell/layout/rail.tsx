import type { LinkProps } from "@tanstack/react-router";
import type { ReactNode } from "react";
import type { ShellSpace } from "@/shell/core/spaces";
import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "cn";
import { Search, SquarePen } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MOD_KEY } from "@/shell/core/keys";
import { useShellLabels } from "@/shell/core/labels";
import { useShellPanelStore } from "@/shell/core/panel-store";
import { isActivePath } from "@/shell/core/spaces";
import { IconButton } from "@/shell/layout/icon-button";

const EXACT = { exact: true };

const ENTRY_BASE = "shrink-0 rounded-[6px] text-muted-foreground transition-colors outline-none hover:bg-foreground/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:bg-foreground/[0.07] aria-[current=page]:text-foreground";
const ENTRY_CLASS = `${ENTRY_BASE} flex w-[50px] flex-col items-center gap-0.5 pt-1.5 pb-1 text-[10px] leading-[13px] [&_svg]:size-[18px]`;
const FOOTER_ENTRY_CLASS = `${ENTRY_BASE} grid size-9 place-items-center [&_svg]:size-[18px]`;

export interface ShellNewAction {
  label: string;
  onSelect: () => void;
}

/**
 * The icon column on the shell's edge: the logo, optional "new" and search, one labelled entry
 * per space, then the footer spaces (icon only) and the account control.
 */
export function Rail({ spaces, homeHref, logo, logoLabel, account, newAction, onSearch, onNavigate, className }: {
  spaces: ShellSpace[];
  homeHref: string;
  logo: ReactNode;
  logoLabel: string;
  account?: ReactNode;
  newAction?: ShellNewAction | undefined;
  onSearch?: (() => void) | undefined;
  /** Set in the mobile sheet: entries close it, and the current entry no longer folds the panel. */
  onNavigate?: () => void;
  className?: string;
}) {
  const labels = useShellLabels();
  const pathname = useRouterState({
    select: s => s.location.pathname,
  });
  const togglePanel = useShellPanelStore(s => s.toggle);
  const entry = (space: ShellSpace) => {
    const iconOnly = !!space.footer;
    const Icon = space.icon;
    const active = isActivePath(pathname, space);
    return (
      <Link
        key={space.key}
        to={space.href as LinkProps["to"]}
        activeOptions={EXACT}
        aria-current={active ? "page" : undefined}
        aria-label={iconOnly ? space.label : undefined}
        title={iconOnly ? space.label : undefined}
        onClick={(e) => {
          // On the desktop rail the current space's entry folds its panel.
          if (active && !onNavigate) {
            e.preventDefault();
            togglePanel();
          }
          onNavigate?.();
        }}
        className={iconOnly ? FOOTER_ENTRY_CLASS : ENTRY_CLASS}
      >
        <Icon aria-hidden="true" />
        {!iconOnly && <span className="max-w-full truncate px-0.5">{space.label}</span>}
      </Link>
    );
  };
  return (
    <nav data-slot="app-rail" className={cn("flex w-[60px] shrink-0 flex-col items-center gap-0.5 py-2.5", className)}>
      <Link
        to={homeHref as LinkProps["to"]}
        aria-label={logoLabel}
        onClick={onNavigate}
        className="mb-1.5 grid size-8 shrink-0 place-items-center rounded-[6px] bg-primary text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {logo}
      </Link>
      {newAction && (
        <IconButton label={newAction.label} icon={SquarePen} keys={["C"]} side="right" onClick={newAction.onSelect} className="size-9 [&_svg]:size-[18px]" />
      )}
      {onSearch && (
        <IconButton label={labels.search} icon={Search} keys={[MOD_KEY, "K"]} side="right" onClick={onSearch} className="size-9 [&_svg]:size-[18px]" />
      )}
      <ScrollArea className="mt-1.5 min-h-0 w-full flex-1">
        <div className="flex flex-col items-center gap-0.5">{spaces.filter(s => !s.footer).map(entry)}</div>
      </ScrollArea>
      <div className="flex flex-col items-center gap-1 pt-2">
        {spaces.filter(s => s.footer).map(entry)}
        {account && <div className="mt-1">{account}</div>}
      </div>
    </nav>
  );
}
