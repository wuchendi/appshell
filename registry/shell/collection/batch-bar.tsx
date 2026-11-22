import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatLabel, useShellLabels } from "@/shell/core/labels";

/** A thin rule between groups of batch actions. */
export function BatchBarSeparator() {
  return <span aria-hidden="true" className="mx-1 h-4 w-px bg-border" />;
}

/** Floating pill pinned to the bottom of a list while rows are selected: count, clear, actions. */
export function BatchBar({ count, onClear, children }: { count: number; onClear: () => void; children: ReactNode }) {
  const labels = useShellLabels();
  return (
    <div className="pointer-events-none sticky bottom-4 z-20 flex justify-center px-4">
      <div className="pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-1 rounded-xl border border-border/60 bg-popover px-3 py-2 text-[13px] shadow-lg">
        <span className="font-medium text-foreground tabular-nums">{formatLabel(labels.selectedCount, { count })}</span>
        <Button variant="ghost" size="icon-xs" aria-label={labels.clearSelection} onClick={onClear}>
          <X />
        </Button>
        <BatchBarSeparator />
        {children}
      </div>
    </div>
  );
}
