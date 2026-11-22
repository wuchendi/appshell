import type { ShellColumn } from "@/shell/collection/columns";
import { hideableColumns } from "@/shell/collection/columns";
import { useShellLabels } from "@/shell/core/labels";
import { MenuSection, MenuSwitch } from "@/shell/menus/menus";

/** The display menu's column switches for a `CollectionTable`. */
export function ColumnsSection<T>({ columns, hidden, onToggle }: {
  columns: ShellColumn<T>[];
  hidden: readonly string[];
  onToggle: (key: string) => void;
}) {
  const labels = useShellLabels();
  return (
    <MenuSection label={labels.columns}>
      {hideableColumns(columns).map(c => (
        <MenuSwitch
          key={c.key}
          label={typeof c.header === "string"
            ? c.header
            : c.key}
          checked={!hidden.includes(c.key)}
          onChange={() => onToggle(c.key)}
        />
      ))}
    </MenuSection>
  );
}
