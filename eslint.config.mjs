import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Downgrade React compiler rules from error → warn until components are refactored.
const reactCompilerOverrides = {
  "react-hooks/set-state-in-effect": "warn",
  "react-hooks/set-state-in-render": "warn",
  "react-hooks/static-components": "warn",
  "react-hooks/purity": "warn",
  "react-hooks/preserve-manual-memoization": "warn",
};

// Patch the nextVitals configs that define react-hooks plugin rules.
const patchedNextVitals = nextVitals.map((cfg) => {
  if (cfg.plugins?.["react-hooks"] && cfg.rules) {
    return { ...cfg, rules: { ...cfg.rules, ...reactCompilerOverrides } };
  }
  return cfg;
});

const eslintConfig = defineConfig([
  ...patchedNextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  globalIgnores([
    ".next/**",
    ".worktrees/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
