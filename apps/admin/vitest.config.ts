import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      include: [
        "src/app/api/**/route.ts",
        "src/lib/**/*.ts",
        "src/middleware.ts",
      ],
      exclude: [
        "src/app/api/auth/**",
        "src/app/api/docs/**",
        "src/app/api/admin/users/route.ts",
        "src/lib/db.ts",
        "src/lib/auth.ts",
        "src/lib/r2.ts",
        "src/lib/i18n/**",
        "src/lib/guards.ts",
        "src/lib/modules.ts",
        "src/lib/queries/analytics.ts",
        "src/lib/queries/forms.ts",
        "src/lib/queries/images.ts",
        "src/lib/services/email.ts",
        "src/lib/services/upload.ts",
      ],
      thresholds: {
        statements: 85,
        branches: 70,
        functions: 90,
        lines: 85,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
