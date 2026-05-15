import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextCoreWebVitals,
  globalIgnores([
    "vitest.config.ts",
    "playwright.config.ts",
    "e2e/**",
    "**/*.test.ts",
    "scripts/**",
    "ecosystem.config.cjs",
  ]),
  {
    rules: {
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
      /** Data-fetch в useEffect + react-hook-form — см. точечные правки выше / при необходимости eslint-disable на строке */
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/incompatible-library": "off",
      "@next/next/no-html-link-for-pages": "warn",
    },
  },
]);
