import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["out/**", "out-test/**", "node_modules/**", "*.vsix"] },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    // Covered by tsconfig.json's "include": normal single-project linting.
    files: ["src/**/*.ts"],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
  {
    // Not covered by any tsconfig's "include": type-check it against
    // TypeScript's default in-memory project instead.
    files: ["eslint.config.mjs"],
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ["eslint.config.mjs"],
        },
      },
    },
  },
  {
    // Needs real cross-file type info (imports from src/), but isn't part
    // of tsconfig.json's "include" — point it at tsconfig.test.json instead.
    files: ["test/**/*.ts"],
    languageOptions: {
      parserOptions: {
        projectService: false,
        project: ["./tsconfig.test.json"],
      },
    },
    rules: {
      // node:test's describe/it return Promises that the runner tracks
      // internally; the caller is not expected to await them.
      "@typescript-eslint/no-floating-promises": [
        "error",
        {
          allowForKnownSafeCalls: [
            { from: "package", name: ["it", "describe"], package: "node:test" },
          ],
        },
      ],
    },
  },
);
