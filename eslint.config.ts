import { defineConfig, globalIgnores } from "eslint/config";

import eslintJS from "@eslint/js";
import prettierEslint from "eslint-plugin-prettier/recommended";
import eslintTS from "typescript-eslint";

export default defineConfig(
  globalIgnores(["coverage", "dist", "generated", "node_modules"]),
  {
    extends: [
      eslintJS.configs.recommended,
      eslintTS.configs.strict,
      prettierEslint,
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-implicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },

    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
);
