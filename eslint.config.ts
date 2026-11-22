import antfu from "@antfu/eslint-config";

export default antfu({
  typescript: true,
  react: true,
  stylistic: {
    indent: 2,
    quotes: "double",
    semi: true,
  },
  rules: {
    "no-console": "warn",
    "ts/no-explicit-any": "error",
    "ts/consistent-type-imports": [
      "error",
      { prefer: "type-imports" },
    ],
    "perfectionist/sort-imports": [
      "error",
      {
        environment: "bun",
        groups: [
          "type-import",
          [
            "type-parent",
            "type-sibling",
            "type-index",
            "type-internal",
          ],
          "value-builtin",
          "value-external",
          "value-internal",
          ["value-parent", "value-sibling", "value-index"],
          "side-effect",
          "ts-equals-import",
          "unknown",
        ],
        newlinesBetween: "ignore",
        newlinesInside: "ignore",
        order: "asc",
        type: "natural",
      },
    ],
  },
  ignores: [
    "**/*.json",
    "**/*.md",
    "**/*.toml",
    "**/*.yml",
    "**/*.yaml",
    "public/r/**",
    "apps/shell-web/src/components/ui/**",
  ],
}, {
  // Copied files share the host namespace: exported types carry the Shell prefix.
  files: ["registry/shell/**/*.{ts,tsx}"],
  ignores: ["**/*.test.ts", "**/*.test.tsx"],
  rules: {
    "ts/naming-convention": [
      "error",
      {
        selector: "typeLike",
        modifiers: ["exported"],
        format: ["PascalCase"],
        filter: { regex: "Props$", match: false },
        prefix: ["Shell"],
      },
    ],
  },
}, {
  files: ["**/*.test.ts", "**/*.test.tsx"],
  rules: {
    "no-console": "off",
  },
});
