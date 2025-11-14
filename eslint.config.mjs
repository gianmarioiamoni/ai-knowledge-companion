import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      // Dependencies
      "node_modules/**",
      ".pnp/**",
      ".pnp.js",
      // Testing
      "coverage/**",
      // Next.js
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      // Production
      "**/*.min.js",
      "**/*.min.css",
      // Misc
      "**/.DS_Store",
      "**/*.pem",
      // Debug logs
      "**/npm-debug.log*",
      "**/yarn-debug.log*",
      "**/yarn-error.log*",
      // Local env files
      ".env",
      ".env.*",
      // Vercel
      ".vercel/**",
      // TypeScript
      "**/*.tsbuildinfo",
      "next-env.d.ts",
      // Scripts (CommonJS)
      "scripts/**",
      "**/*.config.js",
      "jest.config.js",
      // Documentation
      "docs/**",
    ],
  },
  {
    rules: {
      // Allow unused vars that start with underscore
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "caughtErrorsIgnorePattern": "^_",
          "destructuredArrayIgnorePattern": "^_"
        }
      ]
    }
  },
  {
    // Allow 'any' in type definition files and tests
    files: ["src/types/**/*.ts", "src/test/**/*.ts", "src/test/**/*.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off"
    }
  }
];

export default eslintConfig;
