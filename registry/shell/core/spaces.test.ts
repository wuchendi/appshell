import { describe, expect, it } from "bun:test";
import { Link2 } from "lucide-react";
import type { ShellSpace } from "@/shell/core/spaces";
import { isActivePath, railEntryFolds, spaceFor } from "@/shell/core/spaces";

const spaces: ShellSpace[] = [
  {
    key: "home",
    href: "/app",
    label: "Home",
    icon: Link2,
    exact: true,
  },
  {
    key: "links",
    href: "/app/links",
    label: "Links",
    icon: Link2,
  },
  {
    key: "stats",
    href: "/app/stats",
    label: "Stats",
    icon: Link2,
    match: ["/app/live"],
  },
];

describe("isActivePath", () => {
  it("matches exact entries only on their own path", () => {
    expect(isActivePath("/app", spaces[0]!)).toBe(true);
    expect(isActivePath("/app/links", spaces[0]!)).toBe(false);
  });

  it("matches nested paths but not a shared prefix", () => {
    expect(isActivePath("/app/links/abc", spaces[1]!)).toBe(true);
    expect(isActivePath("/app/linksx", spaces[1]!)).toBe(false);
  });
});

describe("spaceFor", () => {
  it("finds the space, including extra prefixes", () => {
    expect(spaceFor(spaces, "/app/live")?.key).toBe("stats");
    expect(spaceFor(spaces, "/elsewhere")).toBeUndefined();
  });
});

describe("railEntryFolds", () => {
  it("folds only a space with a panel, on its own href", () => {
    expect(railEntryFolds("/app/links", spaces[1]!, true)).toBe(true);
  });

  it("navigates from a detail page back to the space", () => {
    expect(railEntryFolds("/app/links/42", spaces[1]!, true)).toBe(false);
    expect(railEntryFolds("/app/live", spaces[2]!, true)).toBe(false);
  });

  it("never folds a space without a panel", () => {
    expect(railEntryFolds("/app", spaces[0]!, false)).toBe(false);
    expect(railEntryFolds("/app/links", spaces[1]!, false)).toBe(false);
  });
});
