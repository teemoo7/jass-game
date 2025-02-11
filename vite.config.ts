import { defineConfig } from "vitest/config";

export default defineConfig({
  base: './',
  build: {
    emptyOutDir: true,
  },
  esbuild: {
    supported: {
      "top-level-await": true,
    }
  },
  test: {
    globals: true,
    reporters: ["verbose"],
    coverage: {
      all: true,
      enabled: true,
      cleanOnRerun: false,
      reportOnFailure: true,
      include: ["src/**/*.ts"],
      reporter: ["text", "html", "json", "lcov"],
    }
  },
});
