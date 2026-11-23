import { describe, expect, it } from "bun:test";
import { clampPage, pageCount, paginate } from "@/shell/collection/pager";
import { formatLabel, shellLabelsEn, shellLabelsZh } from "@/shell/core/labels";

const ROWS = Array.from({ length: 120 }, (_, i) => i + 1);

describe("pageCount", () => {
  it("rounds up and never drops below one page", () => {
    expect(pageCount(120, 50)).toBe(3);
    expect(pageCount(100, 50)).toBe(2);
    expect(pageCount(0, 50)).toBe(1);
    expect(pageCount(5, 0)).toBe(5);
  });
});

describe("clampPage", () => {
  it("keeps the page within the pages that exist", () => {
    expect(clampPage(0, 120, 50)).toBe(1);
    expect(clampPage(-3, 120, 50)).toBe(1);
    expect(clampPage(2, 120, 50)).toBe(2);
    expect(clampPage(9, 120, 50)).toBe(3);
    expect(clampPage(2.7, 120, 50)).toBe(2);
    expect(clampPage(4, 0, 50)).toBe(1);
  });
});

describe("paginate", () => {
  it("slices one page", () => {
    expect(paginate(ROWS, 1, 50)).toEqual(ROWS.slice(0, 50));
    expect(paginate(ROWS, 2, 50)[0]).toBe(51);
  });

  it("returns the short last page", () => {
    expect(paginate(ROWS, 3, 50)).toEqual(ROWS.slice(100));
  });

  it("clamps pages outside the range", () => {
    expect(paginate(ROWS, 7, 50)).toEqual(ROWS.slice(100));
    expect(paginate(ROWS, 0, 50)).toEqual(ROWS.slice(0, 50));
    expect(paginate([], 2, 50)).toEqual([]);
  });

  it("keeps the caller's order (sort before slicing)", () => {
    const sorted = [...ROWS].reverse();
    expect(paginate(sorted, 1, 3)).toEqual([120, 119, 118]);
  });
});

describe("pager labels", () => {
  it("read the total, or the selection against the total", () => {
    expect(formatLabel(shellLabelsEn.pagerTotal, { total: 120 })).toBe("120 items");
    expect(formatLabel(shellLabelsZh.pagerTotal, { total: 120 })).toBe("共 120 条");
    expect(formatLabel(shellLabelsEn.pagerSelected, { count: 3, total: 120 })).toBe(
      "3 of 120 selected",
    );
    expect(formatLabel(shellLabelsZh.pagerSelected, { count: 3, total: 120 })).toBe(
      "已选 3 / 120 条",
    );
    expect(formatLabel(shellLabelsZh.pagerPage, { page: 2, pages: 3 })).toBe("第 2 / 3 页");
  });
});
