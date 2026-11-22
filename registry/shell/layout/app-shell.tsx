import type { ComponentType, ReactNode } from "react";
import type { ShellLabels } from "@/shell/core/labels";
import type { ShellSpace } from "@/shell/core/spaces";
import type { ShellNewAction } from "@/shell/layout/rail";
import { useRouterState } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDefaultLayout } from "react-resizable-panels";
import { Button } from "@/components/ui/button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { isTypingTarget } from "@/shell/core/is-typing";
import { shellLabelsEn, ShellLabelsProvider } from "@/shell/core/labels";
import { useShellPanelStore } from "@/shell/core/panel-store";
import { spaceFor } from "@/shell/core/spaces";
import { useIsMobile } from "@/shell/core/use-is-mobile";
import { NavigationProgress } from "@/shell/layout/navigation-progress";
import { PAGE_GUTTER, ShellPageContext } from "@/shell/layout/page-context";
import { Rail } from "@/shell/layout/rail";

export interface AppShellProps {
  /** Rail entries, in order; `footer` ones sit above the account control. */
  spaces: ShellSpace[];
  /** The panel shown beside each space's pages, by space key. A space without one has no panel. */
  panels?: Partial<Record<string, ComponentType>>;
  homeHref: string;
  logo: ReactNode;
  /** Accessible name of the logo link (the app name). */
  logoLabel: string;
  /** The control at the rail's foot, e.g. an account menu. */
  account?: ReactNode;
  /** Rail "new" button; the bare `C` key runs it too. */
  newAction?: ShellNewAction | undefined;
  /** Rail search button; Cmd/Ctrl+K runs it too. The host renders the dialog it opens. */
  onSearch?: (() => void) | undefined;
  /** Above the page inside the content card, e.g. a notice. */
  banner?: ReactNode;
  labels?: ShellLabels;
  /** localStorage key of the saved panel width. */
  layoutId?: string;
  children: ReactNode;
}

/**
 * From `md` up: the rail on the canvas and one rounded content card beside it, holding the
 * space's resizable panel (while open) and the page. Below `md` the card is the whole window;
 * the rail and the panel move into a sheet behind a top bar.
 */
export function AppShell({
  spaces,
  panels = {},
  homeHref,
  logo,
  logoLabel,
  account,
  newAction,
  onSearch,
  banner,
  labels = shellLabelsEn,
  layoutId = "appshell-space-panel",
  children,
}: AppShellProps) {
  const pathname = useRouterState({
    select: s => s.location.pathname,
  });
  const panelOpen = useShellPanelStore(s => s.open);
  const togglePanel = useShellPanelStore(s => s.toggle);
  const [navOpen, setNavOpen] = useState(false);
  const isMobile = useIsMobile();
  const pressAtRef = useRef<number | null>(null);

  const space = spaceFor(spaces, pathname);
  const Panel = space ? panels[space.key] : undefined;
  const showPanel = !!Panel && panelOpen && !isMobile;
  // One saved panel width for every space; the page-only layout is kept apart.
  const layout = useDefaultLayout({
    id: layoutId,
    panelIds: showPanel
      ? ["panel", "page"]
      : ["page"],
    storage: localStorage,
  });

  // Close the mobile sheet once something in it has navigated.

  useEffect(() => setNavOpen(false), [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.shiftKey || e.altKey || e.defaultPrevented)
        return;
      const key = e.key.toLowerCase();
      if (e.metaKey || e.ctrlKey) {
        if (key === "b") {
          e.preventDefault();
          togglePanel();
        }
        else if (key === "k" && onSearch) {
          e.preventDefault();
          onSearch();
        }
        return;
      }
      if (key === "c" && newAction && !isTypingTarget(e.target)) {
        e.preventDefault();
        newAction.onSelect();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePanel, onSearch, newAction]);

  const railProps = {
    spaces,
    homeHref,
    logo,
    logoLabel,
    account,
    newAction,
    onSearch,
  };

  return (
    <ShellLabelsProvider value={labels}>
      <div className="flex h-dvh w-full overflow-hidden bg-canvas text-foreground">
        <Rail className="hidden md:flex" {...railProps} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col md:py-2 md:pr-2">
          <header className="flex h-12 shrink-0 items-center gap-2 border-b bg-background px-3 md:hidden">
            <Sheet open={navOpen} onOpenChange={setNavOpen}>
              <SheetTrigger render={<Button variant="ghost" size="icon-sm" aria-label={labels.openMenu} />}>
                <Menu />
              </SheetTrigger>
              <SheetContent side="left" showCloseButton={false} className="flex-row gap-0 bg-canvas data-[side=left]:w-auto">
                <SheetTitle className="sr-only">{labels.openMenu}</SheetTitle>
                <Rail {...railProps} onNavigate={() => setNavOpen(false)} />
                {Panel && (
                  <div className="flex w-60 bg-background">
                    <Panel />
                  </div>
                )}
              </SheetContent>
            </Sheet>
            {space && <span className="truncate text-sm font-medium">{space.label}</span>}
          </header>
          <div
            data-slot="content-card"
            className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden bg-background md:rounded-[8px] md:shadow-sm md:ring-1 md:ring-border/70"
          >
            <NavigationProgress />
            <ResizablePanelGroup
              orientation="horizontal"
              defaultLayout={layout.defaultLayout}
              onLayoutChanged={layout.onLayoutChanged}
              className="min-h-0 min-w-0 flex-1"
            >
              {/* Panel and handle come and go in front of the page, which keeps its position so folding never remounts it. */}
              {showPanel && (
                <ResizablePanel id="panel" defaultSize="240px" minSize="200px" maxSize="400px" className="min-w-0">
                  <Panel />
                </ResizablePanel>
              )}
              {showPanel && (
                <ResizableHandle
                  withHandle
                  title={labels.toggleSidebar}
                  onPointerDown={(e) => {
                    pressAtRef.current = e.clientX;
                  }}
                  onClick={(e) => {
                    // A click folds the panel; a drag only resizes it.
                    if (pressAtRef.current !== null && Math.abs(e.clientX - pressAtRef.current) < 3)
                      togglePanel();
                    pressAtRef.current = null;
                  }}
                />
              )}
              <ResizablePanel id="page" minSize="40%" className="min-w-0">
                <main className="flex h-full min-h-0 min-w-0 flex-col">
                  {banner}
                  <ScrollArea className="min-h-0 flex-1">
                    <div className={`${PAGE_GUTTER} pt-4 pb-6 md:pt-5`}>
                      <ShellPageContext value={{
                        ...(space?.icon
                          ? { icon: space.icon }
                          : {}),
                        hasPanel: !!Panel,
                      }}
                      >
                        {children}
                      </ShellPageContext>
                    </div>
                  </ScrollArea>
                </main>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </div>
      </div>
    </ShellLabelsProvider>
  );
}
