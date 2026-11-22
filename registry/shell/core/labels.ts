import { createContext, useContext } from "react";

/** Every string the shell shows. Hosts pass their own (e.g. built from i18n) to `<AppShell labels>`. */
export interface ShellLabels {
  toggleSidebar: string;
  openMenu: string;
  search: string;
  searchPlaceholder: string;
  searchEmpty: string;
  goTo: string;
  filter: string;
  /** `{count}` is replaced with the number of active filters. */
  filterActive: string;
  display: string;
  reset: string;
  clearSearch: string;
  loading: string;
  /** `{count}` is replaced with the number of selected rows. */
  selectedCount: string;
  selectAll: string;
  deselectAll: string;
  clearSelection: string;
  columns: string;
}

export const shellLabelsEn: ShellLabels = {
  toggleSidebar: "Toggle sidebar",
  openMenu: "Open menu",
  search: "Search",
  searchPlaceholder: "Search or jump to…",
  searchEmpty: "Nothing found.",
  goTo: "Go to",
  filter: "Filter",
  filterActive: "Filter · {count}",
  display: "Display",
  reset: "Reset",
  clearSearch: "Clear search",
  loading: "Loading",
  selectedCount: "{count} selected",
  selectAll: "Select all",
  deselectAll: "Deselect all",
  clearSelection: "Clear selection",
  columns: "Columns",
};

export const shellLabelsZh: ShellLabels = {
  toggleSidebar: "切换左侧边栏",
  openMenu: "打开菜单",
  search: "搜索",
  searchPlaceholder: "搜索或跳转到…",
  searchEmpty: "没有找到结果。",
  goTo: "跳转到",
  filter: "筛选",
  filterActive: "筛选 · {count}",
  display: "显示",
  reset: "重置",
  clearSearch: "清除搜索",
  loading: "加载中",
  selectedCount: "已选 {count} 项",
  selectAll: "全选",
  deselectAll: "取消全选",
  clearSelection: "取消选择",
  columns: "列",
};

/** Replaces `{name}` placeholders in a label. */
export function formatLabel(label: string, values: Record<string, string | number>): string {
  return label.replace(/\{(\w+)\}/g, (match, key: string) => (key in values
    ? String(values[key])
    : match));
}

const LabelsContext = createContext<ShellLabels>(shellLabelsEn);

export const ShellLabelsProvider = LabelsContext.Provider;

/** The labels from the nearest `<AppShell>` (English outside one). */
export function useShellLabels(): ShellLabels {
  return useContext(LabelsContext);
}
