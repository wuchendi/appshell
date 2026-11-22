import { describe, expect, it } from "bun:test";
import { isTypingTarget } from "@/shell/core/is-typing";

describe("isTypingTarget", () => {
  it("is true for fields and editable content", () => {
    expect(isTypingTarget(document.createElement("input"))).toBe(true);
    expect(isTypingTarget(document.createElement("textarea"))).toBe(true);
    const div = document.createElement("div");
    div.contentEditable = "true";
    expect(isTypingTarget(div)).toBe(div.isContentEditable);
  });

  it("is false elsewhere", () => {
    expect(isTypingTarget(document.createElement("button"))).toBe(false);
    expect(isTypingTarget(null)).toBe(false);
  });
});
