import type { ShellSpace } from "@/shell/core/spaces";
import { describe, expect, it } from "bun:test";
import { Link2 } from "lucide-react";
import { isActivePath, spaceFor } from "@/shell/core/spaces";

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
