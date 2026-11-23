import { describe, expect, it } from "bun:test";
import type { ShellColumn } from "@/shell/collection/columns";
import { gridTemplate, hideableColumns, visibleColumns } from "@/shell/collection/columns";

interface Row {
  name: string;
}
const cols: ShellColumn<Row>[] = [
  {
    key: "name",
    header: "Name",
    cell: r => r.name,
  },
  {
    key: "tags",
    header: "Tags",
    width: "minmax(0,11rem)",
    cell: () => null,
  },
  {
    key: "clicks",
    header: "Clicks",
    width: "4rem",
    core: true,
    cell: () => null,
  },
  {
    key: "created",
    header: "Created",
    hideable: false,
    cell: () => null,
  },
];

describe("visibleColumns", () => {
  it("keeps the primary and drops hidden ones", () => {
    expect(visibleColumns(cols, ["tags"], false).map(c => c.key)).toEqual([
      "name",
      "clicks",
      "created",
    ]);
  });

  it("keeps only core columns when narrow", () => {
    expect(visibleColumns(cols, [], true).map(c => c.key)).toEqual(["name", "clicks"]);
  });
});

describe("gridTemplate", () => {
  it("adds the selection and actions tracks around the columns", () => {
    expect(gridTemplate(cols.slice(0, 3), { selectable: true, actions: "5rem" })).toBe(
      "1rem minmax(14rem,1fr) minmax(0,11rem) 4rem 5rem",
    );
    expect(gridTemplate(cols.slice(3), { selectable: false, actions: null })).toBe(
      "minmax(14rem,1fr)",
    );
  });
});

describe("hideableColumns", () => {
  it("never offers the primary column or opted-out ones", () => {
    expect(hideableColumns(cols).map(c => c.key)).toEqual(["tags", "clicks"]);
  });
});
