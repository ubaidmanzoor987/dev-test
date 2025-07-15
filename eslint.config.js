import { FlatCompat } from "@eslint/eslintrc";
import tseslint from "typescript-eslint";
// @ts-expect-error: ESLint flat config doesn't love this plugin's type shape
import boundaries from "eslint-plugin-boundaries";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default tseslint.config(
  {
    ignores: [".next"],
  },
  ...compat.extends("next/core-web-vitals"),
  {
    files: ["**/*.ts", "**/*.tsx"],
    extends: [
      ...tseslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    plugins: {
      boundaries, // Boundaries plugin for enforcing import rules
    },
    rules: {
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
      // Boundaries: enforce only importing from a feature's `index.ts`
      "boundaries/element-types": [
        "error",
        {
          default: "allow", // <-- This is here so we can incrementally add rules
          rules: [
            {
              from: "feature",
              allow: ["featureIndex"], // only allow importing from other feature index files or shared
            },
            {
              from: "shared",
              allow: ["shared"], // shared can export anything
            },
          ],
        },
      ],
    },
    settings: {
      "boundaries/elements": [
        { type: "feature", pattern: "src/features/*" },
        { type: "featureIndex", pattern: "src/features/*/index.ts" },
        { type: "shared", pattern: "src/features/shared/**" },
      ],
    },
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
        allowDefaultProject: true,
      },
    },
  },
);
