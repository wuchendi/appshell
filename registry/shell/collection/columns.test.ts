import { describe, expect, it } from "bun:test";
import type { ShellColumn } from "@/shell/collection/columns";
import {
  columnLabel,
  gridTemplate,
  gridTracks,
  hideableColumns,
  opensRow,
  rowLabel,
  tableMinWidth,
  trackMinimum,
  visibleColumns,
} from "@/shell/collection/columns";

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

describe("trackMinimum", () => {
  it("takes the minimum of minmax and fixed lengths as they are", () => {
    expect(trackMinimum("minmax(14rem,1fr)")).toBe("14rem");
    expect(trackMinimum("minmax( 0 , 11rem )")).toBe("0px");
    expect(trackMinimum("minmax(120px, 2fr)")).toBe("120px");
    expect(trackMinimum("6.5rem")).toBe("6.5rem");
    expect(trackMinimum(".5rem")).toBe(".5rem");
  });

  it("counts flexible and keyword tracks as zero", () => {
    expect(trackMinimum("1fr")).toBe("0px");
    expect(trackMinimum("auto")).toBe("0px");
    expect(trackMinimum("minmax(auto,1fr)")).toBe("0px");
    expect(trackMinimum("max-content")).toBe("0px");
  });
});

describe("tableMinWidth", () => {
  it("adds the tracks, the gaps between them and the row padding", () => {
    const tracks = gridTracks(cols, { selectable: true, actions: "5.25rem" });
    expect(tracks).toEqual([
      "1rem",
      "minmax(14rem,1fr)",
      "minmax(0,11rem)",
      "4rem",
      "6.5rem",
      "5.25rem",
    ]);
    expect(tableMinWidth(tracks)).toBe(
      "calc(1rem + 14rem + 0px + 4rem + 6.5rem + 5.25rem + 4.75rem)",
    );
  });

  it("is just the padding without tracks", () => {
    expect(tableMinWidth([])).toBe("calc(1rem)");
  });
});

describe("opensRow", () => {
  const row = document.createElement("div");
  row.innerHTML =
    '<span id="cell">x</span><button id="act">a</button><div role="menuitem" id="mi"></div>';
  document.body.append(row);

  it("opens from a plain cell", () => {
    expect(opensRow(row, row.querySelector("#cell"))).toBe(true);
    expect(opensRow(row, row)).toBe(true);
  });

  it("ignores interactive elements in the row", () => {
    expect(opensRow(row, row.querySelector("#act"))).toBe(false);
    expect(opensRow(row, row.querySelector("#mi"))).toBe(false);
  });

  it("ignores portaled content outside the row", () => {
    const portaled = document.createElement("div");
    document.body.append(portaled);
    expect(opensRow(row, portaled)).toBe(false);
    expect(opensRow(row, null)).toBe(false);
  });
});

describe("rowLabel", () => {
  const named: ShellColumn<{ id: string; name: string }>[] = [
    { key: "name", header: "Name", cell: r => r.name },
  ];
  const noded: ShellColumn<{ id: string }>[] = [{ key: "n", header: "N", cell: () => null }];

  it("prefers getRowLabel", () => {
    expect(rowLabel({ id: "1", name: "A" }, "1", named, r => `#${r.name}`)).toBe("#A");
  });

  it("falls back to a text primary cell, then the id", () => {
    expect(rowLabel({ id: "1", name: "Alpha" }, "1", named, undefined)).toBe("Alpha");
    expect(rowLabel({ id: "7" }, "7", noded, undefined)).toBe("7");
    expect(rowLabel({ id: "7" }, "7", [{ key: "n", header: "N", cell: () => 42 }], undefined)).toBe(
      "42",
    );
  });
});

describe("columnLabel", () => {
  it("uses label, then a text header, then the key", () => {
    expect(columnLabel({ key: "k", header: "H", label: "L", cell: () => null })).toBe("L");
    expect(columnLabel({ key: "k", header: "H", cell: () => null })).toBe("H");
    expect(columnLabel({ key: "k", header: null, cell: () => null })).toBe("k");
  });
});
