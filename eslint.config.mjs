import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // Build output / generated dirs — never our source to lint.
    ignores: [".next/**", "out/**", "build/**", ".vercel/**", "next-env.d.ts"],
  },
  {
    rules: {
      // Cosmetic only — apostrophes/quotes in JSX text render fine. Disabling
      // keeps lint focused on real bugs instead of HTML-entity churn.
      "react/no-unescaped-entities": "off",
    },
  },
];

export default eslintConfig;
